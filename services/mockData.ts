
import { Order, OrderStatus, Driver, DriverStatus, Vehicle, VehicleStatus } from '../types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-7829',
    cargo_description: 'Электроника жабдықтары',
    cargo_weight_tons: 1.5,
    origin_city: 'Алматы',
    destination_city: 'Астана',
    order_date: '2023-10-25T10:00:00Z',
    departure_time: '2023-10-25T14:00',
    estimated_arrival_time: '2023-10-27T10:00',
    status: OrderStatus.OnRoute,
    driver_id: '1',
    vehicle_id: '1',
    amount: 150000
  },
  {
    id: 'ORD-7830',
    cargo_description: 'Құрылыс материалдары',
    cargo_weight_tons: 10,
    origin_city: 'Шымкент',
    destination_city: 'Түркістан',
    order_date: '2023-10-26T09:30:00Z',
    departure_time: '2023-10-26T11:00',
    estimated_arrival_time: '2023-10-26T16:00',
    status: OrderStatus.Delivered,
    completed_date: '2023-10-27T14:00:00Z',
    driver_id: '2',
    vehicle_id: '2',
    amount: 85000
  },
  {
    id: 'ORD-7831',
    cargo_description: 'Азық-түлік тауарлары',
    cargo_weight_tons: 5,
    origin_city: 'Алматы',
    destination_city: 'Талдықорған',
    order_date: '2023-10-27T11:15:00Z',
    status: OrderStatus.Pending,
    amount: 120000
  },
  {
    id: 'ORD-7832',
    cargo_description: 'Жиһаз жинағы',
    cargo_weight_tons: 2.2,
    origin_city: 'Қарағанды',
    destination_city: 'Астана',
    order_date: '2023-10-27T16:45:00Z',
    departure_time: '2023-10-28T09:00',
    estimated_arrival_time: '2023-10-28T14:00',
    status: OrderStatus.Assigned,
    driver_id: '3',
    vehicle_id: '3',
    amount: 95000
  },
  {
    id: 'ORD-7833',
    cargo_description: 'Медициналық жабдықтар',
    cargo_weight_tons: 0.8,
    origin_city: 'Ақтөбе',
    destination_city: 'Орал',
    order_date: '2023-10-28T08:00:00Z',
    status: OrderStatus.Cancelled,
    amount: 200000
  }
];

export const MOCK_DRIVERS: Driver[] = [
  { id: '1', full_name: 'Асқар Омаров', phone_number: '+7 777 111 2233', license_number: 'KZ123456', license_category: 'BC', status: DriverStatus.OnRoute },
  { id: '2', full_name: 'Берік Садықов', phone_number: '+7 777 444 5566', license_number: 'KZ654321', license_category: 'C', status: DriverStatus.Free },
  { id: '3', full_name: 'Ержан Төлеуов', phone_number: '+7 701 999 8877', license_number: 'KZ987654', license_category: 'CE', status: DriverStatus.Inactive },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: '1', license_plate: '010 AAA 02', brand_model: 'Volvo FH16', capacity_tons: 20, status: VehicleStatus.OnRoute },
  { id: '2', license_plate: '777 BBB 02', brand_model: 'Mercedes Actros', capacity_tons: 18, status: VehicleStatus.Free },
  { id: '3', license_plate: '123 CCC 05', brand_model: 'DAF XF', capacity_tons: 22, status: VehicleStatus.Free },
];
