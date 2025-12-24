const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();


const User = require("./models/User");
const sendVerificationEmail = require("./utils/sendEmail");

const app = express();
app.use(express.json());

// 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("Mongo error:", err);
    process.exit(1);
  });

//signup
app.post("/signup", async (req, res) => {
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
    debugger;
    console.error(err);
    res.status(500).json({ message: "Server error"

     });
  }
});

// email verify
app.get("/verify-email/:token", async (req, res) => {
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


// start server
app.listen(5000, () => {9
  console.log("Server running on http://localhost:5000");
});
