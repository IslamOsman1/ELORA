import { promises as fs } from 'fs';
import path from 'path';

function upsertEnvValue(content, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escapedKey}=.*$`, 'm');
  const nextLine = `${key}=${value}`;

  if (pattern.test(content)) {
    return content.replace(pattern, nextLine);
  }

  const normalized = content.endsWith('\n') || !content ? content : `${content}\n`;
  return `${normalized}${nextLine}\n`;
}

export async function syncAdminEnvFile({ email, password }) {
  const envPath = path.resolve(process.cwd(), '.env');
  let content = '';

  try {
    content = await fs.readFile(envPath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  let nextContent = content;
  if (email) nextContent = upsertEnvValue(nextContent, 'ADMIN_EMAIL', email);
  if (password) nextContent = upsertEnvValue(nextContent, 'ADMIN_PASSWORD', password);

  await fs.writeFile(envPath, nextContent, 'utf8');

  if (email) process.env.ADMIN_EMAIL = email;
  if (password) process.env.ADMIN_PASSWORD = password;
}
