const Post = require('../model/postModel');
const User = require('../model/userModel');
const asyncHandler = require('express-async-handler');
const tyccl = require('node-tyccl');
var jieba = require("nodejieba");

// @desc    Get post data
// @route   POST /post/:postId
// @access  Private
const getPosts = asyncHandler(async(req, res) => {
    const id = req.params.postId;
    const posts = await Post.findById(id);
    res.status(200).json({posts});
    
})

const getRowCount = asyncHandler(async(req, res) => { 
    try{
        const total = await Post.countDocuments();
        res.status(200).json({
            count: total
        })
    }
    catch(err){
        res.status(400).send(err);
    }
})

const getCount4Spec = asyncHandler(async(req, res) => { 
    try{
        let query = Post.find({
            placeId : { $in: req.body.followedPlaces}
        });
        const total = await Post.countDocuments({ placeId : { $in: req.body.followedPlaces} });
        const response = await query;
        res.status(200).json({
            count: total,
            res: response
        })
    }
    catch(err){
        res.status(400).send(err);
    }
})

const getAllPosts = asyncHandler(async(req, res) => {
   
    try{
        // console.log(req.body)
       
        let query = Post.find({
            placeId : { $in: req.body.followedPlaces}
        }).sort({"createdAt": -1});
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * pageSize;
        const total = await Post.countDocuments();
        const response = await query;

        const pages = Math.ceil(total / pageSize);

        query = query.skip(skip).limit(pageSize);

        if(page > pages){
            return res.status(404).json({
                status: "failed",
                message: "No page found"
            })
        }

        let tempList = JSON.parse(JSON.stringify(response));
        for(const item of tempList){
            const userInfo = await User.findById(item.userId);
            item['profileName'] = userInfo.username;
            item['profileImageUrl'] = userInfo.profilePictureURL;
            item['user'] = userInfo;
        }
        return res.status(200).json({
            status: "success",
            count: res.length,
            page,
            pages,
            total,
            data: tempList
        });
    }catch(err){
        res.status(400).send(err);
    }
    
})

const getMyPost = asyncHandler(async(req, res) => {
    const userId = req.params.userId;
    const posts = await Post.find({ userId: userId });
    res.status(200).json({posts});
    
})

// @desc    Post post data
// @route   POST /post/:postId
// @access  Private
const postPosts = asyncHandler(async(req, res) => {

    const { _id } = await User.findById(req.user.id);
    const { title, image, text, placeId, at, html } = req.body;

    const content = html.replace(/<[^>]+>/g, '');
    let contentCut = jieba.extract(content, 5);
    let titleCut = jieba.extract(title, 5);
    contentCut = contentCut.map((item, index)=>{
        return item['word'];
    })
    titleCut = titleCut.map((item, index)=>{
        return item['word'];
    })
    const textCuts = contentCut.concat(titleCut);
    let result = [];
    for(let i = 0; i < textCuts.length; i++){
        let sim = tyccl.getSynonym(textCuts[i]);
        sim.forEach(word=>{
            let similarityScore = tyccl.getSimilarity(word, textCuts[i]);
            if(similarityScore >= 0.5)
                result.push(word);
        })
    }

    result = result.concat(textCuts);

    // create post
    const post = await Post.create({
        userId : _id,
        title: title,
        image: [...image],
        text : text,
        placeId: placeId,
        at: at,
        textCuts: result
    })

    if(post){
        res.status(200).json({
            post,
            success: true
        });
    }else{
        res.status(400).json({
            success: false
        });
    }
   
   
})

// @desc    Delete post data
// @route   DELETE /post/:postId
// @access  Private
const deletePosts = asyncHandler(async(req, res) => {
    const postId = req.params.postId;
    const user = await User.findById(req.user.id);
    const post = await Post.findById(req.params.postId);
    if(!post){
        res.status(400);
        throw new Error("Post not found");
    }
    if(!user){
        res.status(401);
        throw new Error("User not found");
    }

    if(post.userId.toString() !== user.id && user.role != "admin"){
        // console.log(user)
        res.status(401);
        throw new Error("User not authorized");
    }
    await Post.findOneAndDelete({
        _id: postId
    })
    res.status(200).json(`Successfully deleted the post with id ${postId}`)
})

// @desc    Update post data
// @route   PATCH /post/:postId
// @access  Private
const updatePosts = asyncHandler(async(req, res) => {
    const postId = req.params.postId;
    const post = await Post.findById(req.params.postId);
    if(!post){
        res.status(400);
        throw new Error("Post not found");
    }
    
    const html = req.body.html;
    const title = req.body.title;
    const text = req.body.text;
    const image = req.body.image;
    
    const content = html.replace(/<[^>]+>/g, '');
    let contentCut = jieba.extract(content, 5);
    let titleCut = jieba.extract(title, 5);
    contentCut = contentCut.map((item, index)=>{
        return item['word'];
    })
    titleCut = titleCut.map((item, index)=>{
        return item['word'];
    })
    const textCuts = contentCut.concat(titleCut);
    let result = [];
    for(let i = 0; i < textCuts.length; i++){
        let sim = tyccl.getSynonym(textCuts[i]);
        sim.forEach(word=>{
            let similarityScore = tyccl.getSimilarity(word, textCuts[i]);
            if(similarityScore >= 0.5)
                result.push(word);
        })
    }

    result = result.concat(textCuts);

    await Post.findOneAndUpdate({
        _id: postId,
    },
    {   
        title: title,
        image: image,
        text: text,
        textCuts: result
    }
    )
    res.status(200).json({
        success: true
    });
})

const searchPosts = asyncHandler(async(req, res)=>{
    try{
        const query = req.query.query;
        const queryCut = jieba.extract(query, query.length).map(item => item['word']);
        // console.log(queryCut)
        const searchStr = queryCut.join(" ");
        // console.log(searchStr);
        // {createdAt:{$gte:ISODate("2021-01-01"),$lt:ISODate("2020-05-01"}}
        const results = await Post.find({$text: {$search: searchStr}}).sort({"createdAt": -1});
        // console.log(results)  
        let tempList = JSON.parse(JSON.stringify(results));
        for(const item of tempList){
            const userInfo = await User.findById(item.userId);
            item['profileName'] = userInfo.username;
            item['profileImageUrl'] = userInfo.profilePictureURL;
            item['user'] = userInfo;
        }
        // console.log(tempList)
        res.status(200).json(tempList);     
    }catch(err){
        res.status(400).send(err);
    }
})

const getStarredPosts = asyncHandler(async(req, res)=>{
    try{
        const userId = req.user.id;
        const response = await User.findById(userId);
        const favoritePostList = response.favoritePostList;
        const result = [];
        for(let i = 0; i < favoritePostList.length; i++){
            const post = await Post.findById(favoritePostList[i]);
            if(post) result.push(post);
            else{
                // delete here
            }
        }
        let tempList = JSON.parse(JSON.stringify(result));
        for(const item of tempList){
            const userInfo = await User.findById(item.userId);
            item['profileName'] = userInfo.username;
            item['profileImageUrl'] = userInfo.profilePictureURL;
            item['user'] = userInfo;
        }

        res.status(200).json({tempList});
    }catch(err){
        res.status(400).send(err);
    }

    
}) 

const changeInPoolStatus = asyncHandler(async(req, res)=> {

});

const changeIsLiveStatus = asyncHandler(async(req, res)=> {
    
});


module.exports = { 
    getPosts,
    postPosts,
    deletePosts,
    updatePosts,
    getMyPost,
    getAllPosts,
    getRowCount,
    getCount4Spec,
    searchPosts,
    getStarredPosts
 }