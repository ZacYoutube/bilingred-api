const Comment = require("../model/commentModel");

const getComments = async(req, res) => {
    const comments = await Comment.find({
        postId: { $in:[req.params.postId]}
    })
    res.status(200).json(comments)
}

const addComment = async(req, res) => {
    const newComment = new Comment({
        body: req.body.body,
        parentId: req.body.parentId,
        postId: req.body.postId,
        userId: req.body.userId,
        username: req.body.username,
        userProfileImage: req.body.userProfileImage,
        parentId: req.body.parentId
    })

   
    const savedComment = await newComment.save();
    res.status(200).json(savedComment);
}

const deleteCommentAndChildren = async (commentId) => {
    // Find all child comments of the given commentId
    const childComments = await Comment.find({ parentId: commentId });

    // Recursively delete each child comment
    for (const child of childComments) {
        await deleteCommentAndChildren(child._id);
    }

    // Delete the parent comment itself
    await Comment.findOneAndDelete({ _id: commentId });
};

const deleteComment = async (req, res) => {
    const commentId = req.params.commentId;

    try {
        // Delete the comment and all its children
        await deleteCommentAndChildren(commentId);

        res.status(200).json({ success: true, message: 'Comment and its children deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete the comment.', error: error.message });
    }
};

const editComment = async(req, res) => {
    console.log(req.params, req.body);
    const commentId = req.params.commentId;
    const comment = await Comment.findById(req.params.commentId);
    if(!comment){
        res.status(400);
        throw new Error("Comment not found");
    }
    
    const body = req.body.body;

    await Comment.findOneAndUpdate({
        _id: commentId,
    },
    {   
        body: body
    }
    )
    res.status(200).json({
        success: true
    });
}

module.exports = { 
    getComments,
    addComment,
    deleteComment,
    editComment
 }