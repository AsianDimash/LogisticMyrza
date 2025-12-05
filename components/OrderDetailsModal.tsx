
import React, { useState } from 'react';
import { X, Calendar, MapPin, Truck, User, Package, Clock, ShieldCheck, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { Order, Driver, Vehicle, OrderStatus } from '../types';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    driver?: Driver | null;
    vehicle?: Vehicle | null;
    onComplete?: (orderId: string) => Promise<void>;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order, driver, vehicle, onComplete }) => {
    const [completing, setCompleting] = useState(false);

    if (!isOpen || !order) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Белгісіз';
        return new Date(dateString).toLocaleString('kk-KZ', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatSimpleDate = (dateString?: string) => {
        if (!dateString) return 'Белгісіз';
        return new Date(dateString).toLocaleDateString('kk-KZ', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const StatusBadge = ({ status }: { status: OrderStatus }) => {
        let colorClass = 'bg-gray-100 text-gray-600';
        if (status === OrderStatus.OnRoute) colorClass = 'bg-blue-100 text-blue-700';
        if (status === OrderStatus.Delivered) colorClass = 'bg-emerald-100 text-emerald-700';
        if (status === OrderStatus.Pending) colorClass = 'bg-amber-100 text-amber-700';

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colorClass}`}>
                {status}
            </span>
        );
    };

    // Financials
    const amount = order.amount || 0;
    const driverFee = order.driver_fee_amount || 0;
    const netIncome = amount - driverFee;
    const feePercentage = order.driver_fee_percentage || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/60 backdrop-blur-sm p-4 md:p-0">
            <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6 bg-slate-50/50 rounded-t-2xl">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">Тапсырыс #{order.id}</h3>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-slate-500">Толық ақпарат және бақылау</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8">

                    {/* Route Timeline */}
                    <div className="flex items-start justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-10"></div>

                        <div className="flex flex-col items-center bg-white px-2 z-10">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center mb-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{order.origin_city}</span>
                            <span className="text-xs text-slate-500 mt-1">{formatDate(order.departure_time)}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold mt-1">Жөнелту</span>
                        </div>

                        <div className="flex flex-col items-center bg-white px-4 z-10">
                            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Жолда
                            </div>
                        </div>

                        <div className="flex flex-col items-center bg-white px-2 z-10">
                            <div className="w-8 h-8 rounded-full bg-stripe-accent/10 border-2 border-stripe-accent flex items-center justify-center mb-2 shadow-sm">
                                <MapPin className="w-4 h-4 text-stripe-accent" />
                            </div>
                            <span className="text-sm font-bold text-slate-900">{order.destination_city}</span>
                            <span className="text-xs text-slate-500 mt-1">{formatDate(order.estimated_arrival_time)}</span>
                            <span className="text-[10px] text-stripe-accent uppercase font-semibold mt-1">Болжалды келу</span>
                        </div>
                    </div>

                    {/* Financial Card */}
                    <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-5 border border-slate-100 shadow-sm">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            Қаржылық есеп
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <span className="text-xs text-slate-400 block mb-1">Жалпы сома</span>
                                <span className="text-lg font-bold text-slate-900">₸{amount.toLocaleString()}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <span className="text-xs text-slate-400 block mb-1">Жүргізуші ({feePercentage}%)</span>
                                <span className="text-lg font-bold text-emerald-600">₸{driverFee.toLocaleString()}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <span className="text-xs text-slate-400 block mb-1">Компания ({100 - feePercentage}%)</span>
                                <span className="text-lg font-bold text-indigo-600">₸{netIncome.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Cargo Info */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-slate-200 transition-colors">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                                <Package className="w-4 h-4 text-slate-500" />
                                Жүк туралы
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Сипаттамасы</span>
                                    <span className="text-sm font-medium text-slate-900">{order.cargo_description}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Салмағы</span>
                                    <span className="text-sm font-medium text-slate-900">{order.cargo_weight_tons} тонна</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Тіркелген күні</span>
                                    <span className="text-sm font-medium text-slate-900">{formatSimpleDate(order.order_date)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Driver & Vehicle */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-slate-200 transition-colors">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                                <ShieldCheck className="w-4 h-4 text-slate-500" />
                                Орындаушылар
                            </h4>
                            <div className="space-y-4">
                                {/* Driver */}
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <div className="p-2 bg-indigo-50 rounded-full text-stripe-accent">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-semibold uppercase block">Жүргізуші</span>
                                        {driver ? (
                                            <>
                                                <div className="text-sm font-bold text-slate-900">{driver.full_name}</div>
                                                <div className="text-xs text-slate-500">{driver.phone_number} • {driver.license_category}</div>
                                            </>
                                        ) : (
                                            <span className="text-sm text-rose-500 italic">Тағайындалмаған</span>
                                        )}
                                    </div>
                                </div>

                                {/* Vehicle */}
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <div className="p-2 bg-indigo-50 rounded-full text-stripe-accent">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-semibold uppercase block">Көлік</span>
                                        {vehicle ? (
                                            <>
                                                <div className="text-sm font-bold text-slate-900">{vehicle.license_plate}</div>
                                                <div className="text-xs text-slate-500">{vehicle.brand_model} • {vehicle.capacity_tons}т</div>
                                            </>
                                        ) : (
                                            <span className="text-sm text-rose-500 italic">Тағайындалмаған</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-8 py-5 rounded-b-2xl flex justify-end gap-3 border-t border-slate-100">
                    <button className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                        Чек жүктеу
                    </button>

                    {/* Complete Order Button - only for OnRoute orders */}
                    {order.status === OrderStatus.OnRoute && onComplete && (
                        <button
                            onClick={async () => {
                                setCompleting(true);
                                try {
                                    await onComplete(order.id);
                                    onClose();
                                } catch (e) {
                                    console.error("Error completing order", e);
                                    alert("Тапсырысты аяқтау мүмкін болмады");
                                } finally {
                                    setCompleting(false);
                                }
                            }}
                            disabled={completing}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold text-white transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-70"
                        >
                            {completing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Аяқталуда...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Тапсырысты аяқтау
                                </>
                            )}
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-stripe-accent rounded-lg text-sm font-semibold text-white hover:bg-stripe-accentHover transition-colors shadow-lg shadow-indigo-200"
                    >
                        Жабу
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
