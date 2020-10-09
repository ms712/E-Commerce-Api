const Users = require("../models/users.Admin.models");
const bcrypt = require("bcrypt");
var Promise = require("bluebird");
Promise.promisifyAll(require("mongoose")); 
const issuedtoken = require("../middleware/generateToken.Middleware");
console.log("do..changes....")
const register = async function(req,res){
    try {
       const foundUser =  await Users.findOne({email:req.body.email})
       if (await foundUser) {
            res.status(200).json({message:"Already Exist"})
       } else {
          const hashpassword = await bcrypt.hash(req.body.password,10)
          let user = new Users({
            email:req.body.email,
            password:hashpassword,
            isAdmin:req.body.isAdmin
          })
          const saveuser = await user.save();
          if (await saveuser) {
            const payload =  {
                email:req.body.email,
                id:saveuser.id,
                isAdmin:saveuser.isAdmin
            }
            res.status(200).json({
                user:saveuser,
                token:`Bearer ${issuedtoken.generatedtoken(payload)}`
            })      
          } else {
             res.status(400).json(saveuser) 
              
          }
       }          
    } catch (error) {
       throw error   
    }                                               
}
const login = async function(req,res,next){  
    try {
        const user = await Users.findOne({email:req.body.email})
        if (user) {
            const comparepassword = await bcrypt.compare(req.body.password,user.password) 
            if (await comparepassword) {
                const payload = {
                    email:user.email,
                    id:user._id,
                    isAdmin:user.isAdmin
                }
                res.status(200).json({
                    user:user,
                    token:`Bearer ${issuedtoken.generatedtoken(payload)}`
                })
            } else {
                res.status(500).json({message:"Password Incorrect"})
            } 
        } else {
            res.status(400).json({message:"Email Not Found"})
        }     
    } catch (error) {
        throw error       
    }
     
}
module.exports = {
    register,
    login
}