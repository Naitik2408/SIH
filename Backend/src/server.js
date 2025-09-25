const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Cloudinary (imported for side effects)
require('./config/cloudinary');

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration for web and mobile clients
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:19006', // Expo dev server
    'http://10.0.2.2:19006',  // Android emulator
    'exp://',                 // Expo client
    'exps://',               // Expo client (secure)
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : []),
    ...(process.env.MOBILE_CLIENT_ORIGINS ? process.env.MOBILE_CLIENT_ORIGINS.split(',') : [])
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list or matches Expo patterns
        if (allowedOrigins.some(allowedOrigin =>
            origin.startsWith(allowedOrigin) || allowedOrigin.startsWith(origin)
        )) {
            return callback(null, true);
        }

        // Log rejected origins in development
        if (process.env.NODE_ENV === 'development') {
            console.warn(`CORS: Rejected origin ${origin}`);
        }

        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'SIH Transportation Analytics API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
    });
});

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// 404 handler - catch all unmatched routes
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;
console.log("Starting server...", PORT);

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('👋 Process terminated');
    });
});

module.exports = app;
