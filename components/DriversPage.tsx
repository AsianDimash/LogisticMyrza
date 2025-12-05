
import React, { useState, useEffect } from 'react';
import { Driver, DriverStatus, Order, OrderStatus } from '../types';
import { Phone, CreditCard, User, Plus, Info, Car, Wallet } from 'lucide-react';
import AddDriverModal from './AddDriverModal';
import DriverDetailsModal from './DriverDetailsModal';
import { fetchDrivers, fetchOrders, createDriver } from '../services/supabase';

const DriversPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadData = async () => {
    try {
        const [d, o] = await Promise.all([fetchDrivers(), fetchOrders()]);
        setDrivers(d);
        setOrders(o);
    } catch (e) {
        console.error("Error loading drivers/orders", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDetailsModalOpen]);

  const handleAddDriver = async (data: any) => {
    const newDriver: Driver = {
      id: `DRV-${Math.floor(Math.random() * 9000) + 1000}`,
      full_name: data.full_name,
      phone_number: data.phone_number,
      license_number: data.license_number,
      license_category: data.license_category,
      status: DriverStatus.Free
    };
    try {
        await createDriver(newDriver);
        await loadData();
    } catch (e) {
        console.error("Error adding driver", e);
    }
  };

  const handleDriverClick = (driver: Driver) => {
    setSelectedDriver(driver);
    const order = orders.find(o => 
      o.driver_id === driver.id && 
      (o.status === OrderStatus.OnRoute || o.status === OrderStatus.Assigned)
    );
    setActiveOrder(order || null);
    setIsDetailsModalOpen(true);
  };

  const getDriverEarnings = (driverId: string) => {
      return orders
        .filter(o => o.driver_id === driverId)
        .reduce((sum, o) => sum + (o.driver_fee_amount || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Жүргізушілер</h1>
          <p className="text-slate-500 mt-1">Жүргізушілер тізімі және қаржылық есеп.</p>
        </div>
        <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stripe-accent hover:bg-stripe-accentHover text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
            <Plus className="w-4 h-4" />
            Жүргізуші қосу
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Аты-жөні</th>
                <th className="px-6 py-3">Санат</th>
                <th className="px-6 py-3">Телефон</th>
                <th className="px-6 py-3">Статус</th>
                <th className="px-6 py-3">Табысы</th>
                <th className="px-6 py-3 text-right">Әрекет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((driver) => {
                const earnings = getDriverEarnings(driver.id);
                return (
                  <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-full">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        {driver.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-700">{driver.license_category}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {driver.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${driver.status === DriverStatus.Free ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                          driver.status === DriverStatus.OnRoute ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                          'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                          <Wallet className="w-4 h-4" />
                          ₸{earnings.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {driver.status === DriverStatus.OnRoute && (
                          <button 
                              onClick={() => handleDriverClick(driver)}
                              className="text-stripe-accent hover:text-stripe-accentHover font-medium text-xs flex items-center gap-1 ml-auto"
                          >
                              <Info className="w-3 h-3" />
                              Толық ақпарат
                          </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddDriverModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddDriver} 
      />

      <DriverDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        driver={selectedDriver}
        activeOrder={activeOrder}
      />
    </div>
  );
};

export default DriversPage;
