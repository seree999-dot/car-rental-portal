import React, { useState } from 'react';
import { Vehicle, VehicleCategory } from '../../types';
import { BRANCHES } from '../../data/mockVehicles';
import { Search, Users, Fuel, Gauge, Shield, Check, Calendar, MapPin, Sparkles } from 'lucide-react';

interface VehicleCatalogProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle, searchParams: { branch: string; startDate: string; endDate: string }) => void;
}

export const VehicleCatalog: React.FC<VehicleCatalogProps> = ({ vehicles, onSelectVehicle }) => {
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Default dates: tomorrow to 3 days after
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().split('T')[0];

  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 4);
  const defaultEnd = returnDate.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const categories: { label: string; value: string }[] = [
    { label: 'รถทั้งหมด', value: 'all' },
    { label: 'Sedan (เก๋งประหยัด)', value: 'sedan' },
    { label: 'SUV (ครอบครัว 7 ที่นั่ง)', value: 'suv' },
    { label: 'EV (ไฟฟ้า 100%)', value: 'ev' },
    { label: 'Luxury (หรูหราพรีเมียม)', value: 'luxury' },
  ];

  const filteredVehicles = vehicles.filter((v) => {
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    const matchesSearch =
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plateNumber.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Hero & Search Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" /> บริการเช่ารถมาตรฐานใหม่ ขับขี่มั่นใจ ประกันภัยชั้น 1 ทุกคัน
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            เช่ารถง่าย คืนรถไว <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              ไม่มีค่าธรรมเนียมแอบแฝง
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            จองออนไลน์พร้อมระบบล็อคสิทธิ์ 15 นาที ตรวจรับรถดิจิทัลแบบไร้กระดาษ ปลดล็อคมัดจำรวดเร็วภายใน 24 ชม.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="relative z-10 mt-8 bg-white text-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> สาขารับ-คืนรถ
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> วันที่รับรถ
              </label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> วันที่คืนรถ
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                categoryFilter === c.value
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Keyword */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหายี่ห้อ, รุ่น, ทะเบียน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const isAvailable = vehicle.status === 'available';

          return (
            <div
              key={vehicle.id}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                isAvailable
                  ? 'border-slate-200 hover:shadow-xl hover:border-blue-300'
                  : 'border-slate-200 opacity-75'
              }`}
            >
              {/* Image & Status Badge */}
              <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden group">
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                    {vehicle.plateNumber}
                  </span>
                  {vehicle.category === 'ev' && (
                    <span className="bg-emerald-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Fuel className="w-3 h-3" /> EV 100%
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm ${
                      vehicle.status === 'available'
                        ? 'bg-emerald-500 text-white'
                        : vehicle.status === 'reserved'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-600 text-white'
                    }`}
                  >
                    {vehicle.status === 'available'
                      ? 'ว่างพร้อมเช่า'
                      : vehicle.status === 'reserved'
                      ? 'ติดจอง'
                      : 'อยู่ระหว่างเช่า'}
                  </span>
                </div>
              </div>

              {/* Vehicle Body Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-xs text-slate-500">{vehicle.year} • {vehicle.branch}</p>
                    </div>
                  </div>

                  {/* Specs Chips */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 my-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vehicle.seats} ที่นั่ง</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      <span className="capitalize">{vehicle.transmission}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-slate-400" />
                      <span className="capitalize">{vehicle.fuelType}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-1 mb-4">
                    {vehicle.features.slice(0, 2).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">ราคาเริ่มต้น</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-blue-600">
                        ฿{vehicle.dailyRate.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">/ วัน</span>
                    </div>
                  </div>

                  <button
                    disabled={!isAvailable}
                    onClick={() => onSelectVehicle(vehicle, { branch: selectedBranch, startDate, endDate })}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                      isAvailable
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'จองคันนี้' : 'ไม่ว่าง'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
