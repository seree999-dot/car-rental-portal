import React, { useState } from 'react';
import { Vehicle, Booking, VehicleStatus } from '../../types';
import {
  Car,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
  Filter,
  Shield,
  RefreshCw,
} from 'lucide-react';

interface FleetDashboardProps {
  vehicles: Vehicle[];
  bookings: Booking[];
  onUpdateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  vehicles,
  bookings,
  onUpdateVehicleStatus,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === 'available').length;
  const rentedVehicles = vehicles.filter((v) => v.status === 'rented').length;
  const reservedVehicles = vehicles.filter((v) => v.status === 'reserved').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.rentalFee || 0), 0);

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedStatusFilter === 'all') return true;
    return v.status === selectedStatusFilter;
  });

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">รถทั้งหมด</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalVehicles} คัน</div>
          <span className="text-[11px] text-slate-400 mt-1 block">ประจำการ 5 สาขา</span>
        </div>

        {/* Available */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-medium">ว่างพร้อมเช่า</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{availableVehicles} คัน</div>
          <span className="text-[11px] text-slate-400 mt-1 block">อัตราพร้อมใช้ {Math.round((availableVehicles / totalVehicles) * 100)}%</span>
        </div>

        {/* Rented */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-600 font-medium">อยู่ระหว่างเช่า</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600">{rentedVehicles} คัน</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active on Road</span>
        </div>

        {/* Maintenance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-600 font-medium">ซ่อมบำรุง</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">{maintenanceVehicles} คัน</div>
          <span className="text-[11px] text-slate-400 mt-1 block">ตรวจเช็คระยะ</span>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-600 font-medium">รายได้ค่าเช่ารวม</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-600">฿{totalRevenue.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">จาก {bookings.length} รายการ</span>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">รายการยานพาหนะทั้งหมด (Fleet Inventory)</h2>
            <p className="text-xs text-slate-500">ปรับเปลี่ยนสถานะการใช้งานและติดตามเลขไมล์</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="available">เฉพาะรถว่าง (Available)</option>
              <option value="reserved">เฉพาะติดจอง (Reserved)</option>
              <option value="rented">เฉพาะอยู่ระหว่างเช่า (Rented)</option>
              <option value="maintenance">เฉพาะซ่อมบำรุง (Maintenance)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">ยานพาหนะ</th>
                <th className="py-3 px-4">สาขาประจำการ</th>
                <th className="py-3 px-4">เลขไมล์ / เชื้อเพลิง</th>
                <th className="py-3 px-4">ราคาต่อวัน</th>
                <th className="py-3 px-4">สถานะปัจจุบัน</th>
                <th className="py-3 px-4 text-right">การจัดการสถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={v.imageUrl}
                      alt={v.model}
                      className="w-12 h-9 object-cover rounded-lg"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {v.brand} {v.model}
                      </span>
                      <span className="text-[11px] text-slate-400">{v.plateNumber}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{v.branch}</td>
                  <td className="py-3 px-4">
                    <span>{v.mileage.toLocaleString()} กม.</span>
                    <span className="text-slate-400 block text-[11px]">
                      {v.fuelType.toUpperCase()} ({v.fuelLevel}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ฿{v.dailyRate.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.status === 'available'
                          ? 'bg-emerald-100 text-emerald-700'
                          : v.status === 'reserved'
                          ? 'bg-amber-100 text-amber-700'
                          : v.status === 'rented'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {v.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-1">
                      {v.status !== 'available' && (
                        <button
                          onClick={() => onUpdateVehicleStatus(v.id, 'available')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold transition"
                        >
                          พร้อมใช้งาน
                        </button>
                      )}
                      {v.status !== 'maintenance' && (
                        <button
                          onClick={() => onUpdateVehicleStatus(v.id, 'maintenance')}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold transition"
                        >
                          ส่งซ่อม
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bookings Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">ประวัติการทำรายการจอง (Booking Ledger)</h2>
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600">{b.bookingCode}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-800">{b.customerName}</span>
                  <span className="text-slate-400">({b.customerPhone})</span>
                </div>
                <div className="text-slate-500 mt-1">
                  ช่วงเวลา: {b.startDate} ถึง {b.endDate} ({b.totalDays} วัน)
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">ยอดชำระแล้ว</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ฿{b.totalPaid.toLocaleString()}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    b.status === 'confirmed'
                      ? 'bg-amber-100 text-amber-800'
                      : b.status === 'active'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
