
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DriverStatus } from '../types';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const AddDriverModal: React.FC<AddDriverModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    license_number: '',
    license_category: 'BC',
    status: DriverStatus.Free
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      full_name: '',
      phone_number: '',
      license_number: '',
      license_category: 'BC',
      status: DriverStatus.Free
    });
    onClose();
  };

  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-stripe-accent focus:ring-stripe-accent sm:text-sm border px-3 py-2 outline-none transition-colors text-slate-900 font-medium placeholder:text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 md:p-0">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Жаңа жүргізуші қосу</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Аты-жөні</label>
            <input
              type="text"
              required
              className={inputClass}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Телефон</label>
              <input
                type="text"
                required
                className={inputClass}
                placeholder="+7 777 ..."
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Куәлік нөмірі</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Санат (Категория)</label>
            <select
                className={inputClass}
                value={formData.license_category}
                onChange={(e) => setFormData({...formData, license_category: e.target.value})}
            >
                <option value="B">B (Жеңіл көлік)</option>
                <option value="C">C (Жүк көлігі)</option>
                <option value="BC">BC (Жеңіл + Жүк)</option>
                <option value="CE">CE (Тіркемелі жүк)</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Болдырмау
            </button>
            <button
              type="submit"
              className="rounded-md bg-stripe-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-stripe-accentHover"
            >
              Қосу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDriverModal;
