const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const DailySummary = require('../models/DailySummary');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required: [lorry_id, cash_amount, credit_amount]
 *       properties:
 *         transaction_id:
 *           type: string
 *           example: "TXN-00001"
 *           description: Auto-generated primary key
 *         lorry_id:
 *           type: string
 *           example: "LH3490"
 *         cash_amount:
 *           type: number
 *           example: 15000
 *         credit_amount:
 *           type: number
 *           example: 5000
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2026-03-31"
 *     Expense:
 *       type: object
 *       required: [lorry_id, type, amount]
 *       properties:
 *         expense_id:
 *           type: string
 *           example: "EXP-00001"
 *           description: Auto-generated primary key
 *         lorry_id:
 *           type: string
 *           example: "LH3490"
 *         type:
 *           type: string
 *           enum: [fuel, food]
 *           example: "fuel"
 *         amount:
 *           type: number
 *           example: 5000
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2026-03-31"
 *     DailySummary:
 *       type: object
 *       properties:
 *         summary_id:
 *           type: string
 *           example: "SUM-00001"
 *           description: Auto-generated primary key
 *         lorry_id:
 *           type: string
 *           example: "LH3490"
 *         total_cash:
 *           type: number
 *           example: 45000
 *         total_credit:
 *           type: number
 *           example: 12000
 *         total_expense:
 *           type: number
 *           example: 8000
 *         profit:
 *           type: number
 *           example: 49000
 *           description: "(total_cash + total_credit) - total_expense"
 */

// ═══════════════════════════════════════════════════════════════
//  TRANSACTION CRUD
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: lorry_id
 *         schema:
 *           type: string
 *         description: Filter by lorry ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of transactions
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const filter = {};
        if (req.query.lorry_id) filter.lorry_id = req.query.lorry_id;
        if (req.query.date) {
            const d = new Date(req.query.date);
            filter.date = {
                $gte: new Date(d.setHours(0, 0, 0, 0)),
                $lt: new Date(d.setHours(23, 59, 59, 999))
            };
        }
        const transactions = await Transaction.find(filter).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id or transaction_id
 *     responses:
 *       200:
 *         description: Transaction found
 *       404:
 *         description: Transaction not found
 */
