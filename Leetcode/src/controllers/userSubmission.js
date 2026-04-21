const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch,submitToken } = require("../utils/problemUtility");
const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { language, code } = req.body;
    if (language === "cpp") language = "c++";
    if (!language || !code || !problemId || !userId) {
      return res.status(400).send("some missing field");
    }
    //fetch the problem form database
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }
   
    console.log(problem);
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      testCasesPassed: 0,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    const languageId = getLanguageById(language);
    //give the code to the judgeo
    let finalCode = code;
    if (problem.hiddenDriverCode && problem.hiddenDriverCode.length > 0) {
      const driver = problem.hiddenDriverCode.find(h => h.language.toLowerCase() === language.toLowerCase() || h.language.toLowerCase() === (language === "cpp" ? "c++" : language));
      if (driver && driver.initialCode) {
        if (driver.initialCode.includes("// USER_CODE_HERE")) {
          finalCode = driver.initialCode.replace("// USER_CODE_HERE", code);
        } else {
          finalCode = code + "\n\n" + driver.initialCode;
        }
      }
    }

    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: finalCode,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));
                                     
    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);
    //judge the output form piston api.
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4 || test.status_id == 6) {
          status = "error";
          errorMessage = test.compile_output || test.stderr || test.message;
        } else {
          status = "wrong";
          errorMessage = test.compile_output || test.stderr || test.message;
        }
      }
    }

    /*Persist Final Verdict  */
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();
    //problem id insert the user schema in problemSolved for containing the number of problem solved.
    //in req.result have the all details of user
    if (!req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    const accepted = status == "accepted";
    res.status(201).json({
      accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      error: errorMessage,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

const runCode = async (req, res) => {
  //
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    //    Fetch the problem from database
    const problem = await Problem.findById(problemId);
    //    testcases(Hidden)
    if (language === "cpp") language = "c++";

    //    Judge0 code ko submit karna hai

    const languageId = getLanguageById(language);

    let finalCode = code;
    if (problem.hiddenDriverCode && problem.hiddenDriverCode.length > 0) {
      const driver = problem.hiddenDriverCode.find(h => h.language.toLowerCase() === language.toLowerCase() || h.language.toLowerCase() === (language === "cpp" ? "c++" : language));
      if (driver && driver.initialCode) {
        if (driver.initialCode.includes("// USER_CODE_HERE")) {
          finalCode = driver.initialCode.replace("// USER_CODE_HERE", code);
        } else {
          finalCode = code + "\n\n" + driver.initialCode;
        }
      }
    }

    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: finalCode,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = false;
          errorMessage = test.stderr;
        } else {
          status = false;
          errorMessage = test.stderr;
        }
      }
    }

    res.status(201).json({
      success: status,
      testCases: testResult,
      runtime,
      memory,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

module.exports = { submitCode, runCode };
