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

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
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
 *     summary: Get product by ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 */
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            name: req.body.name,
            sku: req.body.sku,
            category: req.body.category,
            retail_price: req.body.retail_price,
            wholesale_price: req.body.wholesale_price,
            cost_price: req.body.cost_price,
            barcode: req.body.barcode
        });

        await WarehouseStock.create({
            product_id: product._id,
            quantity: 0
        });

        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product details
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
 *       404:
 *         description: Product not found
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
 *       404:
 *         description: Product not found
 */
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

/**
 * @swagger
 * /stock:
 *   get:
 *     summary: Get all warehouse stock
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: List of warehouse stock items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WarehouseStock'
 */
exports.getStock = async (req, res) => {
    try {
        const stock = await WarehouseStock.find().populate('product_id');
        res.json(stock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /stock/update:
 *   put:
 *     summary: Update product stock level (increase/reduce)
 *     tags: [Stock]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, action, quantity]
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: "665a1b2c3d4e5f6a7b8c9d0e"
 *               action:
 *                 type: string
 *                 enum: [increase, reduce]
 *                 example: "increase"
 *               quantity:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       400:
 *         description: Invalid input or insufficient stock
 *       404:
 *         description: Stock record not found
 */
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

/**
 * @swagger
 * /damaged:
 *   get:
 *     summary: Get all recorded damaged items
 *     tags: [DamagedItems]
 *     responses:
 *       200:
 *         description: List of damaged items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DamagedItem'
 */
exports.getAllDamaged = async (req, res) => {
    try {
        const items = await DamagedItem.find().populate('product_id');
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /damaged:
 *   post:
 *     summary: Record damaged item and reduce warehouse stock
 *     tags: [DamagedItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, quantity, reason]
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: "665a1b2c3d4e5f6a7b8c9d0e"
 *               quantity:
 *                 type: number
 *                 example: 5
 *               reason:
 *                 type: string
 *                 example: "Water damage"
 *     responses:
 *       201:
 *         description: Damaged item recorded successfully
 *       400:
 *         description: Insufficient stock
 *       404:
 *         description: Stock record not found
 */
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
