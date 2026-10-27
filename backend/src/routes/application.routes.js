import express from 'express';
import * as appController from '../controllers/application.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.get('/', authenticate, appController.list);
router.post('/', authenticate, appController.create);
router.get('/:id', authenticate, appController.getById);
router.patch('/:id/submit', authenticate, appController.submit);

export default router;
