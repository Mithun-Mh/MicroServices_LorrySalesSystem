const Customer = require('../models/Customer');
const CreditLimit = require('../models/CreditLimit');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required: [name, shopName, address, phone]
 *       properties:
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
 *     CreditLimit:
 *       type: object
 *       required: [mobileNumber, creditLimit]
 *       properties:
 *         mobileNumber:
 *           type: string
 *           description: Customer's mobile number
 *         creditLimit:
 *           type: number
 *           example: 50000
 *         debit:
 *           type: number
 *           example: 12000
 *         credit:
 *           type: number
 *           example: 5000
 *         availableCredit:
 *           type: number
 *           example: 38000
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
        const debit = req.body.debit || 0;
        const creditBody = req.body.credit || 0;
        
        if (debit > req.body.creditLimit) {
            return res.status(400).json({ message: 'Debit cannot exceed credit limit' });
        }
        
        const credit = new CreditLimit(req.body);
        const saved = await credit.save();
        
        const availableCredit = saved.creditLimit - saved.debit + saved.credit;
        
        res.status(201).json({
            ...saved.toObject(),
            availableCredit: availableCredit
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @swagger
 * /credit-limits/{mobileNumber}:
 *   get:
 *     summary: Get credit limit for a specific customer
 *     tags: [CreditLimits]
 *     parameters:
 *       - in: path
 *         name: mobileNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credit limit details
 */
exports.getCreditLimit = async (req, res) => {
    try {
        const creditData = await CreditLimit.findOne({ mobileNumber: req.params.mobileNumber }).populate('mobileNumber');
        if (!creditData) return res.status(404).json({ message: 'Credit limit not found for this customer' });
        
        const availableCredit = creditData.creditLimit - creditData.debit + creditData.credit;
        
        res.json({
            ...creditData.toObject(),
            availableCredit: availableCredit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /credit-limits/{mobileNumber}:
 *   put:
 *     summary: Update credit limit or current balance
 *     tags: [CreditLimits]
 *     parameters:
 *       - in: path
 *         name: mobileNumber
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
 *               debit:
 *                 type: number
 *               credit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Credit limit updated
 *       400:
 *         description: Transaction exceeds credit limit or bad request
 */
exports.updateCreditLimit = async (req, res) => {
    try {
        const creditData = await CreditLimit.findOne({ mobileNumber: req.params.mobileNumber });
        if (!creditData) return res.status(404).json({ message: 'Credit limit not found' });
        
        const newLimit = req.body.creditLimit !== undefined ? req.body.creditLimit : creditData.creditLimit;
        const newDebit = req.body.debit !== undefined ? req.body.debit : creditData.debit;
        const newCredit = req.body.credit !== undefined ? req.body.credit : creditData.credit;

        const currentAvailable = newLimit - newDebit + newCredit;

        if (newDebit > newLimit + newCredit) {
            return res.status(400).json({ message: 'Transaction exceeds credit limit' });
        }

        const updated = await CreditLimit.findOneAndUpdate(
            { mobileNumber: req.params.mobileNumber },
            { creditLimit: newLimit, debit: newDebit, credit: newCredit, lastUpdated: Date.now() },
            { new: true }
        );
        
        const availableCredit = updated.creditLimit - updated.debit + updated.credit;

        res.json({
            ...updated.toObject(),
            availableCredit: availableCredit
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
