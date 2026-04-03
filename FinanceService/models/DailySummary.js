const mongoose = require('mongoose');

const DailySummarySchema = new mongoose.Schema({
    lorryId: { type: String, required: true },
    totalCash: { type: Number, default: 0 },
    totalCredit: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DailySummary', DailySummarySchema);
