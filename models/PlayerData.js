const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const PlayerDataSchema = new Schema({
    N: { //Name
        type: String,
        required: true,
        trim: true
    },
    M: { //mySportsId
        type: Number,
    },
    T: { //Team
        type: String,
        default: `UNK`,
        trim: true
    },
    P: { //Position
        type: String,
        default: `UNK`
    },
    A: Boolean, //Active
    R: Number, //Rank
});

module.exports = mongoose.model(`PlayerData`, PlayerDataSchema);
