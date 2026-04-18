const express = require("express");
const problemRouter=express.Router();
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem}=require('../controllers/userProblem')

const adminMiddleware=require('../middleware/adminMiddleware.js')
const userMiddleware=require("../middleware/userMiddleware.js")
//we need the admin access for 5,6,7 route 
problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);

 
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblemByUser);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);
problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/submittedProblem/:id",userMiddleware,submittedProblem)


module.exports = problemRouter; 