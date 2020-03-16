const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const RosterTypeSchema = new Schema({
    T: {} //Type
});

module.exports = mongoose.model(`RosterType`, RosterTypeSchema);

