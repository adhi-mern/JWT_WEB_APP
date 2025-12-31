import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

import User from '../../models/User.js';
import sendVerificationEmail from '../../utils/sendEmail.js';
import Verified from '../../models/Verified.js';

const app = express();
app.use(express.json());

const router= express.Router();

//signup
//Express automatically passes (req, res) objects to every route handler
router.post("/signup", async (req, res) => {
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

    // Check duplicate user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or username already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Token generation
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await User.create({
      email,
      username,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: Date.now() + 10 * 60 * 1000
    });
    // Date.now()           = Current time in milliseconds (e.g., 1735620000000)
    // 10 * 60 * 1000       = 600,000 milliseconds = 10 minutes
    // 1 second  = 1,000 ms
    // 1 minute  = 60 * 1,000 = 60,000 ms  
    // 10 minutes = 10 * 60 * 1,000 = 600,000 ms
    // Date.now() + 600,000 = Future timestamp (expires in 10 min)

    const verifyLink = `http://localhost:5000/verify-email/${rawToken}`;
    await sendVerificationEmail(email, verifyLink);

    res.status(201).json({
      message: "Signup successful. Please verify your email."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error"

     });
  }
});

// email verify
router.get("/verify-email/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    } 

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    if(user.emailVerificationExpires && user.emailVerificationExpires > Date.now()){
      if(user.isEmailVerified == true){
        try{
          await user.deleteOne();
        }catch(err){
          console.log(err);
        }

      }
    }

    // const email = user.email;
    // const username =  user.username;
    // const password = user.password;
    // await Verified.create({
    //   Email,
    //   Username, 
    //   Password
    // })

    res.send("Email verified successfully. You can now log in.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) =>{
  //tocken system
  try{
    const{username, password} = req.body;
    if(!username || !password){
      return re.status(400).json({message: "All fields required"})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({
      $and: [{username}, {password}]
    });
  }catch{};
});

export default router;