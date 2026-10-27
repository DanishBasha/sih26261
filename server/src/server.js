import app from './app.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SIH26261 API Server running at http://localhost:${PORT}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`📜 AICTE Rules API available at: http://localhost:${PORT}/api/rules`);
});
