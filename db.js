const mongoose = require('mongoose');
require('dotenv').config();
const connectToDB = mongoose.connect(process.env.MONGOURL);
module.exports = {
    connectToDB
}