import { z } from 'zod';

const cloudName = () => process.env.CLOUDINARY_CLOUD_NAME || '';

/** Only accept images hosted on OUR Cloudinary account (or seed stock images). */
export const imageUrl = z
  .string()
  .trim()
  .url()
  .max(600)
  .refine(
    (u) => u.startsWith(`https://res.cloudinary.com/${cloudName()}/`) || u.startsWith('https://images.unsplash.com/'),
    'Image must be uploaded through the dashboard'
  );

export const stockStatus = z.enum(['IN_STOCK', 'LIMITED_STOCK', 'OUT_OF_STOCK']);

const price = z.coerce.number({ invalid_type_error: 'Enter a valid price' }).int('Use whole rupees').min(0).max(10_000_000);

export const productImageInput = z.object({
  publicId: z.string().trim().min(1).max(300),
  url: imageUrl,
  width: z.number().int().positive().nullish(),
  height: z.number().int().positive().nullish(),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(120),
    slug: z.string().trim().max(140).optional().default(''),
    code: z
      .string()
      .trim()
      .min(2, 'Product code is required')
      .max(40)
      .regex(/^[A-Za-z0-9-_]+$/, 'Use letters, numbers, - or _ only'),
    shortDescription: z.string().trim().min(1, 'Short description is required').max(240),
    description: z.string().trim().max(8000).default(''),
    categoryId: z.string().trim().min(1).nullish(),
    tags: z.array(z.string().trim().min(1).max(40)).max(25).default([]),
    mrp: price,
    offerPrice: price,
    stockStatus: stockStatus.default('IN_STOCK'),
    isFeatured: z.boolean().default(false),
    isPublished: z.boolean().default(true),
    isCustomizable: z.boolean().default(false),
    images: z.array(productImageInput).max(15, 'Maximum 15 images').default([]),
  })
  .refine((d) => d.offerPrice <= d.mrp, { message: 'Offer price cannot be higher than MRP', path: ['offerPrice'] });

export const productPatchSchema = z
  .object({
    isFeatured: z.boolean(),
    isPublished: z.boolean(),
    stockStatus: stockStatus,
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'Nothing to update');

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().max(80).optional().default(''),
  description: z.string().trim().max(500).optional().default(''),
  imageUrl: imageUrl.nullish().or(z.literal('')),
  imagePublicId: z.string().trim().max(300).nullish(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(true),
});

export const tagSchema = z.object({
  name: z.string().trim().min(1).max(40),
});

export const settingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .max(25)
    .transform((v) => v.replace(/[^\d]/g, ''))
    .refine((v) => v === '' || (v.length >= 8 && v.length <= 15), 'Enter number with country code, e.g. 919876543210'),
  instagramUrl: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === '' || /^https:\/\/(www\.)?instagram\.com\//i.test(v), 'Use a full Instagram URL, e.g. https://instagram.com/yourhandle'),
  email: z.string().trim().max(120).refine((v) => v === '' || z.string().email().safeParse(v).success, 'Invalid email'),
  heroTitle: z.string().trim().min(2).max(120),
  heroSubtitle: z.string().trim().max(400).default(''),
  heroImage: imageUrl.or(z.literal('')),
  heroImagePublicId: z.string().trim().max(300).nullish(),
  heroCtaLabel: z.string().trim().min(1).max(40),
  heroCtaHref: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v.startsWith('/') || v.startsWith('https://'), 'Use a path like /shop or a full https:// link'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(120),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(1).max(100),
});

export const accountSchema = z.object({
  name: z.string().trim().min(2).max(60),
});

export const uploadSignSchema = z.object({
  kind: z.enum(['product', 'category', 'site']),
});
