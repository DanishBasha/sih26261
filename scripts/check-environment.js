import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const res = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      res[k] = v;
    }
  }
  return res;
}

const envVars = {
  ...parseEnv(path.resolve(__dirname, '../.env')),
  ...parseEnv(path.resolve(__dirname, '../backend/.env'))
};

console.log('🔍 Checking Environment Variables for SIH26261...');
const required = ['DATABASE_URL', 'GROQ_API_KEY', 'EMAIL_USER', 'EMAIL_PASS'];
let allOk = true;

for (const key of required) {
  if (envVars[key]) {
    console.log(`✅ ${key}: Configured`);
  } else {
    console.warn(`⚠️ ${key}: Missing`);
    allOk = false;
  }
}

if (allOk) {
  console.log('🎉 All required environment variables are configured!');
} else {
  console.log('ℹ️ Please ensure missing variables are set in .env');
}
