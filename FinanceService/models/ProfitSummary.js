const mongoose = require('mongoose');

const ProfitSummarySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    lorryId: { type: String },
    totalIncome: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ProfitSummary', ProfitSummarySchema);
