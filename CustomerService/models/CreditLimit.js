const mongoose = require('mongoose');

const CreditLimitSchema = new mongoose.Schema({
    mobileNumber: { type: String, ref: 'Customer', required: true, unique: true },
    creditLimit: { type: Number, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Helper method to process invoice amounts properly
CreditLimitSchema.methods.applyInvoiceTransaction = function(totalAmount, paymentMethod) {
    const amount = Number(totalAmount) || 0;
    if (paymentMethod === 'Cash' || paymentMethod === 'Card') {
        this.debit += amount;
    } else if (paymentMethod === 'Credit') {
        this.credit += amount;
    }
};

// Helper method to process lorry sales
CreditLimitSchema.methods.applyLorrySale = function(cashAmount, creditAmount) {
    this.debit += Number(cashAmount) || 0;
    this.credit += Number(creditAmount) || 0;
};

module.exports = mongoose.model('CreditLimit', CreditLimitSchema);
