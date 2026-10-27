import express from 'express';
import * as rulesController from '../controllers/rules.controller.js';

const router = express.Router();

router.get('/categories', rulesController.getCategories);
router.get('/checklist/:category', rulesController.getChecklist);
router.get('/', rulesController.list);

export default router;
