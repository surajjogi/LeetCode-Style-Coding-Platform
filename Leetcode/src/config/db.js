const mongoose=require('mongoose');
require('dotenv').config({path:'../.env'});
async function main(){
    await mongoose.connect(process.env.MONGO_STRING);
    console.log("mongodb connected!");
}

module.exports=main;


