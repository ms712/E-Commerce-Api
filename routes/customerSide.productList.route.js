const express = require("express");
const router = express.Router();
const checkAuth  = require("../middleware/checkUser.Middleware");
const product = require("../controller/cutomerSide.Products.controller");
router.get("/getallproductsApi",product.getallproducts);
router.get("/viewProduct",product.viewproductdetail);
router.post("/addtocart",checkAuth.checuserkAuth,product.addtocart)
router.post("/orderproduct",checkAuth.checuserkAuth,product.orderproduct)
router.get("/orderinfo",checkAuth.checuserkAuth,product.displayorder);
router.get("/displaycart",checkAuth.checuserkAuth,product.displaycart);
router.post("/deladdress",checkAuth.checuserkAuth,product.addaddress)
router.post("/cancelorder",checkAuth.checuserkAuth,product.cancelorder)
router.post("/removefromcart",checkAuth.checuserkAuth,product.removefromcart)



module.exports = router;
