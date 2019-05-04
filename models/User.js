const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UserSchema = new Schema({

    local: {
        firstname: {
            type: String,
        },
        lastname: String,
        username: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            unique: true,
        }
    },
    facebook: {
        id: String,
        token: String,
        displayname: String,
        email: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String,
        email: String
    },
    grouplist: [String],
    notification: [
        {
            category: {}, //Should be Group: groupID || Message: userID || Request {friend: userID} OR {joingroup: groupID}
            seen: Boolean
        }
    ], //Stores notifications to the user profile
    blockedUser: [String] // Array of user ids
});


module.exports = mongoose.model(`User`, UserSchema);