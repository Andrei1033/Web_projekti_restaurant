import db from '../../utils/database.js';
// ================= DASHBOARD =================
export const getDashboard = async (req, res) => {
  try {
    const [[ordersToday]] = await db.query(`
      SELECT COUNT(*) AS count
      FROM orders
      WHERE DATE(created_at) = CURDATE()
    `);

    const [[revenue]] = await db.query(`
      SELECT COALESCE(SUM(total_price),0) AS total
      FROM orders
      WHERE DATE(created_at) = CURDATE()
    `);

    const [[occupancy]] = await db.query(`
      SELECT COALESCE(SUM(seats),0) AS seats
      FROM reservations
      WHERE pickup_date = CURDATE()
    `);

    res.json({
      ordersToday: ordersToday.count,
      revenueToday: revenue.total,
      occupancy: occupancy.seats,
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

// ================= ORDERS =================
export const getAllOrders = async (req, res) => {
  try {
    const {date, status} = req.query;

    let query = `
      SELECT o.*,
             SUM(oi.quantity * oi.unit_price) AS total
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
    `;

    const conditions = [];
    const values = [];

    if (date) {
      conditions.push('o.pickup_date = ?');
      values.push(date);
    }

    if (status) {
      conditions.push('o.status = ?');
      values.push(status);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const [rows] = await db.query(query, values);
    res.json(rows);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

// ================= STATUS =================
export const updateOrderStatus = async (req, res) => {
  const {id} = req.params;
  const {status} = req.body;

  const allowed = {
    pending: ['confirmed'],
    confirmed: ['ready'],
    ready: ['completed'],
    completed: [],
    cancelled: [],
  };

  const [[order]] = await db.query('SELECT status FROM orders WHERE id = ?', [
    id,
  ]);

  if (!order) return res.status(404).json({error: 'Not found'});

  if (!allowed[order.status].includes(status)) {
    return res.status(400).json({error: 'Invalid transition'});
  }

  await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

  res.json({success: true});
};

// ================= DELETE =================
export const deleteOrder = async (req, res) => {
  await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
  res.json({success: true});
};

// ================= USERS =================
export const getAllUsers = async (req, res) => {
  const [rows] = await db.query(`
    SELECT id, username, email, role
    FROM users
    ORDER BY created_at DESC
  `);

  res.json(rows);
};

export const updateUserRole = async (req, res) => {
  const {role} = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({error: 'Invalid role'});
  }

  await db.query('UPDATE users SET role=? WHERE id=?', [role, req.params.id]);

  res.json({success: true});
};
