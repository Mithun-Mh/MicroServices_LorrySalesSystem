const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    lorryId: { type: String, required: true },
    type: { type: String, enum: ['Fuel', 'Food', 'Maintenance', 'Other'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    expenseDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
