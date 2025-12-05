
import React, { useState } from 'react';
import { X, Truck, User, Minus, Plus, Calendar, DollarSign, Percent } from 'lucide-react';
import { Driver, DriverStatus, Vehicle, VehicleStatus } from '../types';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  drivers?: Driver[];
  vehicles?: Vehicle[];
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose, onSubmit, drivers = [], vehicles = [] }) => {
  const [formData, setFormData] = useState({
    description: '',
    weight: '',
    origin: '',
    destination: '',
    driverId: '',
    vehicleId: '',
    departureDate: '',
    arrivalDate: '',
    price: '',
    driverPercentage: '25' // Default 25%
  });

  // Filter only free resources
  const freeDrivers = drivers.filter(d => d.status === DriverStatus.Free);
  const freeVehicles = vehicles.filter(v => v.status === VehicleStatus.Free);

  // Calculate financials
  const orderPrice = parseFloat(formData.price) || 0;
  const percentage = parseFloat(formData.driverPercentage) || 0;
  
  const driverFee = Math.round((orderPrice * percentage) / 100);
  const companyIncome = orderPrice - driverFee;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date with default T00:00:00 time
    const submissionData = {
      description: formData.description,
      weight: formData.weight,
      origin: formData.origin,
      destination: formData.destination,
      driverId: formData.driverId,
      vehicleId: formData.vehicleId,
      departureTime: formData.departureDate ? `${formData.departureDate}T00:00:00` : '',
      arrivalTime: formData.arrivalDate ? `${formData.arrivalDate}T00:00:00` : '',
      amount: orderPrice,
      driverFeePercentage: percentage,
      driverFeeAmount: driverFee
    };

    onSubmit(submissionData);
    
    // Reset form
    setFormData({
      description: '',
      weight: '',
      origin: '',
      destination: '',
      driverId: '',
      vehicleId: '',
      departureDate: '',
      arrivalDate: '',
      price: '',
      driverPercentage: '25'
    });
    onClose();
  };

  const handleWeightChange = (amount: number) => {
    const currentWeight = parseFloat(formData.weight) || 0;
    const newWeight = Math.max(0, currentWeight + amount);
    setFormData({ ...formData, weight: newWeight.toFixed(1) });
  };

  const inputClass = "mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-stripe-accent focus:ring-2 focus:ring-stripe-accent/20";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";
  const sectionTitleClass = "text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/60 backdrop-blur-sm p-4 md:p-0">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h3 className="text-xl font-bold text-gray-900">Жаңа тапсырыс тіркеу</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: Cargo Details */}
          <div>
              <h4 className={sectionTitleClass}>Жүк және Қаржы</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Жүк атауы</label>
                    <input
                      type="text"
                      required
                      className={inputClass}
                      placeholder="Мысалы: Электроника"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  
                  {/* Weight Input */}
                  <div>
                    <label className={labelClass}>Салмағы (т)</label>
                    <div className="flex items-center mt-1">
                      <button
                        type="button"
                        onClick={() => handleWeightChange(-0.5)}
                        className="p-2.5 rounded-l-lg bg-stripe-accent text-white hover:bg-stripe-accentHover transition-colors shadow-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        required
                        className="block w-full border-y border-gray-200 bg-gray-50 py-2 text-center text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-stripe-accent focus:ring-0 z-10"
                        placeholder="0.0"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => handleWeightChange(0.5)}
                        className="p-2.5 rounded-r-lg bg-stripe-accent text-white hover:bg-stripe-accentHover transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price Input */}
                  <div>
                    <label className={labelClass}>Тапсырыс құны (₸)</label>
                    <div className="relative">
                        <input
                            type="number"
                            required
                            placeholder="0"
                            className={`${inputClass} pl-9`}
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Driver Percentage Input */}
                  <div>
                    <label className={labelClass}>Жүргізуші пайызы (%)</label>
                    <div className="relative">
                        <input
                            type="number"
                            required
                            min="0"
                            max="100"
                            className={`${inputClass} pl-9`}
                            value={formData.driverPercentage}
                            onChange={(e) => setFormData({ ...formData, driverPercentage: e.target.value })}
                        />
                        <Percent className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
              </div>

              {/* Auto Calculation Display */}
              {orderPrice > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Жүргізуші ({percentage}%)</span>
                        <span className="text-sm font-bold text-emerald-700">₸ {driverFee.toLocaleString()}</span>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Компания Табысы ({100 - percentage}%)</span>
                        <span className="text-sm font-bold text-indigo-700">₸ {companyIncome.toLocaleString()}</span>
                    </div>
                </div>
              )}
          </div>

          {/* Section 2: Route & Time */}
          <div>
             <h4 className={sectionTitleClass}>Бағыт және Уақыт</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Қайдан (Қала)</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Алматы"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Қайда (Қала)</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Астана"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className={labelClass}>Шығу күні</label>
                   <div className="relative">
                       <input
                         type="date"
                         required
                         className={inputClass}
                         value={formData.departureDate}
                         onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                         style={{ colorScheme: 'light' }}
                       />
                       <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                   </div>
                </div>
                <div>
                   <label className={labelClass}>Болжалды жету күні</label>
                   <div className="relative">
                       <input
                         type="date"
                         required
                         className={inputClass}
                         value={formData.arrivalDate}
                         onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                         style={{ colorScheme: 'light' }}
                       />
                       <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                   </div>
                </div>
             </div>
          </div>

          {/* Section 3: Assignment */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <h4 className={`${sectionTitleClass} border-slate-200 mb-4`}>Ресурстарды бекіту</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className={labelClass}>Жүргізуші</label>
                   <div className="relative">
                       <select
                         className={`${inputClass} pl-10`} // Added pl-10 for left icon space
                         value={formData.driverId}
                         onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                       >
                         <option value="">Таңдалмаған</option>
                         {freeDrivers.map(driver => (
                           <option key={driver.id} value={driver.id}>
                             {driver.full_name} ({driver.license_category})
                           </option>
                         ))}
                       </select>
                       {/* Icon moved to left-3 */}
                       <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                   </div>
                   {freeDrivers.length === 0 && (
                     <p className="text-xs text-amber-600 mt-1">Бос жүргізушілер жоқ</p>
                   )}
                 </div>
                 <div>
                   <label className={labelClass}>Көлік (Фура)</label>
                   <div className="relative">
                       <select
                         className={`${inputClass} pl-10`} // Added pl-10 for left icon space
                         value={formData.vehicleId}
                         onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                       >
                         <option value="">Таңдалмаған</option>
                         {freeVehicles.map(vehicle => (
                           <option key={vehicle.id} value={vehicle.id}>
                             {vehicle.license_plate} - {vehicle.brand_model} ({vehicle.capacity_tons}т)
                           </option>
                         ))}
                       </select>
                       {/* Icon moved to left-3 */}
                       <Truck className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                   </div>
                    {freeVehicles.length === 0 && (
                     <p className="text-xs text-amber-600 mt-1">Бос көліктер жоқ</p>
                   )}
                 </div>
             </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Болдырмау
            </button>
            <button
              type="submit"
              className="rounded-lg bg-stripe-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-stripe-accentHover hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-stripe-accent focus:ring-offset-2 transition-all"
            >
              Тапсырысты жасау
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;
