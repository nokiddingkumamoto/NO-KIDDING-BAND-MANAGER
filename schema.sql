PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('studio', 'live', 'other')),
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL DEFAULT '',
  end_time TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS schedules_date_idx ON schedules(date, start_time);

CREATE TABLE IF NOT EXISTS studio_dates (
  date TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS studio_dates_month_idx ON studio_dates(month, date);

CREATE TABLE IF NOT EXISTS studio_answers (
  member TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('yes', 'maybe', 'no')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (member, date)
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tshirt', 'sticker', 'badge', 'cd', 'other')),
  details TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  sold_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sales_sold_at_idx ON sales(sold_at DESC);

CREATE TABLE IF NOT EXISTS app_migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO products (id, name, category, details, price, stock, image) VALUES
('logo-white', 'LOGO T-SHIRT (WHITE)', 'tshirt', 'WHITE / BLACK PRINT / XL', 1000, 0, 'merch-images/tshirt-logo-white-front.jpg'),
('logo-white-kxcxsxp', 'LOGO T-SHIRT (WHITE)', 'tshirt', 'WHITE / BLACK PRINT / XL', 1000, 0, 'merch-images/tshirt-logo-white-back.jpg'),
('logo-gray', 'LOGO T-SHIRT (GRAY)', 'tshirt', 'GRAY / BLACK PRINT / XL', 1000, 0, 'merch-images/tshirt-logo-gray.jpg'),
('logo-blue', 'LOGO T-SHIRT (BLUE)', 'tshirt', 'BLUE / WHITE PRINT / S', 500, 0, 'merch-images/tshirt-logo-blue.png'),
('logo-purple', 'LOGO T-SHIRT (PURPLE)', 'tshirt', 'PURPLE / GREEN PRINT / S', 500, 0, 'merch-images/tshirt-logo-purple.png'),
('zombie-black-green', 'SK8 ZOMBIE T-SHIRT (BLACK×GREEN)', 'tshirt', 'BLACK / GREEN PRINT / S', 500, 0, 'merch-images/tshirt-zombie-black-green.png'),
('zombie-purple-green', 'SK8 ZOMBIE T-SHIRT (PURPLE×GREEN)', 'tshirt', 'PURPLE / GREEN PRINT / S', 500, 0, 'merch-images/tshirt-zombie-purple-green.png'),
('zombie-black-yellow', 'SK8 ZOMBIE T-SHIRT (BLACK×YELLOW)', 'tshirt', 'BLACK / YELLOW PRINT / S', 500, 0, 'merch-images/tshirt-zombie-black-yellow.png'),
('zombie-purple-yellow', 'SK8 ZOMBIE T-SHIRT (PURPLE×YELLOW)', 'tshirt', 'PURPLE / YELLOW PRINT / S', 500, 0, 'merch-images/tshirt-zombie-purple-yellow.png'),
('zombie-green-yellow', 'SK8 ZOMBIE T-SHIRT (GREEN×YELLOW)', 'tshirt', 'GREEN / YELLOW PRINT / S', 500, 0, 'merch-images/tshirt-zombie-green-yellow.png'),
('sticker-logo', 'ステッカー（ロゴ）', 'sticker', '', 100, 0, 'merch-images/sticker-logo.jpg'),
('sticker-character', 'ステッカー（キャラクター）', 'sticker', '', 100, 0, 'merch-images/sticker-character.jpg'),
('sticker-oni', 'ステッカー（鬼）', 'sticker', '', 100, 0, 'merch-images/sticker-oni.png'),
('sticker-sign-large', '看板風 ステッカー大', 'sticker', '大サイズ', 700, 0, 'merch-images/sticker-sign-large.jpg'),
('sticker-sign-medium', '看板風 ステッカー中', 'sticker', '中サイズ', 500, 0, 'merch-images/sticker-sign-medium.jpg');

INSERT OR IGNORE INTO app_migrations (id) VALUES ('catalog-wix-goods-2026-07');
