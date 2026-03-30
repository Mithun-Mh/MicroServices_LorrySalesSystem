const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    saleType: { type: String, enum: ['POS'], default: 'POS' },
    items: [{
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Credit'], required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Cancelled'], default: 'Pending' },
    invoiceDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
