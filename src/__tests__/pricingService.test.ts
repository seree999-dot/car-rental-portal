import { describe, it, expect } from 'vitest';
import {
  calculateRentalPricing,
  calculateLatePenalty,
  calculateFuelPenalty,
  calculateDepositSettlement,
  isEligibleAge,
} from '../domain/services/pricingService';

describe('🚗 DriveEase Business Rules & Pricing Unit Tests (Skill 07)', () => {

  // --------------------------------------------------------------------------
  // BR-01: ผู้เช่าต้องมีอายุไม่ต่ำกว่า 20 ปีบริบูรณ์
  // --------------------------------------------------------------------------
  describe('BR-01: Customer Age Eligibility', () => {
    it('ควรปฏิเสธผู้เช่าที่มีอายุต่ำกว่า 20 ปี (Boundary: 19 ปี)', () => {
      expect(isEligibleAge(19)).toBe(false);
    });

    it('ควรอนุญาตผู้เช่าที่มีอายุ 20 ปีบริบูรณ์ (Boundary: 20 ปี)', () => {
      expect(isEligibleAge(20)).toBe(true);
    });

    it('ควรอนุญาตผู้เช่าที่มีอายุมากกว่า 20 ปี (Happy path: 28 ปี)', () => {
      expect(isEligibleAge(28)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Rental Pricing & Security Deposit (BR-03)
  // --------------------------------------------------------------------------
  describe('Rental Pricing & Security Deposit (BR-03)', () => {
    it('ควรคำนวณค่าเช่า 3 วัน พร้อมประกัน Super Protection และมัดจำ ฿5,000 ถูกต้อง', () => {
      // รถ ฿1,000/วัน เช่า 3 วัน + ประกัน ฿350/วัน + มัดจำ ฿5,000
      const result = calculateRentalPricing(1000, '2026-10-01', '2026-10-04', true);

      expect(result.totalDays).toBe(3);
      expect(result.rentalFee).toBe(3000);
      expect(result.insuranceFee).toBe(1050); // 3 x 350
      expect(result.depositAmount).toBe(5000); // BR-03
      expect(result.totalPayable).toBe(9050); // 3000 + 1050 + 5000
    });

    it('ควรคำนวณค่าเช่าถูกต้องเมื่อไม่เลือกซื้อประกันเสริม', () => {
      const result = calculateRentalPricing(1500, '2026-10-01', '2026-10-03', false);

      expect(result.totalDays).toBe(2);
      expect(result.rentalFee).toBe(3000);
      expect(result.insuranceFee).toBe(0);
      expect(result.depositAmount).toBe(5000);
      expect(result.totalPayable).toBe(8000);
    });
  });

  // --------------------------------------------------------------------------
  // BR-04: กฎการคืนรถช้า (Grace Period)
  // --------------------------------------------------------------------------
  describe('BR-04: Late Return Penalty & Grace Period Boundaries', () => {
    const dailyRate = 1200; // อัตราต่อชั่วโมง = 1200 / 8 = 150 บาท

    it('ควรฟรีค่าปรับ หากคืนช้าไม่เกิน 1 ชั่วโมง (Boundary: 0.5 ชั่วโมง)', () => {
      expect(calculateLatePenalty(0.5, dailyRate)).toBe(0);
    });

    it('ควรฟรีค่าปรับ หากคืนช้าพอดี 1 ชั่วโมง (Boundary: 1.0 ชั่วโมง)', () => {
      expect(calculateLatePenalty(1.0, dailyRate)).toBe(0);
    });

    it('ควรคิดค่าปรับรายชั่วโมง หากคืนช้า 1.1 ชั่วโมง (ปัดเป็น 2 ชม. = ฿300)', () => {
      expect(calculateLatePenalty(1.1, dailyRate)).toBe(300);
    });

    it('ควรคิดค่าปรับรายชั่วโมง หากคืนช้า 4.0 ชั่วโมงพอดี (4 ชม. x ฿150 = ฿600)', () => {
      expect(calculateLatePenalty(4.0, dailyRate)).toBe(600);
    });

    it('ควรคิดค่าปรับเต็มวัน 1 วัน หากคืนช้าเกิน 4 ชั่วโมง (Boundary: 4.1 ชั่วโมง)', () => {
      expect(calculateLatePenalty(4.1, dailyRate)).toBe(dailyRate); // 1200
    });

    it('ควรคิดค่าปรับเต็มวัน 1 วัน หากคืนช้า 10 ชั่วโมง', () => {
      expect(calculateLatePenalty(10, dailyRate)).toBe(dailyRate); // 1200
    });
  });

  // --------------------------------------------------------------------------
  // BR-05: กฎค่าน้ำมัน (Fuel Policy)
  // --------------------------------------------------------------------------
  describe('BR-05: Fuel Shortage Penalty Policy', () => {
    it('ควรไม่มีค่าปรับ หากคืนน้ำมันเต็ม 100%', () => {
      const result = calculateFuelPenalty(100);
      expect(result.missingPercentage).toBe(0);
      expect(result.penaltyFee).toBe(0);
    });

    it('ควรคิดค่าน้ำมันส่วนที่ขาด + ค่าบริการ ฿200 หากน้ำมันเหลือ 80% (ขาด 20%)', () => {
      // (20% x ฿25) + ฿200 = 500 + 200 = 700
      const result = calculateFuelPenalty(80);
      expect(result.missingPercentage).toBe(20);
      expect(result.penaltyFee).toBe(700);
    });

    it('ควรคิดค่าน้ำมันเต็มถัง + ค่าบริการ ฿200 หากน้ำมันเกลี้ยง 0%', () => {
      // (100% x ฿25) + ฿200 = 2500 + 200 = 2700
      const result = calculateFuelPenalty(0);
      expect(result.missingPercentage).toBe(100);
      expect(result.penaltyFee).toBe(2700);
    });
  });

  // --------------------------------------------------------------------------
  // Settlement & Escrow Refund Calculation
  // --------------------------------------------------------------------------
  describe('Escrow Settlement & Refund', () => {
    it('ควรปลดล็อคมัดจำคืนเต็มจำนวน เมื่อไม่มีค่าปรับใดๆ', () => {
      const settlement = calculateDepositSettlement(5000, 0, 0);
      expect(settlement.totalPenalty).toBe(0);
      expect(settlement.refundedAmount).toBe(5000);
    });

    it('ควรหักค่าปรับจากมัดจำและคืนส่วนที่เหลืออย่างถูกต้อง', () => {
      // ค่าปรับคืนช้า ฿300 + ค่าน้ำมัน ฿700 = ฿1,000 -> คืน ฿4,000
      const settlement = calculateDepositSettlement(5000, 300, 700);
      expect(settlement.totalPenalty).toBe(1000);
      expect(settlement.refundedAmount).toBe(4000);
    });

    it('ไม่ควรคืนเงินติดลบ หากค่าปรับรวมเกินวงเงินมัดจำ', () => {
      const settlement = calculateDepositSettlement(5000, 4000, 3000); // ปรับ 7,000
      expect(settlement.totalPenalty).toBe(7000);
      expect(settlement.refundedAmount).toBe(0);
    });
  });
});
