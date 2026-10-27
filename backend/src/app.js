import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import institutionRoutes from './routes/institution.routes.js';
import applicationRoutes from './routes/application.routes.js';
import documentRoutes from './routes/document.routes.js';
import rulesRoutes from './routes/rules.routes.js';
import validationRoutes from './routes/validation.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Mount standard routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'SIH26261 — AICTE Application Scrutiny API',
    endpoints: '/api/health'
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
