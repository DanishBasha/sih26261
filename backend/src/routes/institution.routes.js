import express from 'express';
import * as instController from '../controllers/institution.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/details', authenticate, instController.saveDetails);
router.post('/submit-verification', authenticate, instController.submitVerification);
router.get('/verification-status', authenticate, instController.getVerificationStatus);

export default router;
