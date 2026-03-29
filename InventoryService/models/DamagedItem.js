const mongoose = require('mongoose');

const DamagedItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    reason: { type: String },
    recordedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DamagedItem', DamagedItemSchema);
