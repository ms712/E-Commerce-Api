const mongoose = require("mongoose");
module.exports  = mongoose.connect("mongodb://localhost/EcommerceApiDb",{ useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false },function(err,user){
    if(err){
        console.log(err)
    }else{
        console.log("connected");
    }
})