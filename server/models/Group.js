const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const GroupSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    description: String,
    userlist: [
        {
            _id: String,
            isAdmin: {
                type: Boolean,
                default: false
            },
            isMod: {
                type: Boolean,
                default: false
            },
            isBanned: {
                type: Boolean,
                default: false
            }
        }
    ],
});

module.exports = mongoose.model(`Group`, GroupSchema);