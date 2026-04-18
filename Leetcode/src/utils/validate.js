const validator = require('validator');
const validate=(data)=>{
const mandatoryField=['firstName','emailId','password'];
const isAllowed=mandatoryField.every((e)=>Object.keys(data).includes(e));
if(!isAllowed){
    throw new Error("some missing field");
    
}
if(!validator.isEmail(data.emailId))
{
    throw new Error('Invalid Email');
}
const length = data.password.length;

if (length < 3 || length > 16) {
  throw new Error('Password must be between 3 and 16 characters.');
}
if(!validator.isStrongPassword(data.password)){
    throw new Error("Weak password");
}
}
module.exports=validate;