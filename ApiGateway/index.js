const express = require('express');
const proxy = require('express-http-proxy');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const app = express();
const port = 80;

app.use(express.json());

// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Lorry Sales System API Gateway',
            version: '1.0.0',
            description: 'Central Gateway for Lorry Sales Microservices'
        },
        servers: [{ url: 'http://localhost' }]
    },
    apis: ['./index.js', './routes.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Microservice Routes
app.use('/inventory', proxy('http://inventory-service:5001'));
app.use('/fleet', proxy('http://fleet-service:5002'));
app.use('/customer', proxy('http://customer-service:5003'));
app.use('/sales', proxy('http://sales-service:5004'));
app.use('/finance', proxy('http://finance-service:5005'));

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
