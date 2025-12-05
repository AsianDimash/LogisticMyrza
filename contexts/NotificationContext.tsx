
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface Notification {
    id: string;
    type: 'driver' | 'vehicle' | 'order' | 'user' | 'password';
    message: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (type: Notification['type'], message: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((type: Notification['type'], message: string) => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            timestamp: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Max 50 notifications
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Supabase Realtime subscriptions
    useEffect(() => {
        // Subscribe to drivers table
        const driversChannel = supabase
            .channel('drivers-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'drivers' }, (payload) => {
                const driver = payload.new as any;
                addNotification('driver', `Жаңа жүргізуші қосылды: ${driver.full_name}`);
            })
            .subscribe();

        // Subscribe to vehicles table
        const vehiclesChannel = supabase
            .channel('vehicles-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vehicles' }, (payload) => {
                const vehicle = payload.new as any;
                addNotification('vehicle', `Жаңа көлік қосылды: ${vehicle.license_plate}`);
            })
            .subscribe();

        // Subscribe to orders table
        const ordersChannel = supabase
            .channel('orders-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                const order = payload.new as any;
                addNotification('order', `Жаңа тапсырыс: ${order.origin_city} → ${order.destination_city}`);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
                const order = payload.new as any;
                if (order.status === 'Жеткізілді') {
                    addNotification('order', `Тапсырыс аяқталды: #${order.id}`);
                }
            })
            .subscribe();

        // Subscribe to profiles (new users)
        const profilesChannel = supabase
            .channel('profiles-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
                const profile = payload.new as any;
                addNotification('user', `Жаңа қолданушы тіркелді: ${profile.full_name}`);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(driversChannel);
            supabase.removeChannel(vehiclesChannel);
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(profilesChannel);
        };
    }, [addNotification]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
