import express from 'express';
import * as valController from '../controllers/validation.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/check', authenticate, valController.check);

export default router;
