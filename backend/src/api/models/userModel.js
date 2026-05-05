import db from '../../utils/database.js';
import bcrypt from 'bcryptjs';

// CREATE USER
export const createUser = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 12);

  const sql = `
    INSERT INTO users (username, email, phone, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    user.username,
    user.email,
    user.phone || null,
    hashedPassword,
    user.role || 'user',
  ]);

  return result.insertId;
};

// FIND USER BY EMAIL
export const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

  return rows[0] || null;
};

// FIND USER BY ID
export const findUserById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, username, email, phone, role, created_at FROM users WHERE id = ?',
    [id]
  );

  return rows[0] || null;
};

// UPDATE USER PROFILE (username, phone)
export const updateUserProfile = async (id, updates) => {
  const fields = [];
  const values = [];

  if (updates.username) {
    fields.push('username = ?');
    values.push(updates.username);
  }

  if (updates.phone) {
    fields.push('phone = ?');
    values.push(updates.phone);
  }

  if (fields.length === 0) return;

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  await db.query(sql, values);
};
