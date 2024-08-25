const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Users'
        },
        placeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Places'
        },
        title: {
            type: String,
            required: true,
        },
        image: {
            type: Array,
        },
        text :{ 
            type: String,
            required: true,
        },
        tags: {
            type: Array,
            default:[]
        },
        at: {
            type: String,
            required: true
        },
        textCuts: {
            type: Array,
            default:[]
        },
        isPool:{
            type: Boolean,
            default: false
        },
        onLive: {
            type : Boolean,
            default: false
        },
        bid:{
            type: Number,
            default : 0
        }

        
    } 
    ,{
        timestamps: true
      }  
)

postSchema.index({textCuts: 'text', title: 'text'});
var Post = mongoose.model("Posts", postSchema);
module.exports = Post;