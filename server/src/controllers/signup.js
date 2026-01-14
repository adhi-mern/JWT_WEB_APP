import bcrypt from 'bcrypt';
import crypto, { createSecretKey } from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import sendVerificationEmail from "../utils/sendEmail.js";

const signup = async (req, res) => {
  try {// catch error
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = User.findOne({email})

    try{
      if(user.isEmailVerified == false){
        await user.deleteOne();
        console.log("User deleted!!!")
      }
    }catch(err){
      console.log(err);
    }
    const existingUser = await User.findOne({username});
    if(existingUser){
      return res.status(409).json({
        message:"Username already exist"
      });
    }
    const emailExisting = await User.findOne({email});
    if(emailExisting){
      return res.status(409).json({
        message:"Email already exist"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Token generation
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    try{
      await User.create({
      email,
      username,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: Date.now() + 10 * 60 * 1000
    });
    console.log("user created")
    }catch(err){
      console.log(err);
    }
    // Date.now()           = Current time in milliseconds (e.g., 1735620000000)
    // 10 * 60 * 1000       = 600,000 milliseconds = 10 minutes

    try{const verifyLink = `http://localhost:5000/auth/verify-email/${rawToken}`;
    await sendVerificationEmail(email, verifyLink);
    console.log("working");
  }catch(err){
    console.log(err);
  }

    res.status(201).json({
      message: "Please verify your email."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: "Server error"
     });
  }
}

export default signup;