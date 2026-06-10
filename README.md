# Thisiscotch v2

Next.js + Supabase migration of the legacy PHP-based Thisiscotch / Cotch website and admin panel.

This repo contains:
- Public website for homepage, menu, gallery, about, booking, waitlist, order, lookup, and reviews
- Admin panel for bookings, orders, menu, categories, gallery, reviews, schedule, and settings
- Supabase schema and seed helpers for the migrated data model
- SMTP-based order notification flow for admin email parity

## Stack

- Next.js 15
- React 19
- Supabase
- TypeScript
- Plain CSS matched to the legacy PHP visual system

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Prepare Supabase

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run [`supabase-schema.sql`](/Applications/XAMPP/xamppfiles/htdocs/Thisiscotch-v2/supabase-schema.sql).
4. Optionally run [`supabase-seed.sql`](/Applications/XAMPP/xamppfiles/htdocs/Thisiscotch-v2/supabase-seed.sql).
5. Copy the project URL, anon key, and service role key.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended variables:
- `ADMIN_EMAIL`
- `SITE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `MAIL_SMTP_HOST`
- `MAIL_SMTP_PORT`
- `MAIL_SMTP_USER`
- `MAIL_SMTP_PASS`
- `MAIL_FROM`
- `MAIL_FROM_NAME`

Important:
- Never commit `.env.local`.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only.
- SMTP values are optional for local development, but required if you want order emails to be sent.

### 4. Run development server

```bash
npm run dev
```

Default local app URL:
- `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Notes:
- `dev` and `build` both clear `.next` first to avoid stale Next.js artifacts.

## App Areas

### Public routes

- `/`
- `/menu`
- `/gallery`
- `/about`
- `/booking`
- `/waitlist`
- `/order`
- `/lookup`
- `/reviews`

### Admin routes

- `/admin/login`
- `/admin`
- `/admin/bookings`
- `/admin/orders`
- `/admin/menu`
- `/admin/categories`
- `/admin/gallery`
- `/admin/reviews`
- `/admin/schedule`
- `/admin/settings`
- `/admin/waitlist`

## Email Notifications

Admin order notifications are sent through SMTP from [`lib/mailer.ts`](/Applications/XAMPP/xamppfiles/htdocs/Thisiscotch-v2/lib/mailer.ts).

Behavior:
- If SMTP is configured correctly, new orders send an email to `ADMIN_EMAIL`.
- If SMTP is missing or placeholder-only, order creation still works, but email is skipped.

## Deployment

Typical deployment flow:

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Add the same environment variables used locally.
4. Redeploy after any environment change.

## Security Checklist

- `.env.local` is intentionally ignored
- `.next` is ignored
- `node_modules` is ignored
- `*.tsbuildinfo` is ignored
- Review public commits before pushing to confirm no live keys are embedded in source

## Repo Notes

- Legacy parity work is still ongoing in some content and UX details.
- Public branding currently uses `@cotchbandung` for Instagram, TikTok, and X/Twitter.
- Mobile and tablet-specific layout tuning has been added for the migrated UI.
