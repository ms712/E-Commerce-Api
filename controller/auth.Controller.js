const Users = require("../models/Users.Admin.Models");
const bcrypt = require("bcrypt"); 
const issuedtoken = require("../middleware/generateToken.Middleware");
const register = function(req,res){
    Users.findOne({email:req.body.email},function(err,data){       
          if(err) {
              res.status(500).send({message:err});
          } else {
              if(data) {
                    res.send("email already exist");
              } else {
                    bcrypt.hash(req.body.password,10,function(err,hashPassword) {
                        if(err) {
                                res.send(err);
                          }                     
                        let user = new Users({
                             email:req.body.email,
                             password:hashPassword,
                             isAdmin:req.body.isAdmin
                        });
                       user.save(function(err,data){
                         if(err) {
                               res.json({
                                   message:err});
                           }
                         else {
                            const payload =  {
                                   email:req.body.email,
                                   id:data.id,
                                   isAdmin:data.isAdmin
                            }
                               res.json({
                                   message:"Saved",
                                   user:data,
                                   token:`Bearer ${issuedtoken.generatedtoken(payload)}`
                                   
                               });                                                
                          }
                        });
                
                     });
                }
           }
    });                                               
}
//For Login
const login =  function(req,res,next){  
   
    Users.findOne({email:req.body.email},function(err,user){ 
        if(err)
            {
                return res.json(err);
            }
        if (user) {               
          bcrypt.compare(req.body.password,user.password,function(err,result){
                if (err) {
                            console.log(err);
                    }
                    
                if(result) {
                    const payload = {
                        email:user.email,
                        id:user._id,
                        isAdmin:user.isAdmin
                    }
                    res.status(200).json({
                        user:result,
                        token:`Bearer ${issuedtoken.generatedtoken(payload)}`,
                        message:"logged Successfully"
                    })

                } else { 
                    res.status(500).json({
                            message:"Password Incorrect"
                    })
                }
            })                    
        } else {
            res.json({
                message:"Email Not Found"
            })         
        }                                
    }) 
}
module.exports = {
    register,
    login
}