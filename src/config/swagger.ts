import 'dotenv/config';
import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3000;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Backend Starter API',
      version: '1.0.0',
      description: 'Todo API with JWT authentication (HttpOnly cookies)',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'name@emailaddress.com' },
            username: { type: 'string', example: 'username' },
            name: { type: 'string', example: 'Example User' },
          },
        },
        List: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Shopping List' },
            description: { type: 'string', example: 'Weekly groceries' },
            createdBy: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Todo: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            listId: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Buy milk' },
            done: { type: 'boolean', example: false },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
