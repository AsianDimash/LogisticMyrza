
export enum UserRole {
  Admin = 'admin',
  Operator = 'operator'
}

export enum DriverStatus {
  Free = 'Бос',
  OnRoute = 'Жолда',
  Inactive = 'Белсенді емес'
}

export enum VehicleStatus {
  Free = 'Бос',
  OnRoute = 'Жолда',
  Maintenance = 'Жөндеуде'
}

export enum OrderStatus {
  Pending = 'Күтілуде',
  Assigned = 'Тағайындалды',
  OnRoute = 'Жолда',
  Delivered = 'Жеткізілді',
  Cancelled = 'Бас тартылды'
}

export interface Profile {
  id: string; // Links to auth.users.id
  full_name: string;
  role: UserRole;
  email?: string; // Optional, for display purposes
  created_at?: string;
}

export interface Driver {
  id: string;
  full_name: string;
  phone_number: string;
  license_number: string;
  license_category: string; 
  status: DriverStatus;
}

export interface Vehicle {
  id: string;
  license_plate: string;
  brand_model: string;
  capacity_tons: number;
  status: VehicleStatus;
}

export interface Order {
  id: string;
  cargo_description: string;
  cargo_weight_tons: number;
  origin_city: string;
  destination_city: string;
  order_date: string;
  departure_time?: string;
  estimated_arrival_time?: string;
  completed_date?: string | null;
  status: OrderStatus;
  driver_id?: string | null;
  vehicle_id?: string | null;
  operator_id?: string | null;
  amount?: number; 
  driver_fee_percentage?: number;
  driver_fee_amount?: number;
}

export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  availableDrivers: number;
  totalRevenue: number;
}
