const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const PlayerStatsSchema = new Schema({
    M: {
        type: Number,
    },
    W: {
        type: Number,
    },
    S: {
        type: String,
    },
    P: {
        T: {
            type: Number,
            default: 0
        },
        Y: {
            type: Number,
            default: 0
        },
        I: {
            type: Number,
            default: 0
        },
        A: {
            type: Number,
            default: 0
        },
        C: {
            type: Number,
            default: 0
        },
        '2P': {
            type: Number,
            default: 0
        },
    },
    RU: {
        A: {
            type: Number,
            default: 0
        },
        Y: {
            type: Number,
            default: 0
        },
        T: {
            type: Number,
            default: 0
        },
        '20': {
            type: Number,
            default: 0
        },
        '40': {
            type: Number,
            default: 0
        },
        F: {
            type: Number,
            default: 0
        },
    },
    RE: {
        TA: {
            type: Number,
            default: 0
        },
        R: {
            type: Number,
            default: 0
        },
        Y: {
            type: Number,
            default: 0
        },
        T: {
            type: Number,
            default: 0
        },
        '20': {
            type: Number,
            default: 0
        },
        '40': {
            type: Number,
            default: 0
        },
        F: {
            type: Number,
            default: 0
        },
    },
    F: {
        type: Number,
        default: 0
    },
    FG: {
        '1': {
            type: Number,
            default: 0
        },
        '20': {
            type: Number,
            default: 0
        },
        '30': {
            type: Number,
            default: 0
        },
        '40': {
            type: Number,
            default: 0
        },
        '50': {
            type: Number,
            default: 0
        },
    }
});

module.exports = mongoose.model(`PlayerStats`, PlayerStatsSchema);