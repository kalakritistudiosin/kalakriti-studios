# Kalakriti Studios

Premium handmade art & gifting website — **Next.js 15 (App Router) · TypeScript · Tailwind + shadcn/ui · Framer Motion · Neon PostgreSQL + Prisma · Auth.js (Google) · Cloudinary · Netlify**.

Deploy **once**. After that, everything (products, prices, images, stock, featured, categories, tags, WhatsApp, Instagram, email, homepage hero) is managed from `/admin` and customers see changes on refresh — no code edits, no Git push, no redeploy.

## How "live without redeploy" works
- Public catalogue data is cached in the Next.js Data Cache under the `catalog` tag (Netlify persists it) for fast repeat visits.
- Every admin write calls `revalidateTag('catalog')` + `revalidatePath('/', 'layout')`, so customers see changes on the next refresh.
- Images are uploaded **directly from the admin's browser to Cloudinary** using a short-lived server signature (admin-only), then optimised by Cloudinary (`f_auto,q_auto,w_*`) through a global `next/image` loader.

## Security
- Google OAuth only (Auth.js v5, JWT session in an httpOnly, secure cookie).
- Role is decided **on the server**: only `ADMIN_EMAIL` becomes `ADMIN`; everyone else is `CUSTOMER`.
- `/admin` layout and every `/api/admin/*` route re-read the user's role from the database (401 if signed out, 403 for customers).
- Zod validation on all inputs; image URLs must belong to your Cloudinary account; upload type (JPG/PNG/WEBP/AVIF) and size (8 MB) validated; Cloudinary `allowed_formats` enforced in the signature.
- No secrets are exposed to the browser (no `NEXT_PUBLIC_` secrets).

## Local setup
```bash
cp .env.example .env        # fill in values
yarn install                # runs prisma generate
yarn db:migrate             # prisma migrate deploy
yarn db:seed                # admin role + settings + 3 categories (idempotent)
yarn dev
```

## Deploy to Netlify (one time)
1. Push this repo to GitHub and **Add new site → Import from Git** in Netlify.
2. Build settings are read from `netlify.toml` (`yarn netlify:build`, publish `.next`, Node 20). Netlify's Next.js runtime is used automatically.
3. In **Site configuration → Environment variables**, add every variable from `.env.example`:
   `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `AUTH_URL` (your public site URL), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (optionally `SITE_URL`).
   Set `DIRECT_URL` to your database provider's direct (non-pooled) connection string and include the **Builds** scope for each deploy context you use. `DATABASE_URL` needs both **Builds** and **Functions** scopes because it is used during the build and by the running application.
   Netlify supplies these variables from the site settings automatically. Do not add empty `DATABASE_URL` or `DIRECT_URL` entries to `netlify.toml`: file-based values override the site settings. Keep database credentials out of the repository. After changing the variables, retry the failed deploy.
   The Netlify build preserves an explicit `DIRECT_URL`. When it is missing in a deploy context, the build derives a direct connection from an existing Neon `DATABASE_URL` by removing the hostname's `-pooler` suffix and the `pgbouncer` parameter. The runtime connection stays unchanged. Other database providers still require an explicit `DIRECT_URL`.
4. In Google Cloud Console → your OAuth client → **Authorised redirect URIs**, add
   `https://YOUR-SITE.netlify.app/api/auth/callback/google` (and your custom domain if any).
5. Deploy. The build runs `prisma migrate deploy` + the idempotent seed, then `next build`.
6. Open `/login`, sign in with the `ADMIN_EMAIL` Google account → you land on `/admin`.

## Database migrations
Schema: `prisma/schema.prisma`. Migrations: `prisma/migrations/`. To change the schema later:
```bash
npx prisma migrate dev --name your_change   # creates a new migration (uses DIRECT_URL)
```
Netlify applies pending migrations automatically on the next build (`prisma migrate deploy`).

## Admin guide
- **Products** → add/edit/delete, quick toggles for stock, featured (Best Seller), published. Edit page: name, code, prices, description, category, tags, customizable, images (upload many, reorder with arrows, ★ set primary, delete).
- **Categories** → name, image, description, display order, publish. The first 3 published categories are the homepage cards.
- **Settings** → WhatsApp number (with country code, e.g. 918637269422), email, Instagram URL, homepage hero heading/description/button/image.

## Scripts
- `scripts/make-test-session.mjs` — DEV/TEST ONLY: mints a session cookie for automated tests (needs AUTH_SECRET locally). Not used in production.
- `scripts/import-rakhis.mjs` — one-time import of the original rakhi catalogue.
