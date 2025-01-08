const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const authMiddleware = require("../middleware/authMiddleware");
const { registerValidation, loginValidation,changePasswordValidation } = require("../validation/authValidation");


// Public routes
router.post("/register",registerValidation, authController.register);
router.post("/login",loginValidation, authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword", authController.resetPassword);

// Protected routes
router.post("/changePassword", authMiddleware,changePasswordValidation, authController.changePassword);
router.get("/me", authMiddleware, authController.getUserDetails);

module.exports = router;
