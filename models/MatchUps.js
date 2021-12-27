const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const MatchUpsSchema = new Schema({
    S: { //Season
        type: String,
        required: true,
        trim: true
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

module.exports = mongoose.model(`MatchUps`, MatchUpsSchema);
