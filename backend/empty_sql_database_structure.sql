-- ============================================================
--  NightWolf Kitchen — Full Database Schema
--  Engine:  InnoDB
--  Charset: utf8mb4 (supports emojis and Finnish characters)
--
--  Run order:
--    1. Create database
--    2. Tables run top-to-bottom — foreign keys are safe
--    3. Run seed data at the bottom for testing
-- ============================================================
-- Create and select the database
CREATE DATABASE IF NOT EXISTS nightwolf_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nightwolf_db;
-- ============================================================
--  TABLE: users
--
--  Stores all accounts — both customers and admins.
--  role = 'user'  → regular customer (can log in, see order history)
--  role = 'admin' → can access admin panel, manage menu and orders
--
--  Guest orders do NOT create a user row — they use
--  guest_name / guest_email directly in the orders table.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT uq_users_username UNIQUE (username)
);
-- ============================================================
--  TABLE: dishes
--
--  The permanent menu "library". Every dish the restaurant
--  has ever offered lives here. Dishes are reusable — the
--  same Shoyu Ramen row can appear on multiple weeks without
--  duplicating data.
--
--  dietary_tags: comma-separated flags, e.g. "vegan,glutenfree"
--  Possible values: vegan | glutenfree | lactosefree
--
--  is_active = FALSE hides a dish from the menu without
--  deleting it (useful for seasonal dishes).
--
--  current_dish_image: path stored as "/uploads/menu/filename.jpg"
--  The file itself lives in backend/uploads/menu/
-- ============================================================
CREATE TABLE IF NOT EXISTS dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  price DECIMAL(6, 2) NOT NULL,
  current_dish_image VARCHAR(255) NULL,
  dietary_tags VARCHAR(100) NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dishes_active (is_active)
);
-- ============================================================
--  TABLE: daily_menus
--
--  Represents one restaurant day. For example:
--    date = 2026-04-07, day_name = 'Monday',
--    theme_title = 'Ramen Night'
--
--  One row = one day. The actual dishes for that day are
--  linked through daily_menu_dishes (see below).
--
--  theme_image: path to the day's hero image,
--  e.g. "/uploads/menu/ramen_theme.jpg"
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  day_name VARCHAR(20) NOT NULL,
  theme_title VARCHAR(120) NULL,
  theme_image VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_daily_menus_date UNIQUE (date),
  INDEX idx_daily_menus_date (date)
);
-- ============================================================
--  TABLE: daily_menu_dishes
--
--  Junction table — connects daily_menus to dishes.
--  Because one day can have many dishes (ramen + gyoza + drink)
--  and one dish can appear on many days, this is a many-to-many
--  relationship that needs its own table.
--
--  Example rows:
--    (daily_menu_id=1, dish_id=3)  ← Monday has Shoyu Ramen
--    (daily_menu_id=1, dish_id=7)  ← Monday also has Gyoza
--    (daily_menu_id=2, dish_id=3)  ← Ramen also on next Monday
--
--  sort_order: controls display order on the menu page.
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_menu_dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  daily_menu_id INT NOT NULL,
  dish_id INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_dmd_menu FOREIGN KEY (daily_menu_id) REFERENCES daily_menus(id) ON DELETE CASCADE,
  CONSTRAINT fk_dmd_dish FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  CONSTRAINT uq_dmd_pair UNIQUE (daily_menu_id, dish_id),
  INDEX idx_dmd_menu (daily_menu_id),
  INDEX idx_dmd_dish (dish_id)
);
-- ============================================================
--  TABLE: orders
--
--  One row = one customer order. Links to the user account
--  if logged in, or stores guest details if not.
--
--  user_id NULL  → guest order (guest_name + guest_email used)
--  user_id SET   → registered user order
--
--  pickup_date + pickup_time together = when to pick up.
--  Stored separately so availability queries can filter by date
--  and time independently.
--
--  guest_count: how many people are dining — used to reserve seats.
--
--  status lifecycle:
--    pending → confirmed → ready → completed
--    any state → cancelled
--
--  total_price: calculated at order time and stored here.
--  Even if dish prices change later, the order total is frozen.
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  guest_name VARCHAR(120) NULL,
  guest_email VARCHAR(120) NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  guest_count INT NOT NULL DEFAULT 1,
  total_price DECIMAL(8, 2) NOT NULL,
  status ENUM(
    'pending',
    'confirmed',
    'ready',
    'completed',
    'cancelled'
  ) NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE
  SET NULL,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_date (pickup_date),
    INDEX idx_orders_status (status),
    INDEX idx_orders_date_time (pickup_date, pickup_time)
);
-- ============================================================
--  TABLE: order_items
--
--  The line items inside one order. If a customer orders
--  2× Shoyu Ramen and 1× Gyoza, there are two rows here.
--
--  unit_price: the dish price at the moment of ordering.
--  This is critical — if the admin changes the dish price
--  tomorrow, this order still shows the correct historical price.
--
--  dish_id is SET NULL on dish delete so the order history
--  is preserved even if the dish is later removed.
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  dish_id INT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(6, 2) NOT NULL,
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_dish FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE
  SET NULL,
    INDEX idx_oi_order (order_id),
    INDEX idx_oi_dish (dish_id)
);
-- ============================================================
--  TABLE: reservations
--
--  Every time an order is placed, one reservation row is
--  created to "hold" seats at the requested time.
--
--  The availability check works like this:
--    SELECT SUM(seats)
--    FROM   reservations
--    WHERE  pickup_date = '2026-04-07'
--    AND    pickup_time = '12:30:00';
--
--  If SUM(seats) + requested_guest_count > 40 → fully booked.
--
--  When an order is cancelled (DELETE), the CASCADE also
--  deletes the reservation, freeing up the seats automatically.
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  seats INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_res_slot (pickup_date, pickup_time),
  INDEX idx_res_order (order_id)
);
-- ============================================================
--  SEED DATA — for development and testing only
--  Remove or comment out before production deployment
-- ============================================================
-- Admin user
-- Password is "admin123" hashed with bcrypt (12 rounds)
-- In production, create admin via the API, never hardcode
INSERT INTO users (username, email, phone, password_hash, role)
VALUES (
    'admin',
    'admin@nightwolf.fi',
    '+358401234567',
    '$2b$12$examplehashfordevonlypleasechangethis1234567',
    'admin'
  );
