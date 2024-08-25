const Message = require("../model/messageModel");

const sendMsg = async(req, res) => {
    const newMsg = new Message(req.body)
    const savedMsg = await newMsg.save();
    res.status(200).json(savedMsg);
}

const getMsg = async(req, res) => {
   
    const { page, perPage } = req.query;
    const messages = await Message.paginate({
        conversationId: req.params.conversationId
    },{
        page: parseInt(page, 10),
        limit: parseInt(perPage, 10)
    });
    // const messages = await Message.find({
    //     conversationId: req.params.conversationId
    // })
    res.status(200).json(messages);
}

const deleteMsg = async(req, res) => {
    const converId = req.params.conversationId;
    
    await Message.deleteMany({
        conversationId : converId
    })
    
}

// module.exports.sendMsg = sendMsg;
// module.exports.getMsg = getMsg;
// module.exports.deleteMsg = deleteMsg;

module.exports = { 
    sendMsg,
    getMsg,
    deleteMsg
 }