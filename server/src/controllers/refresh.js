import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const refresh = async(req, res)=>{
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

}
export default refresh;