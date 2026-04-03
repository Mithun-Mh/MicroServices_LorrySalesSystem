const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    lorryId: { type: String, required: true },
    cashAmount: { type: Number, default: 0 },
    creditAmount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
