// Kalakriti Studios — idempotent seed / initial setup
// Usage: yarn db:seed   (runs automatically during the Netlify build)
// - Marks ADMIN_EMAIL as the ADMIN user (signs in with Google)
// - Creates the default Settings row
// - Creates the 3 main categories (only if they don't exist)
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

try {
  process.loadEnvFile?.('.env');
} catch {
  /* env provided by host */
}

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function toCloudinary(url, folder) {
  try {
    const r = await cloudinary.uploader.upload(url, { folder });
    return { url: r.secure_url, publicId: r.public_id };
  } catch (e) {
    console.warn('  (cloudinary upload skipped:', e?.message || e, ')');
    return { url, publicId: null };
  }
}

const CATEGORIES = [
  {
    name: 'Hand Craft Design',
    slug: 'hand-craft-design',
    description: 'Hand-painted decor, festive accents and crafted keepsakes that bring warmth to every home and celebration.',
    image: 'https://images.unsplash.com/photo-1699801676350-4182399f7cdd?crop=entropy&cs=srgb&fm=jpg&q=85',
    sortOrder: 1,
  },
  {
    name: 'Rakhi',
    slug: 'rakhi',
    description: 'Heirloom-worthy rakhis, handcrafted thread by thread to celebrate the bond of siblings.',
    image: 'https://images.unsplash.com/photo-1692902288471-4beec045f56d?crop=entropy&cs=srgb&fm=jpg&q=85',
    sortOrder: 2,
  },
  {
    name: 'Handmade Portrait & Designs',
    slug: 'handmade-portrait-designs',
    description: 'Soulful hand-sketched portraits and custom designs \u2014 a timeless way to capture the people and moments you love.',
    image: 'https://images.unsplash.com/photo-1589637458063-7b054f0c18ab?crop=entropy&cs=srgb&fm=jpg&q=85',
    sortOrder: 3,
  },
];

const HERO = 'https://images.unsplash.com/photo-1635778976124-f609898bafc2?crop=entropy&cs=srgb&fm=jpg&q=85';

async function main() {
  console.log('→ Seeding Kalakriti Studios');

  // 1. Admin (Google sign-in only — the account with ADMIN_EMAIL becomes ADMIN)
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (email) {
    await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN' },
      create: { email, name: 'Kalakriti Admin', role: 'ADMIN' },
    });
    console.log(`  ✓ admin ready: ${email} (sign in with Google)`);
  } else {
    console.warn('  ! ADMIN_EMAIL not set — no admin created');
  }

  // 2. Settings
  const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
  if (!settings) {
    const hero = await toCloudinary(HERO, 'kalakriti/site');
    await prisma.settings.create({
      data: {
        id: 'default',
        email: email || '',
        heroTitle: 'Handcrafted art, made to be gifted',
        heroSubtitle:
          'Hand-painted festive décor, soulful hand sketches and heirloom rakhis — each piece made slowly, by hand, in our studio.',
        heroImage: hero.url,
        heroImagePublicId: hero.publicId,
        heroCtaLabel: 'Explore the Collection',
        heroCtaHref: '/shop',
      },
    });
    console.log('  ✓ settings created');
  } else {
    console.log('  ✓ settings exist (unchanged)');
  }

  // 3. Categories
  for (const c of CATEGORIES) {
    const exists = await prisma.category.findUnique({ where: { slug: c.slug } });
    if (exists) continue;
    const img = await toCloudinary(c.image, 'kalakriti/categories');
    await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: img.url,
        imagePublicId: img.publicId,
        sortOrder: c.sortOrder,
      },
    });
    console.log(`  ✓ category: ${c.name}`);
  }
  console.log('✓ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
