const mongoose = require('mongoose');

const LorryStockSchema = new mongoose.Schema({
    lorryId: { type: String, required: true },        // references Lorry.lorryId
    productId: { type: String, required: true },      // references Product._id from Inventory Service
    productName: { type: String, required: true },
    quantityLoaded: { type: Number, required: true },
    quantitySold: { type: Number, default: 0 },
    quantityReturned: { type: Number, default: 0 },
    loadedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LorryStock', LorryStockSchema);
