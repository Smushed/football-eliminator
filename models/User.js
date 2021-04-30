const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
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
    FT: { //Favorite Team
        type: String,
        default: 'CHI'
    },
    MG: mongoose.Types.ObjectId //Main Group
});


module.exports = mongoose.model(`User`, UserSchema);