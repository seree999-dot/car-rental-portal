import React from 'react';
import { Booking, Vehicle } from '../../types';
import { CheckCircle, QrCode, Calendar, MapPin, ShieldCheck, ArrowRight, Printer } from 'lucide-react';

interface BookingConfirmationProps {
  booking: Booking;
  vehicle: Vehicle;
  onGoToHandover: () => void;
  onBackToCatalog: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  vehicle,
  onGoToHandover,
  onBackToCatalog,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Success Banner */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">การจองรถยนต์สำเร็จ!</h1>
        <p className="text-sm text-slate-500 mt-1">
          ระบบได้ส่งใบเสร็จและเวาเชอร์ยืนยันไปยัง <span className="font-semibold text-slate-700">{booking.customerEmail}</span> แล้ว
        </p>
      </div>

      {/* Digital Voucher Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-200 font-semibold">ใบยืนยันการจองดิจิทัล</span>
            <div className="text-2xl font-black font-mono mt-1 tracking-wider">{booking.bookingCode}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-medium border border-white/20">
            สถานะ: ยืนยันแล้ว (Confirmed)
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
          {/* Car & Dates */}
          <div className="flex flex-col sm:flex-row gap-5 items-center pb-6 border-b border-slate-100">
            <img
              src={vehicle.imageUrl}
              alt={vehicle.model}
              className="w-full sm:w-44 h-28 object-cover rounded-2xl shadow-sm"
            />
            <div className="flex-1 w-full space-y-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                {vehicle.plateNumber}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </h3>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{vehicle.branch}</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {booking.startDate} ถึง {booking.endDate} ({booking.totalDays} วัน)
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">ผู้เช่าหลัก</span>
              <span className="font-semibold text-slate-800">{booking.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">เบอร์ติดต่อ</span>
              <span className="font-semibold text-slate-800">{booking.customerPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block">เลขที่ใบขับขี่</span>
              <span className="font-semibold text-slate-800">{booking.driverLicenseNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block">ค่าเช่ารวม</span>
              <span className="font-semibold text-slate-800">฿{booking.rentalFee.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block">กันวงเงินมัดจำ (Hold)</span>
              <span className="font-semibold text-blue-600">฿{booking.depositAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block">ยอดชำระสุทธิ</span>
              <span className="font-black text-slate-900 text-sm">฿{booking.totalPaid.toLocaleString()}</span>
            </div>
          </div>

          {/* QR Code Presentation */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">QR Code สำหรับรับรถหน้าร้าน</span>
                <span className="text-[11px] text-slate-500">
                  แสดง QR Code นี้แก่พนักงานเพื่อเริ่มกระบวนการตรวจสภาพรถ (Check-in)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4" /> สิทธิ์ถูกล็อคสมบูรณ์
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onGoToHandover}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
          >
            <span>จำลองเป็นพนักงาน: ตรวจรับรถคันนี้ (Staff Handover)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onBackToCatalog}
            className="py-3 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition"
          >
            จองรถคันอื่นเพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};
