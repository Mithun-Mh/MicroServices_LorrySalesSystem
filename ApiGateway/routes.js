module.exports = [
    {
        prefix: '/inventory',
        target: 'http://inventory-service:5001'
    },
    {
        prefix: '/fleet',
        target: 'http://fleet-service:5002'
    },
    {
        prefix: '/customer',
        target: 'http://customer-service:5003'
    },
    {
        prefix: '/sales',
        target: 'http://sales-service:5004'
    },
    {
        prefix: '/finance',
        target: 'http://finance-service:5005'
    }
];
