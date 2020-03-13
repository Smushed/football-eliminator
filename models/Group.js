const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const GroupSchema = new Schema({
    N: { //Name
        type: String,
        unique: true
    },
    D: String, //Description
    UL: [ //Userlist
        {
            ID: mongoose.Schema.Types.ObjectId, //UserID
            A: { //Admin
                type: Boolean,
                default: false
            },
            B: { //Blocked
                type: Boolean,
                default: false
            },
            _id: false
        }
    ],
});

module.exports = mongoose.model(`Group`, GroupSchema);