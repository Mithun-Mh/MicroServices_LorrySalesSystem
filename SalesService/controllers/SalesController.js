const axios = require('axios');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');

// URLs for internal services
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:5001';
const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:5003';

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
 *         saleType:
 *           type: string
 *           enum: [POS, Warehouse]
 *           example: "POS"
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
 *     summary: Create a new warehouse POS invoice (reduces stock)
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       201:
 *         description: Invoice created, stock updated, and (if credit) customer balance updated
 *       400:
 *         description: Stock reduction failed or insufficient credit limit
 */
exports.createInvoice = async (req, res) => {
    try {
        const { customerId, items, paymentMethod, totalAmount } = req.body;

        // ─── 1. CREDIT LIMIT CHECK (If Credit Sale) ─────────────────
        if (paymentMethod === 'Credit') {
            try {
                const creditResp = await axios.get(`${CUSTOMER_SERVICE_URL}/credit-limits/${customerId}`);
                const { availableCredit } = creditResp.data;
                
                if (availableCredit < totalAmount) {
                    return res.status(400).json({ 
                        message: 'Insufficient Credit Limit',
                        available: availableCredit,
                        required: totalAmount
                    });
                }
            } catch (err) {
                console.error(`Credit check failed for customer ${customerId}:`, err.response?.data || err.message);
                return res.status(400).json({ 
                    message: 'Could not verify customer credit limit',
                    details: err.response?.data?.message || err.message
                });
            }
        }

        // ─── 2. INVENTORY STOCK REDUCTION ─────────────────────────
        const reducedItems = [];
        for (const item of items) {
            try {
                await axios.put(`${INVENTORY_SERVICE_URL}/stock/update`, {
                    product_id: item.productId,
                    action: 'reduce',
                    quantity: item.quantity
                });
                reducedItems.push(item); // Keep track for rollback
            } catch (invErr) {
                console.error(`Stock reduction failed: ${item.productName}:`, invErr.response?.data || invErr.message);
                
                // ROLLBACK: Restore stock for items already reduced in this attempt
                for (const rollbackItem of reducedItems) {
                    await axios.put(`${INVENTORY_SERVICE_URL}/stock/update`, {
                        product_id: rollbackItem.productId,
                        action: 'increase',
                        quantity: rollbackItem.quantity
                    }).catch(err => console.error("Critical: Rollback failed!", err.message));
                }

                return res.status(400).json({ 
                    message: `Not enough stock for ${item.productName || item.productId}`,
                    details: invErr.response?.data?.message || invErr.message
                });
            }
        }

        // ─── 3. SAVE THE INVOICE ─────────────────────────────────
        const invoice = new Invoice(req.body);
        const saved = await invoice.save();

        // ─── 4. UPDATE CUSTOMER CREDIT ──────────────────────────────
        // Automatically update Customer's CreditLimit using the other microservice
        try {
            const customerUrl = process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:5003';
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
        console.error('Create Invoice Error:', err.message);
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
        const { status } = req.body;
        const invoice = await Invoice.findById(req.params.id);
        
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        // Logic for Invoice Cancellation (Restoration of Stock and Credit)
        if (status === 'Cancelled' && invoice.status !== 'Cancelled') {
            console.log(`Cancelling invoice ${invoice.invoiceNumber}. Restoring assets...`);

            // 1. Restore Inventory Stock
            for (const item of invoice.items) {
                await axios.put(`${INVENTORY_SERVICE_URL}/stock/update`, {
                    product_id: item.productId,
                    action: 'increase',
                    quantity: item.quantity
                }).catch(err => console.error(`Restore stock failed for ${item.productId}:`, err.message));
            }

            // 2. Restore Customer Credit Limit
            await axios.put(`${CUSTOMER_SERVICE_URL}/credit-limits/${invoice.customerId}`, {
                totalAmount: invoice.totalAmount,
                paymentMethod: invoice.paymentMethod,
                action: 'reverse'
            }).catch(err => console.error(`Restore credit failed for ${invoice.customerId}:`, err.message));
        }

        const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        console.error('Update Invoice Error:', err.message);
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
