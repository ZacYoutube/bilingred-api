const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 20,
        unique: true,
      },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 50,
      },
    password: {
        type: String,
        // required: true,
        min: 8,
      },
    // isAvatarImageSet: {
    //     type: Boolean,
    //     default: false,
    //   },
    profilePictureURL: {
        type: String,
        default: "",
      },

    userDisplayName:{
        type: String,
        default: ""
    },
    favoritePostList: {
        type: Array,
        default: []
    },
    // favoriteEventList:{
    //     type: Array,
    //     default: []
    // },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    followedPlaces:{
        type: Array,
        default: []
    },
    role:{
        type: String,
        default: "subscriber"
    },
    bio:{
        type: String,
        default:""
    },
    isGoogle:{
        type: Boolean
    },
    refresh_token: {
        type: String,
        default: ""
    },
    token: {
        type: String,
        default: ""
    },
},{
  collection : 'Users'
},{
  timestamps: true
}


)
userSchema.plugin(mongoosePaginate);

var User = mongoose.model("Users", userSchema);
module.exports = User;
