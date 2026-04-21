const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
let genAI = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn("GEMINI_API_KEY is not defined in the environment variables.");
}

const getAIModel = (modelName = "gemini-flash-latest") => {
  if (!genAI) {
    throw new Error("Generative AI is not initialized. Please check your GEMINI_API_KEY.");
  }
  return genAI.getGenerativeModel({ model: modelName });
};

module.exports = { getAIModel };
