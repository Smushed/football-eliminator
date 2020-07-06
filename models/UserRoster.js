const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UserRosterSchema = new Schema({

    U: { //UserId
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    G: { //GroupId
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    W: { //Week
        type: Number,
        required: true,
    },
    S: { //Season
        type: String,
        required: true,
    },
    R: [Number] //Roster
});


module.exports = mongoose.model(`UserRoster`, UserRosterSchema);