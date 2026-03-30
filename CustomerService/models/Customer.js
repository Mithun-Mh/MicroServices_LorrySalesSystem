const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    _id: { type: String }, // This will store the mobile number
    name: { type: String, required: true },
    shopName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String }
}, { timestamps: true });

CustomerSchema.pre('save', function(next) {
    if (this.isNew && !this._id) {
        this._id = this.phone; // Set mobile number as primary key
    }
    next();
});

module.exports = mongoose.model('Customer', CustomerSchema);
