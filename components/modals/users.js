const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwd: { type: String, required: true},
    roles: { type: String, required: true },
},{ timestamps: true, versionKey: 'docVersion', minimize: false });

const userModel = mongoose.model("users",userSchema);

module.exports = {
    userModel,
};