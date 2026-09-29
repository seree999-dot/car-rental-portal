export type VehicleCategory = 'sedan' | 'suv' | 'ev' | 'luxury';
export type Transmission = 'auto' | 'manual';
export type VehicleStatus = 'available' | 'reserved' | 'rented' | 'maintenance';

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: Transmission;
  seats: number;
  dailyRate: number;
  status: VehicleStatus;
  fuelType: 'gasoline' | 'diesel' | 'ev';
  mileage: number;
  fuelLevel: number; // 0 - 100%
  branch: string;
  imageUrl: string;
  features: string[];
}

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'active'
  | 'under_inspection'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface Booking {
  id: string;
  bookingCode: string;
  vehicleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  idCardNumber: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  totalDays: number;
  dailyRate: number;
  rentalFee: number;
  insuranceFee: number;
  depositAmount: number; // BR-03: Security deposit
  totalPaid: number;
  status: BookingStatus;
  createdAt: string;
  expiresAt: string; // BR-02: 15-minute hold timer
  confirmedAt?: string;
  returnedAt?: string;
}

export interface InspectionRecord {
  id: string;
  bookingId: string;
  vehicleId: string;
  type: 'check_in' | 'check_out';
  inspectorName: string;
  mileage: number;
  fuelLevel: number;
  photos: {
    front: string;
    back: string;
    left: string;
    right: string;
  };
  damages: string[];
  signatureUrl: string;
  inspectedAt: string;
  // Penalty calculation for check-out
  lateHours?: number;
  lateFee?: number;
  fuelShortageFee?: number;
  totalPenalty?: number;
  depositRefunded?: number;
}
