const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    lorryId: { type: String, required: true },
    type: { type: String, enum: ['fuel', 'food', 'other'], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
