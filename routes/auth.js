const User = require("../controller/userController");
const express = require("express");

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.post("/login", User.login);
router.get("/:id", User.findUser);
router.get("/refresh/:id", User.findUser);
router.post("/register", User.addUser);
router.patch("/update", protect, User.updateUser);
router.post("/google/auth", User.googleAuthenticate);
router.get("/:id/verify/:token", User.verifyEmail);

module.exports = router;
