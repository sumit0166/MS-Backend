const mongoose = require('mongoose');


const prodcutSchema = new mongoose.Schema({
    name: String,
    variant: String,
    type: String,
    category: String,
    brand: String,
    description: String,
    image: String,
    prdoductType: String
}, { timestamps: true, versionKey: 'docVersion', minimize: false })


const productModel = mongoose.model("products",prodcutSchema);

module.exports = {
    productModel,
};