
import { createClient } from '@supabase/supabase-js';
import { Order, Driver, Vehicle, Profile } from '../types';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hgibpsbdnjtqtmpyjjru.supabase.co';
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnaWJwc2Jkbmp0cXRtcHlqanJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4ODU3ODcsImV4cCI6MjA4MDQ2MTc4N30.VZHKudSXKJrj7SQNy07PMM6kIlE0Wt1wE2gl9tHyrHw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Auth & Profiles ---

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// Clean Sign Up - metadata only passes info, trigger handles the rest
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        // We DO NOT hardcode role here. 
        // The database Trigger will decide if it's admin or operator.
      }
    }
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Helper to clean up role string
const sanitizeProfile = (profile: any): Profile => {
  if (profile && profile.role) {
    profile.role = profile.role.trim().toLowerCase();
  }
  return profile as Profile;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // If not found, returns null without crashing
    if (error.code !== 'PGRST116') {
      console.error('Profile lookup failed:', error.message);
    }
    return null;
  }

  return sanitizeProfile(data);
};

export const getUserProfileByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Profile lookup by Email failed:', error.message);
    }
    return null;
  }

  return sanitizeProfile(data);
};

export const fetchProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data?.map(sanitizeProfile) as Profile[];
};

export const createProfileEntry = async (profile: Profile) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select();

  if (error) throw error;
  return data?.[0] as Profile;
};

export const deleteProfileEntry = async (id: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// --- Existing Data Functions ---

export const fetchOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('order_date', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data as Order[];
};

export const fetchDrivers = async () => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
  return data as Driver[];
};

export const fetchVehicles = async () => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('license_plate', { ascending: true });

  if (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
  return data as Vehicle[];
};

export const createOrder = async (order: Order) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select();

  if (error) throw error;
  return data?.[0] as Order;
};

export const deleteOrder = async (id: string) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const createDriver = async (driver: Driver) => {
  const { data, error } = await supabase
    .from('drivers')
    .insert([driver])
    .select();

  if (error) throw error;
  return data?.[0] as Driver;
};

export const createVehicle = async (vehicle: Vehicle) => {
  const { data, error } = await supabase
    .from('vehicles')
    .insert([vehicle])
    .select();

  if (error) throw error;
  return data?.[0] as Vehicle;
};

export const updateDriverStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from('drivers')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
};

export const updateVehicleStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from('vehicles')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
};

export const updateOrder = async (id: string, updates: Partial<Order>) => {
  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const completeOrder = async (id: string) => {
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'Жеткізілді',
      completed_date: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
};
