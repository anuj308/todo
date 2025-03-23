import express from 'express';
import cors from 'cors';
import connectDB from '../server/config/db.js';
import todoRoutes from '../server/routes/todoRoutes.js';

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);

// Handle 404 for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Export the Express API
export default app;