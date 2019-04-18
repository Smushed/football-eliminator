const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
//Authors is plural as that's what google feeds in
const BookSchema = new Schema({
    title: String,
    authors: [String],
    pageCount: Number,
    image: String,
    description: String,
    preview: String
});


module.exports = mongoose.model(`Book`, BookSchema);