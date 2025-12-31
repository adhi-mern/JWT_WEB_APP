import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';

// microserveces routes
import auth from './API/auth/index.js';

const app = express();
app.use(express.json());
app.use(cors());

// database 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("Mongo error:", err);
    process.exit(1);
  });

// Routes
app.use(auth,"/auth");

// start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
