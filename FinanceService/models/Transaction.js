const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    transaction_id: { type: String, unique: true },
    lorry_id: { type: String, required: true },
    cash_amount: { type: Number, required: true, default: 0 },
    credit_amount: { type: Number, required: true, default: 0 },
    date: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

// Auto-generate transaction_id before saving
TransactionSchema.pre('save', async function (next) {
    if (!this.transaction_id) {
        const count = await mongoose.model('Transaction').countDocuments();
        this.transaction_id = 'TXN-' + String(count + 1).padStart(5, '0');
    }
    next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
