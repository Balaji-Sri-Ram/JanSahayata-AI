import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import complaintRoutes from './routes/complaintRoutes.js';
import railwayRoutes from './routes/railwayRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/railway', railwayRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AI Grievance Mediation Platform Backend',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Railway Grievance Server running on http://localhost:${PORT}`);
  console.log(`[Server] Client Origin allowed: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
