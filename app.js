const express = require("express");
const app = module.exports.app = express();
const bodyParser = require("body-parser");
const category =   require("./routes/Category.routes");
const addproduct = require("./routes/Products.routes");
const auth = require("./routes/auth.route");
const customeredit = require("./routes/profile.editprofile.route");
const customerproduct = require("./routes/Customerside.ProductList.Route");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


//***Database Connection***   
require("./connection/connection");

//***Api Routes***

//category related
app.use("/api",category);

//Auth
app.use("/api",auth);
//admin side products related
app.use("/api",addproduct);
//Customer Side
app.use("/api",customeredit)
app.use("/api",customerproduct);


//***Server***/
app.listen(3000,(req,res)=>{
    console.log("Server Is Running On Port 4000");
})


