import express from 'express';
import * as notifController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.get('/', authenticate, notifController.list);
router.post('/test-email', authenticate, notifController.sendTestEmail);

export default router;
