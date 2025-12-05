
import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { Profile, UserRole, Driver, Vehicle, Order } from '../types';
import { signOut, fetchDrivers, fetchVehicles, fetchOrders } from '../services/supabase';
import { useNotifications } from '../contexts/NotificationContext';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  userProfile: Profile | null;
  onLogout: () => void;
}

interface SearchResult {
  type: 'driver' | 'vehicle' | 'order';
  id: string;
  title: string;
  subtitle: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, userProfile, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [allData, setAllData] = useState<{ drivers: Driver[], vehicles: Vehicle[], orders: Order[] }>({
    drivers: [], vehicles: [], orders: []
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  // Load data for search
  useEffect(() => {
    const loadData = async () => {
      try {
        const [drivers, vehicles, orders] = await Promise.all([
          fetchDrivers(),
          fetchVehicles(),
          fetchOrders()
        ]);
        setAllData({ drivers, vehicles, orders });
      } catch (e) {
        console.error('Failed to load search data', e);
      }
    };
    loadData();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search drivers
    allData.drivers.forEach(d => {
      if (d.full_name.toLowerCase().includes(query) || d.phone_number?.includes(query)) {
        results.push({ type: 'driver', id: d.id, title: d.full_name, subtitle: d.phone_number || '' });
      }
    });

    // Search vehicles
    allData.vehicles.forEach(v => {
      if (v.license_plate.toLowerCase().includes(query) || v.brand_model?.toLowerCase().includes(query)) {
        results.push({ type: 'vehicle', id: v.id, title: v.license_plate, subtitle: v.brand_model || '' });
      }
    });

    // Search orders
    allData.orders.forEach(o => {
      if (o.id.toLowerCase().includes(query) || o.cargo_description?.toLowerCase().includes(query) ||
        o.origin_city?.toLowerCase().includes(query) || o.destination_city?.toLowerCase().includes(query)) {
        results.push({ type: 'order', id: o.id, title: `#${o.id}`, subtitle: `${o.origin_city} → ${o.destination_city}` });
      }
    });

    setSearchResults(results.slice(0, 10));
    setSearchOpen(results.length > 0);
  }, [searchQuery, allData]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery('');
    if (result.type === 'driver') onNavigate('drivers');
    else if (result.type === 'vehicle') onNavigate('vehicles');
    else if (result.type === 'order') onNavigate('orders');
  };

  const navigation = [
    { id: 'dashboard', name: 'Бақылау тақтасы', icon: LayoutDashboard },
    { id: 'orders', name: 'Тапсырыстар', icon: Package },
    { id: 'drivers', name: 'Жүргізушілер', icon: Users },
    { id: 'vehicles', name: 'Көліктер', icon: Truck },
    { id: 'settings', name: 'Баптаулар', icon: Settings },
  ];

  const handleNavigation = (id: string) => {
    onNavigate(id);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LM';
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Жаңа ғана';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин бұрын`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} сағ бұрын`;
    return `${Math.floor(seconds / 86400)} күн бұрын`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'driver': return <Users className="w-4 h-4 text-blue-500" />;
      case 'vehicle': return <Truck className="w-4 h-4 text-emerald-500" />;
      case 'order': return <Package className="w-4 h-4 text-purple-500" />;
      case 'user': return <User className="w-4 h-4 text-indigo-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F6F8FA] font-sans">
      <div className="flex-1 flex overflow-hidden relative">

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Sidebar */}
        <div className={`absolute lg:static inset-y-0 left-0 z-40 w-64 bg-[#F7F9FC] border-r border-slate-200/60 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-20 px-5 flex items-center border-b border-slate-200/50">
            <button className="flex items-center gap-3 w-full hover:bg-white p-2 rounded-xl transition-all duration-200 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#7c74ff] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Truck className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[15px] font-bold text-slate-800 tracking-tight leading-none">
                  Logistic<span className="text-[#635BFF]">Myrza</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                  {userProfile?.role === UserRole.Admin ? 'Admin Panel' : 'Operator Panel'}
                </span>
              </div>
            </button>
            <button className="ml-2 lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Негізгі мәзір</div>
            {navigation.map((item) => {
              const isCurrent = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${isCurrent ? 'bg-white text-stripe-accent shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors ${isCurrent ? 'text-stripe-accent' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200/50 bg-[#F7F9FC]">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-100 shadow-sm mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                {getInitials(userProfile?.full_name || '')}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-slate-700 truncate">{userProfile?.full_name || 'Қолданушы'}</span>
                <span className={`text-xs font-bold truncate capitalize ${userProfile?.role === UserRole.Admin ? 'text-purple-600' : 'text-blue-500'}`}>
                  {userProfile?.role === UserRole.Admin ? 'Administrator' : 'Operator'}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Жүйеден шығу
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative flex flex-col bg-[#F6F8FA]">
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-gradient-to-tr from-[#fbbf24]/20 via-[#fca5a5]/15 to-transparent rounded-full blur-[100px] opacity-80 mix-blend-multiply"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-tl from-[#8b5cf6]/20 via-[#c084fc]/15 to-transparent rounded-full blur-[120px] opacity-80 mix-blend-multiply"></div>
          </div>

          {/* Header */}
          <header className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between bg-[#F6F8FA]/80 backdrop-blur-sm">
            <div className="flex items-center gap-4 flex-1">
              <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>

              {/* Search */}
              <div ref={searchRef} className="relative w-full max-w-md hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Жылдам іздеу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border-0 rounded-lg leading-5 bg-white shadow-sm ring-1 ring-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-stripe-accent sm:text-sm"
                />

                {/* Search Results Dropdown */}
                {searchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 overflow-hidden z-50">
                    <div className="p-2 text-xs font-semibold text-slate-400 uppercase border-b">Нәтижелер ({searchResults.length})</div>
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          {result.type === 'driver' && <Users className="w-4 h-4 text-blue-500" />}
                          {result.type === 'vehicle' && <Truck className="w-4 h-4 text-emerald-500" />}
                          {result.type === 'order' && <Package className="w-4 h-4 text-purple-500" />}
                          <div>
                            <div className="text-sm font-medium text-slate-900">{result.title}</div>
                            <div className="text-xs text-slate-500">{result.subtitle}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors bg-white rounded-full shadow-sm ring-1 ring-slate-200 hover:ring-slate-300"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 overflow-hidden z-50">
                  <div className="p-3 border-b flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Хабарламалар</span>
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-stripe-accent hover:underline flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" /> Барлығын оқу
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-xs text-slate-400 hover:text-rose-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">Хабарламалар жоқ</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-900">{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(notif.timestamp)}</p>
                            </div>
                            {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="flex-1 px-6 pb-8 relative z-10">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

