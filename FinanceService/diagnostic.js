// Diagnostic: Try to start FinanceService and log any errors
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '..', 'startup-error.log');

process.on('uncaughtException', (err) => {
    fs.writeFileSync(logFile, 'UNCAUGHT EXCEPTION:\n' + err.stack + '\n');
    console.error('Error written to startup-error.log');
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    fs.writeFileSync(logFile, 'UNHANDLED REJECTION:\n' + String(reason) + '\n');
    console.error('Error written to startup-error.log');
    process.exit(1);
});

fs.writeFileSync(logFile, 'Starting FinanceService diagnostic...\n');

try {
    fs.appendFileSync(logFile, 'Step 1: Loading express...\n');
    const express = require('express');
    
    fs.appendFileSync(logFile, 'Step 2: Loading mongoose...\n');
    const mongoose = require('mongoose');
    
    fs.appendFileSync(logFile, 'Step 3: Loading swagger-ui-express...\n');
    const swaggerUi = require('swagger-ui-express');
    
    fs.appendFileSync(logFile, 'Step 4: Loading swagger-jsdoc...\n');
    const swaggerJsDoc = require('swagger-jsdoc');
    
    fs.appendFileSync(logFile, 'Step 5: Loading dotenv...\n');
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
    
    fs.appendFileSync(logFile, 'Step 6: MONGO_URI = ' + (process.env.MONGO_URI ? 'SET' : 'NOT SET') + '\n');
    
    fs.appendFileSync(logFile, 'Step 7: Loading Transaction model...\n');
    const Transaction = require('./models/Transaction');
    
    fs.appendFileSync(logFile, 'Step 8: Loading Expense model...\n');
    const Expense = require('./models/Expense');
    
    fs.appendFileSync(logFile, 'Step 9: Loading DailySummary model...\n');
    const DailySummary = require('./models/DailySummary');
    
    fs.appendFileSync(logFile, 'Step 10: Loading FinanceController...\n');
    const financeController = require('./controllers/FinanceController');
    
    fs.appendFileSync(logFile, 'Step 11: Creating Express app...\n');
    const app = express();
    app.use(express.json());
    
    fs.appendFileSync(logFile, 'Step 12: Connecting to MongoDB...\n');
    const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/lorry_system';
    mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            fs.appendFileSync(logFile, 'Step 13: MongoDB connected!\n');
        })
        .catch(err => {
            fs.appendFileSync(logFile, 'Step 13: MongoDB FAILED: ' + err.message + '\n');
        });
    
    fs.appendFileSync(logFile, 'Step 14: Setting up routes...\n');
    app.get('/status', (req, res) => res.json({ status: 'ok' }));
    
    fs.appendFileSync(logFile, 'Step 15: Starting server on port 5005...\n');
    app.listen(5005, () => {
        fs.appendFileSync(logFile, 'SUCCESS: FinanceService running on port 5005!\n');
        console.log('FinanceService running on port 5005');
    });
    
} catch (err) {
    fs.appendFileSync(logFile, 'CAUGHT ERROR:\n' + err.stack + '\n');
    console.error('Error:', err.message);
}
