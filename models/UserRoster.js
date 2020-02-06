const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UserRosterSchema = new Schema({

    U: { //UserId
        type: String,
        required: true
    },
    G: { //GroupId
        type: String,
        required: true
    },
    W: { //Week
        type: Number,
        required: true
    },
    S: { //Season
        type: String,
        required: true
    },
    R: { //Roster
        QB: {
            type: Number,
            default: 0
        },
        RB1: {
            type: Number,
            default: 0
        },
        RB2: {
            type: Number,
            default: 0
        },
        WR1: {
            type: Number,
            default: 0
        },
        WR2: {
            type: Number,
            default: 0
        },
        Flex: {
            type: Number,
            default: 0
        },
        TE: {
            type: Number,
            default: 0
        },
        K: {
            type: Number,
            default: 0
        }
    }
});


module.exports = mongoose.model(`UserRoster`, UserRosterSchema);