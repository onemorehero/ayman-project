import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Customer, Provider, AppNotification } from '../types.js';
import { api, setApiUser } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  provider: Provider | null;
  isLoading: boolean;
  isFirstLogin: boolean;
  dismissTour: () => void;
  triggerTour: () => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  login: (email: string, password?: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'customer' | 'provider' | 'admin') => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load initial user session or default to demo customer
  useEffect(() => {
    const savedUserId = localStorage.getItem('khalasly_user_id') || localStorage.getItem('egypt_marketplace_user_id') || 'usr_customer1';
    setApiUser(savedUserId);

    api.getMe()
      .then(res => {
        setUser(res.user);
        setCustomer(res.customer);
        setProvider(res.provider);
        setApiUser(res.user.id);
        localStorage.setItem('khalasly_user_id', res.user.id);

        // Check if user has an uncompleted first-registration tour
        const isPendingTour = localStorage.getItem('khalasly_tour_pending_' + res.user.id);
        const isDismissed = localStorage.getItem('khalasly_tour_completed_' + res.user.id);
        if (isPendingTour === 'true' && !isDismissed) {
          setIsFirstLogin(true);
        }
      })
      .catch(() => {
        // Fallback to customer switch
        api.quickSwitch('customer').then(res => {
          setUser(res.user);
          setCustomer(res.customer);
          setProvider(res.provider);
          setApiUser(res.user.id);
          localStorage.setItem('khalasly_user_id', res.user.id);
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const list = await api.getNotifications(user.id);
      setNotifications(list);
    } catch {
      // ignore
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getMe();
      setUser(res.user);
      setCustomer(res.customer);
      setProvider(res.provider);
    } catch {
      // ignore
    }
  }, [user]);

  // Periodic notification check every 15s
  useEffect(() => {
    if (!user) return;
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 15000);
    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setCustomer(res.customer);
      setProvider(res.provider);
      setApiUser(res.user.id);
      localStorage.setItem('khalasly_user_id', res.user.id);

      // Only show tour if they had registered and not completed it
      const isPendingTour = localStorage.getItem('khalasly_tour_pending_' + res.user.id);
      const isDismissed = localStorage.getItem('khalasly_tour_completed_' + res.user.id);
      if (isPendingTour === 'true' && !isDismissed) {
        setIsFirstLogin(true);
      } else {
        setIsFirstLogin(false);
      }

      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setCustomer(res.customer);
      setProvider(res.provider);
      setApiUser(res.user.id);
      localStorage.setItem('khalasly_user_id', res.user.id);

      // Mark this user as newly registered to trigger role-based tour strictly on first signup
      setIsFirstLogin(true);
      localStorage.setItem('khalasly_tour_pending_' + res.user.id, 'true');

      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const dismissTour = () => {
    setIsFirstLogin(false);
    if (user?.id) {
      localStorage.removeItem('khalasly_tour_pending_' + user.id);
      localStorage.setItem('khalasly_tour_completed_' + user.id, 'true');
    }
  };

  const triggerTour = () => {
    setIsFirstLogin(true);
  };

  const logout = () => {
    setUser(null);
    setCustomer(null);
    setProvider(null);
    setNotifications([]);
    setIsFirstLogin(false);
    setApiUser(null);
    localStorage.removeItem('khalasly_user_id');
  };

  const switchRole = async (role: 'customer' | 'provider' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.quickSwitch(role);
      setUser(res.user);
      setCustomer(res.customer);
      setProvider(res.provider);
      setApiUser(res.user.id);
      localStorage.setItem('khalasly_user_id', res.user.id);
      const notifs = await api.getNotifications(res.user.id);
      setNotifications(notifs);
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      // ignore
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    try {
      await api.markAllNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        provider,
        isLoading,
        isFirstLogin,
        dismissTour,
        triggerTour,
        notifications,
        unreadNotificationsCount,
        login,
        register,
        logout,
        switchRole,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
