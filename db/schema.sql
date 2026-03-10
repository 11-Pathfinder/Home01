-- HomeScope London — SQLite Schema
-- All data scoped to Greater London

-- Postcode reference table
CREATE TABLE IF NOT EXISTS postcodes (
  postcode TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  lsoa_code TEXT,
  lsoa_name TEXT,
  ward_code TEXT,
  ward_name TEXT,
  district TEXT,          -- Borough name
  outcode TEXT            -- e.g. "SW1A" for grouping
);

-- R-Tree spatial index on postcodes
CREATE VIRTUAL TABLE IF NOT EXISTS postcodes_rtree USING rtree(
  id,
  min_lat, max_lat,
  min_lng, max_lng
);

-- Land Registry price paid (Greater London only)
CREATE TABLE IF NOT EXISTS price_paid (
  id TEXT PRIMARY KEY,
  price INTEGER NOT NULL,
  date_of_transfer TEXT NOT NULL,
  postcode TEXT NOT NULL,
  property_type TEXT,     -- D=Detached, S=Semi, T=Terraced, F=Flat, O=Other
  new_build TEXT,         -- Y/N
  tenure TEXT,            -- F=Freehold, L=Leasehold
  paon TEXT,              -- Primary addressable object name (house number)
  saon TEXT,              -- Secondary addressable object name (flat number)
  street TEXT,
  district TEXT
);

CREATE INDEX IF NOT EXISTS idx_pp_postcode ON price_paid(postcode);
CREATE INDEX IF NOT EXISTS idx_pp_date ON price_paid(date_of_transfer);
CREATE INDEX IF NOT EXISTS idx_pp_district ON price_paid(district);
CREATE INDEX IF NOT EXISTS idx_pp_outcode ON price_paid(
  substr(postcode, 1, instr(postcode, ' ') - 1)
);

-- EPC data (for floor area, enabling £/sqm)
CREATE TABLE IF NOT EXISTS epc (
  lmk_key TEXT PRIMARY KEY,
  address TEXT,
  postcode TEXT,
  total_floor_area REAL,  -- sqm
  current_energy_rating TEXT,
  property_type TEXT,
  built_form TEXT,
  construction_age_band TEXT
);

CREATE INDEX IF NOT EXISTS idx_epc_postcode ON epc(postcode);

-- Pre-computed £/sqm (joined Land Registry + EPC)
CREATE TABLE IF NOT EXISTS price_per_sqm (
  price_paid_id TEXT,
  epc_lmk_key TEXT,
  price INTEGER,
  floor_area REAL,
  price_per_sqm REAL,
  date_of_transfer TEXT,
  postcode TEXT,
  property_type TEXT,
  PRIMARY KEY (price_paid_id, epc_lmk_key)
);

CREATE INDEX IF NOT EXISTS idx_ppsqm_postcode ON price_per_sqm(postcode);

-- Schools (GIAS + Ofsted join)
CREATE TABLE IF NOT EXISTS schools (
  urn INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phase TEXT,             -- Primary / Secondary / All-through
  type TEXT,
  postcode TEXT,
  lat REAL,
  lng REAL,
  ofsted_rating TEXT,     -- Outstanding / Good / Requires improvement / Inadequate
  last_inspection_date TEXT,
  number_of_pupils INTEGER,
  gender TEXT,
  religious_character TEXT,
  website TEXT
);

-- R-Tree for schools spatial queries
CREATE VIRTUAL TABLE IF NOT EXISTS schools_rtree USING rtree(
  id,
  min_lat, max_lat,
  min_lng, max_lng
);

-- Demographics / IMD by LSOA
CREATE TABLE IF NOT EXISTS lsoa_demographics (
  lsoa_code TEXT PRIMARY KEY,
  lsoa_name TEXT,
  imd_rank INTEGER,
  imd_decile INTEGER,
  income_rank INTEGER,
  employment_rank INTEGER,
  education_rank INTEGER,
  health_rank INTEGER,
  crime_rank INTEGER,
  housing_rank INTEGER,
  environment_rank INTEGER,
  population INTEGER,
  median_age REAL
);

-- API response cache (for Police, TfL, flood risk)
CREATE TABLE IF NOT EXISTS api_cache (
  cache_key TEXT PRIMARY KEY,
  response TEXT,          -- JSON string
  created_at INTEGER,     -- Unix timestamp
  ttl_seconds INTEGER     -- Time to live
);
