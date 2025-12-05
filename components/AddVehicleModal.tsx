
import React, { useState } from 'react';
import { X, Truck } from 'lucide-react';
import { VehicleStatus } from '../types';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    license_plate: '',
    brand_model: '',
    capacity_tons: '',
    status: VehicleStatus.Free
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      license_plate: '',
      brand_model: '',
      capacity_tons: '',
      status: VehicleStatus.Free
    });
    onClose();
  };

  const inputClass = "mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-stripe-accent focus:ring-2 focus:ring-stripe-accent/20";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/60 backdrop-blur-sm p-4 md:p-0 transition-all">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 transform transition-all scale-100">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 rounded-lg">
                <Truck className="w-5 h-5 text-stripe-accent" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">Жаңа көлік тіркеу</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Мемлекеттік нөмірі</label>
            <input
              type="text"
              required
              placeholder="010 AAA 02"
              className={inputClass}
              value={formData.license_plate}
              onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
            />
          </div>

          <div>
            <label className={labelClass}>Маркасы және Моделі</label>
            <input
              type="text"
              required
              placeholder="Мысалы: Volvo FH16"
              className={inputClass}
              value={formData.brand_model}
              onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
            />
          </div>

          <div>
             <label className={labelClass}>Жүк көтерімділігі (Тонна)</label>
             <input
               type="number"
               step="0.1"
               required
               placeholder="20"
               className={inputClass}
               value={formData.capacity_tons}
               onChange={(e) => setFormData({ ...formData, capacity_tons: e.target.value })}
             />
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-100">
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
              Көлікті қосу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;
