const Lorry = require('../models/Lorry');
const LorryStock = require('../models/LorryStock');
const StockTransfer = require('../models/StockTransfer');
const LorrySale = require('../models/LorrySale');

const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:5003';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:5001';

const normalizePhone = (value) => String(value || '').replace(/\s+/g, '').trim();

const toNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : NaN;
};

const getInventoryProductById = async (productId) => {
    const response = await fetch(`${INVENTORY_SERVICE_URL}/products/${encodeURIComponent(productId)}`);
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error(`Unable to verify product. Inventory Service responded with ${response.status}`);
    }
    return response.json();
};

const getWarehouseStockByProductId = async (productId) => {
    const response = await fetch(`${INVENTORY_SERVICE_URL}/stock`);
    if (!response.ok) {
        throw new Error(`Unable to verify warehouse stock. Inventory Service responded with ${response.status}`);
    }

    const stockList = await response.json();
    if (!Array.isArray(stockList)) {
        return null;
    }

    return stockList.find((item) => {
        const stockProductId = item?.product_id?._id || item?.product_id;
        return String(stockProductId) === String(productId);
    }) || null;
};

const getCustomerByPhoneNumber = async (phoneNumber) => {
    const normalizedPhone = normalizePhone(phoneNumber);

    const response = await fetch(`${CUSTOMER_SERVICE_URL}/customers/${encodeURIComponent(normalizedPhone)}`);
    if (response.status === 404) {
        // Fallback for datasets where customer _id is not the phone number.
        const listResponse = await fetch(`${CUSTOMER_SERVICE_URL}/customers`);
        if (!listResponse.ok) {
            throw new Error(`Unable to verify customer. Customer Service responded with ${listResponse.status}`);
        }

        const customers = await listResponse.json();
        const matched = Array.isArray(customers)
            ? customers.find((c) => normalizePhone(c.phone) === normalizedPhone)
            : null;

        return matched || null;
    }
    if (!response.ok) {
        throw new Error(`Unable to verify customer. Customer Service responded with ${response.status}`);
    }
    return response.json();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Lorry:
 *       type: object
 *       required: [lorry_id, vehicle_number, rep_id]
 *       properties:
 *         lorry_id:
 *           type: string
 *           example: "LH3490"
 *         vehicle_number:
 *           type: string
 *           example: "LH3490"
 *         rep_id:
 *           type: string
 *           example: "REP-1001"
 *         status:
 *           type: string
 *           enum: [Active, Inactive, OnRoute]
 *     LorryStock:
 *       type: object
 *       required: [lorry_id, product_id, quantity]
 *       properties:
 *         lorry_id:
 *           type: string
 *           example: "LH3490"
 *         product_id:
 *           type: string
 *           example: "665a1b2c3d4e5f6a7b8c9d0e"
 *         quantity:
 *           type: number
 *           example: 100
 *     StockTransfer:
 *       type: object
 *       required: [lorry_id, product_id, quantity]
 *       properties:
 *         transfer_id:
 *           type: string
 *           example: "TR-1711785600000-1001"
 *         lorry_id:
 *           type: string
 *           example: "LH3490"
 *         product_id:
 *           type: string
 *           example: "665a1b2c3d4e5f6a7b8c9d0e"
 *         quantity:
 *           type: number
 *           example: 40
 *         status:
 *           type: string
 *           enum: [pending, approved]
 *         date:
 *           type: string
 *           format: date-time
 *     LorrySale:
 *       type: object
 *       required: [lorry_id, phone_number, product_id, quantity, cash_amount, credit_amount]
 *       properties:
 *         lorry_id:
 *           type: string
 *         product_id:
 *           type: string
 *         product_name:
 *           type: string
 *         quantity:
 *           type: number
 *         whole_price:
 *           type: number
 *           description: Auto-filled from Inventory product wholesale_price
 *         total:
 *           type: number
 *           description: Auto-calculated as whole_price * quantity
 *         cash_amount:
 *           type: number
 *         credit_amount:
 *           type: number
 *         phone_number:
 *           type: string
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
        const payload = {
            lorry_id: req.body.lorry_id || req.body.lorryId,
            vehicle_number: req.body.vehicle_number || req.body.vehicleNumber || req.body.licensePlate,
            rep_id: req.body.rep_id || req.body.repId || req.body.assignedRep,
            status: req.body.status
        };
        const lorry = new Lorry(payload);
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
        const payload = {
            ...(req.body.lorry_id || req.body.lorryId ? { lorry_id: req.body.lorry_id || req.body.lorryId } : {}),
            ...(req.body.vehicle_number || req.body.vehicleNumber || req.body.licensePlate ? {
                vehicle_number: req.body.vehicle_number || req.body.vehicleNumber || req.body.licensePlate
            } : {}),
            ...(req.body.rep_id || req.body.repId || req.body.assignedRep ? {
                rep_id: req.body.rep_id || req.body.repId || req.body.assignedRep
            } : {}),
            ...(req.body.status ? { status: req.body.status } : {})
        };
        const updated = await Lorry.findByIdAndUpdate(req.params.id, payload, { new: true });
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
        const lorryId = req.body.lorry_id || req.body.lorryId;
        const productId = req.body.product_id || req.body.productId;
        const quantity = toNumber(req.body.quantity || req.body.quantityLoaded || 0);

        if (!lorryId || !productId) {
            return res.status(400).json({ message: 'lorry_id and product_id are required' });
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'quantity must be a positive number' });
        }

        const warehouseStock = await getWarehouseStockByProductId(productId);
        if (!warehouseStock) {
            return res.status(404).json({
                message: `Product ${productId} was not found in Inventory warehouse stock`
            });
        }

        const warehouseQuantity = toNumber(warehouseStock.quantity || 0);
        const existingLorryStock = await LorryStock.findOne({ lorry_id: lorryId, product_id: productId });
        const currentLorryQuantity = existingLorryStock?.quantity || 0;
        const updatedLorryQuantity = currentLorryQuantity + quantity;

        if (updatedLorryQuantity > warehouseQuantity) {
            return res.status(400).json({
                message: `Lorry stock cannot exceed warehouse quantity for product ${productId}. Warehouse quantity: ${warehouseQuantity}, requested lorry quantity: ${updatedLorryQuantity}`
            });
        }

        const updated = await LorryStock.findOneAndUpdate(
            { lorry_id: lorryId, product_id: productId },
            { $inc: { quantity } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({
            message: 'Stock loaded successfully',
            stock: updated
        });
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
        const stock = await LorryStock.find({ lorry_id: req.params.lorryId });
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

        const returnedQty = Number(req.body.quantityReturned || 0);
        if (returnedQty < 0) {
            return res.status(400).json({ message: 'quantityReturned must be positive' });
        }
        if (returnedQty > stock.quantity) {
            return res.status(400).json({ message: 'Returned quantity exceeds stock quantity' });
        }

        stock.quantity -= returnedQty;
        await stock.save();
        res.json({ message: 'Return recorded', remainingQuantity: stock.quantity, stock });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ─── STOCK TRANSFER ────────────────────────────────────────

/**
 * @swagger
 * /stock-transfers:
 *   post:
 *     summary: Create stock transfer request
 *     tags: [StockTransfer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockTransfer'
 *     responses:
 *       201:
 *         description: Stock transfer created
 *   get:
 *     summary: Get all stock transfers
 *     tags: [StockTransfer]
 *     responses:
 *       200:
 *         description: Stock transfers list
 */
exports.createStockTransfer = async (req, res) => {
    try {
        const transfer = new StockTransfer({
            lorry_id: req.body.lorry_id || req.body.lorryId,
            product_id: req.body.product_id || req.body.productId,
            quantity: req.body.quantity,
            status: req.body.status,
            date: req.body.date
        });
        const saved = await transfer.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllStockTransfers = async (req, res) => {
    try {
        const transfers = await StockTransfer.find().sort({ createdAt: -1 });
        res.json(transfers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /stock-transfers/{transferId}:
 *   get:
 *     summary: Get a stock transfer by transfer_id
 *     tags: [StockTransfer]
 *     parameters:
 *       - in: path
 *         name: transferId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock transfer details
 */
exports.getStockTransferByTransferId = async (req, res) => {
    try {
        const transfer = await StockTransfer.findOne({ transfer_id: req.params.transferId });
        if (!transfer) return res.status(404).json({ message: 'Stock transfer not found' });
        res.json(transfer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /stock-transfers/{transferId}/status:
 *   put:
 *     summary: Update stock transfer status
 *     tags: [StockTransfer]
 *     parameters:
 *       - in: path
 *         name: transferId
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
 *                 enum: [pending, approved]
 *     responses:
 *       200:
 *         description: Stock transfer status updated
 */
exports.updateStockTransferStatus = async (req, res) => {
    try {
        const updated = await StockTransfer.findOneAndUpdate(
            { transfer_id: req.params.transferId },
            { status: req.body.status },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Stock transfer not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ─── LORRY SALE ────────────────────────────────────────────

/**
 * @swagger
 * /lorry-sales:
 *   post:
 *     summary: Create lorry sale record
 *     tags: [LorrySale]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LorrySale'
 *     responses:
 *       201:
 *         description: Lorry sale created
 *   get:
 *     summary: Get all lorry sale records
 *     tags: [LorrySale]
 *     responses:
 *       200:
 *         description: Lorry sales list
 */
exports.createLorrySale = async (req, res) => {
    try {
        const lorryId = req.body.lorry_id || req.body.lorryId;
        const phoneNumberInput = req.body.phone_number || req.body.phoneNumber;
        const productId = req.body.product_id || req.body.productId;
        const quantity = toNumber(req.body.quantity || 0);

        if (!lorryId) {
            return res.status(400).json({ message: 'lorry_id is required' });
        }
        if (!productId) {
            return res.status(400).json({ message: 'product_id is required' });
        }
        if (!phoneNumberInput) {
            return res.status(400).json({ message: 'phone_number is required' });
        }
        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'quantity must be a positive number' });
        }

        const product = await getInventoryProductById(productId);
        if (!product) {
            return res.status(404).json({ message: `Product ${productId} not found in Inventory` });
        }

        const wholePrice = toNumber(product.wholesale_price);
        if (!Number.isFinite(wholePrice) || wholePrice < 0) {
            return res.status(400).json({ message: `Invalid wholesale price for product ${productId}` });
        }

        const cashAmountRaw = req.body.cash_amount ?? req.body.cashAmount;
        const creditAmountRaw = req.body.credit_amount ?? req.body.creditAmount;

        if (cashAmountRaw === undefined || creditAmountRaw === undefined) {
            return res.status(400).json({ message: 'cash_amount and credit_amount are required' });
        }

        const cashAmount = toNumber(cashAmountRaw);
        const creditAmount = toNumber(creditAmountRaw);
        if (!Number.isFinite(cashAmount) || cashAmount < 0 || !Number.isFinite(creditAmount) || creditAmount < 0) {
            return res.status(400).json({ message: 'cash_amount and credit_amount must be non-negative numbers' });
        }

        const total = wholePrice * quantity;
        const paidTotal = cashAmount + creditAmount;
        if (Math.abs(paidTotal - total) > 0.000001) {
            return res.status(400).json({
                message: `cash_amount + credit_amount must equal total (${total})`
            });
        }

        const customer = await getCustomerByPhoneNumber(phoneNumberInput);
        if (!customer) {
            return res.status(404).json({ message: `Customer ${phoneNumberInput} not found` });
        }

        const phoneNumber = customer.phone;
        if (!phoneNumber) {
            return res.status(400).json({ message: `Customer ${phoneNumberInput} does not have a phone number` });
        }

        if (String(phoneNumberInput).trim() !== String(phoneNumber).trim()) {
            return res.status(400).json({
                message: 'Provided phone_number does not match the selected customer phone'
            });
        }

        const stock = await LorryStock.findOne({ lorry_id: lorryId, product_id: productId });
        if (!stock) {
            return res.status(400).json({
                message: `Product ${productId} is not available in lorry ${lorryId} stock`
            });
        }

        if (quantity > stock.quantity) {
            return res.status(400).json({
                message: `Insufficient stock. Available quantity for product ${productId} in lorry ${lorryId} is ${stock.quantity}`
            });
        }

        const sale = new LorrySale({
            lorry_id: lorryId,
            product_id: productId,
            product_name: req.body.product_name || req.body.productName || product.name,
            quantity,
            whole_price: wholePrice,
            total,
            cash_amount: cashAmount,
            credit_amount: creditAmount,
            phone_number: phoneNumber
        });

        if (!sale.product_name) {
            return res.status(400).json({ message: 'product_name is required' });
        }
        if (!sale.phone_number) {
            return res.status(400).json({ message: 'phone_number is required' });
        }

        stock.quantity -= quantity;
        await stock.save();

        const saved = await sale.save();

        // ─── Automate update to Customer CreditLimit ───
        try {
            const customerUrl = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:5003';
            const response = await fetch(`${customerUrl}/credit-limits/${phoneNumber}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cashAmount: saved.cash_amount,
                    creditAmount: saved.credit_amount
                })
            });

            if (!response.ok) {
                console.error(`Warning: Customer Service responded with status ${response.status} when updating LorrySale limit`);
            }
        } catch (serviceErr) {
            console.error('Error communicating with Customer Service for Lorry sale credit update:', serviceErr.message);
        }

        res.status(201).json({
            message: 'Lorry sale created',
            sale: saved,
            remainingStock: stock.quantity
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllLorrySales = async (req, res) => {
    try {
        const sales = await LorrySale.find().sort({ createdAt: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /lorry-sales/product/{productId}:
 *   get:
 *     summary: Get lorry sales by product_id
 *     tags: [LorrySale]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lorry sales for product
 */
exports.getLorrySalesByProduct = async (req, res) => {
    try {
        const sales = await LorrySale.find({ product_id: req.params.productId }).sort({ createdAt: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
