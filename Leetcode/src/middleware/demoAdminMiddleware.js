
const demoAdminMiddleware = (req, res, next) => {
    if (req.result && req.result.role === 'demoAdmin') {
        return res.status(403).json({
            error: " Demo admin account cannot perform this action. This is a read-only demo account."
        });
    }
    next();
};

module.exports = demoAdminMiddleware;
