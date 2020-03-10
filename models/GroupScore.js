const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const GroupScoreSchema = new Schema({
    P: {//Passing
        T: { //TD
            type: Number,
            default: 4
        },
        Y: { //Pass Yards
            type: Number,
            default: 0.04
        },
        I: { //Int
            type: Number,
            default: -2
        },
        A: { //Attempts
            type: Number,
            default: 0
        },
        C: { //Completions
            type: Number,
            default: 0
        },
        '2P': { //2PT Pass
            type: Number,
            default: 2
        },
    },
    RU: { //Rushing
        A: { //Attempts
            type: Number,
            default: 0
        },
        Y: { //Rush Yards
            type: Number,
            default: 0.1
        },
        T: { //Rush TD
            type: Number,
            default: 6
        },
        '20': { //20Plus Rush
            type: Number,
            default: 0
        },
        '40': { //40Plus Rush
            type: Number,
            default: 0
        },
        'F': { //Fumbles
            type: Number,
            default: -2
        },
        '2P': { //2PT Rush
            type: Number,
            default: 2
        },
    },
    RE: {
        TA: { //Targets
            type: Number,
            default: 0
        },
        R: { //Receptions
            type: Number,
            default: 0
        },
        Y: { //Rec Yards
            type: Number,
            default: 0.1
        },
        T: { //Rec TD
            type: Number,
            default: 6
        },
        '20': { //20Plus Rec
            type: Number,
            default: 0
        },
        '40': { //40Plus Rec
            type: Number,
            default: 0
        },
        F: { //Rec Fumble
            type: Number,
            default: -2
        },
        '2P': { //2PT Rec
            type: Number,
            default: 0
        },
    },
    F: {
        F: { //Fumble
            type: Number,
            default: -2
        },
    },
    FG: {
        1: { //1-19 FG
            type: Number,
            default: 2
        },
        20: { //20-29 FG
            type: Number,
            default: 2
        },
        30: { //30-39 FG
            type: Number,
            default: 2
        },
        40: { //40-49 FG 
            type: Number,
            default: 3
        },
        50: { //50 plus FG 
            type: Number,
            default: 5
        },
        'X': { //Extra Point
            type: Number,
            default: 1
        },
    }
});

module.exports = mongoose.model(`GroupScore`, GroupScoreSchema);