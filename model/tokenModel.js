const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users',
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt :{
        type: Date,
        default: Date.now(),
        expires: 3600 // an hour
    }
}
)

var Token = mongoose.model("Tokens", tokenSchema);
module.exports = Token;
