const mongoose = require('mongoose');

const LorryStockSchema = new mongoose.Schema({
    lorry_id: { type: String, required: true },
    product_id: { type: String, required: true },
    quantity: { type: Number, required: true }
}, { timestamps: true });

LorryStockSchema.index({ lorry_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('LorryStock', LorryStockSchema);
