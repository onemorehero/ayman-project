import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User, Customer, Provider, AppNotification } from '../types.js';
import { api, setApiUser, supabase } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  provider: Provider | null;
  session: Session | null;
  isLoading: boolean;
  isFirstLogin: boolean;
  dismissTour: () => void;
  triggerTour: () => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  login: (email: string, password?: string) => Promise<void>;
  signup: (payload: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadUserProfile = useCallback(async (userId: string, email?: string) => {
    try {
      setApiUser(userId);
      const res = await api.getMe(userId);
      setUser(res.user);
      setCustomer(res.customer);
      setProvider(res.provider);
      localStorage.setItem('khalasly_user_id', res.user.id);
      return res;
    } catch (err) {
      if (email) {
        try {
          const res = await api.login(email);
          setUser(res.user);
          setCustomer(res.customer);
          setProvider(res.provider);
          localStorage.setItem('khalasly_user_id', res.user.id);
          return res;
        } catch {
          // ignore
        }
      }
      return null;
    }
  }, []);

  // Initialize real session from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session && isMounted) {
            setSession(data.session);
            if (data.session.user) {
              await loadUserProfile(data.session.user.id, data.session.user.email);
            }
          }
        }

        // If no active Supabase Auth session, check saved user id
        if (!user) {
          const savedUserId = localStorage.getItem('khalasly_user_id');
          if (savedUserId && isMounted) {
            await loadUserProfile(savedUserId);
          }
        }
      } catch (err) {
        console.warn('Session init warning:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Listen to Supabase Auth state changes
    let authSubscription: { unsubscribe: () => void } | null = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await loadUserProfile(newSession.user.id, newSession.user.email);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCustomer(null);
          setProvider(null);
          setNotifications([]);
          setApiUser(null);
          localStorage.removeItem('khalasly_user_id');
        }
      });
      authSubscription = data.subscription;
    }

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, [loadUserProfile]);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
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
      const res = await api.getMe(user.id);
      setUser(res.user);
      setCustomer(res.customer);
      setProvider(res.provider);
    } catch {
      // ignore
    }
  }, [user]);

  // Periodic notification check every 20s
  useEffect(() => {
    if (!user) return;
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 20000);
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

      // Check for first login tour
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

  const signup = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setCustomer(res.customer);
      setProvider(res.provider);
      setApiUser(res.user.id);
      localStorage.setItem('khalasly_user_id', res.user.id);

      // Mark newly registered user for guided tour
      setIsFirstLogin(true);
      localStorage.setItem('khalasly_tour_pending_' + res.user.id, 'true');

      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const register = signup;

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

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      setUser(null);
      setCustomer(null);
      setProvider(null);
      setSession(null);
      setNotifications([]);
      setIsFirstLogin(false);
      setApiUser(null);
      localStorage.removeItem('khalasly_user_id');
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
        session,
        isLoading,
        isFirstLogin,
        dismissTour,
        triggerTour,
        notifications,
        unreadNotificationsCount,
        login,
        signup,
        register,
        logout,
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
