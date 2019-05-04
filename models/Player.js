const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const GroupSchema = new Schema({
    full_name: {
        type: String,
    },
    player_id: {
        type: String,
    },
    team: {
        type: String,
        default: `UNK`
    },
    player_position: {
        type: String,
        default: `UNK`
    }
});

module.exports = mongoose.model(`Group`, GroupSchema);