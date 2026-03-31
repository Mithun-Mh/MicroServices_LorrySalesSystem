const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const authController = require('./controllers/AuthController');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const port = 5006;

app.use(express.json());

// MongoDB Connection
const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/lorry_system';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB - Auth Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth Service API',
            version: '1.0.0',
            description: 'Authentication and Authorization Service'
        },
        servers: [{ url: `http://localhost:${port}` }]
    },
    apis: ['./index.js', './controllers/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.post('/register', authController.register);
app.post('/login', authController.login);
app.get('/verify', authController.verify);

app.listen(port, () => {
    console.log(`Auth Service running on port ${port}`);
});
