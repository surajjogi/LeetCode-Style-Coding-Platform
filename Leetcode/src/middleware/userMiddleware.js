const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis')
const User = require('../models/user');
const userMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(400).send("No token provided");
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id } = payload;
        if (!_id) {
            throw new Error("invalid token")
        }
        const result = await User.findById(_id)
        if (!result) {
            throw new Error("User Does not Exist");
        }
        //check the token is blocked or not 
        const isBlocked = await redisClient.exists(token)
        if (isBlocked) {
            throw new Error("Invalid Token")
        }
        req.result = result;
        //    console.log(payload)
        //    console.log(result)
        next();

    } catch (err) {
        res.send("Error:" + err.message);
    }

}

module.exports = userMiddleware