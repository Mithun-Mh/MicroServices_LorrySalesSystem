const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const DailySummary = require('../models/DailySummary');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required: [lorryId, cashAmount, creditAmount]
 *       properties:
 *         lorryId:
 *           type: string
 *           example: "LH3490"
 *         cashAmount:
 *           type: number
 *           example: 50000
 *         creditAmount:
 *           type: number
 *           example: 20000
 *         date:
 *           type: string
 *           format: date-time
 *     Expense:
 *       type: object
 *       required: [lorryId, type, amount]
 *       properties:
 *         lorryId:
 *           type: string
 *           example: "LH3490"
 *         type:
 *           type: string
 *           enum: [fuel, food, other]
 *           example: "fuel"
 *         amount:
 *           type: number
 *           example: 5000
 *         date:
 *           type: string
 *           format: date-time
 *     DailySummary:
 *       type: object
 *       properties:
 *         lorryId:
 *           type: string
 *         totalCash:
 *           type: number
 *         totalCredit:
 *           type: number
 *         totalExpense:
 *           type: number
 *         profit:
 *           type: number
 *         date:
 *           type: string
 *           format: date-time
 */

// ─── TRANSACTIONS CRUD ───────────────────────────────────────────

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: List of transactions
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Record a new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction recorded
 */
exports.createTransaction = async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        const saved = await transaction.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

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
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Record a new lorry expense (fuel, food, other)
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

// ─── DAILY SUMMARY ────────────────────────────────────────

/**
 * @swagger
 * /finance/summary/{lorryId}:
 *   get:
 *     summary: Get daily summary for a specific lorry
 *     tags: [Summary]
 *     parameters:
 *       - in: path
 *         name: lorryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lorry daily summary
 */
exports.getSummaryByLorry = async (req, res) => {
    try {
        const { lorryId } = req.params;
        
        // Calculate totals from Transactions and Expenses for today (or overall if date filtering is not strict)
        // Since we are building a simple daily summary on the fly or fetching saved, we'll aggregate.
        // Actually, let's aggregate all for now to show the profit calculation.
        
        const transactions = await Transaction.find({ lorryId });
        const expenses = await Expense.find({ lorryId });

        const totalCash = transactions.reduce((sum, t) => sum + (t.cashAmount || 0), 0);
        const totalCredit = transactions.reduce((sum, t) => sum + (t.creditAmount || 0), 0);
        const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        
        const profit = totalCash - totalExpense;

        // Optionally, save/update a DailySummary document
        let summary = await DailySummary.findOne({ lorryId }).sort({ date: -1 });
        
        if (!summary) {
            summary = new DailySummary({ lorryId, totalCash, totalCredit, totalExpense, profit });
        } else {
            summary.totalCash = totalCash;
            summary.totalCredit = totalCredit;
            summary.totalExpense = totalExpense;
            summary.profit = profit;
        }
        await summary.save();

        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
