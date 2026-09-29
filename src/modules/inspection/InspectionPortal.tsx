import React, { useState } from 'react';
import { Booking, Vehicle, InspectionRecord } from '../../types';
import { SignaturePad } from '../../components/SignaturePad';
import {
  ClipboardCheck,
  Camera,
  Car,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Fuel,
  Gauge,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface InspectionPortalProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  onCompleteCheckIn: (bookingId: string, record: InspectionRecord) => void;
  onCompleteCheckOut: (bookingId: string, record: InspectionRecord) => void;
}

export const InspectionPortal: React.FC<InspectionPortalProps> = ({
  bookings,
  vehicles,
  onCompleteCheckIn,
  onCompleteCheckOut,
}) => {
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    bookings[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'check_in' | 'check_out'>('check_in');

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const vehicle = vehicles.find((v) => v.id === selectedBooking?.vehicleId);

  // Handover (Check-in) form state
  const [checkInMileage, setCheckInMileage] = useState<number>(vehicle?.mileage || 14200);
  const [checkInFuel, setCheckInFuel] = useState<number>(100);
  const [checkInDamages, setCheckInDamages] = useState<string>('ไม่มีรอยแผลใหม่, กระจกหน้าและล้อสมบูรณ์');
  const [signatureCheckIn, setSignatureCheckIn] = useState<string>('');

  // Return (Check-out) form state
  const [returnMileage, setReturnMileage] = useState<number>((vehicle?.mileage || 14200) + 350);
  const [returnFuel, setReturnFuel] = useState<number>(85); // 15% missing for testing
  const [lateHours, setLateHours] = useState<number>(0);
  const [returnDamages, setReturnDamages] = useState<string>('ตรวจสอบรอบคันเรียบร้อย สภาพเดิม');
  const [signatureCheckOut, setSignatureCheckOut] = useState<string>('');

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm">
        <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-slate-800">ยังไม่มีรายการจองในระบบ</h3>
        <p className="text-xs text-slate-500 mt-1">
          กรุณาไปที่แท็บ "เลือกรถ & จอง" เพื่อสร้างรายการจองก่อนทำการตรวจรับ-ส่งมอบรถ
        </p>
      </div>
    );
  }

  // Penalty Calculation (BR-04, BR-05)
  // BR-04: Grace period 1 hr free, 1-4 hrs hourly rate (dailyRate / 8), >4 hrs 1 full day
  const dailyRate = selectedBooking?.dailyRate || 1000;
  let calculatedLateFee = 0;
  if (lateHours > 1 && lateHours <= 4) {
    calculatedLateFee = Math.ceil(lateHours) * Math.round(dailyRate / 8);
  } else if (lateHours > 4) {
    calculatedLateFee = dailyRate;
  }

  // BR-05: Fuel shortage policy (100% - returnFuel) * 25 THB + 200 THB service fee
  const fuelShortage = Math.max(0, 100 - returnFuel);
  const fuelShortageFee = fuelShortage > 0 ? fuelShortage * 25 + 200 : 0;
  const totalPenalty = calculatedLateFee + fuelShortageFee;
  const depositAmount = selectedBooking?.depositAmount || 5000;
  const depositRefunded = Math.max(0, depositAmount - totalPenalty);

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureCheckIn) {
      alert('กรุณาให้ลูกค้าลงลายมือชื่อดิจิทัลก่อนยืนยันส่งมอบรถ');
      return;
    }

    const record: InspectionRecord = {
      id: `insp-in-${Date.now()}`,
      bookingId: selectedBooking!.id,
      vehicleId: vehicle!.id,
      type: 'check_in',
      inspectorName: 'จนท. วิชัย สุขเกษม (Counter Staff)',
      mileage: checkInMileage,
      fuelLevel: checkInFuel,
      photos: {
        front: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
        back: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80',
        left: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=80',
        right: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
      },
      damages: [checkInDamages],
      signatureUrl: signatureCheckIn,
      inspectedAt: new Date().toISOString(),
    };

    onCompleteCheckIn(selectedBooking!.id, record);
    alert('ส่งมอบรถและตรวจรับดิจิทัลสำเร็จ! สถานะรถเปลี่ยนเป็น "อยู่ระหว่างเช่า"');
  };

  const handleSubmitCheckOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureCheckOut) {
      alert('กรุณาให้ลูกค้าลงลายมือชื่อดิจิทัลยืนยันการรับคืนรถ');
      return;
    }

    const record: InspectionRecord = {
      id: `insp-out-${Date.now()}`,
      bookingId: selectedBooking!.id,
      vehicleId: vehicle!.id,
      type: 'check_out',
      inspectorName: 'จนท. วิชัย สุขเกษม (Counter Staff)',
      mileage: returnMileage,
      fuelLevel: returnFuel,
      photos: {
        front: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
        back: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80',
        left: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=80',
        right: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
      },
      damages: [returnDamages],
      signatureUrl: signatureCheckOut,
      inspectedAt: new Date().toISOString(),
      lateHours,
      lateFee: calculatedLateFee,
      fuelShortageFee,
      totalPenalty,
      depositRefunded,
    };

    onCompleteCheckOut(selectedBooking!.id, record);
    alert(`รับคืนรถสำเร็จ! ปลดล็อคมัดจำคืนลูกค้า ฿${depositRefunded.toLocaleString()} (หักค่าปรับ ฿${totalPenalty.toLocaleString()})`);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">ตรวจรับ-ส่งมอบรถดิจิทัล</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Staff Tablet App
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ตรวจสภาพรถรอบคัน 4 ทิศทาง บันทึกเลขไมล์และระดับน้ำมัน พร้อม E-Signature ไร้กระดาษ
          </p>
        </div>

        {/* Booking Selector */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            เลือกรายการจองที่ต้องการจัดการ
          </label>
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bookingCode} - {b.customerName} ({b.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBooking && vehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Car & Booking Summary */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <img
                src={vehicle.imageUrl}
                alt={vehicle.model}
                className="w-full h-40 object-cover rounded-2xl"
              />
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {vehicle.plateNumber}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p className="text-xs text-slate-500">{vehicle.branch}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">รหัสจอง:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedBooking.bookingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ชื่อลูกค้า:</span>
                  <span className="font-medium text-slate-800">{selectedBooking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">เบอร์โทร:</span>
                  <span className="text-slate-800">{selectedBooking.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">สถานะปัจจุบัน:</span>
                  <span className="font-semibold text-blue-600 uppercase">{selectedBooking.status}</span>
                </div>
              </div>
            </div>

            {/* Workflow Mode Switcher */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 grid grid-cols-2 gap-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('check_in')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'check_in'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" /> 1. ส่งมอบรถ (Check-in)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('check_out')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'check_out'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> 2. รับคืนรถ (Check-out)
              </button>
            </div>
          </div>

          {/* Right Column: Handover / Inspection Form */}
          <div className="lg:col-span-2">
            {activeTab === 'check_in' ? (
              /* CHECK-IN FORM */
              <form
                onSubmit={handleSubmitCheckIn}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-base text-slate-900">
                    ขั้นตอนที่ 1: ตรวจรับและส่งมอบรถยนต์ (Check-in Handover)
                  </h2>
                </div>

                {/* 4-Direction Photos */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" /> ภาพถ่ายสภาพรถ 4 ทิศทาง (Inspection Evidence)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['ด้านหน้า (Front)', 'ด้านหลัง (Rear)', 'ฝั่งซ้าย (Left)', 'ฝั่งขวา (Right)'].map(
                      (angle, idx) => (
                        <div
                          key={idx}
                          className="relative h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group flex flex-col justify-end p-2"
                        >
                          <img
                            src={`https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80`}
                            alt={angle}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="relative z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded text-center">
                            {angle}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Mileage & Fuel Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-blue-600" /> เลขไมล์ปัจจุบัน (กิโลเมตร)
                    </label>
                    <input
                      type="number"
                      required
                      value={checkInMileage}
                      onChange={(e) => setCheckInMileage(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-blue-600" /> ระดับน้ำมัน / แบตเตอรี่
                      </span>
                      <span className="font-bold text-blue-600">{checkInFuel}% (เต็มถัง)</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={checkInFuel}
                      onChange={(e) => setCheckInFuel(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Damages Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    บันทึกรอยขีดข่วนหรือสภาพเดิมของตัวรถ
                  </label>
                  <input
                    type="text"
                    value={checkInDamages}
                    onChange={(e) => setCheckInDamages(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* E-Signature Pad */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ลายมือชื่อผู้เช่า (Customer Signature - E-Sign) *
                  </label>
                  <SignaturePad
                    onSave={(url) => setSignatureCheckIn(url)}
                    savedSignature={signatureCheckIn}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> ยืนยันการส่งมอบรถ (เปลี่ยนสถานะเป็น Rented)
                </button>
              </form>
            ) : (
              /* CHECK-OUT FORM */
              <form
                onSubmit={handleSubmitCheckOut}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <RotateCcw className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-base text-slate-900">
                    ขั้นตอนที่ 2: การตรวจรับคืนรถและการประเมินค่าปรับ (Check-out Return)
                  </h2>
                </div>

                {/* Return Mileage & Fuel Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-indigo-600" /> เลขไมล์ตอนนำรถมาคืน
                    </label>
                    <input
                      type="number"
                      required
                      value={returnMileage}
                      onChange={(e) => setReturnMileage(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      ระยะทางที่ใช้งาน: {returnMileage - checkInMileage} กม.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-indigo-600" /> ระดับน้ำมันที่คืน
                      </span>
                      <span className={`font-bold ${returnFuel < 100 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {returnFuel}% {returnFuel < 100 && `(ขาด ${100 - returnFuel}%)`}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={returnFuel}
                      onChange={(e) => setReturnFuel(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Late Hours Input (BR-04) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    จำนวนชั่วโมงที่คืนช้ากว่ากำหนด (Grace Period 1 ชม. ฟรี - BR-04)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={72}
                      value={lateHours}
                      onChange={(e) => setLateHours(Number(e.target.value))}
                      className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">
                      {lateHours <= 1
                        ? '✅ ไม่คิดค่าปรับ (อยู่ใน Grace Period 1 ชม.)'
                        : lateHours <= 4
                        ? `⚠️ คิดค่าปรับรายชั่วโมง (฿${calculatedLateFee.toLocaleString()})`
                        : `🚨 เกิน 4 ชม. คิดค่าเช่าเต็มวัน 1 วัน (฿${calculatedLateFee.toLocaleString()})`}
                    </span>
                  </div>
                </div>

                {/* Penalty & Deposit Refund Calculation Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" /> สรุปการหักเงินมัดจำและการคืนเงิน
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>วงเงินมัดจำตั้งต้น (Security Deposit)</span>
                    <span className="font-semibold">฿{depositAmount.toLocaleString()}</span>
                  </div>
                  {calculatedLateFee > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>ค่าปรับคืนรถช้า ({lateHours} ชม. - BR-04)</span>
                      <span>- ฿{calculatedLateFee.toLocaleString()}</span>
                    </div>
                  )}
                  {fuelShortageFee > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>ค่าน้ำมันที่ขาด + ค่าบริการเติม ฿200 (BR-05)</span>
                      <span>- ฿{fuelShortageFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                    <span>ยอดเงินมัดจำที่ปลดล็อคคืนลูกค้า (Release Escrow)</span>
                    <span className="text-emerald-600 font-black text-base">
                      ฿{depositRefunded.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Return Signature Pad */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ลายมือชื่อลูกค้ายืนยันการคืนรถ (Return Signature) *
                  </label>
                  <SignaturePad
                    onSave={(url) => setSignatureCheckOut(url)}
                    savedSignature={signatureCheckOut}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> ปิดงานการเช่า & ปลดล็อคมัดจำ (Release ฿{depositRefunded.toLocaleString()})
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
