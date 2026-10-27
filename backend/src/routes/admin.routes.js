import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/stats', authenticate, adminController.getStats);
router.get('/institution-verifications', authenticate, authorize(['admin', 'official']), adminController.listInstitutionVerifications);
router.post('/institution-verifications/:id/review', authenticate, authorize(['admin', 'official']), adminController.reviewInstitutionVerification);

export default router;
