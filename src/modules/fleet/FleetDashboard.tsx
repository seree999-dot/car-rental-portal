import React, { useState } from 'react';
import { Vehicle, Booking, VehicleStatus, VehicleCategory, Transmission } from '../../types';
import { BRANCHES } from '../../data/mockVehicles';
import {
  Car,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
} from 'lucide-react';

interface FleetDashboardProps {
  vehicles: Vehicle[];
  bookings: Booking[];
  onUpdateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  onAddVehicle: (newVehicle: Vehicle) => Promise<void> | void;
  onEditVehicle: (updatedVehicle: Vehicle) => Promise<void> | void;
  onDeleteVehicle: (vehicleId: string) => Promise<void> | void;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  vehicles,
  bookings,
  onUpdateVehicleStatus,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // Form State
  const [formPlateNumber, setFormPlateNumber] = useState('');
  const [formBrand, setFormBrand] = useState('Toyota');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState<number>(2024);
  const [formCategory, setFormCategory] = useState<VehicleCategory>('sedan');
  const [formTransmission, setFormTransmission] = useState<Transmission>('auto');
  const [formSeats, setFormSeats] = useState<number>(5);
  const [formDailyRate, setFormDailyRate] = useState<number>(1200);
  const [formFuelType, setFormFuelType] = useState<'gasoline' | 'diesel' | 'ev'>('gasoline');
  const [formBranch, setFormBranch] = useState(BRANCHES[0]);
  const [formMileage, setFormMileage] = useState<number>(10000);
  const [formImageUrl, setFormImageUrl] = useState(
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
  );
  const [formFeatures, setFormFeatures] = useState('Apple CarPlay, กล้องมองหลัง, ประหยัดน้ำมัน');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenAddModal = () => {
    setEditingVehicleId(null);
    setFormPlateNumber('');
    setFormBrand('Toyota');
    setFormModel('');
    setFormYear(2024);
    setFormCategory('sedan');
    setFormTransmission('auto');
    setFormSeats(5);
    setFormDailyRate(1200);
    setFormFuelType('gasoline');
    setFormBranch(BRANCHES[0]);
    setFormMileage(10000);
    setFormImageUrl(
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    );
    setFormFeatures('Apple CarPlay, กล้องมองหลัง, ประหยัดน้ำมัน');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setFormPlateNumber(vehicle.plateNumber);
    setFormBrand(vehicle.brand);
    setFormModel(vehicle.model);
    setFormYear(vehicle.year);
    setFormCategory(vehicle.category);
    setFormTransmission(vehicle.transmission);
    setFormSeats(vehicle.seats);
    setFormDailyRate(vehicle.dailyRate);
    setFormFuelType(vehicle.fuelType);
    setFormBranch(vehicle.branch);
    setFormMileage(vehicle.mileage);
    setFormImageUrl(vehicle.imageUrl);
    setFormFeatures(vehicle.features.join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlateNumber || !formBrand || !formModel) {
      alert('กรุณากรอกข้อมูลทะเบียนรถ ยี่ห้อ และรุ่นให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    const featuresArray = formFeatures
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const vehicleData: Vehicle = {
      id: editingVehicleId || `veh-${Date.now()}`,
      plateNumber: formPlateNumber,
      brand: formBrand,
      model: formModel,
      year: formYear,
      category: formCategory,
      transmission: formTransmission,
      seats: formSeats,
      dailyRate: formDailyRate,
      status: 'available',
      fuelType: formFuelType,
      mileage: formMileage,
      fuelLevel: 100,
      branch: formBranch,
      imageUrl: formImageUrl,
      features: featuresArray,
    };

    try {
      if (editingVehicleId) {
        await onEditVehicle(vehicleData);
      } else {
        await onAddVehicle(vehicleData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    const confirmDelete = window.confirm(
      `คุณต้องการลบรถยนต์ "${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})" ออกจากระบบจริงหรือไม่?`
    );
    if (!confirmDelete) return;

    try {
      await onDeleteVehicle(vehicle.id);
    } catch (err: any) {
      alert(`ลบไม่สำเร็จ: ${err.message}`);
    }
  };

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
          <span className="text-[11px] text-slate-400 mt-1 block">
            พร้อมใช้ {totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0}%
          </span>
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
            <h2 className="text-lg font-bold text-slate-900">จัดการยานพาหนะ (Fleet Inventory CRUD)</h2>
            <p className="text-xs text-slate-500">เพิ่ม, แก้ไขสเปก/ราคา, ปรับสถานะ หรือลบรถยนต์ออกจากระบบ D1</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="available">เฉพาะรถว่าง (Available)</option>
                <option value="reserved">เฉพาะติดจอง (Reserved)</option>
                <option value="rented">เฉพาะอยู่ระหว่างเช่า (Rented)</option>
                <option value="maintenance">เฉพาะซ่อมบำรุง (Maintenance)</option>
              </select>
            </div>

            {/* Insert Button */}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรถยนต์ใหม่</span>
            </button>
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
                <th className="py-3 px-4 text-right">การจัดการ (Actions)</th>
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
                    <div className="inline-flex items-center gap-1.5">
                      {/* Quick Status toggle */}
                      {v.status !== 'available' && (
                        <button
                          onClick={() => onUpdateVehicleStatus(v.id, 'available')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold transition"
                          title="เปลี่ยนเป็นพร้อมใช้งาน"
                        >
                          พร้อมใช้
                        </button>
                      )}
                      {v.status !== 'maintenance' && (
                        <button
                          onClick={() => onUpdateVehicleStatus(v.id, 'maintenance')}
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[11px] font-semibold transition"
                          title="เปลี่ยนเป็นส่งซ่อม"
                        >
                          ส่งซ่อม
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(v)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="แก้ไขข้อมูลรถ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(v)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="ลบรถออกจากระบบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

      {/* ADD / EDIT VEHICLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingVehicleId ? 'แก้ไขข้อมูลยานพาหนะ' : 'เพิ่มรถยนต์ใหม่เข้าสู่ระบบ'}
                  </h3>
                  <p className="text-xs text-slate-400">บันทึกข้อมูลและอัปเดตลง Cloudflare D1</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ทะเบียนรถ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 1กข-8921 (กทม)"
                    value={formPlateNumber}
                    onChange={(e) => setFormPlateNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ยี่ห้อ (Brand) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Toyota, Honda, BYD"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รุ่น (Model) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Yaris Ativ, CR-V, Seal"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีผลิต (Year) *</label>
                  <input
                    type="number"
                    required
                    min={2015}
                    max={2030}
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภทรถ *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as VehicleCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="sedan">Sedan (เก๋ง)</option>
                    <option value="suv">SUV (อเนกประสงค์)</option>
                    <option value="ev">EV (ไฟฟ้า 100%)</option>
                    <option value="luxury">Luxury (หรูหรา)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ระบบเกียร์ *</label>
                  <select
                    value={formTransmission}
                    onChange={(e) => setFormTransmission(e.target.value as Transmission)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="auto">Auto</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนที่นั่ง *</label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    required
                    value={formSeats}
                    onChange={(e) => setFormSeats(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ราคาต่อวัน (฿) *</label>
                  <input
                    type="number"
                    min={300}
                    required
                    value={formDailyRate}
                    onChange={(e) => setFormDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เชื้อเพลิง *</label>
                  <select
                    value={formFuelType}
                    onChange={(e) => setFormFuelType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="gasoline">Gasoline (เบนซิน)</option>
                    <option value="diesel">Diesel (ดีเซล)</option>
                    <option value="ev">EV (ไฟฟ้า)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขไมล์เริ่มต้น *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formMileage}
                    onChange={(e) => setFormMileage(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สาขาประจำการ *</label>
                <select
                  value={formBranch}
                  onChange={(e) => setFormBranch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL รูปภาพรถยนต์</label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  คุณสมบัติเด่น (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลลงฐานข้อมูล D1'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-3 px-5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
