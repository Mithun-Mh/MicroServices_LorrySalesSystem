const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    retail_price: { type: Number, required: true },
    wholesale_price: { type: Number, required: true },
    cost_price: { type: Number, required: true },
    barcode: { type: String, unique: true, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Product', ProductSchema);
