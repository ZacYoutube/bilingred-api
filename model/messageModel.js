const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const MessageSchema = mongoose.Schema({
   conversationId:{
      type: String
   },
   sender:{
      type: String
   },
   text:{
      type: String
   }

},{
  timestamps: true
},
{ capped: { size: 1024, max: 1000, autoIndexId: true } }

)

MessageSchema.plugin(mongoosePaginate);

var Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
