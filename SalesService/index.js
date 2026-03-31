const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const salesController = require('./controllers/SalesController');

const app = express();
const port = 5004;

app.use(express.json());

// MongoDB Connection
const baseMongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/lorry_system';
const mongoUrl = baseMongoUrl.replace(/(\.net\/|\:\d+\/)[^\?]+/, '$1LorrySystem_Sales');

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB - Sales Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Sales Service API',
            version: '1.0.0',
            description: 'Invoicing, Billing, and Transaction Processing'
        },
        servers: [{ url: `http://localhost:${port}` }]
    },
    apis: ['./index.js', './controllers/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── STATUS ─────────────────────────────────────────────────
app.get('/status', (req, res) => {
    res.status(200).json({ message: 'Sales Service is up and running' });
});

// ─── INVOICE ROUTES ─────────────────────────────────────────
app.get('/invoices', salesController.getAllInvoices);
app.get('/invoices/:id', salesController.getInvoiceById);
app.post('/invoices', salesController.createInvoice);
app.put('/invoices/:id', salesController.updateInvoice);

// ─── TRANSACTION ROUTES ─────────────────────────────────────
app.post('/transactions', salesController.createTransaction);
app.get('/transactions', salesController.getAllTransactions);

app.listen(port, () => {
    console.log(`Sales Service running on port ${port}`);
});
