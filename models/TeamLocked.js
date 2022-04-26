const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const TeamLockedSchema = new Schema({
    T: { //Team
        type: String,
        required: true,
        trim: true
    },
    ST: { //Starting Time
        type: Date,
        required: true,
    },
    W: { //Week this time is for
        type: Number,
        required: true
    },
    S: { //Season
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model(`TeamLocked`, TeamLockedSchema);