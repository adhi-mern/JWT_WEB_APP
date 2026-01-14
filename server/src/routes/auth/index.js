import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto, { createSecretKey } from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import User from '../../models/User.js';
import sendVerificationEmail from '../../utils/sendEmail.js';
import jwtAuth from '../../utils/jwtAuth.js';

//controllers
import me from '../../controllers/me.js';
import refresh from '../../controllers/refresh.js';
import signup from '../../controllers/signup.js';
import verifyEmail from '../../controllers/veify_email.js';
import login from '../../controllers/login.js';

const app = express();
app.use(express.json());

const router= express.Router();


router.post("/signup", signup);

router.get("/verify-email/:token", verifyEmail);

router.post("/login", login);

router.get("/me", jwtAuth,me);

router.post("/refresh", refresh);

export default router;