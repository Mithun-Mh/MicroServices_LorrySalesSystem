const Customer = require('../models/Customer');
const CreditLimit = require('../models/CreditLimit');
const PaymentHistory = require('../models/PaymentHistory');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required: [name, shopName, address, phone]
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: "Nimal Fernando"
 *         shopName:
 *           type: string
 *           example: "Nimal Textiles"
 *         address:
 *           type: string
 *           example: "123 Main St, Colombo"
 *         phone:
 *           type: string
 *           example: "0771234567"
 *         email:
 *           type: string
 *           example: "nimal@shop.lk"
 *         paymentMethod:
 *           type: string
 *           enum: [Cash, Card, Credit]
 *     CreditLimit:
 *       type: object
 *       required: [customerId, creditLimit]
 *       properties:
 *         customerId:
 *           type: string
 *         creditLimit:
 *           type: number
 *           example: 50000
 *         currentBalance:
 *           type: number
 *           example: 12000
 *     PaymentHistory:
 *       type: object
 *       required: [customerId, amount]
 *       properties:
 *         customerId:
 *           type: string
 *         amount:
 *           type: number
 *           example: 5000
 *         date:
 *           type: string
 *           format: date-time
 */

// ─── CUSTOMER CRUD ──────────────────────────────────────────

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all shop owner profiles
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: List of customers
 */
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get a single customer
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 */
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Register a new shop owner
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created
 */
exports.createCustomer = async (req, res) => {
    try {
        const customer = new Customer(req.body);
        const saved = await customer.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Update customer details
 *     tags: [Customers]
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
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated
 */
exports.updateCustomer = async (req, res) => {
    try {
        const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Customer not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Remove a customer
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted
 */
exports.deleteCustomer = async (req, res) => {
    try {
        const deleted = await Customer.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── CREDIT LIMIT ───────────────────────────────────────────

/**
 * @swagger
 * /credit-limits:
 *   post:
 *     summary: Set a credit limit for a customer
 *     tags: [CreditLimits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreditLimit'
 *     responses:
 *       201:
 *         description: Credit limit set
 */
exports.setCreditLimit = async (req, res) => {
    try {
        const credit = new CreditLimit(req.body);
        const saved = await credit.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /credit-limits/{customerId}:
 *   get:
 *     summary: Get credit limit for a specific customer
 *     tags: [CreditLimits]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credit limit details
 */
exports.getCreditLimit = async (req, res) => {
    try {
        const credit = await CreditLimit.findOne({ customerId: req.params.customerId }).populate('customerId');
        if (!credit) return res.status(404).json({ message: 'Credit limit not found for this customer' });
        res.json(credit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /credit-limits/{customerId}:
 *   put:
 *     summary: Update credit limit or current balance
 *     tags: [CreditLimits]
 *     parameters:
 *       - in: path
 *         name: customerId
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
 *               creditLimit:
 *                 type: number
 *               currentBalance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Credit limit updated
 */
exports.updateCreditLimit = async (req, res) => {
    try {
        const updated = await CreditLimit.findOneAndUpdate(
            { customerId: req.params.customerId },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Credit limit not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ─── PAYMENT HISTORY ────────────────────────────────────────

/**
 * @swagger
 * /payment-history:
 *   post:
 *     summary: Add a new payment history record for a customer
 *     tags: [PaymentHistory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentHistory'
 *     responses:
 *       201:
 *         description: Payment history created
 */
exports.addPaymentHistory = async (req, res) => {
    try {
        const payment = new PaymentHistory(req.body);
        const saved = await payment.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /payment-history/{customerId}:
 *   get:
 *     summary: Get payment history for a specific customer
 *     tags: [PaymentHistory]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of payment histories
 */
exports.getPaymentHistory = async (req, res) => {
    try {
        const history = await PaymentHistory.find({ customerId: req.params.customerId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
