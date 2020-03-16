const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UserRosterSchema = new Schema({

    U: { //UserId
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: false
    },
    G: { //GroupId
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: false
    },
    W: { //Week
        type: Number,
        required: true,
        unique: false
    },
    S: { //Season
        type: String,
        required: true,
        unique: false
    },
    R: { //Roster
        QB: {
            type: Number, //These are MySportsIds rather than Mongoose Ids
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