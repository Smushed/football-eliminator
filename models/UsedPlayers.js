const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UsedPlayerSchema = new Schema({
    ID: { //UserId
        type: mongoose.Schema.Types.ObjectId,
    },
    S: String, //Season
    UP: [Number] //Used Players (MySportsId)
});


module.exports = mongoose.model(`UsedPlayers`, UsedPlayerSchema);