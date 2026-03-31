const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const financeController = require('./controllers/FinanceController');

const app = express();
const port = 5005;

app.use(express.json());

// MongoDB Connection
const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/lorry_system';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB - Finance Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Finance & Expense Service API',
            version: '1.0.0',
            description: 'Transaction, Expense, and Daily Profit Summary Management'
        },
        servers: [{ url: `http://localhost:${port}` }]
    },
    apis: ['./index.js', './controllers/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── STATUS ─────────────────────────────────────────────────
app.get('/status', (req, res) => {
    res.status(200).json({ message: 'Finance & Expense Service is up and running' });
});

// ─── TRANSACTION ROUTES ─────────────────────────────────────
app.get('/transactions', financeController.getAllTransactions);
app.get('/transactions/:id', financeController.getTransactionById);
app.post('/transactions', financeController.createTransaction);
app.put('/transactions/:id', financeController.updateTransaction);
app.delete('/transactions/:id', financeController.deleteTransaction);

// ─── EXPENSE ROUTES ─────────────────────────────────────────
app.get('/expenses', financeController.getAllExpenses);
app.get('/expenses/:id', financeController.getExpenseById);
app.post('/expenses', financeController.createExpense);
app.put('/expenses/:id', financeController.updateExpense);
app.delete('/expenses/:id', financeController.deleteExpense);

// ─── DAILY SUMMARY ROUTES ──────────────────────────────────
app.get('/daily-summary', financeController.getAllDailySummaries);
app.get('/daily-summary/:id', financeController.getDailySummaryById);
app.get('/daily-summary/lorry/:lorryId', financeController.getDailySummaryByLorry);
app.post('/daily-summary', financeController.createDailySummary);
app.post('/daily-summary/generate', financeController.generateDailySummary);
app.put('/daily-summary/:id', financeController.updateDailySummary);
app.delete('/daily-summary/:id', financeController.deleteDailySummary);

app.listen(port, () => {
    console.log(`Finance & Expense Service running on port ${port}`);
});
