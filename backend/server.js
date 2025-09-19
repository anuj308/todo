import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import todoRoutes from './routes/todoRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import userRoutes from './routes/userRoutes.js'; // Import user routes
import folderRoutes from './routes/folderRoutes.js'; // Import folder routes

console.log('Server starting up - this is a test log'); // Test log

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://todo-nine-jade.vercel.app'], // Allow both origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Enable credentials for cookies
}));
app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes); // Add user routes
app.use('/api/folders', folderRoutes); // Add folder routes

// 404 handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Root route for API status
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Todo and Notes API server is running',
    version: '1.0.0'
  });
});

// Ensure the database connection is established before starting the server
(async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
})();