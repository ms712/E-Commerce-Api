const User  = require("../models/users.Admin.models");
var Promise = require("bluebird");
Promise.promisifyAll(require("mongoose"))

const editprofile = async (req,res,next)=>{
    const options = {new:true}
    const filter = {email:req.user.email}
    const update = {
        name:req.body.name,
        surname:req.body.surname,
        address:req.body.address,
        contact:req.body.contact,
        profileImage:req.file.path
    }
    try {
        const updateprofile = await User.findOneAndUpdate(filter,{$set:update},options)
        res.status(200).json(updateprofile)    
    } catch (error) {
        throw error
    }
}
module.exports = {
    editprofile
}
