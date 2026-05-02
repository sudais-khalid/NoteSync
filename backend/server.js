require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const lectureRoutes = require('./routes/lectureRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', lectureRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NoteSync API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NoteSync API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getMe: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password'
      },
      summarize: 'POST /api/summarize',
      lectures: {
        getAll: 'GET /api/lectures',
        getOne: 'GET /api/lectures/:id',
        create: 'POST /api/lectures',
        update: 'PUT /api/lectures/:id',
        delete: 'DELETE /api/lectures/:id'
      }
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n================================');
  console.log(`NoteSync Backend Server Started`);
  console.log(`================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log('================================\n');
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message || err);
});