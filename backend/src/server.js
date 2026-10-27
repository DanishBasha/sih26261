import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 SIH26261 Backend Server running at http://localhost:${PORT}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
});
