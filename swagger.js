const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
    openapi: "3.0.0",
    
    info: {
        title: "My API",
        version: "1.0.0",
        description: "API documentation for my app"
    },

    servers: [
        {
            url: "https://joke-generator-server-3il8.onrender.com",
            description: "Development server"
        },
    ],
};


const options = {
    swaggerDefinition,
    apis: ["./app.js"]
}

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec
}