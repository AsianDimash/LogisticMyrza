
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import OrdersPage from './components/OrdersPage';
import DriversPage from './components/DriversPage';
import VehiclesPage from './components/VehiclesPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import { supabase, getUserProfile } from './services/supabase';
import { Profile, UserRole } from './types';
import { Loader2 } from 'lucide-react';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const fetchProfile = async (user: any) => {
    try {
      // 1. Database-тен профильді жүктейміз
      const profile = await getUserProfile(user.id);

      if (profile) {
        setUserProfile(profile);
      } else {
        // 2. Егер SQL Trigger кешігіп жатса, уақытша Auth деректерін көрсетеміз
        // Бірақ рөлді "Operator" деп болжаймыз (қауіпсіздік үшін)
        console.warn("Профиль табылмады, уақытша деректер қолданылуда.");
        setUserProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || 'User',
          email: user.email,
          role: UserRole.Operator,
          created_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Профиль жүктеу қатесі:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Сессияны тексеру
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setLoading(false);
        return;
      }

      const currentSession = data?.session;
      setSession(currentSession);

      if (currentSession?.user) {
        fetchProfile(currentSession.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Auth өзгерістерін тыңдау
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Password recovery event
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setLoading(false);
        return;
      }

      setSession(session);
      if (session?.user) {
        if (event === 'SIGNED_IN') setLoading(true);
        fetchProfile(session.user);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <OrdersPage />;
      case 'drivers':
        return <DriversPage />;
      case 'vehicles':
        return <VehiclesPage />;
      case 'settings':
        // Барлық қолданушыларға рұқсат береміз, бірақ ішінде функционал шектеледі
        return <SettingsPage currentUserRole={userProfile?.role} />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F6F8FA] flex-col gap-3">
        <Loader2 className="w-10 h-10 text-stripe-accent animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Жүйе жүктелуде...</p>
      </div>
    );
  }

  // Password Recovery mode
  if (isPasswordRecovery) {
    return (
      <ResetPasswordPage
        onComplete={() => {
          setIsPasswordRecovery(false);
          window.location.href = '/';
        }}
      />
    );
  }

  if (!session) {
    return <LoginPage onLoginSuccess={() => { }} />;
  }

  return (
    <NotificationProvider>
      <Layout
        activePage={currentPage}
        onNavigate={setCurrentPage}
        userProfile={userProfile}
        onLogout={() => {
          setSession(null);
          setUserProfile(null);
          window.location.reload();
        }}
      >
        {renderPage()}
      </Layout>
    </NotificationProvider>
  );
}

export default App;
