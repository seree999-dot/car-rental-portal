-- ============================================================================
-- DRIVE-EASE CAR RENTAL PLATFORM - DATABASE SCHEMA
-- Target Database: PostgreSQL 14+ (with btree_gist extension)
-- Designed using Skill 04-database-design
-- ============================================================================

-- Enable UUID and Range Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================================
-- 1. ENUMS & DOMAINS
-- ============================================================================
CREATE TYPE vehicle_category_enum AS ENUM ('sedan', 'suv', 'ev', 'luxury');
CREATE TYPE vehicle_transmission_enum AS ENUM ('auto', 'manual');
CREATE TYPE vehicle_status_enum AS ENUM ('available', 'reserved', 'rented', 'maintenance', 'retired');
CREATE TYPE booking_status_enum AS ENUM (
    'draft',
    'pending_payment',
    'confirmed',
    'active',
    'under_inspection',
    'completed',
    'cancelled',
    'expired'
);
CREATE TYPE payment_type_enum AS ENUM ('rental_fee', 'insurance_fee', 'deposit_preauth', 'penalty_fee', 'deposit_refund');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'captured', 'held', 'released', 'refunded', 'failed');
CREATE TYPE inspection_type_enum AS ENUM ('check_in', 'check_out');

-- ============================================================================
-- 2. BRANCHES (สาขา)
-- ============================================================================
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. VEHICLES (ยานพาหนะ)
-- ============================================================================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year_manufactured INT NOT NULL CHECK (year_manufactured >= 2015),
    category vehicle_category_enum NOT NULL,
    transmission vehicle_transmission_enum NOT NULL DEFAULT 'auto',
    seats SMALLINT NOT NULL CHECK (seats BETWEEN 2 AND 12),
    fuel_type VARCHAR(20) NOT NULL, -- gasoline, diesel, ev
    daily_rate NUMERIC(10, 2) NOT NULL CHECK (daily_rate > 0),
    status vehicle_status_enum NOT NULL DEFAULT 'available',
    current_mileage INT NOT NULL CHECK (current_mileage >= 0),
    fuel_level SMALLINT NOT NULL DEFAULT 100 CHECK (fuel_level BETWEEN 0 AND 100),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    image_url TEXT,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. CUSTOMERS & KYC (ข้อมูลลูกค้าและการยืนยันตัวตน - BR-01)
-- ============================================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id VARCHAR(20) NOT NULL UNIQUE, -- บัตรประชาชน หรือ Passport
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    date_of_birth DATE NOT NULL,
    driver_license_number VARCHAR(30) NOT NULL UNIQUE,
    driver_license_expiry DATE NOT NULL,
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    kyc_verified_at TIMESTAMPTZ,
    kyc_doc_urls JSONB DEFAULT '{}'::jsonb, -- Secure S3 paths
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- BR-01: ผู้เช่าต้องมีอายุไม่ต่ำกว่า 20 ปีบริบูรณ์
    CONSTRAINT check_customer_age CHECK (
        date_of_birth <= (CURRENT_DATE - INTERVAL '20 years')
    )
);

-- ============================================================================
-- 5. BOOKINGS (การจองรถ - ป้องกัน Overbooking ด้วย Exclusion Constraint)
-- ============================================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(30) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    pickup_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    return_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    booking_period TSRANGE GENERATED ALWAYS AS (tsrange(start_time, end_time)) STORED,
    total_days INT NOT NULL CHECK (total_days >= 1),
    daily_rate NUMERIC(10, 2) NOT NULL,
    rental_fee NUMERIC(10, 2) NOT NULL CHECK (rental_fee >= 0),
    insurance_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (insurance_fee >= 0),
    deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 5000.00 CHECK (deposit_amount >= 0), -- BR-03
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status booking_status_enum NOT NULL DEFAULT 'pending_payment',
    hold_expires_at TIMESTAMPTZ NOT NULL, -- BR-02: 15-minute hold timer
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_valid_booking_dates CHECK (end_time > start_time),
    
    -- DATABASE-LEVEL OVERBOOKING PREVENTION:
    -- ป้องกันไม่ให้มีช่วงเวลาจองทับซ้อนกันในรถคันเดียวกันสำหรับสถานะที่ Active
    CONSTRAINT prevent_overlapping_bookings EXCLUDE USING gist (
        vehicle_id WITH =,
        booking_period WITH &&
    ) WHERE (status IN ('pending_payment', 'confirmed', 'active'))
);

