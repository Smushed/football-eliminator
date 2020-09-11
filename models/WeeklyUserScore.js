const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const WeeklyUserScore = new Schema({

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
    W: { //Week
        type: Number,
        required: true,
    },
    SC: [Number] // Score for the User's Roster
});

module.exports = mongoose.model(`WeeklyUserScore`, WeeklyUserScore);
