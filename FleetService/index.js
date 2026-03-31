const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fleetController = require('./controllers/FleetController');

const app = express();
const port = 5002;

app.use(express.json());

// MongoDB Connection
const mongoUrl = process.env.MONGO_URI || 'mongodb+srv://lasalflowiix_db_user:FOMDbEvkF25z7R19@fastxprodbackup0129.hldrh6n.mongodb.net/LorrySystem?retryWrites=true&w=majority';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB - Fleet Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Fleet Service API',
            version: '1.0.0',
            description: 'Lorry and Rep Management with stock tracking'
        },
        servers: [{ url: `http://localhost:${port}` }]
    },
    apis: ['./index.js', './controllers/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── STATUS ─────────────────────────────────────────────────
app.get('/status', (req, res) => {
    res.status(200).json({ message: 'Fleet Service is up and running' });
});

// ─── LORRY ROUTES ───────────────────────────────────────────
app.get('/lorries', fleetController.getAllLorries);
app.post('/lorries', fleetController.createLorry);
app.put('/lorries/:id', fleetController.updateLorry);
app.delete('/lorries/:id', fleetController.deleteLorry);

// ─── LORRY STOCK ROUTES ─────────────────────────────────────
app.post('/lorry-stock', fleetController.loadStock);
app.get('/lorry-stock/:lorryId', fleetController.getStockByLorry);
app.put('/lorry-stock/return/:id', fleetController.returnStock);

app.listen(port, () => {
    console.log(`Fleet Service running on port ${port}`);
});
