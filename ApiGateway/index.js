const express = require('express');
const proxy = require('express-http-proxy');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();
const app = express();
const port = 80;

app.use(express.json());

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * tags:
 *   - name: Auth
 *     description: Public authentication endpoints
 *   - name: Inventory
 *     description: Inventory operations proxied through API Gateway
 *   - name: Fleet
 *     description: Fleet operations proxied through API Gateway
 *   - name: Customer
 *     description: Customer operations proxied through API Gateway
 *   - name: Sales
 *     description: Sales operations proxied through API Gateway
 *   - name: Finance
 *     description: Finance operations proxied through API Gateway
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Proxied to Auth Service.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, staff, rep]
 *     responses:
 *       200:
 *         description: User registration response from Auth Service
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Auth]
 *     description: Proxied to Auth Service.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login response with token
 */

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify authentication token
 *     tags: [Auth]
 *     description: Proxied to Auth Service.
 *     responses:
 *       200:
 *         description: Token verification response
 */

/**
 * @swagger
 * /inventory/status:
 *   get:
 *     summary: Inventory service health status
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory service is running
 */

/**
 * @swagger
 * /inventory/products:
 *   get:
 *     summary: Get all products
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku, price]
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [Shirt, Slippers, Other]
 *     responses:
 *       201:
 *         description: Product created
 */

/**
 * @swagger
 * /inventory/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *   put:
 *     summary: Update product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */

/**
 * @swagger
 * /inventory/damaged:
 *   get:
 *     summary: Get all damaged item records
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Damaged items list
 *   post:
 *     summary: Record damaged items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Damaged items recorded
 */

/**
 * @swagger
 * /fleet/status:
 *   get:
 *     summary: Fleet service health status
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fleet service is running
 */

/**
 * @swagger
 * /fleet/lorries:
 *   get:
 *     summary: Get all lorries
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of lorries
 *   post:
 *     summary: Register a new lorry
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lorryId, licensePlate, assignedRep]
 *             properties:
 *               lorryId:
 *                 type: string
 *                 example: LH3490
 *               licensePlate:
 *                 type: string
 *                 example: WP-AB-1234
 *               assignedRep:
 *                 type: string
 *                 example: Kamal Perera
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, OnRoute]
 *     responses:
 *       201:
 *         description: Lorry registered
 */

/**
 * @swagger
 * /fleet/lorries/{id}:
 *   put:
 *     summary: Update lorry details
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
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
 *               lorryId:
 *                 type: string
 *               licensePlate:
 *                 type: string
 *               assignedRep:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, OnRoute]
 *     responses:
 *       200:
 *         description: Lorry updated
 *   delete:
 *     summary: Delete a lorry
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /fleet/lorry-stock:
 *   post:
 *     summary: Load stock to a lorry
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lorryId, productId, productName, quantityLoaded]
 *             properties:
 *               lorryId:
 *                 type: string
 *                 example: LH3490
 *               productId:
 *                 type: string
 *                 example: 665a1b2c3d4e5f6a7b8c9d0e
 *               productName:
 *                 type: string
 *                 example: Men's Cotton Shirt
 *               quantityLoaded:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Stock loaded
 */

/**
 * @swagger
 * /fleet/lorry-stock/{lorryId}:
 *   get:
 *     summary: Get stock for a lorry
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lorryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lorry stock list
 */

/**
 * @swagger
 * /fleet/lorry-stock/return/{id}:
 *   put:
 *     summary: Record returned stock
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /fleet/lorry-sales:
 *   post:
 *     summary: Create lorry sale record
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lorry_id, product_id, product_name, quantity, retail_price, whole_price, total, name]
 *             properties:
 *               lorry_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               product_name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               retail_price:
 *                 type: number
 *               whole_price:
 *                 type: number
 *               total:
 *                 type: number
 *               cash_amount:
 *                 type: number
 *               credit_amount:
 *                 type: number
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lorry sale created
 *   get:
 *     summary: Get all lorry sales
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lorry sales list
 */

/**
 * @swagger
 * /fleet/lorry-sales/product/{productId}:
 *   get:
 *     summary: Get lorry sales by product ID
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /customer/status:
 *   get:
 *     summary: Customer service health status
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer service is running
 */

