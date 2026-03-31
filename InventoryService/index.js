const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const inventoryController = require('./controllers/InventoryController');

const app = express();
const port = 5001;

app.use(express.json());

// MongoDB Connection
const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/lorry_system';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB - Inventory Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Inventory Service API',
            version: '1.0.0',
            description: 'Service for Warehouse and Damaged Items management'
        },
        servers: [{ url: `http://localhost:${port}` }]
    },
    apis: ['./index.js', './controllers/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── STATUS ─────────────────────────────────────────────────
app.get('/status', (req, res) => {
    res.status(200).json({ message: 'Inventory Service is up and running' });
});

// ─── PRODUCT ROUTES ─────────────────────────────────────────
app.get('/products', inventoryController.getAllProducts);
app.get('/products/:id', inventoryController.getProductById);
app.post('/products', inventoryController.createProduct);
app.put('/products/:id', inventoryController.updateProduct);
app.delete('/products/:id', inventoryController.deleteProduct);

// ─── DAMAGED ITEMS ROUTES ───────────────────────────────────
app.get('/damaged', inventoryController.getAllDamaged);
app.post('/damaged', inventoryController.recordDamaged);

app.listen(port, () => {
    console.log(`Inventory Service running on port ${port}`);
});
