// orderController.js
import pool from '../../utils/database.js';

// Config
const MAX_CAPACITY = parseInt(process.env.MAX_CAPACITY || '40', 10);

// Helpers
// Format Date → "HH:MM:SS" for MySQL TIME column
const toTimeStr = (timeStr) => {
  // Accepts "12:30" or "12:30:00"
  if (!timeStr) return null;
  return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
};

// Send order confirmation email placeholder — replace with nodemailer later
const sendConfirmationEmail = async (order) => {
  // TODO: implement with nodemailer
  console.log(
    `[EMAIL] Order #${order.id} confirmed → ${order.guest_email || 'registered user'}`
  );
};

/**
 * @file orderController.js
 * @description Handles all order and availability operations.
 *
 * Endpoints:
 *   GET  /api/availability              → checkAvailability
 *   POST /api/orders                    → createOrder
 *   GET  /api/orders/my                 → getMyOrders      (JWT)
 *   GET  /api/orders/:id                → getOrderById     (JWT / Admin)
 *   PATCH /api/orders/:id/status        → updateStatus     (Admin)
 *   DELETE /api/orders/:id              → cancelOrder      (Admin)
 */

// ═══════════════════════════════════════════════════════════════
//  GET /api/availability Checks how many seats are available at a given date + time.
// ═══════════════════════════════════════════════════════════════

const checkAvailability = async (req, res) => {
  try {
    const {date, time, guests} = req.query;

    if (!date || !time) {
      return res
        .status(400)
        .json({error: 'date and time query params required'});
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({error: 'date must be YYYY-MM-DD'});
    }

    const guestCount = parseInt(guests || '1', 10);

    // Sum all reserved seats for this date + time slot
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(seats), 0) AS booked
       FROM   reservations
       WHERE  pickup_date = ?
         AND  pickup_time = ?`,
      [date, toTimeStr(time)]
    );

    const bookedSeats = parseInt(rows[0].booked, 10);
    const freeSeats = MAX_CAPACITY - bookedSeats;
    const available = freeSeats >= guestCount;

    res.json({
      available,
      freeSeats,
      bookedSeats,
      totalCapacity: MAX_CAPACITY,
      requestedGuests: guestCount,
    });
  } catch (err) {
    console.error('checkAvailability:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  POST /api/orders Places a new order. Works for both guests and logged-in users.
// ═══════════════════════════════════════════════════════════════

const createOrder = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const {
      guest_name,
      guest_email,
      pickup_date,
      pickup_time,
      guest_count,
      notes,
      items,
    } = req.body;

    // ── Validate ───────────────────────────────────────────────
    if (!pickup_date || !pickup_time) {
      return res
        .status(400)
        .json({error: 'pickup_date and pickup_time are required'});
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({error: 'items array is required and must not be empty'});
    }

    const guestCount = parseInt(guest_count || '1', 10);
    if (guestCount < 1) {
      return res.status(400).json({error: 'guest_count must be at least 1'});
    }

    // Guest order requires name + email
    const userId = req.user?.id || null;
    if (!userId && (!guest_name || !guest_email)) {
      return res.status(400).json({
        error: 'guest_name and guest_email are required for guest orders',
      });
    }

    // Validate email format for guest
    if (!userId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest_email)) {
      return res.status(400).json({error: 'Invalid email address'});
    }

    const timeStr = toTimeStr(pickup_time);

    // ── Availability check (before transaction) ────────────────
    const [avail] = await pool.query(
      `SELECT COALESCE(SUM(seats), 0) AS booked
       FROM   reservations
       WHERE  pickup_date = ? AND pickup_time = ?`,
      [pickup_date, timeStr]
    );

    const bookedSeats = parseInt(avail[0].booked, 10);
    const freeSeats = MAX_CAPACITY - bookedSeats;

    if (freeSeats < guestCount) {
      return res.status(409).json({
        error: 'Not enough seats available',
        freeSeats,
        requested: guestCount,
      });
    }

    // ── Calculate total price ──────────────────────────────────
    const totalPrice = items.reduce((sum, item) => {
      return sum + parseFloat(item.unit_price) * parseInt(item.quantity, 10);
    }, 0);

    // ── BEGIN TRANSACTION ──────────────────────────────────────
    await conn.beginTransaction();

    // 1. INSERT order
    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (user_id, guest_name, guest_email, pickup_date, pickup_time,
          guest_count, total_price, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        userId,
        userId ? null : guest_name.trim(),
        userId ? null : guest_email.trim().toLowerCase(),
        pickup_date,
        timeStr,
        guestCount,
        totalPrice.toFixed(2),
        notes?.trim() || null,
      ]
    );

    const orderId = orderResult.insertId;

    // 2. INSERT order_items
    for (const item of items) {
      const dishId = parseInt(item.dish_id, 10);
      const quantity = parseInt(item.quantity, 10);
      const unitPrice = parseFloat(item.unit_price);

      if (!dishId || quantity < 1 || isNaN(unitPrice)) {
        await conn.rollback();
        return res
          .status(400)
          .json({error: `Invalid item: ${JSON.stringify(item)}`});
      }

      await conn.query(
        `INSERT INTO order_items (order_id, dish_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, dishId, quantity, unitPrice.toFixed(2)]
      );
    }

    // 3. INSERT reservation — holds the seats
    await conn.query(
      `INSERT INTO reservations (order_id, pickup_date, pickup_time, seats)
       VALUES (?, ?, ?, ?)`,
      [orderId, pickup_date, timeStr, guestCount]
    );

    // 4. COMMIT
    await conn.commit();

    // Fetch full order to return
    const fullOrder = await getFullOrder(orderId);

    // Send confirmation email (non-blocking)
    sendConfirmationEmail(fullOrder).catch(() => {});

    res.status(201).json(fullOrder);
  } catch (err) {
    await conn.rollback();
    console.error('createOrder:', err);
    res.status(500).json({error: 'Server error'});
  } finally {
    conn.release();
  }
};

