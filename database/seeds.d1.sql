-- ============================================================================
-- DRIVE-EASE CAR RENTAL - CLOUDFLARE D1 SEED DATA
-- ============================================================================

-- 1. Branches
INSERT OR IGNORE INTO branches (id, code, name, address, city, contact_phone) VALUES
('b0000001-0000-0000-0000-000000000001', 'BKK-BKK', 'สาขาสนามบินสุวรรณภูมิ', '999 หมู่ 1 หนองปรือ บางพลี สมุทรปราการ', 'กรุงเทพฯ', '02-132-1888'),
('b0000001-0000-0000-0000-000000000002', 'DMK-BKK', 'สาขาสนามบินดอนเมือง', '222 ถนนวิภาวดีรังสิต สนามบิน ดอนเมือง', 'กรุงเทพฯ', '02-535-1111'),
('b0000001-0000-0000-0000-000000000003', 'SIAM-BKK', 'สาขาสยามพารากอน (ใจกลางเมือง)', '991 ถนนพระรามที่ 1 ปทุมวัน', 'กรุงเทพฯ', '02-610-8000'),
('b0000001-0000-0000-0000-000000000004', 'HKT-PHUKET', 'สาขาภูเก็ต (สนามบิน)', '222 หมู่ 6 ไม้ขาว ถลาง ภูเก็ต', 'ภูเก็ต', '076-351-166'),
('b0000001-0000-0000-0000-000000000005', 'CNX-CHIANGMAI', 'สาขาเชียงใหม่ (นิมมาน)', 'ถนนนิมมานเหมินท์ สุเทพ เมือง เชียงใหม่', 'เชียงใหม่', '053-270-222');

-- 2. Vehicles
INSERT OR IGNORE INTO vehicles (id, plate_number, brand, model, year_manufactured, category, transmission, seats, fuel_type, daily_rate, status, current_mileage, fuel_level, branch_id, image_url, features) VALUES
('v0000001-0000-0000-0000-000000000001', '1กข-8921 (กทม)', 'Toyota', 'Yaris Ativ Premium', 2024, 'sedan', 'auto', 5, 'gasoline', 990.0, 'available', 14200, 100, 'b0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', '["Apple CarPlay", "กล้องมองหลัง", "ประหยัดน้ำมัน 23.3 กม./ลิตร", "ระบบเตือนมุมอับสายตา"]'),
('v0000001-0000-0000-0000-000000000002', '3ขค-4512 (กทม)', 'Honda', 'City Hatchback e:HEV RS', 2024, 'sedan', 'auto', 5, 'gasoline', 1290.0, 'available', 9800, 100, 'b0000001-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80', '["Honda SENSING", "เบาะหนังอัลตราซีท", "เครื่องเสียง 8 ลำโพง", "Hybrid ประหยัดน้ำมัน"]'),
('v0000001-0000-0000-0000-000000000003', '4กง-1123 (เชียงใหม่)', 'BYD', 'Seal Premium (EV)', 2024, 'ev', 'auto', 5, 'ev', 1890.0, 'available', 6300, 95, 'b0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', '["วิ่งได้ 650 กม./ชาร์จ", "จอหมุน 15.6 นิ้ว", "หลังคาแก้วพาโนรามา", "ระบบช่วยขับขี่ระดับ L2+"]'),
('v0000001-0000-0000-0000-000000000004', '7กจ-7890 (ภูเก็ต)', 'Honda', 'CR-V e:HEV RS 4WD', 2024, 'suv', 'auto', 7, 'gasoline', 2490.0, 'available', 21500, 100, 'b0000001-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', '["ขับเคลื่อน 4 ล้อ (AWD)", "เบาะ 7 ที่นั่ง", "Hands-free Tailgate", "BOSE Sound System"]'),
('v0000001-0000-0000-0000-000000000005', '9กว-9999 (กทม)', 'BMW', '330e M Sport (LCI)', 2024, 'luxury', 'auto', 5, 'gasoline', 4500.0, 'available', 11200, 100, 'b0000001-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', '["ชุดแต่ง M Sport รอบคัน", "BMW Curved Display", "ช่วงล่าง Adaptive M", "Plug-in Hybrid 292 แรงม้า"]');
