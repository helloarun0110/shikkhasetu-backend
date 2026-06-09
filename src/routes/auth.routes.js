const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validateRegister, validateLogin } = require("../validations/auth.validation");


router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/me", authMiddleware, authController.getMe);

router.put("/profile", authMiddleware, authController.updateUserProfile);
router.put("/password", authMiddleware, authController.updatePassword);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);  

module.exports = router;




