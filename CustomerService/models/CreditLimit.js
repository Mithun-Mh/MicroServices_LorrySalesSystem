const mongoose = require('mongoose');

const CreditLimitSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    creditLimit: { type: Number, required: true },
    currentBalance: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CreditLimit', CreditLimitSchema);
