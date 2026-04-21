import express from 'express';
import {register, login} from '../controllers/authController.js';

const authRouter = express.Router();

// REGISTER
authRouter.post('/register', register);

// LOGIN
authRouter.post('/login', login);

export default authRouter;
