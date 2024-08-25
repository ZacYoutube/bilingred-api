const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');

const getJSON = async function(url) {
    try{
        const response = await axios.get(url);
        return response.data;
    }catch(err){
        return err;
    }
};

const checkExpiration = (decoded) => {
    const now = Date.now().valueOf() / 1000
    if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
        return true;
    }
    if (typeof decoded.nbf !== 'undefined' && decoded.nbf > now) {
        return true;
    }
    return false;
}

const protect = asyncHandler( async (req, res, next) => {
    let token;
    if(req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')){
        try{
            // get token from header
            token = req.headers.authorization.split(' ')[1];
            // console.log(req.body.refresh_token, token)
            //verify token
            if(req.body.isGoogle){
                const googleClient = new OAuth2Client(
                    process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
                    'postmessage',
                );
                let certificate = await getJSON('https://www.googleapis.com/oauth2/v1/certs');
                const header = jwt.decode(token, { complete: true }).header;
                const cert = certificate[header.kid];
                let decoded = jwt.verify(token, cert, { algorithms: ['RS256'] , ignoreExpiration: true} );
                const isExpired = checkExpiration(decoded);
                if(isExpired){
                    googleClient.setCredentials({
                        refresh_token: req.body.refresh_token
                      });
                    const res = await googleClient.refreshAccessToken();
                    decoded = jwt.verify(res.credentials.id_token, cert, { algorithms: ['RS256'] });
                }
                req.user = await User.findOne({email: decoded?.email})
                console.log(req.user);
                next();
            }else{
                const decoded = jwt.verify(token, process.env.REACT_APP_JWT_SECRET)
                // get user from the token
                req.user = await User.findById(decoded.id).select('-password')
                // console.log(req.user);
                next();
            }
            
            
        }catch(err){
            console.log(err);
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    if(!token){
        res.status(401);
        throw new Error('Not authorized - No Token');
    }

})

module.exports = { protect }