const mongoose = require('mongoose');

const WarehouseStockSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    quantity: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('WarehouseStock', WarehouseStockSchema);
