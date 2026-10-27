import express from 'express';
import multer from 'multer';
import * as docController from '../controllers/document.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/upload', authenticate, upload.single('file'), docController.upload);

export default router;
