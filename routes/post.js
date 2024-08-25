const Post = require("../controller/postController");
const express = require("express");

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.post("/", Post.getAllPosts);
router.post("/spec", Post.getCount4Spec);
router.get("/getCount", Post.getRowCount);
router.get("/getPost/:postId", Post.getPosts);
router.post("/myPost/:userId", protect, Post.getMyPost);
router.post("/postContent", protect, Post.postPosts);
router.delete("/deletePost/:postId", protect, Post.deletePosts);
router.patch("/editPost/:postId", protect, Post.updatePosts);
router.get("/search*", Post.searchPosts);
router.post("/starred", protect, Post.getStarredPosts);

module.exports = router;