// ═══════════════════════════════════════════════════════════════
//  GET /api/orders/my  (JWT required) Returns order history for the logged-in user.
// ═══════════════════════════════════════════════════════════════

const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, pickup_date, pickup_time, guest_count,
              total_price, status, notes, created_at
       FROM   orders
       WHERE  user_id = ?
       ORDER  BY created_at DESC`,
      [req.user.id]
    );

    // Attach items to each order
    const result = await Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(order.id);
        return {...order, items};
      })
    );

    res.json(result);
  } catch (err) {
    console.error('getMyOrders:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  GET /api/orders/:id  (JWT or Admin) Returns a single order with all items.
// ═══════════════════════════════════════════════════════════════

const getOrderById = async (req, res) => {
  try {
    const {id} = req.params;
    const order = await getFullOrder(id);

    if (!order) {
      return res.status(404).json({error: 'Order not found'});
    }

    // Logged-in user can only see their own orders (admin sees all)
    if (
      req.user &&
      req.user.role !== 'admin' &&
      order.user_id !== req.user.id
    ) {
      return res.status(403).json({error: 'Access denied'});
    }

    res.json(order);
  } catch (err) {
    console.error('getOrderById:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  GET /api/admin/orders  (Admin) Returns all orders with filters.
// ═══════════════════════════════════════════════════════════════

const getAllOrders = async (req, res) => {
  try {
    const {date, status, page = 1, limit = 20} = req.query;

    let where = [];
    let params = [];

    if (date) {
      where.push('o.pickup_date = ?');
      params.push(date);
    }
    if (status) {
      where.push('o.status = ?');
      params.push(status);
    }

    const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [orders] = await pool.query(
      `SELECT
         o.id, o.user_id, o.guest_name, o.guest_email,
         o.pickup_date, o.pickup_time, o.guest_count,
         o.total_price, o.status, o.notes, o.created_at,
         u.username, u.email AS user_email
       FROM   orders o
       LEFT JOIN users u ON u.id = o.user_id
       ${whereStr}
       ORDER  BY o.pickup_date ASC, o.pickup_time ASC
       LIMIT  ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    // Count total for pagination
    const [[{total}]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders o ${whereStr}`,
      params
    );

    const result = await Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(order.id);
        return {...order, items};
      })
    );

    res.json({
      orders: result,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    console.error('getAllOrders:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/orders/:id/status  (Admin) Updates order status.
//Valid status transitions: pending → confirmed → ready → completed
// ═══════════════════════════════════════════════════════════════

const updateStatus = async (req, res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;

    const allowed = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({error: `Invalid status. Must be one of: ${allowed.join(', ')}`});
    }

    const [existing] = await pool.query('SELECT * FROM orders WHERE id = ?', [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({error: 'Order not found'});
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // If cancelled → delete reservation to free seats
    if (status === 'cancelled') {
      await pool.query('DELETE FROM reservations WHERE order_id = ?', [id]);
    }

    const updated = await getFullOrder(id);
    res.json(updated);
  } catch (err) {
    console.error('updateStatus:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  PUT /api/orders/:id  (Admin) Full update of order (time, guests, notes, items)
//  This updates orders, order_items and reservations inside a transaction
// ═══════════════════════════════════════════════════════════════

const updateOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {id} = req.params;
    const {pickup_time, guest_count, notes, total_price, items} = req.body;

    if (!pickup_time || !items || !Array.isArray(items)) {
      return res
        .status(400)
        .json({error: 'pickup_time and items array are required'});
    }

    const newGuestCount = parseInt(guest_count || '1', 10);
    if (isNaN(newGuestCount) || newGuestCount < 1) {
      return res.status(400).json({error: 'guest_count must be at least 1'});
    }

    const timeStr = toTimeStr(pickup_time);

    await conn.beginTransaction();

    const [existingRows] = await conn.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    if (existingRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({error: 'Order not found'});
    }

    const existing = existingRows[0];
    const pickupDate = existing.pickup_date;

    // Check availability for the (possibly new) time: exclude this order's reservation
    const [availRows] = await conn.query(
      `SELECT COALESCE(SUM(seats), 0) AS booked
       FROM reservations
       WHERE pickup_date = ? AND pickup_time = ? AND order_id != ?`,
      [pickupDate, timeStr, id]
    );

    const bookedSeats = parseInt(availRows[0].booked, 10);
    const freeSeats = MAX_CAPACITY - bookedSeats;
    if (freeSeats < newGuestCount) {
      await conn.rollback();
      return res.status(409).json({error: 'Not enough seats available'});
    }

    // Update orders table
    await conn.query(
      `UPDATE orders SET pickup_time = ?, guest_count = ?, total_price = ?, notes = ? WHERE id = ?`,
      [
        timeStr,
        newGuestCount,
        parseFloat(total_price || 0).toFixed(2),
        notes?.trim() || null,
        id,
      ]
    );

    // Replace order_items
    await conn.query('DELETE FROM order_items WHERE order_id = ?', [id]);

    for (const item of items) {
      const dishId = parseInt(item.dish_id, 10);
      const quantity = parseInt(item.quantity, 10);
      const unitPrice = parseFloat(item.unit_price);

      if (!dishId || isNaN(quantity) || quantity < 1 || isNaN(unitPrice)) {
        await conn.rollback();
        return res
          .status(400)
          .json({error: `Invalid item: ${JSON.stringify(item)}`});
      }

      await conn.query(
        `INSERT INTO order_items (order_id, dish_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
        [id, dishId, quantity, unitPrice.toFixed(2)]
      );
    }

    // Update reservation (time + seats)
    await conn.query(
      `UPDATE reservations SET pickup_time = ?, seats = ? WHERE order_id = ?`,
      [timeStr, newGuestCount, id]
    );

    await conn.commit();

    const updated = await getFullOrder(id);
    res.json(updated);
  } catch (err) {
    await conn.rollback();
    console.error('updateOrder:', err);
    res.status(500).json({error: 'Server error'});
  } finally {
    conn.release();
  }
};