/**
 * @swagger
 * /customer/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers list
 *   post:
 *     summary: Create a customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, shopName, address, phone]
 *             properties:
 *               name:
 *                 type: string
 *               shopName:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Card, Credit]
 *     responses:
 *       201:
 *         description: Customer created
 */

/**
 * @swagger
 * /customer/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 *   put:
 *     summary: Update customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Customer updated
 *   delete:
 *     summary: Delete customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /customer/credit-limits:
 *   post:
 *     summary: Set customer credit limit
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, creditLimit]
 *             properties:
 *               customerId:
 *                 type: string
 *               creditLimit:
 *                 type: number
 *               currentBalance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Credit limit set
 */

/**
 * @swagger
 * /customer/credit-limits/{customerId}:
 *   get:
 *     summary: Get customer credit limit
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Credit limit details
 *   put:
 *     summary: Update customer credit limit
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /sales/status:
 *   get:
 *     summary: Sales service health status
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales service is running
 */

/**
 * @swagger
 * /sales/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices list
 *   post:
 *     summary: Create invoice
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceNumber, customerId, customerName, lorryId, items, totalAmount, paymentMethod]
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *               customerId:
 *                 type: string
 *               customerName:
 *                 type: string
 *               lorryId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               totalAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Card, Credit]
 *     responses:
 *       201:
 *         description: Invoice created
 */

/**
 * @swagger
 * /sales/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice details
 *   put:
 *     summary: Update invoice status
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /sales/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions list
 *   post:
 *     summary: Create transaction
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceId, paymentMethod, amountPaid]
 *             properties:
 *               invoiceId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Card, Credit]
 *               amountPaid:
 *                 type: number
 *               reference:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction recorded
 */

/**
 * @swagger
 * /finance/status:
 *   get:
 *     summary: Finance service health status
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Finance service is running
 */

/**
 * @swagger
 * /finance/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expenses list
 *   post:
 *     summary: Create expense
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lorryId, type, amount]
 *             properties:
 *               lorryId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Fuel, Food, Maintenance, Other]
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created
 */

/**
 * @swagger
 * /finance/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Expense updated
 *   delete:
 *     summary: Delete expense
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /finance/profit-summary:
 *   get:
 *     summary: Get all profit summaries
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profit summaries list
 *   post:
 *     summary: Create profit summary
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               lorryId:
 *                 type: string
 *               totalIncome:
 *                 type: number
 *               totalExpenses:
 *                 type: number
 *     responses:
 *       201:
 *         description: Profit summary created
 */

/**
 * @swagger
 * /finance/profit-summary/{lorryId}:
 *   get:
 *     summary: Get profit summary by lorry
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
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

// Auth Middleware
const authenticate = (allowedRoles) => (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        if (allowedRoles && !allowedRoles.includes(decoded.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        req.user = decoded;
        // Pass user info to microservices
        req.headers['x-user-id'] = decoded.id;
        req.headers['x-user-role'] = decoded.role;
        req.headers['x-user-email'] = decoded.email;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Lorry Sales System API Gateway',
            version: '1.0.0',
            description: 'Central Gateway for Lorry Sales Microservices with RBAC'
        },
        servers: [{ url: 'http://localhost' }]
    },
    apis: ['./index.js', './routes.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Public Routes (Auth)
app.use('/auth', proxy('http://auth-service:5006'));

// Protected Routes with RBAC
// Inventory, Sales, Finance: Admin and Staff
app.use('/inventory', authenticate(['admin', 'staff']), proxy('http://inventory-service:5001'));
app.use('/sales', authenticate(['admin', 'staff']), proxy('http://sales-service:5004'));
app.use('/finance', authenticate(['admin', 'staff']), proxy('http://finance-service:5005'));

// Fleet: Rep, Admin, Staff
app.use('/fleet', authenticate(['admin', 'staff', 'rep']), proxy('http://fleet-service:5002'));

// Customer: Rep, Admin, Staff
app.use('/customer', authenticate(['admin', 'staff', 'rep']), proxy('http://customer-service:5003'));

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
