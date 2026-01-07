import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function refreshAuth (req, res, next){
    // console.log(req)
    // console.log(req.cookies.refreshToken);//in Express there is NO req.cookie (singular).req.cookies --- plural
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401);
    }
   
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err,decoded)=>{
        if(!err){
            return res.status(401).json({message: "Invalid Token"});
        }
        req.user=decoded;
        next();
    })
    
};

export default refreshAuth;

