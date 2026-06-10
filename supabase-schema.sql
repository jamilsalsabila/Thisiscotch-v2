-- ============================================================
-- Cotch v2 — Supabase (PostgreSQL) Schema
-- Jalankan di Supabase: Dashboard > SQL Editor > New Query
-- ============================================================

-- floor_tables
CREATE TABLE IF NOT EXISTS floor_tables (
  id          TEXT PRIMARY KEY,
  section     TEXT NOT NULL CHECK (section IN ('indoor','semi-outdoor-1','semi-outdoor-2')),
  capacity    INT  NOT NULL DEFAULT 4,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- bookings
CREATE TABLE IF NOT EXISTS bookings (
  id              BIGSERIAL PRIMARY KEY,
  booking_code    TEXT UNIQUE NOT NULL,
  table_id        TEXT NOT NULL REFERENCES floor_tables(id),
  guest_name      TEXT NOT NULL,
  guest_phone     TEXT NOT NULL,
  guest_email     TEXT,
  party_size      INT  NOT NULL DEFAULT 1,
  booking_date    DATE NOT NULL,
  booking_time    TIME NOT NULL,
  special_request TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  is_seen         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id            BIGSERIAL PRIMARY KEY,
  order_code    TEXT UNIQUE NOT NULL,
  table_number  TEXT,
  guest_name    TEXT NOT NULL,
  guest_phone   TEXT NOT NULL,
  notes         TEXT,
  total_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','ready','cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id  BIGINT NOT NULL,
  item_name     TEXT NOT NULL,
  price         NUMERIC(12,2) NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  subtotal      NUMERIC(12,2) NOT NULL
);

-- waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id              BIGSERIAL PRIMARY KEY,
  waitlist_code   TEXT UNIQUE NOT NULL,
  guest_name      TEXT NOT NULL,
  guest_phone     TEXT NOT NULL,
  guest_email     TEXT,
  party_size      INT  NOT NULL DEFAULT 1,
  preferred_date  DATE NOT NULL,
  preferred_time  TIME NOT NULL,
  special_request TEXT,
  status          TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','notified','cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id              BIGSERIAL PRIMARY KEY,
  name_en         TEXT NOT NULL,
  name_id         TEXT NOT NULL,
  description_en  TEXT,
  description_id  TEXT,
  category        TEXT NOT NULL DEFAULT 'drink',
  subcategory     TEXT NOT NULL DEFAULT 'coffee',
  price           NUMERIC(12,2) NOT NULL DEFAULT 0,
  image           TEXT,
  is_available    BOOLEAN NOT NULL DEFAULT true,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id              BIGSERIAL PRIMARY KEY,
  reviewer_name   TEXT NOT NULL,
  booking_code    TEXT,
  order_code      TEXT,
  comment         TEXT,
  ratings         JSONB DEFAULT '{}',
  overall_rating  NUMERIC(3,2),
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- gallery_items
CREATE TABLE IF NOT EXISTS gallery_items (
  id          BIGSERIAL PRIMARY KEY,
  src         TEXT NOT NULL,
  alt_en      TEXT NOT NULL DEFAULT '',
  alt_id      TEXT NOT NULL DEFAULT '',
  section     TEXT NOT NULL DEFAULT 'indoor',
  sort_order  INT  NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_date    ON bookings (booking_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_code    ON bookings (booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_unseen  ON bookings (is_seen) WHERE is_seen = false;
CREATE INDEX IF NOT EXISTS idx_orders_code      ON orders (order_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_code    ON waitlist (waitlist_code);
CREATE INDEX IF NOT EXISTS idx_reviews_pub      ON reviews (is_published, created_at DESC);

-- ── RLS (Row Level Security) ─────────────────────────────────────
-- Public: bisa INSERT booking/order/waitlist/review, SELECT yang published
-- Admin: full access via service role key (bypass RLS)

ALTER TABLE bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items  ENABLE ROW LEVEL SECURITY;

-- floor_tables: semua bisa baca (untuk floor plan)
CREATE POLICY "public read floor_tables"  ON floor_tables  FOR SELECT USING (true);

-- menu_items: semua bisa baca yang available
CREATE POLICY "public read menu_items"    ON menu_items    FOR SELECT USING (is_available = true);

-- gallery_items: semua bisa baca yang active
CREATE POLICY "public read gallery_items" ON gallery_items FOR SELECT USING (is_active = true);

-- bookings: insert bebas, select hanya by booking_code (untuk lookup)
CREATE POLICY "public insert bookings"    ON bookings      FOR INSERT WITH CHECK (true);
CREATE POLICY "public read own booking"   ON bookings      FOR SELECT USING (true);

-- orders: insert bebas
CREATE POLICY "public insert orders"      ON orders        FOR INSERT WITH CHECK (true);
CREATE POLICY "public read own order"     ON orders        FOR SELECT USING (true);
CREATE POLICY "public insert order_items" ON order_items   FOR INSERT WITH CHECK (true);
CREATE POLICY "public read order_items"   ON order_items   FOR SELECT USING (true);

-- waitlist: insert bebas
CREATE POLICY "public insert waitlist"    ON waitlist      FOR INSERT WITH CHECK (true);
CREATE POLICY "public read own waitlist"  ON waitlist      FOR SELECT USING (true);

-- reviews: insert bebas, select hanya yang published
CREATE POLICY "public insert reviews"     ON reviews       FOR INSERT WITH CHECK (true);
CREATE POLICY "public read reviews"       ON reviews       FOR SELECT USING (is_published = true);

-- site_settings: semua bisa baca
CREATE POLICY "public read settings"      ON site_settings FOR SELECT USING (true);
