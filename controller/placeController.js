const Place = require('../model/placeModel');
const asyncHandler = require('express-async-handler');
const tyccl = require('node-tyccl');
var jieba = require("nodejieba");

// @desc    Get place data
// @route   GET /place
// @access  Public
const getAllPlaces = asyncHandler(async(req, res) => {
    const place = await Place.find({})
    res.status(200).json({place});
})

// @desc    Add place data
// @route   POST /place
// @access  Public
const addPlace = asyncHandler(async(req, res) => {
    const { name, shortHand, type, address } = req.body;

    let addressCut = jieba.extract(address, 5);
    let nameCut = jieba.extract(name, 5);
    addressCut = addressCut.map((item, index)=>{
        return item['word'];
    })
    nameCut = nameCut.map((item, index)=>{
        return item['word'];
    })
    let textCuts = addressCut.concat(nameCut);
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
    const place = await Place.create({
        name : name,
        shortHand: shortHand,
        type: type,
        address : address,
        textCuts: result
    })

    res.status(200).json({place});
})

// @desc    Delete place data
// @route   DELETE /place:placeId
// @access  Public
const deletePlace = asyncHandler(async(req, res) => {
    const placeId = req.params.placeId;
    await Place.findOneAndDelete({
        _id: placeId
    })
    res.status(200).json(`Successfully deleted the place with id ${placeId}`)
})

const getMyPlaces = asyncHandler(async(req, res)=>{
    const id = req.params.placeId;

    const place = await Place.findById(id);

    res.status(200).json(place)
})

const searchPlaces = asyncHandler(async(req, res)=>{
    try{
        const query = req.query.query;
        const queryCut = jieba.extract(query, query.length).map(item => item['word']);
        const searchStr = queryCut.join(" ");
        // {createdAt:{$gte:ISODate("2021-01-01"),$lt:ISODate("2020-05-01"}}
        const results = await Place.find({$text: {$search: searchStr}}).sort({"createdAt": -1});
        // console.log(results)  
        let tempList = JSON.parse(JSON.stringify(results));
        // for(const item of tempList){
        //     const userInfo = await User.findById(item.userId);
        //     item['profileName'] = userInfo.username;
        //     item['profileImageUrl'] = userInfo.profilePictureURL;
        //     item['user'] = userInfo;
        // }
        res.status(200).json(tempList);     
    }catch(err){
        res.status(400).send(err);
    }
})



module.exports = { 
    getAllPlaces,
    addPlace,
    deletePlace,
    getMyPlaces,
    searchPlaces
 }