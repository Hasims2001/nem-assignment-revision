const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
    Title:  String,
    Author: String,
    ISBN: String,
    Description : String,
    PublishedDate : String

})

const BookModel = mongoose.model('book', bookSchema);

module.exports = {
    BookModel
}