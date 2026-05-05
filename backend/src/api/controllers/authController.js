import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../../utils/database.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
} from '../models/userModel.js';

// REGISTER
const register = async (req, res) => {
  try {
    const existing = await findUserByEmail(req.body.email);

    if (existing) {
      return res.status(409).json({error: 'Email already exists'});
    }

    const userId = await createUser(req.body);

    const token = jwt.sign(
      {id: userId, email: req.body.email, role: 'user'},
      process.env.JWT_SECRET,
      {expiresIn: '7d'}
    );

    res.status(201).json({
      message: 'User created',
      token,
      user: {
        id: userId,
        email: req.body.email,
        username: req.body.username,
        role: 'user',
      },
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

// GET CURRENT USER (TOKEN CHECK)
const getMe = async (req, res) => {
  console.log('getMe', res.locals.user);

  if (res.locals.user) {
    res.json({message: 'token ok', user: res.locals.user});
  } else {
    res.sendStatus(401);
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const user = await findUserByEmail(req.body.email);

    if (!user) {
      return res.status(401).json({error: 'Invalid credentials'});
    }

    const match = await bcrypt.compare(req.body.password, user.password_hash);

    if (!match) {
      return res.status(401).json({error: 'Invalid credentials'});
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {expiresIn: '7d'}
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = res.locals.user.id;

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    res.json({
      message: 'User profile retrieved',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const {username, phone, password} = req.body;

    if (!username && !phone && !password) {
      return res.status(400).json({error: 'No fields to update'});
    }

    const updates = {};

    if (username) updates.username = username;
    if (phone) updates.phone = phone;

    if (Object.keys(updates).length > 0) {
      await updateUserProfile(userId, updates);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);

      const [result] = await db.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({error: 'Failed to update password'});
      }
    }

    const updatedUser = await findUserById(userId);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

// ✅ EXPORTS (ONLY ONCE, AT THE END)
export {register, login, getMe, getProfile, updateProfile};
