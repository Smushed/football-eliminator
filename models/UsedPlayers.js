const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UsedPlayerSchema = new Schema({
    ID: { //ID
        type: String,
    },
    S: String, //Season
    UP: [Number]
});


module.exports = mongoose.model(`UsedPlayers`, UsedPlayerSchema);