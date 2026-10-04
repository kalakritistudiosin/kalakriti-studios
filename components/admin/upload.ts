'use client';

export type UploadedImage = { publicId: string; url: string; width?: number | null; height?: number | null };
export type UploadKind = 'product' | 'category' | 'site';

export const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
export const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function validateFile(f: File): string | null {
  if (!ACCEPT.includes(f.type)) return `${f.name}: only JPG, PNG, WEBP or AVIF images are allowed`;
  if (f.size > MAX_BYTES) return `${f.name}: file is larger than 8 MB`;
  return null;
}

type Signature = { timestamp: number; folder: string; allowed_formats: string; signature: string; apiKey: string; cloudName: string };

export async function getSignature(kind: UploadKind): Promise<Signature> {
  const r = await fetch('/api/admin/upload-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Could not authorise upload');
  return j;
}

/** Signed direct upload browser → Cloudinary with progress. */
export function uploadFile(file: File, sig: Signature, onProgress?: (pct: number) => void): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', String(sig.timestamp));
    fd.append('signature', sig.signature);
    fd.append('folder', sig.folder);
    fd.append('allowed_formats', sig.allowed_formats);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const j = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve({ publicId: j.public_id, url: j.secure_url, width: j.width, height: j.height });
        else reject(new Error(j?.error?.message || 'Upload failed'));
      } catch {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(fd);
  });
}

export async function api<T = any>(url: string, method: string, body?: unknown): Promise<T> {
  const r = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Request failed (${r.status})`);
  return j as T;
}
