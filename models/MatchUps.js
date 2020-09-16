const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const MatchUps = new Schema({
    S: { //Season
        type: String,
        required: true
    },
    W: { //Week
        type: Number,
        required: true,
    },
    M: [{
        H: String, //Home
        A: String, //Away
        W: String,  //Weather
        _id: false
    }]
});

module.exports = mongoose.model(`MatchUps`, MatchUps);
