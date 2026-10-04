// One-time import: 4 Hand Craft Design pieces (images -> Cloudinary, products -> Postgres)
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
try { process.loadEnvFile?.('.env'); } catch {}
const prisma = new PrismaClient();
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
const B = 'https://customer-assets-cm19k8pv.emergentagent.net/job_handmade-shop-71/artifacts';
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const P = [
  { name: 'Shubh Labh Gota Toran', code: 'KS-HC-001', mrp: 1499, offer: 1199, featured: true, tags: ['Toran', 'Festive', 'Gota Work'], img: `${B}/cmdjkoyj_WhatsApp%20Image%202026-09-26%20at%2013.52.24.jpeg`,
    short: 'Handcrafted door toran with gota work, mirror detailing, elephants and Shubh Labh motifs.' },
  { name: 'Evil Eye Floral Toran', code: 'KS-HC-002', mrp: 1299, offer: 999, featured: true, tags: ['Toran', 'Evil Eye', 'Floral'], img: `${B}/3nv6727q_WhatsApp%20Image%202026-09-26%20at%2013.52.22.jpeg`,
    short: 'A fresh blue-and-white evil eye toran with hand-made lotus flowers and pearl tassels.' },
  { name: 'Royal Elephant Wall Hangings (Pair)', code: 'KS-HC-003', mrp: 1199, offer: 899, tags: ['Wall Hanging', 'Elephant', 'Festive'], img: `${B}/mi24vuft_WhatsApp%20Image%202026-09-26%20at%2013.52.21%20%281%29.jpeg`,
    short: 'A pair of hand-painted elephant hangings with gold rings, pearls and lotus drops.' },
  { name: 'Shrinathji Pichwai Cow Hangings (Pair)', code: 'KS-HC-004', mrp: 999, offer: 749, tags: ['Wall Hanging', 'Devotional', 'Pichwai'], img: `${B}/uz618gih_WhatsApp%20Image%202026-09-26%20at%2013.52.21.jpeg`,
    short: 'Devotional Shrinathji and Pichwai cow hangings framed in golden gota and pearls.' },
];
const DESC = (n) => `${n} is handmade in our studio with gota, pearls, beads and hand-finished details \u2014 made to bring warmth and blessings to your home.\n\nEvery piece is crafted by hand, so small variations make each one unique. Gift-ready packing is included.\n\nNeed a different size, colour or theme? Message us on WhatsApp and we\u2019ll customise it for you.`;
const cat = await prisma.category.findUnique({ where: { slug: 'hand-craft-design' } });
for (const p of P) {
  if (await prisma.product.findUnique({ where: { code: p.code } })) { console.log('skip', p.code); continue; }
  const r = await cloudinary.uploader.upload(p.img, { folder: 'kalakriti/products' });
  const tagIds = [];
  for (const t of p.tags) tagIds.push((await prisma.tag.upsert({ where: { slug: slugify(t) }, update: {}, create: { name: t, slug: slugify(t) } })).id);
  await prisma.product.create({ data: {
    name: p.name, slug: slugify(p.name), code: p.code, shortDescription: p.short, description: DESC(p.name),
    mrp: p.mrp, offerPrice: p.offer, isFeatured: !!p.featured, isCustomizable: true, categoryId: cat?.id,
    images: { create: [{ cloudinaryPublicId: r.public_id, imageUrl: r.secure_url, width: r.width, height: r.height, sortOrder: 0 }] },
    tags: { create: tagIds.map((tagId) => ({ tagId })) },
  } });
  console.log('created', p.name);
}
// Use the owner's toran photo as the Hand Craft Design category image
const toran = await prisma.product.findUnique({ where: { code: 'KS-HC-001' }, include: { images: true } });
if (cat && toran?.images[0] && !cat.imageUrl?.includes('/products/')) {
  const r = await cloudinary.uploader.upload(P[0].img, { folder: 'kalakriti/categories' });
  if (cat.imagePublicId) await cloudinary.uploader.destroy(cat.imagePublicId).catch(() => {});
  await prisma.category.update({ where: { id: cat.id }, data: { imageUrl: r.secure_url, imagePublicId: r.public_id } });
  console.log('category image updated');
}
await prisma.$disconnect();
