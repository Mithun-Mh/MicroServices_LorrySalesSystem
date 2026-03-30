const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required: [invoiceNumber, customerId, customerName, lorryId, items, totalAmount, paymentMethod]
 *       properties:
 *         invoiceNumber:
 *           type: string
 *           example: "INV-20260329-001"
 *         customerId:
 *           type: string
 *         customerName:
 *           type: string
 *           example: "Nimal Textiles"
 *         lorryId:
 *           type: string
 *           example: "LH3490"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               productName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               total:
 *                 type: number
 *         totalAmount:
 *           type: number
 *           example: 25000
 *         paymentMethod:
 *           type: string
 *           enum: [Cash, Card, Credit]
 *         status:
 *           type: string
 *           enum: [Paid, Pending, Cancelled]
 *     Transaction:
 *       type: object
 *       required: [invoiceId, paymentMethod, amountPaid]
 *       properties:
 *         invoiceId:
 *           type: string
 *         paymentMethod:
 *           type: string
 *           enum: [Cash, Card, Credit]
 *         amountPaid:
 *           type: number
 *           example: 25000
 *         reference:
 *           type: string
 *           example: "CARD-REF-12345"
 */

// ─── INVOICE CRUD ───────────────────────────────────────────

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: List of invoices
 */
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find();
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice details
 */
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create a new invoice (sale to shop owner)
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       201:
 *         description: Invoice created
 */
exports.createInvoice = async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        const saved = await invoice.save();

        // Automatically update Customer's CreditLimit using the other microservice
        try {
            const customerUrl = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:5003';
            // Assuming customerId from the invoice matches the mobileNumber used in CreditLimit
            const response = await fetch(`${customerUrl}/credit-limits/${saved.customerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalAmount: saved.totalAmount,
                    paymentMethod: saved.paymentMethod
                })
            });

            if (!response.ok) {
                console.error(`Warning: Customer Service responded with status ${response.status}`);
            }
        } catch (serviceErr) {
            console.error('Error communicating with Customer Service for credit update:', serviceErr.message);
        }

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     summary: Update invoice status
 *     tags: [Invoices]
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
 *               status:
 *                 type: string
 *                 enum: [Paid, Pending, Cancelled]
 *     responses:
 *       200:
 *         description: Invoice updated
 */
exports.updateInvoice = async (req, res) => {
    try {
        const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Invoice not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ─── TRANSACTIONS ───────────────────────────────────────────

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Record a payment transaction for an invoice
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

        // Mark invoice as Paid
        await Invoice.findByIdAndUpdate(req.body.invoiceId, { status: 'Paid' });

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

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
        const transactions = await Transaction.find().populate('invoiceId');
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
