const Message = require("../controller/messageController");
const express = require("express");

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');


router.post("/", protect, Message.sendMsg);
router.get("/:conversationId", protect, Message.getMsg);
router.delete("/:conversationId", protect, Message.deleteMsg);

module.exports = router;
