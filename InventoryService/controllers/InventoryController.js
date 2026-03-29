const Product = require('../models/Product');
const DamagedItem = require('../models/DamagedItem');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required: [name, sku, price]
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: "Men's Cotton Shirt"
 *         sku:
 *           type: string
 *           example: "SHT-001"
 *         quantity:
 *           type: number
 *           example: 500
 *         price:
 *           type: number
 *           example: 1250.00
 *         category:
 *           type: string
 *           enum: [Shirt, Slippers, Other]
 *           example: "Shirt"
 *     DamagedItem:
 *       type: object
 *       required: [productId, quantity]
 *       properties:
 *         _id:
 *           type: string
 *         productId:
 *           type: string
 *           example: "665a1b2c3d4e5f6a7b8c9d0e"
 *         quantity:
 *           type: number
 *           example: 5
 *         reason:
 *           type: string
 *           example: "Water damage during transport"
 *         recordedDate:
 *           type: string
 *           format: date-time
 */

// ─── PRODUCT CRUD ───────────────────────────────────────────

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products in the warehouse
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product to the warehouse
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 */
exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        const saved = await product.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (e.g. restock quantity)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 */
exports.updateProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Product not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
exports.deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── DAMAGED ITEMS ──────────────────────────────────────────

/**
 * @swagger
 * /damaged:
 *   get:
 *     summary: Get all damaged item records
 *     tags: [DamagedItems]
 *     responses:
 *       200:
 *         description: List of damaged item records
 */
exports.getAllDamaged = async (req, res) => {
    try {
        const items = await DamagedItem.find().populate('productId');
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /damaged:
 *   post:
 *     summary: Record damaged items (reduces warehouse stock)
 *     tags: [DamagedItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DamagedItem'
 *     responses:
 *       201:
 *         description: Damaged item recorded and stock reduced
 *       400:
 *         description: Not enough stock or invalid data
 */
exports.recordDamaged = async (req, res) => {
    try {
        const { productId, quantity, reason } = req.body;
        // Reduce stock from Product
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock to record as damaged' });
        }
        product.quantity -= quantity;
        await product.save();

        const damaged = new DamagedItem({ productId, quantity, reason });
        const saved = await damaged.save();
        res.status(201).json({ message: 'Damaged items recorded, stock reduced', damaged: saved, remainingStock: product.quantity });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
