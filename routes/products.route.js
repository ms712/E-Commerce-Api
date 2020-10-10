const express = require("express");
const multer = require("multer");
const router = express.Router();
const product = require("../controller/products.controller");
const checkauth = require("../middleware/checkAdmin.Middleware");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post("/addproductApi", checkauth.checkAuth, upload.single("productImage"), product.addproduct);
router.patch("/updateproductApi/:prid", checkauth.checkAuth, upload.single("productImage"), product.updateproduct);
router.delete("/removeApi", checkauth.checkAuth, product.removeproduct);
router.get("/productDetailsApi", checkauth.checkAuth, product.getproductdetails);
router.post("/allproducts", checkauth.checkAuth, product.productlist);

module.exports = router;    