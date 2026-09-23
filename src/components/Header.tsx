import React, { useState } from 'react';
import {
  Bell,
  Search,
  User,
  Shield,
  Briefcase,
  Menu,
  X,
  HelpCircle,
  LogOut,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Logo } from './Logo.js';

interface Props {
  activeView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuthModal: () => void;
  onOpenNotifications: () => void;
  onOpenOnboarding: () => void;
}

export function Header({
  activeView,
  onNavigate,
  onOpenAuthModal,
  onOpenNotifications,
  onOpenOnboarding
}: Props) {
  const { user, switchRole, logout, unreadNotificationsCount, triggerTour } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenTour = () => {
    if (triggerTour) {
      triggerTour();
    } else {
      onOpenOnboarding();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      {/* Top Bar with Demo Switcher & 100% Free Guarantee */}
      <div className="bg-slate-950 text-slate-100 text-xs py-2 px-4 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="font-bold text-[11px] sm:text-xs">
              منصة خلصلى · خدمات مصغرة فورية ومجانية 100% بدون أي وسيط أو عمولة
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 px-2 hidden sm:inline-block font-medium">تجربة الدور:</span>
            <button
              id="switch-to-customer"
              type="button"
              onClick={() => switchRole('customer')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                user?.role === 'customer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              عميل
            </button>

            <button
              id="switch-to-provider"
              type="button"
              onClick={() => switchRole('provider')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                user?.role === 'provider'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              فني
            </button>

            <button
              id="switch-to-admin"
              type="button"
              onClick={() => switchRole('admin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                user?.role === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              الإدارة
            </button>
          </div>
        </div>
      </div>

      {/* Main Minimalist Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Brand - Official Typographic SVG Logo */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center focus:outline-none group cursor-pointer hover:opacity-90 active:scale-95 transition-all"
              aria-label="خلصلى - الصفحة الرئيسية"
            >
              <Logo className="text-emerald-600 h-9 sm:h-10 w-auto" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  activeView === 'home'
                    ? 'text-emerald-700 bg-emerald-50 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                الرئيسية
              </button>

              <button
                type="button"
                onClick={() => onNavigate('providers')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  activeView === 'providers'
                    ? 'text-emerald-700 bg-emerald-50 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                دليل الفنيين
              </button>

              {user?.role === 'customer' && (
                <button
                  type="button"
                  onClick={() => onNavigate('customer-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    activeView === 'customer-dashboard'
                      ? 'text-emerald-700 bg-emerald-50 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  طلباتي
                </button>
              )}

              {user?.role === 'provider' && (
                <button
                  type="button"
                  onClick={() => onNavigate('provider-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    activeView === 'provider-dashboard'
                      ? 'text-emerald-700 bg-emerald-50 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  لوحة تحكم الفني
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    activeView === 'admin-dashboard'
                      ? 'text-emerald-700 bg-emerald-50 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  لوحة الإدارة
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guide Trigger */}
            <button
              type="button"
              onClick={handleOpenTour}
              className="h-10 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
              title="جولة إرشادية سريعة"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">دليل الاستخدام</span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-700 transition-all"
              aria-label="الإشعارات"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
              )}
            </button>

            {/* Auth / Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (user.role === 'customer') onNavigate('customer-dashboard');
                    else if (user.role === 'provider') onNavigate('provider-dashboard');
                    else onNavigate('admin-dashboard');
                  }}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <span className="text-xs font-bold text-slate-900 max-w-[100px] truncate hidden sm:inline">
                    {user.name}
                  </span>
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                  />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20"
              >
                تسجيل الدخول
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-2">
            <button
              type="button"
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-50"
            >
              الرئيسية
            </button>
            <button
              type="button"
              onClick={() => { onNavigate('providers'); setMobileMenuOpen(false); }}
              className="w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-50"
            >
              دليل الفنيين
            </button>
            {user?.role === 'customer' && (
              <button
                type="button"
                onClick={() => { onNavigate('customer-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-50"
              >
                طلباتي
              </button>
            )}
            {user?.role === 'provider' && (
              <button
                type="button"
                onClick={() => { onNavigate('provider-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-50"
              >
                لوحة تحكم الفني
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-50"
              >
                لوحة الإدارة
              </button>
            )}
            <button
              type="button"
              onClick={() => { handleOpenTour(); setMobileMenuOpen(false); }}
              className="w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>دليل الاستخدام (جولة سريعة)</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
