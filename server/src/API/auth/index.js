import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

//Cross-Origin Resource Sharing(cors) - Browser security blocking your frontend → backend requests.
import User from '../../models/User.js';
import sendVerificationEmail from '../../utils/sendEmail.js';
import Verified from '../../models/Verified.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const Router = express.Router();

//signup
//Express automatically passes (req, res) objects to every route handler
Router.post("/signup", async (req, res) => {
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
Router.get("/verify-email/:token", async (req, res) => {
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

    const email = user.email;
    const username =  user.username;
    const password = user.password;
    await Verified.create({
      Email,
      Username, 
      Password
    })

    res.send("Email verified successfully. You can now log in.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

Router.post("/login", async (req, res) =>{
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

export default Router;