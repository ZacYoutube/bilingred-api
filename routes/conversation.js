const Conver = require("../controller/conversationController");
const express = require("express");

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');


router.post("/", protect, Conver.sendConver);
router.get("/:userId", protect, Conver.getUserConver);
router.delete("/:conversationId", protect, Conver.deleteConver);

module.exports = router;