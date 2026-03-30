const Product = require('../models/Product');
const WarehouseStock = require('../models/WarehouseStock');
const DamagedItem = require('../models/DamagedItem');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required: [name, category, retail_price, wholesale_price, cost_price, barcode]
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: "Formal Shirt"
 *         category:
 *           type: string
 *           example: "Shirt"
 *         retail_price:
 *           type: number
 *           example: 3500
 *         wholesale_price:
 *           type: number
 *           example: 3000
 *         cost_price:
 *           type: number
 *           example: 2500
 *         barcode:
 *           type: string
 *           example: "123456789012"
 *         created_at:
 *           type: string
 *           format: date-time
 *     WarehouseStock:
 *       type: object
 *       required: [product_id, quantity]
 *       properties:
 *         _id:
 *           type: string
 *         product_id:
 *           type: string
 *           example: "665a1b2c3d4e5f6a7b8c9d0e"
 *         quantity:
 *           type: number
 *           example: 100
 *     DamagedItem:
 *       type: object
 *       required: [product_id, quantity]
 *       properties:
 *         _id:
 *           type: string
 *         product_id:
 *           type: string
 *           example: "665a1b2c3d4e5f6a7b8c9d0e"
 *         quantity:
 *           type: number
 *           example: 5
 *         reason:
 *           type: string
 *           example: "Water damage"
 *         date:
 *           type: string
 *           format: date-time
 */

// ─── PRODUCT CRUD ───────────────────────────────────────────

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = new Product({
            name: req.body.name,
            sku: req.body.sku,
            category: req.body.category,
            retail_price: req.body.retail_price,
            wholesale_price: req.body.wholesale_price,
            cost_price: req.body.cost_price,
            barcode: req.body.barcode
        });
        const saved = await product.save();
        // Initialize stock
        const stock = new WarehouseStock({ product_id: saved._id, quantity: 0 });
        await stock.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Product not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Product not found' });
        await WarehouseStock.findOneAndDelete({ product_id: req.params.id });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── WAREHOUSE STOCK ────────────────────────────────────────

exports.getStock = async (req, res) => {
    try {
        const stock = await WarehouseStock.find().populate('product_id');
        res.json(stock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { product_id, action, quantity } = req.body; // action = 'increase' or 'reduce'
        if (!['increase', 'reduce'].includes(action)) {
            return res.status(400).json({ message: "Action must be 'increase' or 'reduce'" });
        }
        
        let stock = await WarehouseStock.findOne({ product_id });
        if (!stock) return res.status(404).json({ message: 'Stock not found for this product' });

        if (action === 'increase') {
            stock.quantity += quantity;
        } else if (action === 'reduce') {
            if (stock.quantity < quantity) {
                return res.status(400).json({ message: 'Not enough stock to reduce' });
            }
            stock.quantity -= quantity;
        }
        
        const updated = await stock.save();
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ─── DAMAGED ITEMS ──────────────────────────────────────────

exports.getAllDamaged = async (req, res) => {
    try {
        const items = await DamagedItem.find().populate('product_id');
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.recordDamaged = async (req, res) => {
    try {
        const { product_id, quantity, reason } = req.body;
        // Reduce stock from WarehouseStock
        const stock = await WarehouseStock.findOne({ product_id });
        if (!stock) return res.status(404).json({ message: 'Stock not found' });
        if (stock.quantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock to record as damaged' });
        }
        stock.quantity -= quantity;
        await stock.save();

        const damaged = new DamagedItem({ product_id, quantity, reason });
        const saved = await damaged.save();
        res.status(201).json({ message: 'Damaged item recorded, stock reduced', damaged: saved, remainingStock: stock.quantity });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
