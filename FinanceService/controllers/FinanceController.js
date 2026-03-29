const Expense = require('../models/Expense');
const ProfitSummary = require('../models/ProfitSummary');

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required: [lorryId, type, amount]
 *       properties:
 *         lorryId:
 *           type: string
 *           example: "LH3490"
 *         type:
 *           type: string
 *           enum: [Fuel, Food, Maintenance, Other]
 *           example: "Fuel"
 *         amount:
 *           type: number
 *           example: 5000
 *         description:
 *           type: string
 *           example: "Diesel refill at Kaduwela"
 *     ProfitSummary:
 *       type: object
 *       required: [date]
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           example: "2026-03-29"
 *         lorryId:
 *           type: string
 *           example: "LH3490"
 *         totalIncome:
 *           type: number
 *           example: 75000
 *         totalExpenses:
 *           type: number
 *           example: 12000
 *         netProfit:
 *           type: number
 *           example: 63000
 */

// ─── EXPENSE CRUD ───────────────────────────────────────────

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: List of expenses
 */
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Record a new lorry expense (fuel, food, maintenance)
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201:
 *         description: Expense recorded
 */
exports.createExpense = async (req, res) => {
    try {
        const expense = new Expense(req.body);
        const saved = await expense.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     summary: Update an expense record
 *     tags: [Expenses]
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
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense updated
 */
exports.updateExpense = async (req, res) => {
    try {
        const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Expense not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Delete an expense record
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense deleted
 */
exports.deleteExpense = async (req, res) => {
    try {
        const deleted = await Expense.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Expense not found' });
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── PROFIT SUMMARY ────────────────────────────────────────

/**
 * @swagger
 * /profit-summary:
 *   post:
 *     summary: Generate a daily profit summary
 *     tags: [ProfitSummary]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfitSummary'
 *     responses:
 *       201:
 *         description: Profit summary created
 */
exports.createProfitSummary = async (req, res) => {
    try {
        const { date, lorryId, totalIncome, totalExpenses } = req.body;
        const netProfit = totalIncome - totalExpenses;
        const summary = new ProfitSummary({ date, lorryId, totalIncome, totalExpenses, netProfit });
        const saved = await summary.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /profit-summary:
 *   get:
 *     summary: Get all daily profit summaries
 *     tags: [ProfitSummary]
 *     responses:
 *       200:
 *         description: List of profit summaries
 */
exports.getAllProfitSummaries = async (req, res) => {
    try {
        const summaries = await ProfitSummary.find().sort({ date: -1 });
        res.json(summaries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /profit-summary/{lorryId}:
 *   get:
 *     summary: Get profit summaries for a specific lorry
 *     tags: [ProfitSummary]
 *     parameters:
 *       - in: path
 *         name: lorryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lorry profit summaries
 */
exports.getProfitByLorry = async (req, res) => {
    try {
        const summaries = await ProfitSummary.find({ lorryId: req.params.lorryId }).sort({ date: -1 });
        res.json(summaries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
