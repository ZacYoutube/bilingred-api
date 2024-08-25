const Conversation = require("../model/conversationModel");

const sendConver = async(req, res) => {
    const newConver = new Conversation({
        members:[req.body.senderId, req.body.receiverId],
        visibility:[req.body.senderId, req.body.receiverId]
    })

   
    const savedConver = await newConver.save();
    res.status(200).json(savedConver);
   

}

const getUserConver = async(req, res) => {
    const conversation = await Conversation.find({
        members : { $in:[req.params.userId]}
    })
    res.status(200).json(conversation)
   
}

const deleteConver = async(req, res) => {
    const converId = req.params.conversationId;
   
    await Conversation.findOneAndDelete({
        _id: converId
    })
    res.status(200).json()

        // console.log(visibility.length)

   
}

// module.exports.sendConver = sendConver;
// module.exports.getUserConver = getUserConver;
// module.exports.deleteConver = deleteConver;

module.exports = { 
    sendConver,
    getUserConver,
    deleteConver
 }