const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    passwd: String,
    roles: String,
},{ timestamps: true, versionKey: 'docVersion', minimize: false });

const userModel = mongoose.model("users",userSchema);

module.exports = {
    userModel,
};