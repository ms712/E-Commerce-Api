const express = require("express");

const router = express.Router();
const checkAuth = require("../middleware/checkUser.Middleware");
const profile = require("../controller/CustomerProfile.Controller");
const multer = require("multer");
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads/");

    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
});

const upload = multer({storage:storage});

router.post("/editProfileApi",checkAuth.checuserkAuth,upload.single("profileImage"),profile.editprofile);


module.exports = router;
