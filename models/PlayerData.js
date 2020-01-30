const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const PlayerDataSchema = new Schema({
    N: {
        type: String,
        required: true,
        trim: true
    },
    M: {
        type: Number,
    },
    T: {
        type: String,
        default: `UNK`,
        trim: true
    },
    P: {
        type: String,
        default: `UNK`
    },
    A: Boolean,
    R: Number,
});

module.exports = mongoose.model(`PlayerData`, PlayerDataSchema);
