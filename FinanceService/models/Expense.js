const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    expense_id: { type: String, unique: true },
    lorry_id: { type: String, required: true },
    type: { type: String, enum: ['fuel', 'food'], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

// Auto-generate expense_id before saving
ExpenseSchema.pre('save', async function (next) {
    if (!this.expense_id) {
        const count = await mongoose.model('Expense').countDocuments();
        this.expense_id = 'EXP-' + String(count + 1).padStart(5, '0');
    }
    next();
});

module.exports = mongoose.model('Expense', ExpenseSchema);
