const express = require("express");
const userMiddleware=require('../middleware/userMiddleware.js');
const adminMiddleware=require('../middleware/adminMiddleware.js')
const demoAdminMiddleware=require('../middleware/demoAdminMiddleware.js')
const authRouter = express.Router();
const {register,login,logout,adminRegister,deleteProfile,getAllUsers,getPlatformStats,updateUserRole}=require('../controllers/userAuthection')

//register
authRouter.post('/register',register)
//login
authRouter.post('/login',login);
//logout
authRouter.post('/logout',userMiddleware,logout);
//admin register
authRouter.post('/admin/register',adminMiddleware,adminRegister)
//get profile
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

// ── Admin user management routes ─────────────────────────────────────────────
authRouter.get('/admin/users', adminMiddleware, getAllUsers);
authRouter.get('/admin/stats', adminMiddleware, getPlatformStats);
authRouter.patch('/admin/users/:id/role', adminMiddleware, demoAdminMiddleware, updateUserRole);
authRouter.delete('/admin/users/:id', adminMiddleware, demoAdminMiddleware, async (req, res) => {
    const User = require('../models/user');
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed: ' + err.message });
    }
});

module.exports=authRouter;
