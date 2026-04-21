const { getAIModel } = require("../utils/aiUtility");

const generateContentWithRetry = async (model, params, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await model.generateContent(params);
    } catch (error) {
      if (error.status === 503 && i < maxRetries - 1) {
        console.warn(`[Gemini API] 503 Service Unavailable. Retrying in 2 seconds... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }
  }
};

const generateProblem = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }

    const model = getAIModel();
    const systemInstruction = `
      You are an expert algorithm problem creator.
      Create a programming problem based on the user's idea.
      You MUST respond ONLY with a JSON object. Do NOT include Markdown formatting like \`\`\`json or \`\`\`. 
      The JSON object must have this exact structure:
      {
        "title": "String",
        "description": "String (Markdown supported, clear problem description, constraints)",
        "difficulty": "easy" | "medium" | "hard",
        "tags": "array" | "linkedlist" | "dynamic programming" | "graph" | "simple",
        "visibleTestCases": [ { "input": "String", "output": "String", "explanation": "String" } ],
        "hiddenTestCases": [ { "input": "String", "output": "String" } ],
        "startCode": [
          { "language": "C++", "initialCode": "..." },
          { "language": "Java", "initialCode": "..." },
          { "language": "JavaScript", "initialCode": "..." }
        ],
        "hiddenDriverCode": [
          { "language": "C++", "initialCode": "..." },
          { "language": "Java", "initialCode": "..." },
          { "language": "JavaScript", "initialCode": "..." }
        ],
        "referenceSolution": [
          { "language": "C++", "initialCode": "..." },
          { "language": "Java", "initialCode": "..." },
          { "language": "JavaScript", "initialCode": "..." }
        ]
      }
      
      Requirements:
      - Include exactly 2 visible test cases and 3 hidden test cases.
      - startCode MUST ONLY contain the basic class/function template. CRITICAL: For ALL languages including JavaScript, you MUST wrap the solution inside a \`class Solution { ... }\` so that the hiddenDriverCode can reliably instantiate it via \`new Solution()\`. Do NOT just export a function in JavaScript.
      - hiddenDriverCode MUST contain the full standard I/O reading boilerplate (e.g., \`int main()\` reading from \`cin\`). CRITICAL: You must include the exact text \`// USER_CODE_HERE\` exactly where the user's class should be injected! Example for C++: \`#include <iostream>\nusing namespace std;\n\n// USER_CODE_HERE\n\nint main() { ... }\`
      - For JavaScript, the hiddenDriverCode MUST use \`console.log()\` to print the final evaluated result to stdout. 
      - If the problem involves custom data structures like Linked Lists (\`ListNode\`) or Trees (\`TreeNode\`), you MUST fully define those classes/functions inside the \`hiddenDriverCode\` so the user's code can access them.
      - Reference solutions must be fully working standalone code that solves the problem.
      - CRITICAL: Ensure input/output formats are simple (e.g. space separated integers) suitable for standard IO reading since code is run via judge0 standard input.
    `;

    const fullPrompt = `${systemInstruction}\n\nUser Idea: ${prompt}`;
    const result = await generateContentWithRetry(model, {
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const problemData = JSON.parse(text);
      res.status(200).json(problemData);
    } catch (e) {
      console.error("Failed to parse AI response:", text);
      res.status(500).send("AI returned invalid format.");
    }
  } catch (error) {
    console.error("Error generating problem:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
};

const chatSupport = async (req, res) => {
  try {
    const { problemTitle, problemDescription, userCode, question } = req.body;
    if (!question) {
      return res.status(400).send("Question is required");
    }

    const model = getAIModel();
    const chatPrompt = `
      You are an expert AI teaching assistant for a competitive programming platform.
      A user is solving a problem and needs help. 
      Problem Title: ${problemTitle || 'Unknown'}
      Problem Description: ${problemDescription || 'Unknown'}
      User's Current Code: 
      ${userCode || 'No code provided'}
      
      User's Question: ${question}
      
      Instructions:
      1. Be encouraging, helpful, and concise.
      2. If the user asks for a hint, give a conceptual hint. DO NOT give them the direct answer or the full code.
      3. If they ask to spot an error, point out the logical or syntax error without rewriting the entire function for them.
      4. Use Markdown for formatting code snippets or emphasis.
    `;

    const result = await generateContentWithRetry(model, chatPrompt);
    res.status(200).json({ reply: result.response.text() });
  } catch (error) {
    console.error("Error in AI support chat:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
};

module.exports = { generateProblem, chatSupport };
