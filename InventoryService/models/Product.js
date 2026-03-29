const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, unique: true, required: true },
    quantity: { type: Number, default: 0 },
    price: { type: Number, required: true },
    category: { type: String, enum: ['Shirt', 'Slippers', 'Other'], default: 'Other' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
