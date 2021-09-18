const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    UN: { //Username
        type: String,
        unique: true
    },
    E: { //Email
        type: String,
        unique: true,
    },
    GL: [mongoose.Schema.Types.ObjectId], //GroupList
    A: { //Admin
        type: Boolean,
        default: false
    },
    MG: mongoose.Types.ObjectId, //Main Group
});


module.exports = mongoose.model(`User`, UserSchema);