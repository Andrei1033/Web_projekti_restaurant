import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {createUser, findUserByEmail} from '../models/userModel.js';

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
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

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
      {id: user.user_id, email: user.email, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: '7d'}
    );

    res.json({
      message: 'Login successful',
      token,
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

export {register, login};
