const Token = require('../model/tokenModel');
const asyncHandler = require('express-async-handler');


// @desc    Delete token data
// @route   DELETE /token:token
// @access  Public
const deleteToken = asyncHandler(async(req, res) => {
    const token = req.params.token;
    await Token.findOneAndDelete({
        token: token
    },
    )
    res.status(200).json(`Successfully deleted the token ${token}`)
})




module.exports = { 
    deleteToken
 }