// ═══════════════════════════════════════════════════════════════
//  DELETE /api/orders/:id  (Admin) Cancels and removes an order.
// ═══════════════════════════════════════════════════════════════

const cancelOrder = async (req, res) => {
  try {
    const {id} = req.params;

    const [existing] = await pool.query('SELECT * FROM orders WHERE id = ?', [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({error: 'Order not found'});
    }

    // Delete reservation first (releases seats), then order (cascades order_items)
    await pool.query('DELETE FROM reservations WHERE order_id = ?', [id]);
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);

    res.json({message: 'Order cancelled and deleted'});
  } catch (err) {
    console.error('cancelOrder:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  GET /api/admin/dashboard  (Admin)
// ═══════════════════════════════════════════════════════════════

const getDashboard = async (req, res) => {
  try {
    const [[today]] = await pool.query(
      `SELECT
         COUNT(*)                                        AS orders_today,
         COALESCE(SUM(total_price), 0)                  AS revenue_today,
         COALESCE(SUM(guest_count), 0)                  AS guests_today
       FROM orders
       WHERE pickup_date = CURDATE()
         AND status != 'cancelled'`
    );

    const [[week]] = await pool.query(
      `SELECT
         COUNT(*)                       AS orders_week,
         COALESCE(SUM(total_price), 0)  AS revenue_week
       FROM orders
       WHERE pickup_date BETWEEN
         DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
         AND DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 6 DAY)
         AND status != 'cancelled'`
    );

    // Most popular dish this week
    const [[popular]] = await pool
      .query(
        `SELECT   d.name, SUM(oi.quantity) AS total_ordered
       FROM     order_items oi
       JOIN     dishes d       ON d.id = oi.dish_id
       JOIN     orders o       ON o.id = oi.order_id
       WHERE    o.pickup_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND    o.status != 'cancelled'
       GROUP BY d.id
       ORDER BY total_ordered DESC
       LIMIT    1`
      )
      .catch(() => [null]);

    // Pending orders needing attention
    const [[{pending_count}]] = await pool.query(
      `SELECT COUNT(*) AS pending_count FROM orders WHERE status = 'pending'`
    );

    res.json({
      today: {
        orders: parseInt(today.orders_today, 10),
        revenue: parseFloat(today.revenue_today).toFixed(2),
        guests: parseInt(today.guests_today, 10),
      },
      week: {
        orders: parseInt(week.orders_week, 10),
        revenue: parseFloat(week.revenue_week).toFixed(2),
      },
      popular_dish: popular?.name || null,
      pending_orders: parseInt(pending_count, 10),
    });
  } catch (err) {
    console.error('getDashboard:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════

// Fetch a full order with its items from DB
async function getFullOrder(orderId) {
  const [[order]] = await pool.query(
    `SELECT o.*, u.username, u.email AS user_email
     FROM   orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE  o.id = ?`,
    [orderId]
  );

  if (!order) return null;

  const items = await getOrderItems(orderId);
  return {...order, items};
}

// Fetch order items with dish names
async function getOrderItems(orderId) {
  const [items] = await pool.query(
    `SELECT
       oi.id, oi.quantity, oi.unit_price,
       d.name         AS dish_name,
       d.current_dish_image AS dish_image
     FROM   order_items oi
     LEFT JOIN dishes d ON d.id = oi.dish_id
     WHERE  oi.order_id = ?`,
    [orderId]
  );
  return items;
}

// ═══════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════

export {
  checkAvailability,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateStatus,
  updateOrder,
  cancelOrder,
  getDashboard,
};
