import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import rulesRoutes from './routes/rules.js';
import applicationsRoutes from './routes/applications.js';
import documentsRoutes from './routes/documents.js';
import reviewsRoutes from './routes/reviews.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Mount API Routes
app.use('/api/health', healthRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'SIH26261 — AI-Powered AICTE Application Validation API',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'online'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default app;
