import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

import cookieParser from "cookie-parser";
app.use(cookieParser());

//Cross-Origin Resource Sharing(cors) - Browser security blocking your frontend → backend requests.
import cors from 'cors';
app.use(cors({
  origin: "http://localhost:5173", // React app
  credentials: true
}));

// Database 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("Mongo error:", err);
    process.exit(1);
  });


// import routes
import auth from './routes/auth/index.js';

// Routes
app.use("/auth",auth);

// start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000 🔥");
});
