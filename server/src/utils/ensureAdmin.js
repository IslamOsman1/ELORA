import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function ensureAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elora.com').toLowerCase();
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    if (!existingAdmin.username) {
      existingAdmin.username = adminUsername;
      await existingAdmin.save();
    }
    return;
  }

  await User.create({
    name: 'ELORA Admin',
    email: adminEmail,
    username: adminUsername,
    password: await bcrypt.hash(adminPassword, 10),
    role: 'admin',
    authProviders: ['manual']
  });

  console.log(`Default admin created: ${adminEmail} (${adminUsername})`);
}
