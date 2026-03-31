const mongoose = require('mongoose');

const LorrySchema = new mongoose.Schema({
    lorry_id: { type: String, unique: true, required: true },
    vehicle_number: { type: String, required: true },
    rep_id: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive', 'OnRoute'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Lorry', LorrySchema);
