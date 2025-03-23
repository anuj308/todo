import express from 'express';
import cors from 'cors';
import todoRoutes from '../server/routes/todoRoutes.js';
import connectDB from '../server/config/db.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;