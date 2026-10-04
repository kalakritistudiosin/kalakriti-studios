// Global next/image loader: lets Cloudinary do resizing + format/quality optimisation.
// Works on any host (Netlify, Node, etc.) because Cloudinary does the work, not the server.
export default function imageLoader({ src, width, quality }) {
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    const q = quality ? `q_${quality}` : 'q_auto';
    return src.replace('/upload/', `/upload/f_auto,${q},c_limit,w_${width}/`);
  }
  if (src.includes('images.unsplash.com')) {
    try {
      const u = new URL(src);
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', String(quality || 75));
      u.searchParams.set('auto', 'format');
      return u.toString();
    } catch {
      return src;
    }
  }
  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`;
}
