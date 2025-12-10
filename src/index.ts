import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import listsRoutes from './routes/lists.js';
import todosRoutes from './routes/todos.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/lists', listsRoutes);
app.use(todosRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Express Backend Starter API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
