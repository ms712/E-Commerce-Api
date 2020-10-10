const express = require("express");

const router = express.Router();

const AuthController = require("../controller/auth.controller");

router.post("/register", AuthController.register);

router.post("/logins", AuthController.login);

module.exports = router
