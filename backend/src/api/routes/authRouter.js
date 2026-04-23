import express from 'express';
import {register, login, getMe} from '../controllers/authController.js';
import {authenticateToken} from '../../middelwares/authentication.js';

const authRouter = express.Router();

// REGISTER
authRouter.post('/register', register);

// LOGIN
authRouter.post('/login', login);

//
authRouter.get('/me', authenticateToken, getMe);

export default authRouter;
