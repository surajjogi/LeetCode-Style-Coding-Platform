const express = require("express");
const problemRouter=express.Router();
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem}=require('../controllers/userProblem')

const adminMiddleware=require('../middleware/adminMiddleware.js')
const demoAdminMiddleware=require('../middleware/demoAdminMiddleware.js')
const userMiddleware=require("../middleware/userMiddleware.js")

// ── Write routes: blocked for demoAdmin ─────────────────────────────────────
problemRouter.post("/create",  adminMiddleware, demoAdminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, demoAdminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, demoAdminMiddleware, deleteProblem);

// ── Read routes: accessible to all authenticated users ───────────────────────
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblemByUser);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);
problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/submittedProblem/:id",userMiddleware,submittedProblem)


module.exports = problemRouter; 