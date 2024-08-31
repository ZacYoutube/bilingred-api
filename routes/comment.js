const Comment = require("../controller/commentController");
const express = require("express");

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.post("/:postId", protect, Comment.getComments);
router.post("/", protect, Comment.addComment);
router.delete("/:commentId", protect, Comment.deleteComment);
router.patch("/:commentId", protect, Comment.editComment);

module.exports = router;
