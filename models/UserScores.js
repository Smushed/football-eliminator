const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UserScores = new Schema({

    userId: { //This is who the roster belongs to
        type: String,
        unique: true,
        required: true
    },
    weeklyScore: {
        'groupId': {
            type: String,
            required: true,
            default: `allUsers`
        },
        'totalScore': Number,
        '1': Number,
        '2': Number,
        '3': Number,
        '4': Number,
        '5': Number,
        '6': Number,
        '7': Number,
        '8': Number,
        '9': Number,
        '10': Number,
        '11': Number,
        '12': Number,
        '13': Number,
        '14': Number,
        '15': Number,
        '16': Number,
        '17': Number,
    }
});

module.exports = mongoose.model(`UserScores`, UserScores);
