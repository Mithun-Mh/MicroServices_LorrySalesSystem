const mongoose = require('mongoose');

const StockTransferSchema = new mongoose.Schema({
    transfer_id: {
        type: String,
        unique: true,
        required: true,
        default: () => `TR-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    },
    lorry_id: { type: String, required: true },
    product_id: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending'
    },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StockTransfer', StockTransferSchema);
