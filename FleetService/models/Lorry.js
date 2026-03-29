const mongoose = require('mongoose');

const LorrySchema = new mongoose.Schema({
    lorryId: { type: String, unique: true, required: true },       // e.g. "LH3490"
    licensePlate: { type: String, required: true },
    assignedRep: { type: String, required: true },                 // Rep name
    status: { type: String, enum: ['Active', 'Inactive', 'OnRoute'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Lorry', LorrySchema);
