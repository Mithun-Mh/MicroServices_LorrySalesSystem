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

        // Automatically provision a default 5000 credit limit
        try {
            const initialCreditLimit = new CreditLimit({
                mobileNumber: saved.phone,
                creditLimit: 100000,
                debit: 0,
                credit: 0
            });
            await initialCreditLimit.save();
        } catch (creditErr) {
            console.error('Failed to create default credit limit for new customer:', creditErr);
        }

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
 *     summary: Set an initial credit limit for a customer
 *     tags: [CreditLimits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobileNumber, creditLimit]
 *             properties:
 *               mobileNumber:
 *                 type: string
 *               creditLimit:
 *                 type: number
 *     responses:
 *       201:
 *         description: Credit limit set
 */
exports.setCreditLimit = async (req, res) => {
    try {
        // Prevent manual seeding of debit/credit on creation
        const credit = new CreditLimit({
            mobileNumber: req.body.mobileNumber,
            creditLimit: req.body.creditLimit,
            debit: 0,
            credit: 0
        });
        
        const saved = await credit.save();
        
        const availableCredit = saved.creditLimit;
        const currentBalance = saved.debit - saved.credit;
        
        res.status(201).json({
            ...saved.toObject(),
            availableCredit: availableCredit,
            currentBalance: currentBalance
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
        const currentBalance = creditData.debit - creditData.credit;
        
        res.json({
            ...creditData.toObject(),
            availableCredit: availableCredit,
            currentBalance: currentBalance
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
 *               totalAmount:
 *                 type: number
 *                 description: Provide invoice total to auto-calculate debit/credit
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Card, Credit]
 *               cashAmount:
 *                 type: number
 *                 description: For Lorry Sales debit logic
 *               creditAmount:
 *                 type: number
 *                 description: For Lorry Sales credit logic
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
        
        if (req.body.creditLimit !== undefined) {
            creditData.creditLimit = req.body.creditLimit;
        }

        // Apply LorrySale Logic
        if (req.body.cashAmount !== undefined || req.body.creditAmount !== undefined) {
            creditData.applyLorrySale(req.body.cashAmount, req.body.creditAmount);
        }
        // Apply automatic debit/credit logic from Invoice if fields exist
        else if (req.body.totalAmount !== undefined && req.body.paymentMethod) {
            if (req.body.action === 'reverse') {
                creditData.reverseInvoiceTransaction(req.body.totalAmount, req.body.paymentMethod);
            } else {
                creditData.applyInvoiceTransaction(req.body.totalAmount, req.body.paymentMethod);
            }
        }

        if (creditData.debit > creditData.creditLimit + creditData.credit) {
            return res.status(400).json({ message: 'Transaction exceeds credit limit' });
        }

        creditData.lastUpdated = Date.now();
        const updated = await creditData.save();
        
        const availableCredit = updated.creditLimit - updated.debit + updated.credit;
        const currentBalance = updated.debit - updated.credit;

        res.json({
            ...updated.toObject(),
            availableCredit: availableCredit,
            currentBalance: currentBalance
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
