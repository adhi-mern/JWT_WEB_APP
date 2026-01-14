import User from "../models/User.js";

const me =  async(req, res)=>{
  const user = req.user;
  const email = user.Email;
  const me = await User.findOne({email});// without await "me" is just a Promise (MongoDB query is still running)
  res.status(200).json({
    id: me._id,
    username: me.username,
    email: me.email,
    isEmailVerified: me.isEmailVerified,
  })
}

export default me;