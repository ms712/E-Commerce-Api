const jwt = require("jsonwebtoken");
require('dotenv').config();
const checkAuth = (req,res,next)=>{
    
const privatekey = process.env.PRIVATE_KEY       
const authHeader = req.headers.authorization; 
    if(typeof req.headers.authorization !== "undefined") {
        const token = authHeader && authHeader.split(' ')[1].toString();
   
    if(token ==  null) return res.sendStatus(401);

    jwt.verify(token,privatekey,function(err,verifying) {
        if(err) {
            res.status(401).json({
                message:err
            });
        }                       
        if(verifying) { 
            req.user = verifying;
            if(req.user.isAdmin === true) {
                next(); 
            }else{
                res.status(403).json({
                    message:"Forbidden"
                })               
            }
        } else {   
            res.status(401).json({
                message:"Unauthorized"
            })
        }                  
    })      
    }
}

module.exports = {
    checkAuth
}