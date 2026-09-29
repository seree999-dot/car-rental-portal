// ============================================================================
// DRIVE-EASE DOMAIN PRICING & PENALTY SERVICE (Pure Domain Logic)
// Implementing BR-01, BR-02, BR-03, BR-04, BR-05, BR-06
// ============================================================================

export const BUSINESS_RULES = {
  CUSTOMER: {
    MIN_AGE: 20, // BR-01: ผู้เช่าต้องมีอายุไม่ต่ำกว่า 20 ปีบริบูรณ์
  },
  BOOKING: {
    HOLD_DURATION_SECONDS: 900, // BR-02: ล็อคสิทธิ์ 15 นาที
    DEFAULT_SECURITY_DEPOSIT: 5000, // BR-03: มัดจำความเสียหาย
    SUPER_INSURANCE_DAILY_RATE: 350,
  },
  PENALTY: {
    GRACE_PERIOD_HOURS: 1.0, // BR-04: คืนช้าไม่เกิน 1 ชม. ฟรี
    MAX_HOURLY_PENALTY_HOURS: 4.0, // BR-04: คืนช้า 1-4 ชม. คิดราย ชม. เกิน 4 ชม. คิดเต็มวัน
    FUEL_COST_PER_PERCENT: 25.0, // BR-05: ค่าน้ำมันต่อเปอร์เซ็นต์
    FUEL_SERVICE_SURCHARGE: 200.0, // BR-05: ค่าบริการเติมน้ำมัน
  },
  CANCELLATION: {
    FULL_REFUND_HOURS_BEFORE: 48, // BR-06: ยกเลิกก่อน 48 ชม. คืน 100%
    HALF_REFUND_HOURS_BEFORE: 24, // BR-06: ยกเลิก 24-48 ชม. คืน 50%
  },
} as const;

export interface RentalPriceBreakdown {
  totalDays: number;
  dailyRate: number;
  rentalFee: number;
  insuranceFee: number;
  depositAmount: number;
  totalPayable: number;
}

/**
 * คำนวณราคาค่าเช่ารถ ประกันภัย และเงินมัดจำ
 */
export function calculateRentalPricing(
  dailyRate: number,
  startDate: string | Date,
  endDate: string | Date,
  withInsurance: boolean = true
): RentalPriceBreakdown {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const rentalFee = dailyRate * totalDays;
  const insuranceFee = withInsurance ? BUSINESS_RULES.BOOKING.SUPER_INSURANCE_DAILY_RATE * totalDays : 0;
  const depositAmount = BUSINESS_RULES.BOOKING.DEFAULT_SECURITY_DEPOSIT;
  const totalPayable = rentalFee + insuranceFee + depositAmount;

  return {
    totalDays,
    dailyRate,
    rentalFee,
    insuranceFee,
    depositAmount,
    totalPayable,
  };
}

/**
 * คำนวณค่าปรับกรณีคืนรถช้า (BR-04: Grace Period)
 * - ช้า <= 1 ชม. = ฟรี (0 บาท)
 * - ช้า 1 - 4 ชม. = คิดรายชั่วโมง (dailyRate / 8 ชม. ต่อชั่วโมง ปัดเศษขึ้น)
 * - ช้า > 4 ชม. = คิดค่าเช่าเต็มวัน 1 วัน
 */
export function calculateLatePenalty(lateHours: number, dailyRate: number): number {
  if (lateHours <= BUSINESS_RULES.PENALTY.GRACE_PERIOD_HOURS) {
    return 0;
  }
  if (lateHours <= BUSINESS_RULES.PENALTY.MAX_HOURLY_PENALTY_HOURS) {
    const hourlyRate = Math.round(dailyRate / 8);
    return Math.ceil(lateHours) * hourlyRate;
  }
  return dailyRate; // เกิน 4 ชม. ปรับ 1 วันเต็ม
}

/**
 * คำนวณค่าปรับค่าน้ำมันขาด (BR-05: Fuel Policy)
 * - น้ำมันครบ 100% = ฟรี (0 บาท)
 * - น้ำมันขาด = (% ที่ขาด x 25 บาท) + ค่าบริการเติม 200 บาท
 */
export function calculateFuelPenalty(returnedFuelLevel: number): {
  missingPercentage: number;
  penaltyFee: number;
} {
  const missingPercentage = Math.max(0, 100 - returnedFuelLevel);
  if (missingPercentage === 0) {
    return { missingPercentage: 0, penaltyFee: 0 };
  }
  const penaltyFee = missingPercentage * BUSINESS_RULES.PENALTY.FUEL_COST_PER_PERCENT + BUSINESS_RULES.PENALTY.FUEL_SERVICE_SURCHARGE;
  return { missingPercentage, penaltyFee };
}

/**
 * คำนวณยอดเงินมัดจำที่จะปลดล็อคคืนลูกค้า
 */
export function calculateDepositSettlement(
  initialDeposit: number,
  lateFee: number,
  fuelFee: number
): {
  totalPenalty: number;
  refundedAmount: number;
} {
  const totalPenalty = lateFee + fuelFee;
  const refundedAmount = Math.max(0, initialDeposit - totalPenalty);
  return { totalPenalty, refundedAmount };
}

/**
 * ตรวจสอบความถูกต้องของอายุผู้เช่า (BR-01 >= 20 ปี)
 */
export function isEligibleAge(age: number): boolean {
  return age >= BUSINESS_RULES.CUSTOMER.MIN_AGE;
}
