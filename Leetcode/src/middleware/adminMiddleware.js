const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/user');

const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login." });
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id } = payload;
        if (!_id) {
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);
        if (!result) {
            throw new Error("User does not exist");
        }

        // Allow both 'admin' and 'demoAdmin' roles
        if (result.role !== 'admin' && result.role !== 'demoAdmin') {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        // Check if token is blacklisted (logged out)
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            return res.status(401).json({ error: "Token has been invalidated. Please login again." });
        }

        req.result = result;
        next();

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired. Please login again." });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token. Please login again." });
        }
        return res.status(401).json({ error: err.message });
    }
};

module.exports = adminMiddleware;