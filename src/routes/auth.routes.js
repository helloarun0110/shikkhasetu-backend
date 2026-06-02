const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validateRegister, validateLogin } = require("../validations/auth.validation");


router.post("/register", validateRegister, authController.register);


router.post("/login", validateLogin, authController.login);


router.get("/me", authMiddleware, authController.getMe);

module.exports = router;



