// One-time import of the owner's existing rakhi catalogue (images → Cloudinary, products → Postgres)
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
try { process.loadEnvFile?.('.env'); } catch {}
const prisma = new PrismaClient();
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
const S = 'https://kalakritistudios.netlify.app/assets';
const A = 'https://customer-assets-cm19k8pv.emergentagent.net/job_handmade-shop-71/artifacts';
const P = [
  { name: 'Premium Evil Eye Rakhi', code: 'KS-RK-001', mrp: 399, offer: 299, featured: true, tags: ['Evil Eye', 'Premium'], short: 'Luxury designer evil eye rakhi \u2014 a handcrafted token of protection for your brother.', imgs: [`${S}/regular/morepremevil.jpeg`, `${A}/o9r0lfqe_evil-eye-1.jpeg`, `${A}/ik182tl2_evil-eye-2.jpeg`] },
  { name: 'Ganesha Rakhi', code: 'KS-RK-002', mrp: 349, offer: 249, featured: true, tags: ['Devotional', 'Ganesha'], short: 'Traditional blessings with Lord Ganesha, framed in hand-set golden beads and pearls.', imgs: [`${A}/8lb8rnez_ganesha-rakhi.png`] },
  { name: 'Floral Pearl Rakhi', code: 'KS-RK-003', mrp: 449, offer: 349, featured: true, tags: ['Floral', 'Pearl', 'Premium'], short: 'A blooming floral centrepiece with pearls and golden leaves on a braided red thread.', imgs: [`${A}/bonir5ss_floral-rakhi.png`] },
  { name: 'Lotus Rakhi', code: 'KS-RK-004', mrp: 299, offer: 199, tags: ['Floral', 'Traditional'], short: 'Elegant handcrafted lotus rakhi \u2014 a symbol of purity and grace.', imgs: [`${S}/regular/lotus.jpeg`] },
  { name: 'Pearl Rakhi', code: 'KS-RK-005', mrp: 299, offer: 219, tags: ['Pearl'], short: 'Elegant handcrafted rakhi adorned with lustrous pearls.', imgs: [`${S}/regular/pearl-rakhi.png`] },
  { name: 'Traditional Rakhi', code: 'KS-RK-006', mrp: 249, offer: 149, tags: ['Traditional'], short: 'A classic handcrafted festive rakhi, rich with traditional colours.', imgs: [`${S}/regular/traditional-rakhi.jpeg`] },
  { name: 'Customized Photo Rakhi', code: 'KS-RK-007', mrp: 499, offer: 399, featured: true, custom: true, tags: ['Photo Rakhi', 'Personalised'], short: 'Your favourite photo, handcrafted into a rakhi with pearls, kundan and golden beads.', imgs: [1,2,3,4,5,6,7,8].map((n) => `${S}/custom/custom-${n}.${n === 2 ? 'PNG' : 'jpeg'}`) },
];
const DESC = (n) => `${n} is handmade in our studio, one piece at a time, using quality threads, beads and embellishments.\n\nEvery rakhi is finished by hand, so small variations make each one unique. Gift-ready packing is included.\n\nWant a different colour, a name or a photo? Message us on WhatsApp \u2014 we love creating something personal.`;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const cat = await prisma.category.findUnique({ where: { slug: 'rakhi' } });
// remove earlier test product
const test = await prisma.product.findUnique({ where: { code: 'KS-RK-001' }, include: { images: true } });
if (test && test.name === 'Royal Zardozi Rakhi') {
  await cloudinary.api.delete_resources(test.images.map((i) => i.cloudinaryPublicId)).catch(() => {});
  await prisma.product.delete({ where: { id: test.id } });
  console.log('removed test product');
}
for (const p of P) {
  if (await prisma.product.findUnique({ where: { code: p.code } })) { console.log('skip', p.code); continue; }
  const images = [];
  for (const [i, url] of p.imgs.entries()) {
    try {
      const r = await cloudinary.uploader.upload(url, { folder: 'kalakriti/products' });
      images.push({ cloudinaryPublicId: r.public_id, imageUrl: r.secure_url, width: r.width, height: r.height, sortOrder: images.length });
    } catch (e) { console.warn('  image failed', url, e.message); }
  }
  const tagIds = [];
  for (const t of p.tags) tagIds.push((await prisma.tag.upsert({ where: { slug: slugify(t) }, update: {}, create: { name: t, slug: slugify(t) } })).id);
  await prisma.product.create({
    data: {
      name: p.name, slug: slugify(p.name), code: p.code, shortDescription: p.short, description: DESC(p.name),
      mrp: p.mrp, offerPrice: p.offer, isFeatured: !!p.featured, isCustomizable: p.custom ?? true, categoryId: cat?.id,
      images: { create: images }, tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });
  console.log('created', p.name, images.length, 'images');
}
// business settings from the existing site + hero with the owner's own product photo
const hero = await cloudinary.uploader.upload(`${A}/bonir5ss_floral-rakhi.png`, { folder: 'kalakriti/site' });
await prisma.settings.update({ where: { id: 'default' }, data: { whatsappNumber: '918637269422', heroImage: hero.secure_url, heroImagePublicId: hero.public_id } });
console.log('settings updated');
await prisma.$disconnect();
