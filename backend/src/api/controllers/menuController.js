const fs = require('fs');
const path = require('path');
const pool = require('../../utils/database');

// ═══════════════════════════════════════════════════════════════
//  SHARED HELPERS
// ═══════════════════════════════════════════════════════════════
/**
 * Builds a public URL from an uploaded filename.
 * @param {string|null} filename  e.g. "1712345678_burger.jpg"
 * @returns {string|null}         e.g. "/uploads/menu/1712345678_burger.jpg"
 */
const imageUrl = (filename) => (filename ? `/uploads/menu/${filename}` : null);

/**
 * Deletes an image file from disk.
 * Silently ignores errors (e.g. file already deleted).
 * @param {string|null} url  e.g. "/uploads/menu/1712345678_burger.jpg"
 */
const deleteImageFile = (url) => {
  if (!url) return;
  const filepath = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    'menu',
    path.basename(url)
  );
  fs.unlink(filepath, () => {});
};

/**
 * Converts a Date object or MySQL date value to "YYYY-MM-DD" string.
 * @param {Date|string} date
 * @returns {string}
 */
const toDateStr = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  return date.toString().slice(0, 10);
};

/**
 * Parses ISO week string "2026-W14" into the Monday Date of that week.
 * @param {string} weekStr
 * @returns {Date}
 */
const mondayOfISOWeek = (weekStr) => {
  const [yearStr, wStr] = weekStr.split('-W');
  const year = parseInt(yearStr, 10);
  const weekNum = parseInt(wStr, 10);
  const jan4 = new Date(year, 0, 4);
  const monday = new Date(jan4);
  monday.setDate(
    jan4.getDate() - ((jan4.getDay() + 6) % 7) + (weekNum - 1) * 7
  );
  return monday;
};

/*dishController part
 * Endpoints handled:
 *   GET    /api/dishes          → getAllDishes
 *   GET    /api/dishes/:id      → getDishById
 *   POST   /api/dishes          → createDish    (Admin)
 *   PUT    /api/dishes/:id      → updateDish    (Admin)
 *   DELETE /api/dishes/:id      → deleteDish    (Admin)
 */

