const mongoose = require('mongoose');

const DailySummarySchema = new mongoose.Schema({
    summary_id: { type: String, unique: true },
    lorry_id: { type: String, required: true },
    total_cash: { type: Number, required: true, default: 0 },
    total_credit: { type: Number, required: true, default: 0 },
    total_expense: { type: Number, required: true, default: 0 },
    profit: { type: Number, required: true, default: 0 },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-generate summary_id before saving
DailySummarySchema.pre('save', async function (next) {
    if (!this.summary_id) {
        const count = await mongoose.model('DailySummary').countDocuments();
        this.summary_id = 'SUM-' + String(count + 1).padStart(5, '0');
    }
    next();
});

module.exports = mongoose.model('DailySummary', DailySummarySchema);
