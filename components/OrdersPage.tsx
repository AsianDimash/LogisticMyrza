
import React, { useState, useEffect } from 'react';
import OrdersTable from './OrdersTable';
import AddOrderModal from './AddOrderModal';
import OrderDetailsModal from './OrderDetailsModal';
import { Order, OrderStatus, Driver, DriverStatus, Vehicle, VehicleStatus } from '../types';
import { Plus } from 'lucide-react';
import {
  fetchOrders,
  fetchDrivers,
  fetchVehicles,
  createOrder,
  deleteOrder,
  updateDriverStatus,
  updateVehicleStatus,
  completeOrder
} from '../services/supabase';

const OrdersPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const loadData = async () => {
    try {
      const [o, d, v] = await Promise.all([fetchOrders(), fetchDrivers(), fetchVehicles()]);
      setOrders(o);
      setDrivers(d);
      setVehicles(v);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddOrder = async (data: any) => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 8999) + 1000}`,
      cargo_description: data.description,
      cargo_weight_tons: parseFloat(data.weight),
      origin_city: data.origin,
      destination_city: data.destination,
      order_date: new Date().toISOString(),
      departure_time: data.departureTime,
      estimated_arrival_time: data.arrivalTime,
      status: (data.driverId && data.vehicleId) ? OrderStatus.OnRoute : OrderStatus.Pending,
      driver_id: data.driverId || null,
      vehicle_id: data.vehicleId || null,
      amount: data.amount ? parseFloat(data.amount) : 0,
      driver_fee_percentage: data.driverFeePercentage,
      driver_fee_amount: data.driverFeeAmount
    };

    try {
      await createOrder(newOrder);

      if (data.driverId) {
        await updateDriverStatus(data.driverId, DriverStatus.OnRoute);
      }

      if (data.vehicleId) {
        await updateVehicleStatus(data.vehicleId, VehicleStatus.OnRoute);
      }
      await loadData();
    } catch (error) {
      console.error("Error creating order", error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Бұл тапсырысты өшіргіңіз келе ме?')) {
      const orderToDelete = orders.find(o => o.id === id);
      try {
        if (orderToDelete && orderToDelete.driver_id) {
          await updateDriverStatus(orderToDelete.driver_id, DriverStatus.Free);
        }

        if (orderToDelete && orderToDelete.vehicle_id) {
          await updateVehicleStatus(orderToDelete.vehicle_id, VehicleStatus.Free);
        }

        await deleteOrder(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting order", error);
      }
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleCompleteOrder = async (orderId: string) => {
    const orderToComplete = orders.find(o => o.id === orderId);
    if (!orderToComplete) return;

    // 1. Тапсырысты аяқтау
    await completeOrder(orderId);

    // 2. Жүргізушіні "Бос" етіп ауыстыру
    if (orderToComplete.driver_id) {
      await updateDriverStatus(orderToComplete.driver_id, DriverStatus.Free);
    }

    // 3. Көлікті "Бос" етіп ауыстыру
    if (orderToComplete.vehicle_id) {
      await updateVehicleStatus(orderToComplete.vehicle_id, VehicleStatus.Free);
    }

    // 4. Деректерді жаңарту
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Тапсырыстар</h1>
          <p className="text-slate-500 mt-1">Барлық тапсырыстарды басқару.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stripe-accent hover:bg-stripe-accentHover text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Тапсырыс қосу
        </button>
      </div>

      <OrdersTable
        orders={orders}
        onDelete={handleDeleteOrder}
        onViewDetails={handleViewDetails}
      />

      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddOrder}
        drivers={drivers}
        vehicles={vehicles}
      />

      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        order={selectedOrder}
        driver={drivers.find(d => d.id === selectedOrder?.driver_id) || null}
        vehicle={vehicles.find(v => v.id === selectedOrder?.vehicle_id) || null}
        onComplete={handleCompleteOrder}
      />
    </div>
  );
};

export default OrdersPage;
