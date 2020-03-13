const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UsedPlayerSchema = new Schema({
    ID: { //UserId
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    S: { //Season
        type: String,
        required: true
    },
    UP: [Number] //Used Players (MySportsId)
});


module.exports = mongoose.model(`UsedPlayers`, UsedPlayerSchema);