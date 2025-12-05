
import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { Truck, Plus, Wrench, CheckCircle, Loader2 } from 'lucide-react';
import AddVehicleModal from './AddVehicleModal';
import { fetchVehicles, createVehicle, updateVehicleStatus } from '../services/supabase';

const VehiclesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const v = await fetchVehicles();
      setVehicles(v);
    } catch (e) {
      console.error("Error loading vehicles", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddVehicle = async (data: any) => {
    const newVehicle: Vehicle = {
      id: `VEH-${Math.floor(Math.random() * 9000) + 1000}`,
      license_plate: data.license_plate,
      brand_model: data.brand_model,
      capacity_tons: parseFloat(data.capacity_tons),
      status: VehicleStatus.Free
    };
    try {
      await createVehicle(newVehicle);
      await loadData();
    } catch (e) {
      console.error("Error creating vehicle", e);
    }
  };

  const handleStatusChange = async (vehicleId: string, newStatus: VehicleStatus) => {
    setUpdatingId(vehicleId);
    try {
      await updateVehicleStatus(vehicleId, newStatus);
      await loadData();
    } catch (e) {
      console.error("Error updating vehicle status", e);
      alert("Статусты өзгерту мүмкін болмады");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Көліктер паркі</h1>
          <p className="text-slate-500 mt-1">Көлік құралдарының тізімі және техникалық жағдайы.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stripe-accent hover:bg-stripe-accentHover text-white rounded-lg text-sm font-medium shadow-sm transition-all shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Көлік қосу
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Мемлекеттік нөмір</th>
                <th className="px-6 py-3">Маркасы мен моделі</th>
                <th className="px-6 py-3">Жүк көтерімділігі</th>
                <th className="px-6 py-3">Статус</th>
                <th className="px-6 py-3 text-right">Әрекет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Truck className="w-4 h-4 text-indigo-600" />
                      </div>
                      {vehicle.license_plate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{vehicle.brand_model}</td>
                  <td className="px-6 py-4 text-slate-600">{vehicle.capacity_tons} тонна</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${vehicle.status === VehicleStatus.Free ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        vehicle.status === VehicleStatus.OnRoute ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {updatingId === vehicle.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400 inline" />
                    ) : vehicle.status === VehicleStatus.OnRoute ? (
                      <span className="text-xs text-slate-400 italic">Тапсырыста</span>
                    ) : vehicle.status === VehicleStatus.Free ? (
                      <button
                        onClick={() => handleStatusChange(vehicle.id, VehicleStatus.Maintenance)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium border border-amber-200 transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Жөндеуге
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(vehicle.id, VehicleStatus.Free)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Бос етіп ауыстыру
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddVehicle}
      />
    </div>
  );
};

export default VehiclesPage;

