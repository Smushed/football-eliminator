const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UserScores = new Schema({

    U: { //User ID
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    G: { //GroupID
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    S: { //Season
        type: String,
        required: true
    },
    TS: { //Total Score
        type: Number,
        default: 0
    },
    '1': {
        type: Number,
        default: 0
    },
    '2': {
        type: Number,
        default: 0
    },
    '3': {
        type: Number,
        default: 0
    },
    '4': {
        type: Number,
        default: 0
    },
    '5': {
        type: Number,
        default: 0
    },
    '6': {
        type: Number,
        default: 0
    },
    '7': {
        type: Number,
        default: 0
    },
    '8': {
        type: Number,
        default: 0
    },
    '9': {
        type: Number,
        default: 0
    },
    '10': {
        type: Number,
        default: 0
    },
    '11': {
        type: Number,
        default: 0
    },
    '12': {
        type: Number,
        default: 0
    },
    '13': {
        type: Number,
        default: 0
    },
    '14': {
        type: Number,
        default: 0
    },
    '15': {
        type: Number,
        default: 0
    },
    '16': {
        type: Number,
        default: 0
    },
    '17': {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model(`UserScores`, UserScores);
