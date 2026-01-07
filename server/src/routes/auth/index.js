import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto, { createSecretKey } from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import User from '../../models/User.js';
import sendVerificationEmail from '../../utils/sendEmail.js';
import jwtAuth from '../../utils/jwtAuth.js';
import refreshAuth from '../../utils/refreshAuth.js';
//import jwtAuth from '../../utils/jwtAuth.js';

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

    // // Check duplicate user
    // const existingUser = await User.findOne({
    //   $or: [{ email }, { username }]
    // });

    // if (existingUser) {
    //   return res.status(409).json({
    //     message: "Email or username already exists"
    //   });
    // }

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
      return res.status(400).json({message: "All fields required"})
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({username});
    if(!existingUser){
      return res.status(401).json({message:"Incorrect Username or Password"})
    }
    if(existingUser.isEmailVerified == false){
      return res.status(401).json({
        message: "Email not verified"
      })
    }

    if(existingUser.isEmailVerified == true){
      if(existingUser.password==hashedPassword){
        return res.status(401).json({
          message:"Incorrect Username or Password"
        })
    }   
  }

  const payload = { id: existingUser._id,Email: existingUser.email};
  //node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   
  const tocken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});//change to 10
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'});
  existingUser.refreshToken= refreshToken;
  await existingUser.save();
  
  res.cookie("refreshToken", refreshToken,{
    httpOnly: true,
    secure: false,        // true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });
  res.status(200).json({
    tocken,
    refreshToken
  });

  }catch(error){
    console.log(error);
  };
});


router.get("/me", jwtAuth, async(req, res)=>{
  const user = req.user;
  const email = user.Email;
  const me = await User.findOne({email});// without await "me" is just a Promise (MongoDB query is still running)
  // res.status(200).json({
  //   user
  // })
  res.status(200).json({
    id: me._id,
    username: me.username,
    email: me.email,
    isEmailVerified: me.isEmailVerified,
  })
})

router.post("/refresh", async(req, res)=>{
  const token = req.cookies?.refreshToken;
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  };

  const user = await User.findOne({refreshToken: token}); // db check

  if(!user){
    return res.status(403).json({message: "Invalid Refresh Token"});
  }
  
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
  const payload = { id: decoded.id,Email: decoded.Email};
  
  const tocken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});// expire time
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'});
  user.refreshToken = refreshToken;
  await user.save();
  
  res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  sameSite: "strict",
  secure: false // true in production
});
console.log("working:", tocken);
res.json({ tocken });

});

export default router;