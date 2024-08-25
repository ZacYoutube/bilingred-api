const User = require("../model/userModel");
const Token = require("../model/tokenModel");
const { sendVerificationEmail } = require("../utils/sendVerificationEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// @desc    Login authentication
// @route   POST /user/login
// @access  Private
const login = asyncHandler(async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    // console.log('im here', email, password)
 
    // check for email
    const user = await User.findOne({ email });
    const isValidPass = await bcrypt.compare(password, user.password);
    
    if(!isValidPass){
        // console.log("not true~~~")
        res.status(400);
        throw new Error("Invalid credentials")
    }

    if(!user.isEmailVerified){
        let token = await Token.findOne({userId: user._id});
        if(!token){
            token = await Token.create({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex")
            })
        
            const url = `${process.env.REACT_APP_BASE_URL}user/${user._id}/verify/${token.token}`;
            await sendVerificationEmail(user.email, "Verify Email", url);
        }
        res.status(200).send({message: "An email has been sent to your account. Please verify"});

    }
    if(user && isValidPass && user.isEmailVerified){
        res.json({
            _id: user.id,
            name: user.userDisplayName,
            email: user.email,
            token: generateToken(user._id),
            profilePictureURL: user.profilePictureURL,
            favoriteEventList: user.favoriteEventList,
            favoritePostList: user.favoritePostList,
            isEmailVerified: user.isEmailVerified,
            followedPlaces: user.followedPlaces,
            isGoogle: user.isGoogle,
            bio: user.bio
        })
    }

       
})

// @desc    Get user data
// @route   POST /user/me
// @access  Private
const findUser = asyncHandler(async(req, res) => {
    const { _id, userDisplayName, email, profilePictureURL, favoriteEventList, favoritePostList, isEmailVerified, followedPlaces, isGoogle, bio } = await User.findById(req.params.id);
    res.status(200).json({
        _id: _id,
        name: userDisplayName,
        email: email,
        profilePictureURL: profilePictureURL,
        favoriteEventList: favoriteEventList,
        favoritePostList: favoritePostList,
        isEmailVerified: isEmailVerified,
        followedPlaces: followedPlaces,
        isGoogle: isGoogle,
        bio: bio
    })
})

// @desc    Register a new user 
// @route   POST /user/register
// @access  Public
const addUser = asyncHandler(async(req, res) => {
    const { email, password, profilePictureURL, userDisplayName, username, role } = req.body;
    
    // validate 
    if(!email || !password || !username){
        res.status(400);
        throw new Error('Please enter the fields');
    }

    // check if user exist
    const userExists = await User.findOne({ email })
    if(userExists){
        res.status(400);
        throw new Error('User already registered')
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // create user
    const user = await User.create({
        email: email,
        password: hashedPassword, 
        username: username,
        profilePictureURL: profilePictureURL,
        userDisplayName: userDisplayName,
        role: role ? role : "subscriber",
        isGoogle: false
    })

    const token = await Token.create({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex")
    })

    if(!token){
        res.status(400);
        throw new Error('Token generated failure')
    }


    const url = `${process.env.REACT_APP_BASE_URL}user/${user._id}/verify/${token.token}`;
    await sendVerificationEmail(user.email, "Verify Email", url);

    
    // res.status(200).send({message: "An email has been sent to your account. Please verify", email});
    if(user){
        res.status(201).json({
            _id: user.id,
            name: user.userDisplayName,
            email: user.email,
            token: generateToken(user._id),
            profilePictureURL: user.profilePictureURL,
            favoriteEventList: user.favoriteEventList,
            favoritePostList: user.favoritePostList,
            isEmailVerified: user.isEmailVerified,
            followedPlaces: user.followedPlaces,
            bio: user.bio
        })
    }else{
        res.status(400);
        throw new Error('Invalid user data')
    }

})

const verifyEmail = asyncHandler(async(req, res) => {
    try{
        const user = await User.findOne({_id: req.params.id});
        if(!user)
            return res.status(400).send({message: "Invalid user"});
        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token
        })
        if(!token)
            return res.status(400).send({message: "Invalid link"});
        else{
            await User.findOneAndUpdate({
                _id: user._id,
            },
            {   
                isEmailVerified: true
            }
            )
            
        res.status(200).send({message: "email verified!", token: token});
        
        }
        
    }catch(err){
        res.status(500).send({message: "Internal error"});
    }
})

const updateUser = asyncHandler(async(req, res) => {
    // const { _id, userDisplayName, email } = await User.findById(req.user.id);
    const {  profilePictureURL, userDisplayName, favoritePostList, favoriteEventList, followedPlaces, bio } = req.body;
    await User.findByIdAndUpdate({_id: req.user.id}, {
        // password: password,
        favoritePostList: favoritePostList,
        favoriteEventList: favoriteEventList,
        profilePictureURL: profilePictureURL,
        userDisplayName: userDisplayName,
        followedPlaces: followedPlaces,
        bio: bio
    })

    res.status(200).json(`Successfully updated the user with id ${req.user.id}`);

})

// generate jwt 
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.REACT_APP_JWT_SECRET, {
        expiresIn: '30d'
    })
}

// const GOOGLE_CALL_BACK_URL = "http://localhost:9000/google/auth"
// passport.use(new GoogleStrategy({
//     clientID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
//     clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
//     callbackURL: GOOGLE_CALL_BACK_URL,
//     passReqToCallback: true
// }, async()=>{

// }))

const googleAuthenticate = asyncHandler(async(req, res)=>{
    // Handle Google Auth
    const googleClient = new OAuth2Client(
        process.env.REACT_APP_GOOGLE_CLIENT_ID,
        process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
        'postmessage',
      );
    const { tokens } = await googleClient.getToken(req.body.code);
    console.log(tokens)
    const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audient: `${process.env.REACT_APP_GOOGLE_CLIENT_ID}`,
    });
    const payload = ticket.getPayload();
    // console.log("payload", payload)
    let user = await User.findOne({email: payload?.email});
    if(!user){
        user = await User.create({
            email: payload?.email,
            password: "", 
            username: payload?.name,
            profilePictureURL: payload?.picture,
            userDisplayName: payload?.name,
            role: "subscriber",
            isEmailVerified: payload?.email_verified,
            isGoogle: true,
            token: tokens.id_token,
            refresh_token: tokens.refresh_token,
            // googleId: payload
        })
        if(user){
            res.status(200).json({
                _id: user.id,
                name: user.userDisplayName,
                email: user.email,
                token: tokens.id_token,
                profilePictureURL: user.profilePictureURL,
                favoriteEventList: user.favoriteEventList,
                favoritePostList: user.favoritePostList,
                isEmailVerified: user.isEmailVerified,
                followedPlaces: user.followedPlaces,
                isGoogle: user.isGoogle,
                bio: user.bio,
                refresh_token: tokens.refresh_token
            })
        }
    }else{
        res.status(200).json({
            _id: user.id,
            name: user.userDisplayName,
            email: user.email,
            token: tokens.id_token,
            profilePictureURL: user.profilePictureURL,
            favoriteEventList: user.favoriteEventList,
            favoritePostList: user.favoritePostList,
            isEmailVerified: user.isEmailVerified,
            followedPlaces: user.followedPlaces,
            isGoogle: user.isGoogle,
            bio: user.bio,
            refresh_token: user.refresh_token
        })
    }
})

module.exports = { 
    login,
    findUser,
    addUser,
    updateUser,
    googleAuthenticate,
    verifyEmail
 }