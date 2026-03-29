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
 * /inventory/{path}:
 *   get:
 *     summary: Proxy GET request to Inventory Service
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response from Inventory Service
 */

/**
 * @swagger
 * /fleet/{path}:
 *   get:
 *     summary: Proxy GET request to Fleet Service
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response from Fleet Service
 */

/**
 * @swagger
 * /customer/{path}:
 *   get:
 *     summary: Proxy GET request to Customer Service
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response from Customer Service
 */

/**
 * @swagger
 * /sales/{path}:
 *   get:
 *     summary: Proxy GET request to Sales Service
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response from Sales Service
 */

/**
 * @swagger
 * /finance/{path}:
 *   get:
 *     summary: Proxy GET request to Finance Service
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response from Finance Service
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
