const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword", authController.resetPassword);

// Protected routes
router.post("/changePassword", authMiddleware, authController.changePassword);
router.get("/me", authMiddleware, authController.getUserDetails);

module.exports = router;
