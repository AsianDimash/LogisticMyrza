import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon, subValue }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg">
          <Icon className="w-5 h-5 text-stripe-accent" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
        <div className="flex items-center text-sm">
          {change && (
            <span className={`font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'} flex items-center`}>
              {isPositive ? '+' : ''}{change}
            </span>
          )}
          {subValue && (
            <span className="text-slate-400 ml-2">{subValue}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;