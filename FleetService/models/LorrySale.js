const mongoose = require('mongoose');

const LorrySaleSchema = new mongoose.Schema({
    lorry_id: { type: String, required: true },
    product_id: { type: String, required: true },
    product_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    retail_price: { type: Number, required: true },
    whole_price: { type: Number, required: true },
    total: { type: Number, required: true },
    cash_amount: { type: Number, default: 0 },
    credit_amount: { type: Number, default: 0 },
    phone_number: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('LorrySale', LorrySaleSchema);
