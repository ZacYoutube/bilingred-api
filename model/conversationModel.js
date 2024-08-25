const mongoose = require("mongoose");

const ConversationSchema = mongoose.Schema({
    members: {
      type: Array
    },
},{
  timestamps: true
}


)

var Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation;
