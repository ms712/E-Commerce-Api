const User  = require("../models/Users.Admin.Models");

const editprofile = (req,res,next)=>{

        console.log(User);
    const filter = {email:req.user.email}
    const update = {
        name:req.body.name,
        surname:req.body.surname,
        address:req.body.address,
        contact:req.body.contact,
        profileImage:req.file.path
    }
    const options = {new:true}
    User.findOneAndUpdate(filter,{$set:update},options,function(err,updateprofile){
        if (err) {
            res.json({
                message:err
            })
        } else {
                res.status(200).json({
                profile:updateprofile
            })            
        }
    }) 
}
module.exports = {
    editprofile
}
