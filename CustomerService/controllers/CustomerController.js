const Customer = require('../models/Customer');
const CreditLimit = require('../models/CreditLimit');

// ─── VALIDATION HELPER FUNCTIONS ────────────────────────────

/**
 * Validate customer data
 */
const validateCustomerData = (data, isUpdate = false) => {
    const errors = [];

    // Name validation
    if (data.name !== undefined) {
        if (typeof data.name !== 'string' || data.name.trim() === '') {
            errors.push('name must be a non-empty string');
        } else if (data.name.trim().length < 2) {
            errors.push('name must be at least 2 characters long');
        } else if (data.name.length > 100) {
            errors.push('name cannot exceed 100 characters');
        }
    } else if (!isUpdate) {
        errors.push('name is required');
    }

    // Shop Name validation
    if (data.shopName !== undefined) {
        if (typeof data.shopName !== 'string' || data.shopName.trim() === '') {
            errors.push('shopName must be a non-empty string');
        } else if (data.shopName.trim().length < 2) {
            errors.push('shopName must be at least 2 characters long');
        } else if (data.shopName.length > 150) {
            errors.push('shopName cannot exceed 150 characters');
        }
    } else if (!isUpdate) {
        errors.push('shopName is required');
    }

    // Address validation
    if (data.address !== undefined) {
        if (typeof data.address !== 'string' || data.address.trim() === '') {
            errors.push('address must be a non-empty string');
        } else if (data.address.trim().length < 5) {
            errors.push('address must be at least 5 characters long');
        } else if (data.address.length > 200) {
            errors.push('address cannot exceed 200 characters');
        }
    } else if (!isUpdate) {
        errors.push('address is required');
    }

    // Phone validation
    if (data.phone !== undefined) {
        if (typeof data.phone !== 'string' || data.phone.trim() === '') {
            errors.push('phone must be a non-empty string');
        } else if (!/^[0-9]{10}$/.test(data.phone.replace(/[-\s]/g, ''))) {
            errors.push('phone must be a valid 10-digit phone number');
        }
    } else if (!isUpdate) {
        errors.push('phone is required');
    }

    // Email validation (optional field)
    if (data.email !== undefined && data.email !== null && data.email !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof data.email !== 'string' || !emailRegex.test(data.email)) {
            errors.push('email must be a valid email address');
        } else if (data.email.length > 100) {
            errors.push('email cannot exceed 100 characters');
        }
    }

    return errors;
};

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
        const creditLimits = await CreditLimit.find();
        
        const customerWithCredit = customers.map(customer => {
            const customerObj = customer.toObject();
            const creditInfo = creditLimits.find(cl => cl.mobileNumber === customerObj.phone);
            
            if (creditInfo) {
                customerObj.creditLimitInfo = {
                    creditLimit: creditInfo.creditLimit,
                    availableCredit: creditInfo.creditLimit - creditInfo.debit + creditInfo.credit,
                    currentBalance: creditInfo.debit - creditInfo.credit
                };
            } else {
                customerObj.creditLimitInfo = null;
            }
            return customerObj;
        });

        res.json(customerWithCredit);
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
        
        const creditInfo = await CreditLimit.findOne({ mobileNumber: customer.phone });
        const customerObj = customer.toObject();
        
        if (creditInfo) {
             customerObj.creditLimitInfo = {
                 creditLimit: creditInfo.creditLimit,
                 availableCredit: creditInfo.creditLimit - creditInfo.debit + creditInfo.credit,
                 currentBalance: creditInfo.debit - creditInfo.credit
             };
        } else {
             customerObj.creditLimitInfo = null;
        }

        res.json(customerObj);
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
        // Validate input data
        const validationErrors = validateCustomerData(req.body, false);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }

        // Check if phone number already exists
        const existingCustomer = await Customer.findOne({ phone: req.body.phone });
        if (existingCustomer) {
            return res.status(409).json({ message: 'A customer with this phone number already exists' });
        }

        const customer = new Customer(req.body);
        const saved = await customer.save();

        // Automatically provision a default credit limit
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
        // Check if customer exists
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Validate input data (isUpdate = true to make all fields optional)
        const validationErrors = validateCustomerData(req.body, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }

        // If phone is being updated, check for duplicates
        if (req.body.phone && req.body.phone !== customer.phone) {
            const existingCustomer = await Customer.findOne({ phone: req.body.phone });
            if (existingCustomer) {
                return res.status(409).json({ message: 'Another customer with this phone number already exists' });
            }
        }

        const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 creditLimit:
 *                   type: number
 *                 availableCredit:
 *                   type: number
 *                 currentBalance:
 *                   type: number
 */
exports.getCreditLimit = async (req, res) => {
    try {
        const creditData = await CreditLimit.findOne({ mobileNumber: req.params.mobileNumber }).populate('mobileNumber');
        if (!creditData) return res.status(404).json({ message: 'Credit limit not found for this customer' });
        
        const availableCredit = creditData.creditLimit - creditData.debit + creditData.credit;
        const currentBalance = creditData.debit - creditData.credit;
        
        res.json({
            creditLimit: creditData.creditLimit,
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
 *     summary: Update customer credit limit
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
 *             required: [creditLimit]
 *             properties:
 *               creditLimit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Credit limit updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Credit limit not found
 */
exports.updateCreditLimit = async (req, res) => {
    try {
        const creditData = await CreditLimit.findOne({ mobileNumber: req.params.mobileNumber });
        if (!creditData) return res.status(404).json({ message: 'Credit limit not found' });
        
        if (req.body.creditLimit === undefined || req.body.creditLimit === null) {
            return res.status(400).json({ message: 'creditLimit is required' });
        }

        const newCreditLimit = Number(req.body.creditLimit);

        if (isNaN(newCreditLimit)) {
            return res.status(400).json({ message: 'creditLimit must be a valid number' });
        }

        if (newCreditLimit < 0) {
            return res.status(400).json({ message: 'creditLimit cannot be negative' });
        }

        if (newCreditLimit > 10000000) {
            return res.status(400).json({ message: 'creditLimit cannot exceed 10,000,000' });
        }

        creditData.creditLimit = newCreditLimit;
        
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
