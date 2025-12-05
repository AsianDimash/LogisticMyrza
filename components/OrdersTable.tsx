
import React from 'react';
import { Order, OrderStatus } from '../types';
import { Trash2, FileText, ChevronRight } from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
  onDelete: (id: string) => void;
  onViewDetails?: (order: Order) => void;
}

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  let styles = '';
  switch (status) {
    case OrderStatus.Delivered:
      styles = 'bg-emerald-100 text-emerald-700 border-emerald-200';
      break;
    case OrderStatus.OnRoute:
      styles = 'bg-blue-100 text-blue-700 border-blue-200';
      break;
    case OrderStatus.Pending:
      styles = 'bg-amber-100 text-amber-700 border-amber-200';
      break;
    case OrderStatus.Assigned:
      styles = 'bg-indigo-100 text-indigo-700 border-indigo-200';
      break;
    case OrderStatus.Cancelled:
      styles = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    default:
      styles = 'bg-gray-100 text-gray-600';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      {status}
    </span>
  );
};

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onDelete, onViewDetails }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 className="text-base font-semibold text-slate-900">Соңғы тапсырыстар</h3>
        <button className="text-sm text-stripe-accent hover:text-stripe-accentHover font-medium">
          Барлығын көру &rarr;
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Жүк сипаттамасы</th>
              <th className="px-6 py-3">Бағыт</th>
              <th className="px-6 py-3">Күні</th>
              <th className="px-6 py-3">Статус</th>
              <th className="px-6 py-3 text-right">Сомасы</th>
              <th className="px-6 py-3 text-right">Әрекет</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-slate-50 transition-colors group cursor-pointer"
                onClick={() => onViewDetails && onViewDetails(order)}
              >
                <td className="px-6 py-4 font-medium text-slate-900">
                   <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-slate-400" />
                       {order.id}
                   </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{order.cargo_description}</span>
                    <span className="text-xs text-slate-400">{order.cargo_weight_tons} тонна</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                             {order.origin_city}
                        </div>
                        <div className="h-2 border-l border-dashed border-slate-300 ml-[3px]"></div>
                        <div className="flex items-center gap-1 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-stripe-accent"></div>
                             <span className="font-medium text-slate-900">{order.destination_city}</span>
                        </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {/* Changed to dd/mm/yyyy format */}
                  {new Date(order.order_date).toLocaleDateString('kk-KZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {order.amount ? `₸${order.amount.toLocaleString()}` : '-'}
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
                    className="text-slate-400 hover:text-rose-600 p-2 rounded-md hover:bg-rose-50 transition-colors z-10 relative"
                    title="Өшіру"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <div className="p-12 text-center text-slate-500">
          Тапсырыстар табылмады. Жаңа тапсырыс қосыңыз.
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
