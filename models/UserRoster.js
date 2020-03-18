const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UserRosterSchema = new Schema({

    U: { //UserId
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: false
    },
    G: { //GroupId
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: false
    },
    W: { //Week
        type: Number,
        required: true,
        unique: false
    },
    S: { //Season
        type: String,
        required: true,
        unique: false
    },
    R: [Number] //Roster
});


module.exports = mongoose.model(`UserRoster`, UserRosterSchema);