exports.getTransactionById = async (req, res) => {
    try {
        const txn = await Transaction.findById(req.params.id) ||
                     await Transaction.findOne({ transaction_id: req.params.id });
        if (!txn) return res.status(404).json({ message: 'Transaction not found' });
        res.json(txn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction created
 */
exports.createTransaction = async (req, res) => {
    try {
        const txn = new Transaction(req.body);
        const saved = await txn.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transactions]
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
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Transaction updated
 */
exports.updateTransaction = async (req, res) => {
    try {
        const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Transaction not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted
 */
exports.deleteTransaction = async (req, res) => {
    try {
        const deleted = await Transaction.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Transaction deleted', data: deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
//  EXPENSE CRUD
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: lorry_id
 *         schema:
 *           type: string
 *         description: Filter by lorry ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [fuel, food]
 *         description: Filter by expense type
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of expenses
 */
exports.getAllExpenses = async (req, res) => {
    try {
        const filter = {};
        if (req.query.lorry_id) filter.lorry_id = req.query.lorry_id;
        if (req.query.type) filter.type = req.query.type;
        if (req.query.date) {
            const d = new Date(req.query.date);
            filter.date = {
                $gte: new Date(d.setHours(0, 0, 0, 0)),
                $lt: new Date(d.setHours(23, 59, 59, 999))
            };
        }
        const expenses = await Expense.find(filter).sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Get an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id or expense_id
 *     responses:
 *       200:
 *         description: Expense found
 *       404:
 *         description: Expense not found
 */
exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id) ||
                         await Expense.findOne({ expense_id: req.params.id });
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Record a new lorry expense
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
        res.json({ message: 'Expense deleted', data: deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
//  DAILY SUMMARY CRUD
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /daily-summary:
 *   get:
 *     summary: Get all daily summaries
 *     tags: [DailySummary]
 *     parameters:
 *       - in: query
 *         name: lorry_id
 *         schema:
 *           type: string
 *         description: Filter by lorry ID
 *     responses:
 *       200:
 *         description: List of daily summaries
 */
exports.getAllDailySummaries = async (req, res) => {
    try {
        const filter = {};
        if (req.query.lorry_id) filter.lorry_id = req.query.lorry_id;
        const summaries = await DailySummary.find(filter).sort({ date: -1 });
        res.json(summaries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /daily-summary/{id}:
 *   get:
 *     summary: Get a daily summary by ID
 *     tags: [DailySummary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id or summary_id
 *     responses:
 *       200:
 *         description: Summary found
 *       404:
 *         description: Summary not found
 */
exports.getDailySummaryById = async (req, res) => {
    try {
        const summary = await DailySummary.findById(req.params.id) ||
                         await DailySummary.findOne({ summary_id: req.params.id });
        if (!summary) return res.status(404).json({ message: 'Daily summary not found' });
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /daily-summary/lorry/{lorryId}:
 *   get:
 *     summary: Get daily summaries for a specific lorry
 *     tags: [DailySummary]
 *     parameters:
 *       - in: path
 *         name: lorryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lorry daily summaries
 */
exports.getDailySummaryByLorry = async (req, res) => {
    try {
        const summaries = await DailySummary.find({ lorry_id: req.params.lorryId }).sort({ date: -1 });
        res.json(summaries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /daily-summary:
 *   post:
 *     summary: Create a daily summary manually
 *     tags: [DailySummary]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DailySummary'
 *     responses:
 *       201:
 *         description: Daily summary created
 */
exports.createDailySummary = async (req, res) => {
    try {
        const { lorry_id, total_cash, total_credit, total_expense } = req.body;
        const profit = (total_cash + total_credit) - total_expense;
        const summary = new DailySummary({
            ...req.body,
            profit
        });
        const saved = await summary.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /daily-summary/generate:
 *   post:
 *     summary: Auto-generate daily summary from transactions & expenses
 *     tags: [DailySummary]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lorry_id, date]
 *             properties:
 *               lorry_id:
 *                 type: string
 *                 example: "LH3490"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-31"
 *     responses:
 *       201:
 *         description: Daily summary auto-generated from transaction & expense data
 */
exports.generateDailySummary = async (req, res) => {
    try {
        const { lorry_id, date } = req.body;
        if (!lorry_id || !date) {
            return res.status(400).json({ error: 'lorry_id and date are required' });
        }

        const d = new Date(date);
        const dayStart = new Date(d.setHours(0, 0, 0, 0));
        const dayEnd = new Date(d.setHours(23, 59, 59, 999));
        const dateFilter = { lorry_id, date: { $gte: dayStart, $lt: dayEnd } };

        // Aggregate transactions for the day
        const transactions = await Transaction.find(dateFilter);
        const total_cash = transactions.reduce((sum, t) => sum + t.cash_amount, 0);
        const total_credit = transactions.reduce((sum, t) => sum + t.credit_amount, 0);

        // Aggregate expenses for the day
        const expenses = await Expense.find(dateFilter);
        const total_expense = expenses.reduce((sum, e) => sum + e.amount, 0);

        // Calculate profit
        const profit = (total_cash + total_credit) - total_expense;

        const summary = new DailySummary({
            lorry_id,
            total_cash,
            total_credit,
            total_expense,
            profit,
            date: new Date(req.body.date)
        });

        const saved = await summary.save();
        res.status(201).json({
            message: 'Daily summary generated successfully',
            data: saved,
            breakdown: {
                transactions_count: transactions.length,
                expenses_count: expenses.length
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /daily-summary/{id}:
 *   put:
 *     summary: Update a daily summary
 *     tags: [DailySummary]
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
 *             $ref: '#/components/schemas/DailySummary'
 *     responses:
 *       200:
 *         description: Daily summary updated
 */
exports.updateDailySummary = async (req, res) => {
    try {
        // Recalculate profit if amounts are updated
        if (req.body.total_cash !== undefined || req.body.total_credit !== undefined || req.body.total_expense !== undefined) {
            const existing = await DailySummary.findById(req.params.id);
            if (existing) {
                const cash = req.body.total_cash !== undefined ? req.body.total_cash : existing.total_cash;
                const credit = req.body.total_credit !== undefined ? req.body.total_credit : existing.total_credit;
                const expense = req.body.total_expense !== undefined ? req.body.total_expense : existing.total_expense;
                req.body.profit = (cash + credit) - expense;
            }
        }
        const updated = await DailySummary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Daily summary not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /daily-summary/{id}:
 *   delete:
 *     summary: Delete a daily summary
 *     tags: [DailySummary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily summary deleted
 */
exports.deleteDailySummary = async (req, res) => {
    try {
        const deleted = await DailySummary.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Daily summary not found' });
        res.json({ message: 'Daily summary deleted', data: deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
