const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const financeController = require('./controllers/FinanceController');

const app = express();
const port = 5005;

app.use(express.json());

// MongoDB Connection
const baseMongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/lorry_system';
const mongoUrl = baseMongoUrl.replace(/(\.net\/|\:\d+\/)[^\?]+/, '$1LorrySystem_Finance');

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB - Finance Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Finance Service API',
            version: '1.0.0',
            description: 'Income, Lorry Expenses, and Daily Profit Tracking'
        },
        servers: [{ url: `http://localhost:${port}` }]
    },
    apis: ['./index.js', './controllers/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── STATUS ─────────────────────────────────────────────────
app.get('/status', (req, res) => {
    res.status(200).json({ message: 'Finance Service is up and running' });
});

// ─── EXPENSE ROUTES ─────────────────────────────────────────
app.get('/expenses', financeController.getAllExpenses);
app.post('/expenses', financeController.createExpense);
app.put('/expenses/:id', financeController.updateExpense);
app.delete('/expenses/:id', financeController.deleteExpense);

// ─── PROFIT SUMMARY ROUTES ─────────────────────────────────
app.post('/profit-summary', financeController.createProfitSummary);
app.get('/profit-summary', financeController.getAllProfitSummaries);
app.get('/profit-summary/:lorryId', financeController.getProfitByLorry);

app.listen(port, () => {
    console.log(`Finance Service running on port ${port}`);
});