-- Sample dishes
INSERT INTO dishes (
    name,
    description,
    price,
    dietary_tags,
    is_active
  )
VALUES (
    'Shoyu Ramen',
    'Clear soy broth, wavy noodles, chashu pork belly, soft-boiled egg & nori.',
    15.90,
    'lactosefree',
    1
  ),
  (
    'Miso Veggie Ramen',
    'Rich white miso broth, tofu, shiitake mushrooms & spring onion.',
    14.50,
    'vegan,lactosefree',
    1
  ),
  (
    'Gyoza (6 pcs)',
    'Pan-fried pork & cabbage dumplings with yuzu ponzu dipping sauce.',
    9.00,
    '',
    1
  ),
  (
    'Classic Smash Burger',
    'Double smash patty, aged cheddar, caramelised onion & wolf sauce.',
    13.90,
    'glutenfree',
    1
  ),
  (
    'Mushroom Smash',
    'Portobello patty, vegan cheese, sriracha aioli & pickled jalapeño.',
    13.50,
    'vegan,glutenfree',
    1
  ),
  (
    'Wolf Fries',
    'Crispy fries with rosemary salt & house aioli.',
    5.00,
    'vegan,glutenfree,lactosefree',
    1
  ),
  (
    'Birria Tacos',
    'Braised beef in adobo, Oaxaca cheese, consommé for dipping.',
    14.00,
    '',
    1
  ),
  (
    'Jackfruit Tacos',
    'Pulled jackfruit, guacamole, pico de gallo & lime crema.',
    13.00,
    'vegan,glutenfree',
    1
  );
-- Sample daily menus for current week
INSERT INTO daily_menus (date, day_name, theme_title)
VALUES ('2026-04-07', 'Monday', 'Ramen Night'),
  ('2026-04-08', 'Tuesday', 'Smash Burger'),
  ('2026-04-09', 'Wednesday', 'Taco Tuesday'),
  ('2026-04-10', 'Thursday', 'Pizza Romana'),
  ('2026-04-11', 'Friday', 'Sushi Friday');
-- Link dishes to days
-- Monday: Shoyu Ramen (1), Miso Veggie Ramen (2), Gyoza (3)
INSERT INTO daily_menu_dishes (daily_menu_id, dish_id, sort_order)
VALUES (1, 1, 1),
  (1, 2, 2),
  (1, 3, 3);
-- Tuesday: Classic Smash (4), Mushroom Smash (5), Wolf Fries (6)
INSERT INTO daily_menu_dishes (daily_menu_id, dish_id, sort_order)
VALUES (2, 4, 1),
  (2, 5, 2),
  (2, 6, 3);
-- Wednesday: Birria Tacos (7), Jackfruit Tacos (8), Wolf Fries (6)
INSERT INTO daily_menu_dishes (daily_menu_id, dish_id, sort_order)
VALUES (3, 7, 1),
  (3, 8, 2),
  (3, 6, 3);
-- ============================================================
--  USEFUL QUERIES for the backend controllers
--  (copy these into your controller files)
-- ============================================================
-- Get full menu for a specific week (used by GET /api/menu/week)
-- Replace ? with the Monday date of the week
/*
 SELECT
 dm.date,
 dm.day_name,
 dm.theme_title,
 dm.theme_image,
 d.id        AS dish_id,
 d.name,
 d.description,
 d.price,
 d.image_url,
 d.dietary_tags,
 dmd.sort_order
 FROM daily_menus dm
 JOIN daily_menu_dishes dmd ON dmd.daily_menu_id = dm.id
 JOIN dishes            d   ON d.id = dmd.dish_id
 WHERE dm.date BETWEEN ? AND DATE_ADD(?, INTERVAL 4 DAY)
 AND d.is_active = 1
 ORDER BY dm.date, dmd.sort_order;
 */
-- Check availability for a time slot (used by GET /api/availability)
/*
 SELECT COALESCE(SUM(seats), 0) AS booked_seats
 FROM   reservations
 WHERE  pickup_date = ?
 AND    pickup_time = ?;
 */
-- Get all items for one order (used by GET /api/orders/:id)
/*
 SELECT
 oi.id,
 oi.quantity,
 oi.unit_price,
 d.name      AS dish_name,
 d.image_url AS dish_image
 FROM order_items oi
 LEFT JOIN dishes d ON d.id = oi.dish_id
 WHERE oi.order_id = ?;
 */
-- Admin dashboard stats (used by GET /api/admin/dashboard)
/*
 SELECT
 COUNT(*)        AS orders_today,
 SUM(total_price) AS revenue_today,
 SUM(guest_count) AS guests_today
 FROM orders
 WHERE pickup_date = CURDATE()
 AND status != 'cancelled';
 */