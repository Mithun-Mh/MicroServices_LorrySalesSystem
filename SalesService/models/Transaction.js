const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Credit'], required: true },
    amountPaid: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now },
    reference: { type: String }   // Card reference number or credit note ID
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
