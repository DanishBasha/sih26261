import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.get('/session', authenticate, authController.getSession);

export default router;
