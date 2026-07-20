import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

// Route Imports
import dashboardRoutes from './routes/dashboardRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import savedFilterRoutes from './routes/savedFilterRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';

// Middleware Imports
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

// Load environmental variables
dotenv.config();

// Establish MongoDB connection
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

import v1Routes from './routes/v1/index.js';

import productCategoryRoutes from './routes/productCategoryRoutes.js';
import productBrandRoutes from './routes/productBrandRoutes.js';
import productRoutes from './routes/productRoutes.js';
import productVariantRoutes from './routes/productVariantRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import dealItemRoutes from './routes/dealItemRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// API Module Route Mounts
app.use('/api/v1', v1Routes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/saved-filters', savedFilterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/product-brands', productBrandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-variants', productVariantRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/deal-items', dealItemRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint (GET /api/health)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    data: {
      serverStatus: 'online',
      mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date()
  });
});

// 404 Route Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
