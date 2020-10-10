const express = require("express");
const app = module.exports.app = express();
const bodyParser = require("body-parser");
const path = require("path")
const category =   require("./routes/category.route");
const addproduct = require("./routes/products.route");
const auth = require("./routes/auth.route");
const customeredit = require("./routes/profile.editProfile.route");
const customerproduct = require("./routes/customerSide.productList.route");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'uploads')))
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


