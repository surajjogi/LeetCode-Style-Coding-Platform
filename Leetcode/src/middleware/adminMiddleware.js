const jwt=require('jsonwebtoken');
const redisClient=require('../config/redis')
const User = require('../models/user');
const adminMiddleware=async (req,res,next)=>{
try {
    const {token} = req.cookies;
        if (!token) {
          return res.status(400).send("No token provided");
        }
        
    const payload = jwt.verify(token, process.env.JWT_KEY); 
    const{_id}=payload;
    if(!_id){
        throw new Error("invalid id")
    }
    const result=await User.findById(_id)
    console.log(result)
   //checks the user is admin or not if not throw the error
    if(payload.role!='admin'){
throw new Error("Invalid Token");      
    }
    if(!result){
        throw new Error("User Does not Exist");
    }
    //check the token is blocked or not 
   const isBlocked= await redisClient.exists(`token:${token}`)
   
   if(isBlocked){
    throw new Error("Invalid Token")
   }

   req.result=result;

   next();


} catch (err) {
    res.send("Error:"+err.message);
}

}

module.exports=adminMiddleware