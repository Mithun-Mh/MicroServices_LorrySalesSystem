const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const customerController = require('./controllers/CustomerController');

const app = express();
const port = 5003;

app.use(express.json());

// MongoDB Connection
const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/customer_db';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB - Customer Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Customer Service API',
            version: '1.0.0',
            description: 'Shop Owner Profiles and Credit Limit management'
        },
        servers: [{ url: `http://localhost:${port}` }]
    },
    apis: ['./index.js', './controllers/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── STATUS ─────────────────────────────────────────────────
app.get('/status', (req, res) => {
    res.status(200).json({ message: 'Customer Service is up and running' });
});

// ─── CUSTOMER ROUTES ────────────────────────────────────────
app.get('/customers', customerController.getAllCustomers);
app.get('/customers/:id', customerController.getCustomerById);
app.post('/customers', customerController.createCustomer);
app.put('/customers/:id', customerController.updateCustomer);
app.delete('/customers/:id', customerController.deleteCustomer);

// ─── CREDIT LIMIT ROUTES ───────────────────────────────────
app.post('/credit-limits', customerController.setCreditLimit);
app.get('/credit-limits/:customerId', customerController.getCreditLimit);
app.put('/credit-limits/:customerId', customerController.updateCreditLimit);

app.listen(port, () => {
    console.log(`Customer Service running on port ${port}`);
});
