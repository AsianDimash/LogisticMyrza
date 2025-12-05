
import React, { useState, useEffect } from 'react';
import OrdersTable from './OrdersTable';
import StatCard from './StatCard';
import AddOrderModal from './AddOrderModal';
import OrderDetailsModal from './OrderDetailsModal';
import { Order, OrderStatus, Driver, DriverStatus, Vehicle, VehicleStatus } from '../types';
import { 
  Truck, 
  Users, 
  TrendingUp, 
  Plus,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  fetchOrders, 
  fetchDrivers, 
  fetchVehicles, 
  createOrder, 
  deleteOrder, 
  updateDriverStatus, 
  updateVehicleStatus 
} from '../services/supabase';

const Dashboard: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [o, d, v] = await Promise.all([fetchOrders(), fetchDrivers(), fetchVehicles()]);
      setOrders(o);
      setDrivers(d);
      setVehicles(v);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Process Chart Data (Last 7 Days)
  const processChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    return last7Days.map(date => {
      const dayTotal = orders
        .filter(order => order.order_date.startsWith(date))
        .reduce((sum, order) => sum + (order.amount || 0), 0);
      
      const dayName = new Date(date).toLocaleDateString('kk-KZ', { weekday: 'short' });

      return {
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        value: dayTotal
      };
    });
  };

  const chartData = processChartData();

  // Financial calculations
  const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const totalDriverFees = orders.reduce((sum, order) => sum + (order.driver_fee_amount || 0), 0);
  const netIncome = totalRevenue - totalDriverFees;

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
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error("Error creating order", error);
      alert("Тапсырыс құру кезінде қате кетті");
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
          alert("Тапсырысты өшіру мүмкін болмады");
        }
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Бақылау тақтасы</h1>
          <p className="text-slate-500 mt-1">Логистикалық операцияларға шолу.</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={loadData}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
             >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                Жаңарту
             </button>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-stripe-accent hover:bg-stripe-accentHover text-white rounded-lg text-sm font-medium shadow-sm transition-all shadow-indigo-200"
            >
                <Plus className="w-4 h-4" />
                Тапсырыс қосу
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Жалпы айналым" 
          value={`₸${(totalRevenue / 1000000).toFixed(1)}M`}
          change="" 
          isPositive={true} 
          icon={TrendingUp}
          subValue="барлық сома"
        />
        <StatCard 
          title="Таза табыс" 
          value={`₸${(netIncome / 1000000).toFixed(1)}M`} 
          change="" 
          isPositive={true} 
          icon={Wallet}
          subValue="компания"
        />
        <StatCard 
          title="Жүргізушілер төлемі" 
          value={`₸${(totalDriverFees / 1000000).toFixed(1)}M`} 
          change="" 
          isPositive={false} 
          icon={Users}
          subValue="шығыс"
        />
        <StatCard 
          title="Жолдағы тапсырыстар" 
          value={orders.filter(o => o.status === OrderStatus.OnRoute).length} 
          change="" 
          isPositive={true} 
          icon={Truck}
          subValue="қазіргі уақытта"
        />
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-base font-semibold text-slate-900 mb-6">Соңғы 7 күндегі табыс</h3>
           {/* Fixed height container to prevent Recharts -1 height warning */}
           <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart
                 data={chartData}
                 margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
               >
                 <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#635BFF" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#635BFF" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `₸${value/1000}k`} />
                 <Tooltip 
                    formatter={(value: number) => [`₸${value.toLocaleString()}`, 'Табыс']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#635BFF', strokeWidth: 1, strokeDasharray: '4 4' }}
                 />
                 <Area type="monotone" dataKey="value" stroke="#635BFF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-3">
          <OrdersTable 
            orders={orders} 
            onDelete={handleDeleteOrder} 
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>

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
      />
    </div>
  );
};

export default Dashboard;
