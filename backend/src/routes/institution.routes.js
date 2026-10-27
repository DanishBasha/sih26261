import express from 'express';
import * as instController from '../controllers/institution.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.get('/:id', authenticate, instController.getProfile);
router.patch('/:id', authenticate, instController.updateProfile);

export default router;
