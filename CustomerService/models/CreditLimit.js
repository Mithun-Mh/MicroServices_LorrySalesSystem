const mongoose = require('mongoose');

const CreditLimitSchema = new mongoose.Schema({
    mobileNumber: { type: String, ref: 'Customer', required: true },
    creditLimit: { type: Number, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CreditLimit', CreditLimitSchema);
