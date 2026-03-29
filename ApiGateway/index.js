const express = require('express');
const proxy = require('express-http-proxy');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();
const app = express();
const port = 80;

app.use(express.json());

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
app.use('/auth', proxy('http://localhost:5006'));

// Protected Routes with RBAC
// Inventory, Sales, Finance: Admin and Staff
app.use('/inventory', authenticate(['admin', 'staff']), proxy('http://localhost:5001'));
app.use('/sales', authenticate(['admin', 'staff']), proxy('http://localhost:5004'));
app.use('/finance', authenticate(['admin', 'staff']), proxy('http://localhost:5005'));

// Fleet: Rep, Admin, Staff
app.use('/fleet', authenticate(['admin', 'staff', 'rep']), proxy('http://localhost:5002'));

// Customer: Rep, Admin, Staff
app.use('/customer', authenticate(['admin', 'staff', 'rep']), proxy('http://localhost:5003'));

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
