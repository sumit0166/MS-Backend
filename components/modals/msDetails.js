const mongoose = require('mongoose');


const msDetailsSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    name: String,
    host: String,
    port: Number,
    url: String,
    status: String,
    statusCode: {type: Number, default: 0},
    lastUpTime: Date,
    lastDownTime: Date
})


const msDetailsModel = mongoose.model("msDetails",msDetailsSchema);

module.exports = {
    msDetailsModel,
};