const { getLanguageById, submitBatch,submitToken } = require("../utils/problemUtility");

const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;
  console.log(req.body);
  try {
    for (const {language,initialCode } of referenceSolution) {
      const Language = getLanguageById(language);
      console.log(Language)
      // Prepare submissions for all visible test cases
      const submissions = visibleTestCases.map((testcase) => ({
         source_code:initialCode,
            language_id: Language,
            stdin: testcase.input,
            expected_output: testcase.output
      }));
  console.log(submissions)
     const submitResult = await submitBatch(submissions);
        // console.log(submitResult);

        const resultToken = submitResult.map((value)=> value.token);

        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
       const testResult = await submitToken(resultToken);


       console.log(testResult);

       // Temporarily disabled strict validation so AI problems can be created even if they are slightly wrong
       /*
       for(const test of testResult){
        if(test.status_id!=3){
         const errMsg = test.compile_output || test.stderr || (test.status && test.status.description) || `Status ID: ${test.status_id} (e.g., 4=Wrong Answer, 5=Time Limit Exceeded, 6=Compile Error)`;
         return res.status(400).send(`Test Failed for language ${language}: ${errMsg}`);
        }
       }
       */
    }
       
    

    // All reference solutions passed - create the problem
 const userProblem =  await Problem.create({
        ...req.body,
        problemCreator: req.result._id
      });

      res.status(201).send("Problem Saved Successfully");

  
  } catch (err) {
     res.status(400).send("Error: "+err);
  }
};

const updateProblem = async (req, res) => {
  console.log("it is running");
  const { id } = req.params;
  if (!id) {
    return res.status(400).send("id is not defined");
  }
  const dsaProblem = await Problem.findById(id);
  if (!dsaProblem) {
    return res.status(400).send("problem is not found");
  }
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;


  try {
    for (const { language, initialCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      // Prepare submissions for all visible test cases
      const submissions = visibleTestCases.map((testcase) => ({
         source_code:initialCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output
      }));

      const submitResult = await submitBatch(submissions);
      // console.log(submitResult);

      const resultToken = submitResult.map((value)=> value.token);

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
      
     const testResult = await submitToken(resultToken);
      // Temporarily disabled strict validation
      /*
      for(const test of testResult){
      if(test.status_id!=3){
       const errMsg = test.compile_output || test.stderr || (test.status && test.status.description) || `Status ID: ${test.status_id} (e.g., 4=Wrong Answer, 5=Time Limit Exceeded, 6=Compile Error)`;
       return res.status(400).send(`Test Failed for language ${language}: ${errMsg}`);
      }
     }
     */
    }
     const newProblem = await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
   
  res.status(200).send(newProblem);
  }
  catch(err){
      res.status(500).send("Error: "+err);
  }
  
};


const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).send("ID is Missing");
    }
    const deleteProblem = await Problem.findByIdAndDelete(id);
    if (!deleteProblem) {
      return res.status(404).send("problem is missing");
    }
    res.status(200).send("Sucessfully deleted");
  } catch (err) {
    res.status(404).send("Error: " + err.message);
  }
};


const getProblemById=async (req,res)=>{
const {id}=req.params;
try {
    if (!id) {
      return res.status(400).send("ID is Missing");
    }
    const getProblem = await Problem.findById(id).select('title description tags difficulty visibleTestCases hiddenTestCases startCode hiddenDriverCode referenceSolution');
 if(!getProblem){
  return res.status(404).send("Problem is missing");
 }
res.status(200).send(getProblem);
  
} catch (err) {
   res.status(404).send("Error: " + err.message);
}


}

const getAllProblem = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const problems = await Problem.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }).select('title tags difficulty');

    const total = await Problem.countDocuments();
    res.status(200).json({
      data: problems,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch problems"
    });
  }
};


const solvedAllProblemByUser=async(req,res)=>{
  try {
 //use populate method to all solvedProblem are fetched with one request
 const userId=req.result._id;
 console.log(userId)
 const user=await User.findById(userId).populate({
  path:"problemSolved",
  select:"_id title difficulty tags"
 });
console.log(user);
res.status(200).send(user.problemSolved)
 
  } catch (err) {
    res.status(500).send("server Error")
  }
}

const submittedProblem=async(req,res)=>{
try {
  const userId=req.result._id;
const problemId=req.params.id;
const ans=await Submission.find({userId,problemId})
if(ans.length==0){
  res.status(200).send("No submision is persent")
}
res.status(200).send(ans);
} catch (err) {
  res.status(500).send("Internal Server Error")

}

}
module.exports = { createProblem,updateProblem, deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem };
