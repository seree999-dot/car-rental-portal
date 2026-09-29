-- ============================================================================
-- DRIVE-EASE CAR RENTAL PLATFORM - CLOUDFLARE D1 (SQLITE) PRODUCTION SCHEMA
-- Generated via Skill 04-database-design
-- ============================================================================

-- 1. Branches (สาขา)
CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Vehicles (ยานพาหนะ)
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    plate_number TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year_manufactured INTEGER NOT NULL CHECK (year_manufactured >= 2015),
    category TEXT NOT NULL CHECK (category IN ('sedan', 'suv', 'ev', 'luxury')),
    transmission TEXT NOT NULL DEFAULT 'auto' CHECK (transmission IN ('auto', 'manual')),
    seats INTEGER NOT NULL CHECK (seats BETWEEN 2 AND 12),
    fuel_type TEXT NOT NULL,
    daily_rate REAL NOT NULL CHECK (daily_rate > 0),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'rented', 'maintenance', 'retired')),
    current_mileage INTEGER NOT NULL CHECK (current_mileage >= 0),
    fuel_level INTEGER NOT NULL DEFAULT 100 CHECK (fuel_level BETWEEN 0 AND 100),
    branch_id TEXT NOT NULL REFERENCES branches(id),
    image_url TEXT,
    features TEXT NOT NULL DEFAULT '[]',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Customers & KYC (ข้อมูลลูกค้าและตรวจสอบอายุ - BR-01)
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    national_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    driver_license_number TEXT NOT NULL UNIQUE,
    driver_license_expiry TEXT NOT NULL,
    kyc_verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Bookings (การจองและคำนวณราคา - BR-02, BR-03)
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_code TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
    pickup_branch_id TEXT NOT NULL REFERENCES branches(id),
    return_branch_id TEXT NOT NULL REFERENCES branches(id),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    total_days INTEGER NOT NULL CHECK (total_days >= 1),
    daily_rate REAL NOT NULL,
    rental_fee REAL NOT NULL CHECK (rental_fee >= 0),
    insurance_fee REAL NOT NULL DEFAULT 0.0 CHECK (insurance_fee >= 0),
    deposit_amount REAL NOT NULL DEFAULT 5000.0 CHECK (deposit_amount >= 0), -- BR-03
    total_amount REAL NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'active', 'under_inspection', 'completed', 'cancelled', 'expired')),
    hold_expires_at TEXT NOT NULL, -- BR-02: 15-min countdown
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Trigger: Overbooking Prevention at Database Level (Skill 04)
CREATE TRIGGER IF NOT EXISTS prevent_overbooking_on_insert
BEFORE INSERT ON bookings
FOR EACH ROW
WHEN NEW.status IN ('pending_payment', 'confirmed', 'active')
BEGIN
    SELECT RAISE(ABORT, 'OVERBOOKING_ERROR: Vehicle has overlapping booking period')
    WHERE EXISTS (
        SELECT 1 FROM bookings
        WHERE vehicle_id = NEW.vehicle_id
          AND status IN ('pending_payment', 'confirmed', 'active')
          AND (
            (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
            (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
            (NEW.start_time <= start_time AND NEW.end_time >= end_time)
          )
    );
END;

-- 6. Payment Transactions (ประวัติการเงินและกันวงเงินมัดจำ - BR-03)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL REFERENCES bookings(id),
    idempotency_key TEXT NOT NULL UNIQUE,
    gateway_transaction_id TEXT,
    payment_method TEXT NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('rental_fee', 'insurance_fee', 'deposit_preauth', 'penalty_fee', 'deposit_refund')),
    amount REAL NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'THB',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. Inspections & Handovers (ตรวจรับ-คืนรถดิจิทัล - FR-05, BR-04, BR-05)
CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL REFERENCES bookings(id),
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
    inspection_type TEXT NOT NULL CHECK (inspection_type IN ('check_in', 'check_out')),
    inspector_name TEXT NOT NULL,
    mileage_recorded INTEGER NOT NULL CHECK (mileage_recorded >= 0),
    fuel_level_recorded INTEGER NOT NULL CHECK (fuel_level_recorded BETWEEN 0 AND 100),
    photo_urls TEXT NOT NULL, -- JSON string
    damage_remarks TEXT,
    signature_url TEXT NOT NULL,
    late_hours REAL DEFAULT 0.0,
    late_fee REAL DEFAULT 0.0, -- BR-04
    fuel_shortage_fee REAL DEFAULT 0.0, -- BR-05
    total_penalty_deducted REAL DEFAULT 0.0,
    deposit_refunded REAL DEFAULT 0.0,
    inspected_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Audit Logs (NFR-06)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_vehicles_branch_status ON vehicles (branch_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_dates ON bookings (vehicle_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_hold_expiry ON bookings (hold_expires_at, status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings (customer_id);
