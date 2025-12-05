
import React from 'react';
import { X, MapPin, Package, Calendar } from 'lucide-react';
import { Driver, Order } from '../types';

interface DriverDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  activeOrder?: Order | null;
}

const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({ isOpen, onClose, driver, activeOrder }) => {
  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 md:p-0">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-slate-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-gray-900">{driver.full_name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
            {/* Driver Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="block text-slate-500">Телефон</span>
                    <span className="font-medium text-slate-900">{driver.phone_number}</span>
                </div>
                <div>
                    <span className="block text-slate-500">Куәлік нөмірі</span>
                    <span className="font-medium text-slate-900">{driver.license_number}</span>
                </div>
                <div>
                    <span className="block text-slate-500">Санаты</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {driver.license_category}
                    </span>
                </div>
                <div>
                    <span className="block text-slate-500">Статус</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        driver.status === 'Жолда' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                        {driver.status}
                    </span>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Active Order Info */}
            {activeOrder ? (
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-stripe-accent" />
                        Ағымдағы тапсырыс
                    </h4>
                    
                    <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                         <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Жүк</span>
                            <div className="font-medium text-slate-900">{activeOrder.cargo_description}</div>
                            <div className="text-sm text-slate-500">{activeOrder.cargo_weight_tons} тонна</div>
                         </div>

                         <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            <div className="relative">
                                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-white"></div>
                                <span className="text-xs text-slate-500 block">Қайдан</span>
                                <span className="font-medium text-slate-900">{activeOrder.origin_city}</span>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-stripe-accent ring-4 ring-white"></div>
                                <span className="text-xs text-slate-500 block">Қайда</span>
                                <span className="font-medium text-slate-900">{activeOrder.destination_city}</span>
                            </div>
                         </div>
                         
                         <div className="flex justify-between items-center pt-2">
                             <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                 <Calendar className="w-3 h-3" />
                                 {new Date(activeOrder.order_date).toLocaleDateString('kk-KZ', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                             </div>
                             <div className="font-bold text-slate-900">
                                 ₸{activeOrder.amount?.toLocaleString()}
                             </div>
                         </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    Қазіргі уақытта белсенді тапсырыс жоқ
                </div>
            )}
        </div>

        <div className="bg-slate-50 px-6 py-4 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Жабу
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailsModal;
