const mongoose = require('mongoose');

const LorrySchema = new mongoose.Schema({
    lorry_id: { type: String, unique: true, required: true, trim: true },
    lorryId: { type: String, unique: true, required: true, trim: true },
    vehicle_number: { type: String, required: true, trim: true, alias: 'licensePlate' },
    rep_id: { type: String, required: true, trim: true, alias: 'assignedRep' },
    status: { type: String, enum: ['Active', 'Inactive', 'OnRoute'], default: 'Active' }
}, { timestamps: true });

LorrySchema.pre('validate', function preValidate(next) {
    if (!this.lorry_id && this.lorryId) {
        this.lorry_id = this.lorryId;
    }
    if (!this.lorryId && this.lorry_id) {
        this.lorryId = this.lorry_id;
    }
    next();
});

module.exports = mongoose.model('Lorry', LorrySchema);
