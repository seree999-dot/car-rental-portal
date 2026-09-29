import React, { useState, useEffect } from 'react';
import { Vehicle, Booking, InspectionRecord, VehicleStatus } from './types';
import { INITIAL_VEHICLES } from './data/mockVehicles';
import { Navbar, NavTab } from './components/Navbar';
import { VehicleCatalog } from './modules/catalog/VehicleCatalog';
import { BookingModal } from './modules/booking/BookingModal';
import { BookingConfirmation } from './modules/booking/BookingConfirmation';
import { InspectionPortal } from './modules/inspection/InspectionPortal';
import { FleetDashboard } from './modules/fleet/FleetDashboard';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('catalog');

  // Load vehicles from localStorage or default
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('driveease_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  // Load bookings from localStorage or default initial booking
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('driveease_bookings');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'bk-init-1',
        bookingCode: 'DE-202409-1001',
        vehicleId: 'veh-06',
        customerName: 'คุณภานุวัฒน์ วงศ์สวัสดิ์',
        customerEmail: 'phanuwat@example.com',
        customerPhone: '081-998-7766',
        idCardNumber: '1-1002-33445-56-7',
        driverLicenseNumber: 'DL-9944123',
        driverLicenseExpiry: '2028-05-30',
        startDate: '2026-09-30',
        endDate: '2026-10-03',
        totalDays: 3,
        dailyRate: 1590,
        rentalFee: 4770,
        insuranceFee: 1050,
        depositAmount: 5000,
        totalPaid: 10820,
        status: 'active',
        createdAt: '2026-09-29T10:00:00.000Z',
        expiresAt: '2026-09-29T10:15:00.000Z',
        confirmedAt: '2026-09-29T10:05:00.000Z',
      },
    ];
  });

  // Modal & Selection State
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<{
    vehicle: Vehicle;
    searchParams: { branch: string; startDate: string; endDate: string };
  } | null>(null);

  const [confirmedBookingData, setConfirmedBookingData] = useState<{
    booking: Booking;
    vehicle: Vehicle;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('driveease_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('driveease_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Handle Booking Creation
  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);

    // Update vehicle status to 'reserved'
    setVehicles((prev) =>
      prev.map((v) => (v.id === newBooking.vehicleId ? { ...v, status: 'reserved' } : v))
    );

    const vehicle = vehicles.find((v) => v.id === newBooking.vehicleId)!;
    setSelectedVehicleForBooking(null);
    setConfirmedBookingData({ booking: newBooking, vehicle });
  };

  // Handle Handover Check-In
  const handleCompleteCheckIn = (bookingId: string, record: InspectionRecord) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'active' } : b))
    );
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === record.vehicleId
          ? { ...v, status: 'rented', mileage: record.mileage, fuelLevel: record.fuelLevel }
          : v
      )
    );
  };

  // Handle Return Check-Out
  const handleCompleteCheckOut = (bookingId: string, record: InspectionRecord) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'completed', returnedAt: record.inspectedAt }
          : b
      )
    );
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === record.vehicleId
          ? { ...v, status: 'available', mileage: record.mileage, fuelLevel: record.fuelLevel }
          : v
      )
    );
  };

  // Handle Fleet Manual Status Update
  const handleUpdateVehicleStatus = (vehicleId: string, status: VehicleStatus) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status } : v))
    );
  };

  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'active'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setConfirmedBookingData(null);
        }}
        activeBookingsCount={activeBookingsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {confirmedBookingData ? (
          <BookingConfirmation
            booking={confirmedBookingData.booking}
            vehicle={confirmedBookingData.vehicle}
            onGoToHandover={() => {
              setConfirmedBookingData(null);
              setActiveTab('inspection');
            }}
            onBackToCatalog={() => {
              setConfirmedBookingData(null);
              setActiveTab('catalog');
            }}
          />
        ) : (
          <>
            {activeTab === 'catalog' && (
              <VehicleCatalog
                vehicles={vehicles}
                onSelectVehicle={(vehicle, searchParams) =>
                  setSelectedVehicleForBooking({ vehicle, searchParams })
                }
              />
            )}

            {activeTab === 'inspection' && (
              <InspectionPortal
                bookings={bookings}
                vehicles={vehicles}
                onCompleteCheckIn={handleCompleteCheckIn}
                onCompleteCheckOut={handleCompleteCheckOut}
              />
            )}

            {activeTab === 'fleet' && (
              <FleetDashboard
                vehicles={vehicles}
                bookings={bookings}
                onUpdateVehicleStatus={handleUpdateVehicleStatus}
              />
            )}
          </>
        )}
      </main>

      {/* Booking Modal */}
      {selectedVehicleForBooking && (
        <BookingModal
          vehicle={selectedVehicleForBooking.vehicle}
          searchParams={selectedVehicleForBooking.searchParams}
          onClose={() => setSelectedVehicleForBooking(null)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 DriveEase Car Rental Platform. All rights reserved. (Developed with Clean Architecture & Cloudflare Pages)
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-800 cursor-pointer">เงื่อนไขการเช่า</span>
            <span className="hover:text-slate-800 cursor-pointer">นโยบายความเป็นส่วนตัว (PDPA)</span>
            <span className="hover:text-slate-800 cursor-pointer">ติดต่อสอบถาม</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