-- ============================================================================
-- 6. PAYMENT TRANSACTIONS (ธุรกรรมการเงินและกันวงเงินมัดจำ - BR-03)
-- ============================================================================
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    gateway_transaction_id VARCHAR(100),
    payment_method VARCHAR(30) NOT NULL, -- credit_card, promptpay
    payment_type payment_type_enum NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'THB',
    status payment_status_enum NOT NULL DEFAULT 'pending',
    gateway_raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. INSPECTIONS & HANDOVERS (ตรวจรับ-คืนรถดิจิทัล - FR-05, BR-04, BR-05)
-- ============================================================================
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    inspection_type inspection_type_enum NOT NULL,
    inspector_name VARCHAR(100) NOT NULL,
    mileage_recorded INT NOT NULL CHECK (mileage_recorded >= 0),
    fuel_level_recorded SMALLINT NOT NULL CHECK (fuel_level_recorded BETWEEN 0 AND 100),
    photo_urls JSONB NOT NULL, -- { "front": "s3://...", "back": "s3://...", "left": "...", "right": "..." }
    damage_remarks TEXT,
    signature_url TEXT NOT NULL,
    
    -- เฉพาะการคืนรถ (Check-out) คำนวณค่าปรับอัตโนมัติ:
    delay_hours NUMERIC(5, 2) DEFAULT 0.00,
    late_fee NUMERIC(10, 2) DEFAULT 0.00 CHECK (late_fee >= 0), -- BR-04
    fuel_shortage_fee NUMERIC(10, 2) DEFAULT 0.00 CHECK (fuel_shortage_fee >= 0), -- BR-05
    total_penalty_deducted NUMERIC(10, 2) DEFAULT 0.00 CHECK (total_penalty_deducted >= 0),
    deposit_refunded NUMERIC(10, 2) DEFAULT 0.00 CHECK (deposit_refunded >= 0),
    
    inspected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. AUDIT LOGS (ประวัติการเปลี่ยนแปลงระดับระบบ - NFR-06)
-- ============================================================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE_STATUS, PAYMENT, RELEASE_DEPOSIT
    performed_by VARCHAR(100) NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. OPTIMIZED INDEX STRATEGY (กลยุทธ์ Index ตาม Query Pattern)
-- ============================================================================

-- Pattern 1: ค้นหารถว่างตามสาขาและสถานะ
CREATE INDEX idx_vehicles_branch_status ON vehicles (branch_id, status) WHERE is_active = TRUE;

-- Pattern 2: ค้นหาการจองของลูกค้า
CREATE INDEX idx_bookings_customer_id ON bookings (customer_id, created_at DESC);

-- Pattern 3: ตรวจสอบการจองที่หมดอายุ (สำหรับ Background Cleaner ยกเลิกที่ค้างเกิน 15 นาที)
CREATE INDEX idx_bookings_pending_expiry ON bookings (hold_expires_at) WHERE status = 'pending_payment';

-- Pattern 4: ค้นหาการจองตามรหัส Booking Code (สำหรับเคาน์เตอร์สแกน QR)
CREATE INDEX idx_bookings_code ON bookings (booking_code);

-- Pattern 5: ค้นหาประวัติการเงิน
CREATE INDEX idx_payments_booking_id ON payment_transactions (booking_id);

-- Pattern 6: ตรวจสอบสภาพรถตาม Booking
CREATE INDEX idx_inspections_booking ON inspections (booking_id, inspection_type);
