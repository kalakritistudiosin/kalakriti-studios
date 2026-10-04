import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const FOLDERS = {
  product: 'kalakriti/products',
  category: 'kalakriti/categories',
  site: 'kalakriti/site',
} as const;

export const ALLOWED_FORMATS = 'jpg,jpeg,png,webp,avif';

/** Signed params for a direct browser → Cloudinary upload (keeps large files off our serverless functions). */
export function signUpload(kind: keyof typeof FOLDERS) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: FOLDERS[kind], allowed_formats: ALLOWED_FORMATS };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET as string);
  return {
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  };
}

/** Best-effort removal of images from Cloudinary (never throws). */
export async function destroyImages(publicIds: (string | null | undefined)[]) {
  const ids = publicIds.filter((x): x is string => !!x && x.startsWith('kalakriti/'));
  if (!ids.length) return;
  try {
    await cloudinary.api.delete_resources(ids);
  } catch (e) {
    console.error('Cloudinary delete failed', (e as Error)?.message);
  }
}

export { cloudinary };
