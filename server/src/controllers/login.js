import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

const login = async (req, res) =>{
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
}

export default login;