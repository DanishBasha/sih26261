import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/stats', authenticate, authorize(['admin', 'official', 'institution']), adminController.getStats);

export default router;
