import db from '../../utils/database.js';
import bcrypt from 'bcryptjs';

const createUser = async (user) => {
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
    'user',
  ]);

  return result.insertId;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

  return rows[0];
};

export {createUser, findUserByEmail};
