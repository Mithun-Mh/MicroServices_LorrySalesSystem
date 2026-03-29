const Lorry = require('../models/Lorry');
const LorryStock = require('../models/LorryStock');

/**
 * @swagger
 * components:
 *   schemas:
 *     Lorry:
 *       type: object
 *       required: [lorryId, licensePlate, assignedRep]
 *       properties:
 *         lorryId:
 *           type: string
 *           example: "LH3490"
 *         licensePlate:
 *           type: string
 *           example: "WP-AB-1234"
 *         assignedRep:
 *           type: string
 *           example: "Kamal Perera"
 *         status:
 *           type: string
 *           enum: [Active, Inactive, OnRoute]
 *     LorryStock:
 *       type: object
 *       required: [lorryId, productId, productName, quantityLoaded]
 *       properties:
 *         lorryId:
 *           type: string
 *           example: "LH3490"
 *         productId:
 *           type: string
 *           example: "665a1b2c3d4e5f6a7b8c9d0e"
 *         productName:
 *           type: string
 *           example: "Men's Cotton Shirt"
 *         quantityLoaded:
 *           type: number
 *           example: 100
 *         quantitySold:
 *           type: number
 *           example: 0
 *         quantityReturned:
 *           type: number
 *           example: 0
 */

// ─── LORRY CRUD ─────────────────────────────────────────────

/**
 * @swagger
 * /lorries:
 *   get:
 *     summary: Get all lorries
 *     tags: [Lorries]
 *     responses:
 *       200:
 *         description: List of lorries
 */
exports.getAllLorries = async (req, res) => {
    try {
        const lorries = await Lorry.find();
        res.json(lorries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /lorries:
 *   post:
 *     summary: Register a new lorry
 *     tags: [Lorries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lorry'
 *     responses:
 *       201:
 *         description: Lorry registered
 */
exports.createLorry = async (req, res) => {
    try {
        const lorry = new Lorry(req.body);
        const saved = await lorry.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /lorries/{id}:
 *   put:
 *     summary: Update lorry details or assigned rep
 *     tags: [Lorries]
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
 *             $ref: '#/components/schemas/Lorry'
 *     responses:
 *       200:
 *         description: Lorry updated
 */
exports.updateLorry = async (req, res) => {
    try {
        const updated = await Lorry.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Lorry not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /lorries/{id}:
 *   delete:
 *     summary: Remove a lorry
 *     tags: [Lorries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lorry removed
 */
exports.deleteLorry = async (req, res) => {
    try {
        const deleted = await Lorry.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Lorry not found' });
        res.json({ message: 'Lorry removed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── LORRY STOCK ────────────────────────────────────────────

/**
 * @swagger
 * /lorry-stock:
 *   post:
 *     summary: Transfer stock from warehouse to a lorry
 *     tags: [LorryStock]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LorryStock'
 *     responses:
 *       201:
 *         description: Stock loaded onto lorry
 */
exports.loadStock = async (req, res) => {
    try {
        const stock = new LorryStock(req.body);
        const saved = await stock.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /lorry-stock/{lorryId}:
 *   get:
 *     summary: Get all stock currently on a lorry
 *     tags: [LorryStock]
 *     parameters:
 *       - in: path
 *         name: lorryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock list for the lorry
 */
exports.getStockByLorry = async (req, res) => {
    try {
        const stock = await LorryStock.find({ lorryId: req.params.lorryId });
        res.json(stock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /lorry-stock/return/{id}:
 *   put:
 *     summary: Record unsold stock returned to warehouse (end-of-day)
 *     tags: [LorryStock]
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
 *             type: object
 *             properties:
 *               quantityReturned:
 *                 type: number
 *                 example: 15
 *     responses:
 *       200:
 *         description: Return recorded
 */
exports.returnStock = async (req, res) => {
    try {
        const stock = await LorryStock.findById(req.params.id);
        if (!stock) return res.status(404).json({ message: 'Stock record not found' });
        stock.quantityReturned = req.body.quantityReturned;
        await stock.save();
        res.json({ message: 'Return recorded', stock });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
