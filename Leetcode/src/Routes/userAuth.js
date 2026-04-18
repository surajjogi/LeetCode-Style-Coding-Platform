const express = require("express");
const userMiddleware=require('../middleware/userMiddleware.js');
const adminMiddleware=require('../middleware/adminMiddleware.js')
const authRouter = express.Router();
const {register,login,logout,adminRegister,deleteProfile}=require('../controllers/userAuthection')

//register
authRouter.post('/register',register)
//login
authRouter.post('/login',login);
//logout
authRouter.post('/logout',userMiddleware,logout);
//admin register
authRouter.post('/admin/register',adminMiddleware,adminRegister)
//get profile
// authRouter.get('/getProfile',getProfile);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile)
authRouter.get('/check',userMiddleware,(req,res)=>{

    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id:req.result._id,
        role:req.result.role,
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})
module.exports=authRouter;

