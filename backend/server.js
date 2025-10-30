import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import todoRoutes from './routes/todoRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import userRoutes from './routes/userRoutes.js'; // Import user routes
import folderRoutes from './routes/folderRoutes.js'; // Import folder routes
import calendarTodoRoutes from './routes/calendarTodoRoutes.js'; // Import calendar todo routes
import timeLogRoutes from './routes/timeLogRoutes.js'; // Import time log routes
import productivityRoutes from './routes/productivityRoutes.js'; // Import productivity routes
import dailyDiaryRoutes from './routes/dailyDiaryRoutes.js';
import projectRoutes from './routes/projectRoutes.js'; // Import project routes

console.log('Server starting up - this is a test log'); // Test log

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'https://todo-nu-six-91.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for development (mobile app)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Enable credentials for cookies
}));

// Increase payload limit for image uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes); // Add user routes
app.use('/api/folders', folderRoutes); // Add folder routes
app.use('/api/calendar-todos', calendarTodoRoutes); // Add calendar todo routes
app.use('/api/time-logs', timeLogRoutes); // Add time log routes
app.use('/api/productivity-metrics', productivityRoutes); // Add productivity routes
app.use('/api/daily-diary', dailyDiaryRoutes);
app.use('/api/projects', projectRoutes); // Add project routes

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
    // Listen on 0.0.0.0 to allow connections from mobile devices on same network
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      console.log(`Network: accessible from devices on same WiFi`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
})();