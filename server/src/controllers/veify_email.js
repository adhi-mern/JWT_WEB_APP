import crypto, { createSecretKey } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

const verifyEmail = async (req, res) => {
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
}

export default verifyEmail;