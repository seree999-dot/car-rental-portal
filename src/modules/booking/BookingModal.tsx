import React, { useState, useEffect } from 'react';
import { Vehicle, Booking } from '../../types';
import { X, Clock, ShieldCheck, CreditCard, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BookingModalProps {
  vehicle: Vehicle;
  searchParams: { branch: string; startDate: string; endDate: string };
  onClose: () => void;
  onBookingConfirmed: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  vehicle,
  searchParams,
  onClose,
  onBookingConfirmed,
}) => {
  // 15-minute countdown (900 seconds) - BR-02
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900);
  const [isExpired, setIsExpired] = useState(false);

  // Customer form inputs
  const [customerName, setCustomerName] = useState('สมชาย ใจดี');
  const [customerEmail, setCustomerEmail] = useState('somchai@example.com');
  const [customerPhone, setCustomerPhone] = useState('089-123-4567');
  const [customerAge, setCustomerAge] = useState<number>(28);
  const [idCardNumber, setIdCardNumber] = useState('1-1002-00345-67-8');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('DL-88992314');
  const [driverLicenseExpiry, setDriverLicenseExpiry] = useState('2028-12-31');
  const [withInsurance, setWithInsurance] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'promptpay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate rental days
  const start = new Date(searchParams.startDate);
  const end = new Date(searchParams.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Pricing (BR-03: Security deposit 5,000 THB)
  const rentalFee = vehicle.dailyRate * diffDays;
  const insuranceFee = withInsurance ? 350 * diffDays : 0;
  const depositAmount = 5000;
  const totalAmount = rentalFee + insuranceFee + depositAmount;

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // BR-01: Age >= 20
    if (customerAge < 20) {
      setErrorMsg('ขออภัย ผู้เช่าต้องมีอายุ 20 ปีบริบูรณ์ขึ้นไปตามเงื่อนไขทางกฎหมาย (BR-01)');
      return;
    }

    if (!customerName || !customerPhone || !idCardNumber || !driverLicenseNumber) {
      setErrorMsg('กรุณากรอกข้อมูลผู้เช่าและใบขับขี่ให้ครบถ้วน');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const bookingCode = `DE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        bookingCode,
        vehicleId: vehicle.id,
        customerName,
        customerEmail,
        customerPhone,
        idCardNumber,
        driverLicenseNumber,
        driverLicenseExpiry,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        totalDays: diffDays,
        dailyRate: vehicle.dailyRate,
        rentalFee,
        insuranceFee,
        depositAmount,
        totalPaid: totalAmount,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        confirmedAt: new Date().toISOString(),
      };

      onBookingConfirmed(newBooking);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ยืนยันการจองและชำระเงิน</h2>
              <p className="text-xs text-slate-300">
                {vehicle.brand} {vehicle.model} ({vehicle.plateNumber})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 15-Minute Countdown Banner (BR-02) */}
        <div
          className={`py-2.5 px-4 flex items-center justify-between text-xs font-semibold ${
            isExpired
              ? 'bg-rose-500 text-white'
              : secondsRemaining < 180
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-blue-50 text-blue-700 border-b border-blue-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>
              {isExpired
                ? 'หมดเวลาการล็อคสิทธิ์จองแล้ว ระบบได้ปล่อยรถคืนสู่ Catalog'
                : 'ระบบกำลังล็อคสิทธิ์รถคันนี้ไว้ให้คุณชั่วคราว (BR-02)'}
            </span>
          </div>
          <div className="font-mono text-sm tracking-wider">
            {formatTimer(secondsRemaining)}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Booking Summary Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">สาขา</span>
              <span className="font-semibold text-slate-800">{searchParams.branch}</span>
            </div>
            <div>
              <span className="text-slate-400 block">วันที่รับ</span>
              <span className="font-semibold text-slate-800">{searchParams.startDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block">วันที่คืน</span>
              <span className="font-semibold text-slate-800">{searchParams.endDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block">ระยะเวลาเช่า</span>
              <span className="font-semibold text-blue-600">{diffDays} วัน</span>
            </div>
          </div>

          {/* Customer KYC Form (BR-01) */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> ข้อมูลผู้เช่าและใบขับขี่ (KYC Verification)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">อีเมลสำหรับรับหลักฐาน *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  อายุผู้เช่า (ต้อง ≥ 20 ปี) *
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={90}
                  value={customerAge}
                  onChange={(e) => setCustomerAge(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">เลขบัตรประชาชน / Passport *</label>
                <input
                  type="text"
                  required
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">เลขที่ใบอนุญาตขับขี่ *</label>
                <input
                  type="text"
                  required
                  value={driverLicenseNumber}
                  onChange={(e) => setDriverLicenseNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Insurance Option */}
          <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 flex items-start gap-3">
            <input
              type="checkbox"
              id="insurance"
              checked={withInsurance}
              onChange={(e) => setWithInsurance(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="insurance" className="text-xs cursor-pointer flex-1">
              <span className="font-bold text-slate-900 block">
                ประกันภัยคุ้มครองพิเศษ Super Protection (฿350/วัน)
              </span>
              <span className="text-slate-500">
                ฟรีค่าเสียหายส่วนแรก (Zero Deductible) กรณีเกิดอุบัติเหตุ ยางแบน หรือกระจกแตก
              </span>
            </label>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>ค่าเช่ารถ ({diffDays} วัน x ฿{vehicle.dailyRate.toLocaleString()})</span>
              <span>฿{rentalFee.toLocaleString()}</span>
            </div>
            {withInsurance && (
              <div className="flex justify-between text-slate-600">
                <span>ค่าประกันภัย Super Protection ({diffDays} วัน)</span>
                <span>฿{insuranceFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-blue-700 font-semibold pt-1 border-t border-slate-200">
              <span>วงเงินมัดจำความเสียหาย (Pre-auth Hold - BR-03)</span>
              <span>฿{depositAmount.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * วงเงินมัดจำ ฿5,000 จะถูกกันวงเงินไว้ในบัตร และปลดล็อคคืนภายใน 24 ชม. หลังจากส่งคืนรถเรียบร้อย
            </p>
            <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-200">
              <span>ยอดชำระและกันวงเงินรวมสุทธิ</span>
              <span className="text-blue-600 font-black">฿{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">เลือกช่องทางการชำระเงิน</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" /> บัตรเครดิต / เดบิต
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('promptpay')}
                className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                  paymentMethod === 'promptpay'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-4 h-4" /> Thai QR PromptPay
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isExpired || isProcessing}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${
                isExpired
                  ? 'bg-slate-300 cursor-not-allowed'
                  : isProcessing
                  ? 'bg-blue-400 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-500/25'
              }`}
            >
              {isProcessing ? (
                <>กำลังประมวลผลการจองและตัดวงเงิน...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> ยืนยันการจองและชำระเงิน (฿{totalAmount.toLocaleString()})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
