// DEV/TEST ONLY: mints Auth.js session cookies so automated tests can act as admin/customer
// without completing Google OAuth. Usage: node scripts/make-test-session.mjs [admin|customer]
import { encode } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';
try { process.loadEnvFile?.('.env'); } catch {}
const prisma = new PrismaClient();
const kind = process.argv[2] || 'admin';
const email = kind === 'admin' ? process.env.ADMIN_EMAIL.toLowerCase() : 'test.customer@example.com';
const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: kind === 'admin' ? 'Kalakriti Admin' : 'Test Customer', role: kind === 'admin' ? 'ADMIN' : 'CUSTOMER' } });
const out = {};
for (const salt of ['__Secure-authjs.session-token', 'authjs.session-token']) {
  out[salt] = await encode({ token: { sub: user.id, uid: user.id, role: user.role, email: user.email, name: user.name }, secret: process.env.AUTH_SECRET, salt, maxAge: 60 * 60 * 24 * 7 });
}
console.log(JSON.stringify({ email, role: user.role, cookies: out }));
await prisma.$disconnect();
