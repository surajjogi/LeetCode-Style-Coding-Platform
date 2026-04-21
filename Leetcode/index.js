const dns = require("node:dns");
dns.setServers(["1.1.1.1"]);
const express=require('express');
const app =express();
require('dotenv').config();
const PORT=process.env.PORT;
const main = require('./src/config/db.js');
const cors = require('cors');

var cookieParser = require('cookie-parser');
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
const authRouter = require('./src/Routes/userAuth.js');
const problemRouter=require('./src/Routes/problemCreator.js')
const submitRouter=require('./src/Routes/submit.js')
const aiRouter=require('./src/Routes/ai.js')
app.use('/user',authRouter);
app.use('/problem',problemRouter)
app.use('/submission',submitRouter)
app.use('/ai', aiRouter)
const redisClient=require("../Leetcode/src/config/redis.js")
const useMiddleware=require('../Leetcode/src/middleware/userMiddleware.js')
main()
.then(async ()=>{
app.listen(PORT,()=>{
    console.log(`server is running and port number is ${PORT}`)
})
})
.catch(err=>console.log(err));

