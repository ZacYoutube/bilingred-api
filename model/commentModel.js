const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
    {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: false
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true,
        },
        userProfileImage: {
            type: String,
            required: true
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false
        }
    } 
    ,{
        timestamps: true
      }  
)

var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;