// ─────────────────────────────────────────────
// GET /api/dishes Returns all dishes.
// ─────────────────────────────────────────────
const getAllDishes = async (req, res) => {
  try {
    const onlyActive = req.query.active !== '0'; // default true

    const [rows] = await pool.query(
      `SELECT id, name, description, price, image_url,
              dietary_tags, is_active, created_at, updated_at
       FROM   dishes
       ${onlyActive ? 'WHERE is_active = 1' : ''}
       ORDER  BY name ASC`
    );

    res.json(rows);
  } catch (err) {
    console.error('getAllDishes:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ─────────────────────────────────────────────
// GET /api/dishes/:id Returns a single dish by ID.
// ─────────────────────────────────────────────
const getDishById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, description, price, image_url,
              dietary_tags, is_active, created_at, updated_at
       FROM   dishes
       WHERE  id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({error: 'Dish not found'});
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('getDishById:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ─────────────────────────────────────────────
// POST /api/dishes  (Admin) Creates a new dish.
// ─────────────────────────────────────────────

const createDish = async (req, res) => {
  try {
    const {name, description, price, dietary_tags, is_active} = req.body;

    // Validate required fields
    if (!name || !price) {
      // Clean up uploaded file if validation fails
      if (req.file) deleteImageFile(imageUrl(req.file.filename));
      return res.status(400).json({error: 'name and price are required'});
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      if (req.file) deleteImageFile(imageUrl(req.file.filename));
      return res.status(400).json({error: 'price must be a positive number'});
    }

    const img = req.file ? imageUrl(req.file.filename) : null;

    const [result] = await pool.query(
      `INSERT INTO dishes (name, description, price, image_url, dietary_tags, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        description?.trim() || null,
        parseFloat(price),
        img,
        dietary_tags?.trim() || '',
        is_active !== undefined ? parseInt(is_active) : 1,
      ]
    );

    // Return the newly created dish
    const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createDish:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ─────────────────────────────────────────────
// PUT /api/dishes/:id  (Admin) Updates an existing dish.
// ─────────────────────────────────────────────
const updateDish = async (req, res) => {
  try {
    const {id} = req.params;

    // Check dish exists
    const [existing] = await pool.query('SELECT * FROM dishes WHERE id = ?', [
      id,
    ]);
    if (existing.length === 0) {
      if (req.file) deleteImageFile(imageUrl(req.file.filename));
      return res.status(404).json({error: 'Dish not found'});
    }

    const old = existing[0];
    const {name, description, price, dietary_tags, is_active} = req.body;

    // If a new image was uploaded, delete the old one
    let img = old.image_url;
    if (req.file) {
      deleteImageFile(old.image_url);
      img = imageUrl(req.file.filename);
    }

    await pool.query(
      `UPDATE dishes
       SET    name         = ?,
              description  = ?,
              price        = ?,
              image_url    = ?,
              dietary_tags = ?,
              is_active    = ?
       WHERE  id = ?`,
      [
        name?.trim() || old.name,
        description?.trim() ?? old.description,
        price ? parseFloat(price) : old.price,
        img,
        dietary_tags?.trim() ?? old.dietary_tags,
        is_active !== undefined ? parseInt(is_active) : old.is_active,
        id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('updateDish:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ─────────────────────────────────────────────
// DELETE /api/dishes/:id  (Admin) Deletes a dish and its image file.
// ─────────────────────────────────────────────
const deleteDish = async (req, res) => {
  try {
    const {id} = req.params;

    const [existing] = await pool.query('SELECT * FROM dishes WHERE id = ?', [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({error: 'Dish not found'});
    }

    // Check if dish is linked to any future daily menus
    const [linked] = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM   daily_menu_dishes dmd
       JOIN   daily_menus dm ON dm.id = dmd.daily_menu_id
       WHERE  dmd.dish_id = ?
         AND  dm.date >= CURDATE()`,
      [id]
    );

    if (linked[0].cnt > 0) {
      return res.status(409).json({
        error:
          'Cannot delete dish — it is linked to one or more upcoming daily menus. Remove it from those menus first.',
      });
    }

    // Delete image file from disk
    deleteImageFile(existing[0].image_url);

    await pool.query('DELETE FROM dishes WHERE id = ?', [id]);

    res.json({message: 'Dish deleted successfully'});
  } catch (err) {
    console.error('deleteDish:', err);
    res.status(500).json({error: 'Server error'});
  }
};

module.exports = {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
};

/*dailyMenuController part
 * Endpoints handled:
 *   GET    /api/menu/week?week=2026-W14   → getWeekMenu
 *   GET    /api/menu/day?date=YYYY-MM-DD  → getDayMenu
 *   POST   /api/menu/days                 → createDay     (Admin)
 *   PUT    /api/menu/days/:id             → updateDay     (Admin)
 *   DELETE /api/menu/days/:id             → deleteDay     (Admin)
 *   POST   /api/menu/days/:id/dishes      → addDishToDay  (Admin)
 *   DELETE /api/menu/days/:id/dishes/:dishId → removeDishFromDay (Admin)
 */

// ═══════════════════════════════════════════════════════════════
//  GET /api/menu/week?week=2026-W17 Returns the menu for the specified ISO week.
// ═══════════════════════════════════════════════════════════════
const getWeekMenu = async (req, res) => {
  try {
    const weekParam = req.query.week;
    let monday;

    if (weekParam && /^\d{4}-W\d{1,2}$/.test(weekParam)) {
      monday = mondayOfISOWeek(weekParam);
    } else {
      const now = new Date();
      const day = now.getDay() || 7;
      monday = new Date(now);
      monday.setDate(now.getDate() - day + 1);
    }

    const mondayStr = toDateStr(monday);
    const fridayStr = toDateStr(new Date(monday.getTime() + 4 * 86400000));

    const [rows] = await pool.query(
      `SELECT
         dm.id          AS menu_id,
         dm.date,
         dm.day_name,
         dm.theme_title,
         dm.theme_image,
         d.id           AS dish_id,
         d.name,
         d.description,
         d.price,
         d.image_url,
         d.dietary_tags,
         dmd.sort_order
       FROM   daily_menus dm
       LEFT JOIN daily_menu_dishes dmd ON dmd.daily_menu_id = dm.id
       LEFT JOIN dishes d              ON d.id = dmd.dish_id AND d.is_active = 1
       WHERE  dm.date BETWEEN ? AND ?
       ORDER  BY dm.date ASC, dmd.sort_order ASC`,
      [mondayStr, fridayStr]
    );

    // Group rows into { "YYYY-MM-DD": { ...dayInfo, dishes: [...] } }
    const result = {};
    for (const row of rows) {
      const key = toDateStr(row.date);

      if (!result[key]) {
        result[key] = {
          date: key,
          day_name: row.day_name,
          theme_title: row.theme_title,
          theme_image: row.theme_image,
          dishes: [],
        };
      }

      if (row.dish_id) {
        result[key].dishes.push({
          id: row.dish_id,
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          image_url: row.image_url,
          dietary_tags: row.dietary_tags,
        });
      }
    }

    res.json(result);
  } catch (err) {
    console.error('getWeekMenu:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  GET /api/menu/day?date=YYYY-MM-DD Returns the menu for the specified date.
// ═══════════════════════════════════════════════════════════════
const getDayMenu = async (req, res) => {
  try {
    const {date} = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res
        .status(400)
        .json({error: 'date query param required (YYYY-MM-DD)'});
    }

    const [rows] = await pool.query(
      `SELECT
         dm.id          AS menu_id,
         dm.date,
         dm.day_name,
         dm.theme_title,
         dm.theme_image,
         d.id           AS dish_id,
         d.name,
         d.description,
         d.price,
         d.image_url,
         d.dietary_tags,
         dmd.sort_order
       FROM   daily_menus dm
       LEFT JOIN daily_menu_dishes dmd ON dmd.daily_menu_id = dm.id
       LEFT JOIN dishes d              ON d.id = dmd.dish_id AND d.is_active = 1
       WHERE  dm.date = ?
       ORDER  BY dmd.sort_order ASC`,
      [date]
    );

    if (rows.length === 0) {
      return res.json({date, dishes: []});
    }

    const first = rows[0];
    const dishes = rows
      .filter((r) => r.dish_id)
      .map((r) => ({
        id: r.dish_id,
        name: r.name,
        description: r.description,
        price: parseFloat(r.price),
        image_url: r.image_url,
        dietary_tags: r.dietary_tags,
      }));

    res.json({
      date: toDateStr(first.date),
      day_name: first.day_name,
      theme_title: first.theme_title,
      theme_image: first.theme_image,
      dishes,
    });
  } catch (err) {
    console.error('getDayMenu:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  POST /api/menu/days  (Admin) Creates a new day theme.
// ═══════════════════════════════════════════════════════════════
const createDay = async (req, res) => {
  try {
    const {date, day_name, theme_title} = req.body;

    if (!date || !day_name) {
      if (req.file) deleteImageFile(imageUrl(req.file.filename));
      return res.status(400).json({error: 'date and day_name are required'});
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      if (req.file) deleteImageFile(imageUrl(req.file.filename));
      return res.status(400).json({error: 'date must be YYYY-MM-DD'});
    }

    const img = req.file ? imageUrl(req.file.filename) : null;

    const [result] = await pool.query(
      `INSERT INTO daily_menus (date, day_name, theme_title, theme_image)
       VALUES (?, ?, ?, ?)`,
      [date, day_name.trim(), theme_title?.trim() || null, img]
    );

    const [rows] = await pool.query('SELECT * FROM daily_menus WHERE id = ?', [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      if (req.file) deleteImageFile(imageUrl(req.file.filename));
      return res
        .status(409)
        .json({error: 'A menu for this date already exists'});
    }
    console.error('createDay:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  PUT /api/menu/days/:id  (Admin) Updates an existing day theme.
// ═══════════════════════════════════════════════════════════════
const updateDay = async (req, res) => {
  try {
    const {id} = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM daily_menus WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      if (req.file) deleteImageFile(imageUrl(req.file.filename));
      return res.status(404).json({error: 'Daily menu not found'});
    }

    const old = existing[0];
    const {date, day_name, theme_title} = req.body;

    let img = old.theme_image;
    if (req.file) {
      deleteImageFile(old.theme_image);
      img = imageUrl(req.file.filename);
    }

    await pool.query(
      `UPDATE daily_menus
       SET date        = ?,
           day_name    = ?,
           theme_title = ?,
           theme_image = ?
       WHERE id = ?`,
      [
        date?.trim() || toDateStr(old.date),
        day_name?.trim() || old.day_name,
        theme_title?.trim() ?? old.theme_title,
        img,
        id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM daily_menus WHERE id = ?', [
      id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      if (req.file) deleteImageFile(imageUrl(req.file.filename));
      return res
        .status(409)
        .json({error: 'A menu for this date already exists'});
    }
    console.error('updateDay:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  DELETE /api/menu/days/:id  (Admin) Deletes a day and its image file.
// ═══════════════════════════════════════════════════════════════
const deleteDay = async (req, res) => {
  try {
    const {id} = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM daily_menus WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({error: 'Daily menu not found'});
    }

    deleteImageFile(existing[0].theme_image);
    // daily_menu_dishes rows are removed by CASCADE
    await pool.query('DELETE FROM daily_menus WHERE id = ?', [id]);

    res.json({message: 'Daily menu deleted'});
  } catch (err) {
    console.error('deleteDay:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  POST /api/menu/days/:id/dishes  (Admin) Adds a dish to a daily menu.
// ═══════════════════════════════════════════════════════════════
const addDishToDay = async (req, res) => {
  try {
    const {id} = req.params;
    const {dish_id, sort_order} = req.body;

    if (!dish_id) {
      return res.status(400).json({error: 'dish_id is required'});
    }

    const [menu] = await pool.query('SELECT id FROM daily_menus WHERE id = ?', [
      id,
    ]);
    if (menu.length === 0) {
      return res.status(404).json({error: 'Daily menu not found'});
    }

    const [dish] = await pool.query('SELECT id FROM dishes WHERE id = ?', [
      dish_id,
    ]);
    if (dish.length === 0) {
      return res.status(404).json({error: 'Dish not found'});
    }

    await pool.query(
      `INSERT INTO daily_menu_dishes (daily_menu_id, dish_id, sort_order)
       VALUES (?, ?, ?)`,
      [id, dish_id, sort_order || 0]
    );

    res.status(201).json({message: 'Dish added to daily menu'});
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({error: 'This dish is already on this day'});
    }
    console.error('addDishToDay:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  DELETE /api/menu/days/:id/dishes/:dishId  (Admin) Removes a dish from a daily menu.
// ═══════════════════════════════════════════════════════════════
const removeDishFromDay = async (req, res) => {
  try {
    const {id, dishId} = req.params;

    const [result] = await pool.query(
      'DELETE FROM daily_menu_dishes WHERE daily_menu_id = ? AND dish_id = ?',
      [id, dishId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({error: 'This dish is not on this day'});
    }

    res.json({message: 'Dish removed from daily menu'});
  } catch (err) {
    console.error('removeDishFromDay:', err);
    res.status(500).json({error: 'Server error'});
  }
};

// ═══════════════════════════════════════════════════════════════
//  IMAGE UPLOAD (standalone) POST /api/uploads/image  (Admin) Receives an image via Multer and returns its public URL.
// ═══════════════════════════════════════════════════════════════
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({error: 'No image file received'});
  }
  res.status(201).json({url: `/uploads/menu/${req.file.filename}`});
};

// ═══════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════
module.exports = {
  // Dishes
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  // Daily menus
  getWeekMenu,
  getDayMenu,
  createDay,
  updateDay,
  deleteDay,
  addDishToDay,
  removeDishFromDay,
  // Upload
  uploadImage,
};
