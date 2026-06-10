# Cotch v2

Next.js + Supabase rewrite dari versi PHP.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Buat project Supabase
1. Buka https://supabase.com → New Project
2. Buka **SQL Editor** → paste isi `supabase-schema.sql` → Run
3. Buka **Project Settings > API** → copy URL dan keys

### 3. Setup environment
```bash
cp .env.local.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# isi MAIL_SMTP_* kalau ingin notifikasi email order aktif
```

### 4. Jalankan dev server
```bash
npm run dev
# buka http://localhost:3000
```

### 5. Email notification parity
- Notifikasi order admin sekarang mengikuti pola versi PHP lama via SMTP.
- Isi `MAIL_SMTP_HOST`, `MAIL_SMTP_PORT`, `MAIL_SMTP_USER`, `MAIL_SMTP_PASS`, `MAIL_FROM`, `MAIL_FROM_NAME`, `ADMIN_EMAIL`, dan `SITE_URL`.
- Kalau `MAIL_SMTP_*` masih kosong atau placeholder, order tetap berhasil dibuat tetapi email akan di-skip.

## Deploy ke Vercel
1. Push ke GitHub
2. Import repo di https://vercel.com
3. Tambah environment variables (sama dengan .env.local)
4. Deploy otomatis setiap push ke main

## Struktur
```
app/                  Next.js App Router
  booking/            Halaman reservasi meja
  waitlist/           Halaman waitlist
  order/              Halaman order online
  reviews/            Halaman ulasan
  menu/               Halaman menu
  gallery/            Halaman galeri
  about/              Halaman tentang kami
  lookup/             Cari booking/order/waitlist
  admin/              Panel admin (login required)
components/           Reusable React components
lib/supabase/         Supabase client (browser + server)
types/database.ts     TypeScript types untuk semua tabel
utils/                Helper functions
styles/style.css      CSS dari v1 (1:1 sama)
supabase-schema.sql   Schema PostgreSQL untuk Supabase
```
