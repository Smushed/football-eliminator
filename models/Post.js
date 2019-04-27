const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const PostSchema = new Schema({
    user: String, //UserID of the user that made a post
    group: String, //The group that this post belongs to, if any
    date: Date,
    title: String,
    text: String,
    comment: [{
        user: String,
        text: String,
        date: Date,
        _id: String
    }] //Any comments that are attached to the post
})

module.exports = mongoose.model(`Post`, PostSchema);