const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");

// POST
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refreshToken", authController.requestRefreshToken);
router.post("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/changePassword", authController.changePassword);

// UPDATE
router.put("/confirmEmail/:token", authController.confirmedEmail);

module.exports = router;
