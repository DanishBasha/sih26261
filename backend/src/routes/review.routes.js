import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/deficiency', authenticate, reviewController.raiseDeficiency);
router.post('/approve', authenticate, reviewController.approve);
router.post('/override', authenticate, reviewController.overrideFinding);

export default router;
