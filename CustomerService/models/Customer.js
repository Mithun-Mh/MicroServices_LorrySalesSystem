const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shopName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Credit'], default: 'Cash' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
