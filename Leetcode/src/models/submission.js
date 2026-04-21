const mongoose =require('mongoose');
const { applyTimestamps } = require('./user');
const { Schema } = mongoose;

const submissionSchema=new Schema({

userId:{
    type:Schema.Types.ObjectId,
    ref:'user',
    required:true,
    index:true

},
problemId:{
    type:Schema.Types.ObjectId,
     ref:'problem',
     required:true,
     index:true
},
code:{
    type:String,
    required:true
},
status:{
    type:String,
    enum:['pending','accepted','wrong','error'],
    default:'pending'
   
},
language:{
    type:String,
    enum:['javascript','java','c++'],
    required:true

},

runtime:{
    type:Number,
    default:0
},
memory:{
    type:Number,
    default:0
},
   errorMessage:{
    type:String,
    default:''
   },
 testCasesPassed:{
    type:Number,
    default:0
 },
 testCasesTotal:{
    type:Number,
    default:0
 }


},{timestamps:true})

submissionSchema.index({userId:1,problemId:1})

const Submission=mongoose.model('submission',submissionSchema);
module.exports=Submission;