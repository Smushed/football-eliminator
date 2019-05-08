const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const FantasyStatsSchema = new Schema({
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    mySports_id: {
        type: String,
    },
    team: {
        id: {
            type: Number
        },
        abbreviation: {
            type: String,
            default: `UNK`,
            trim: true
        },
    },
    position: {
        type: String,
        default: `UNK`
    },
});

module.exports = mongoose.model(`FantasyStats`, FantasyStatsSchema);