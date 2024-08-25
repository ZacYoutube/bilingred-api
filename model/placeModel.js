const mongoose = require('mongoose');

const placeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        shortHand: {
            type: String,
            required: true,
        },
        type :{ 
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        textCuts: {
            type: Array,
            default:[]
        },
    } 
    ,{
        timestamps: true
      }  
)

var Place = mongoose.model("Places", placeSchema);
module.exports = Place;