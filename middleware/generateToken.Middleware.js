const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretekey = process.env.PRIVATE_KEY;
console.log("mykey",secretekey);

const generatedtoken = (payload)=>{
       const token = jwt.sign(payload,secretekey);
       return token
}
module.exports = {
    generatedtoken
}