const express = require("express");
const router = express.Router();
const cat = require("../controller/category.controller");
const checkauth = require("../middleware/checkAdmin.Middleware");

//route api
router.post("/createCategoryApi",checkauth.checkAuth,cat.createCategory);
router.get("/getallacategoryApi",checkauth.checkAuth,cat.getallcategory);
router.delete("/removeCategoryApi",checkauth.checkAuth,cat.removecategory);
router.patch("/updatesCategoryApi",checkauth.checkAuth,cat.updatecategory);
router.get("/getCategoryDetails",checkauth.checkAuth,cat.getcategorydetails);

module.exports = router;
