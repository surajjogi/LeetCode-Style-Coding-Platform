const axios = require("axios");
const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };

  return language[lang.toLowerCase()];
};




// const submitBatch = async (submissions)=>{


// const options = {
//   method: 'POST',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     base64_encoded: 'false'
//   },
//   headers: {
//     'x-rapidapi-key': process.env.JUDGE0_KEY,
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//     'Content-Type': 'application/json'
//   },
//   data: {
//     submissions
//   }
// };

const submitBatch = async (submissions) => {
  try {
    const response = await axios.post(
      "http://15.206.28.10:2358/submissions/batch?base64_encoded=false",
      {
        submissions: submissions,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
};
                                         
const waiting = async(timer)=>{
  setTimeout(()=>{
    return 1;
  },timer);
}
const submitToken = async (resultToken) => {

  const options = {
    method: "GET",
    url: "http://15.206.28.10:2358/submissions/batch", // your EC2 Judge0
    params: {
      tokens: resultToken.join(","),
      base64_encoded: "false",
      fields: "*",
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error("Fetch Error:", error.message);
    }
  }

  // Polling loop
  while (true) {
    const result = await fetchData();

    if (!result || !result.submissions) {
      console.error("Invalid response from Judge0");
      return;
    }

    const isResultObtained = result.submissions.every(
      (r) => r.status_id > 2   
    );

    if (isResultObtained) return result.submissions;

    await new Promise((resolve) => setTimeout(resolve, 1000)); 
  }
};






module.exports = { getLanguageById, submitBatch, submitToken };
