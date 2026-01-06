import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function jwtAuth(req, res, next){
    // console.log(req);
    const authorize = req.headers.authorization || '';
    if(!authorize){
        return res.status(401).json({message: "Access token required"});
    }
    const  [header, token] = authorize.split(' '); 

    if(!token){
        return res.status(400).json({message: "Access token required"});
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {   
    //Token valid → err = null, user = { id: "64f8b123...", iat: 1640995200 }
    //Token invalid → err = { name: 'TokenExpiredError', message: 'jwt expired' }, user = undefined
    if(err){
        return res.status(403).json({message: "Invalid tocken"});
    }
    req.user=user;
    // console.log(user);
    next(); // forward request to next handler in the /me route
    }); 
    
};

export default jwtAuth;