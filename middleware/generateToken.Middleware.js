const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretekey = process.env.PRIVATE_KEY;

const generatedtoken = (payload) => {
    const token = jwt.sign(payload, secretekey);
    return token
}
module.exports = {
    generatedtoken
}