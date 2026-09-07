import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Customer, Provider, AppNotification } from '../types.js';
import { api, setApiUser } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  provider: Provider | null;
  isLoading: boolean;
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load initial user session or default to demo customer
  useEffect(() => {
    const savedUserId = localStorage.getItem('egypt_marketplace_user_id') || 'usr_customer1';
    setApiUser(savedUserId);

    api.getMe()
      .then(res => {
        setUser(res.user);
        setCustomer(res.customer);
        setProvider(res.provider);
        setApiUser(res.user.id);
        localStorage.setItem('egypt_marketplace_user_id', res.user.id);
      })
      .catch(() => {
        // Fallback to customer switch
        api.quickSwitch('customer').then(res => {
          setUser(res.user);
          setCustomer(res.customer);
          setProvider(res.provider);
          setApiUser(res.user.id);
          localStorage.setItem('egypt_marketplace_user_id', res.user.id);
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
      localStorage.setItem('egypt_marketplace_user_id', res.user.id);
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
      localStorage.setItem('egypt_marketplace_user_id', res.user.id);
      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCustomer(null);
    setProvider(null);
    setNotifications([]);
    setApiUser(null);
    localStorage.removeItem('egypt_marketplace_user_id');
  };

  const switchRole = async (role: 'customer' | 'provider' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.quickSwitch(role);
      setUser(res.user);
      setCustomer(res.customer);
      setProvider(res.provider);
      setApiUser(res.user.id);
      localStorage.setItem('egypt_marketplace_user_id', res.user.id);
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
