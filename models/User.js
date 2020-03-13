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
    A: Boolean //Admin
});


module.exports = mongoose.model(`User`, UserSchema);