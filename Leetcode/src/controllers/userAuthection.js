require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const validate = require("../utils/validate");
const jwt = require("jsonwebtoken");
const requirClient = require("../config/redis");
const redisClient = require("../config/redis");
const useMiddleware = require('../middleware/userMiddleware')
const Submission = require("../models/submission")
//register feature
// const register = async (req, res) => {

//     try {
//         validate(req.body);

//         const user = await User.create(req.body);
//         const { firstName, emailId, password } = req.body;
//         const token = jwt.sign(
//             { _id: user._id, emailId: emailId },
//             process.env.JWT_KEY,
//             { expiresIn: 60 * 60 }
//         );
//         res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
//         res.status(201).send("user Registered Sucessfully");
//     } catch (err) {
//         res.status(400).send("Error:" + err);
//     }
// };
const register = async (req, res) => {
  try {

    validate(req.body);
    const { firstName, lastName, emailId, password } = req.body;

    // 1. Hash the password before saving!
    const passwordHash = await bcrypt.hash(password, 10);
    //chec user before tying to create
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered. Please login or use another email."
      });
    }
    // 2. Create user with the hashed password
    const user = await User.create({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    req.body.role = user;
    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role
    }


    const token = jwt.sign({ _id: user._id, emailId: emailId, role: 'user' }, process.env.JWT_KEY, { expiresIn: "1h" });
    res.cookie("token", token, { sameSite: 'none', secure: true });
    // res.status(201).send("User Registered Successfully");
    res.status(200).send({
      user: reply,
      meassage: "User Register sucessfully"
    })
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

//login feature
// const login = async (req, res) => {
//     try {
//         const { emailId, password } = req.body;

//         if (!emailId) {
//             throw new Error("invalid Credentilas");
//         }
//         if (!password) {
//             throw new Error("invalid Credentilas");
//         }
//         const user = await User.findOne({ emailId })
//         const match = bcrypt.compare(password, user.body)
//         if (!match) {
//             throw new Error("invalid Credtinals")
//         }
//         const token = jwt.sign(
//             { _id: user._id, emailId: emailId },
//             process.env.JWT_KEY,
//             { expiresIn: 60 * 60 }
//         );
//         res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
//         res.status(200).send("logged in sucessfully");
//     } 
//     catch (err) {
//         res.status(401).send("Error:" + err);
//     }



// };

//correct the bcrypt error
const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid Credentials");

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid Credentials");

    const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });
    res.cookie("token", token, { sameSite: 'none', secure: true });
    // res.send("Logged in successfully");

    res.status(200).send({
      user: reply,
      meassage: "Login sucessfully"
    })
  } catch (err) {
    res.status(401).send("Error: " + err.message);
  }
};

// logout feature  but it is very simple but not use in real worlds mnc because if anyone save the token they can easily access until the token is not expired
// const logout = async (req, res) => {
//   // To logout, simply clear the cookie
//   res.cookie("token", null, { expires: new Date(0) });
//   res.send("Logged out successfully");
// };

//we use 

//use redis method
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.decode(token);
    await redisClient.set(`token:${token}`, "blocked Token")
    await redisClient.expireAt(`token:${token}`, payload.exp);
    res.cookie("token", null, { expires: new Date(0), sameSite: 'none', secure: true })
    res.send("Logged out successfully");
  } catch (err) {
    res.status(500).send("Logout failed: " + err.message);
  }

};

const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;
    // 1. Hash the password before saving!
    req.body.password = await bcrypt.hash(password, 10);
    // 2. Create user with the hashed password
    const user = await User.create(req.body);
    const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
    res.cookie('token', token, { maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    res.status(201).send("Admin Registered Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }


}

const deleteProfile = async (req, res) => {
  try {
    const userId = req.params._id;
    //delete the schema
    await User.findByIdAndDelete(userId)
    //delete also submission which stroed by user
    //we use post middleware insead of this. 
    // await Submission.deleteMany({userId})    

    res.status(200).send("deleted sucessfully")

  } catch (err) {
    res.status(501).send("server internal error")
  }



}
module.exports = { login, register, logout, adminRegister, deleteProfile }