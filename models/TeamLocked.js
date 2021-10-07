const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const TeamLockedSchema = new Schema({
    T: { //Team
        type: String,
        required: true,
    },
    ST: { //Locked for Week (AKA they started playing)
        type: Date,
        required: true,
    },
    W: { //Week this time is for
        type: Number,
        required: true
    },
    S: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model(`TeamLocked`, TeamLockedSchema);