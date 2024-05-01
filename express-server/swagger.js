const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'API documentation for your Express.js server',
    },
  },
  apis: ['path/to/your/routes/*.js'], // Replace this with the path to your route files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
