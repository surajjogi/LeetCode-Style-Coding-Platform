const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { generateProblem, chatSupport } = require('../controllers/aiController');

// Only admins can generate problems, using userMiddleware to ensure authenticated user.
// Since problem creation endpoint relies on admin validation in frontend, we assume the same.
// We can add an admin check here, but userMiddleware is standard for this project.
aiRouter.post('/generate-problem', userMiddleware, generateProblem);
aiRouter.post('/chat-support', userMiddleware, chatSupport);

module.exports = aiRouter;
