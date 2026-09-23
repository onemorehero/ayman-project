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
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Logo } from './Logo.js';
import { UserAvatar } from './UserAvatar.js';

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
  const { user, logout, unreadNotificationsCount, triggerTour } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenTour = () => {
    if (triggerTour) {
      triggerTour();
    } else {
      onOpenOnboarding();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'provider':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">فني</span>;
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-md">إدارة</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-md">عميل</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      {/* Top Bar - 100% Free Guarantee */}
      <div className="bg-slate-950 text-slate-100 text-xs py-2 px-4 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="font-bold text-[11px] sm:text-xs">
              منصة خلصلى · خدمات مصغرة فورية ومجانية 100% بدون أي وسيط أو عمولة
            </span>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>نظام الإطلاق الفعلي والإنتاج</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Brand Logo & Desktop Nav */}
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
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

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guide Tour */}
            <button
              type="button"
              onClick={handleOpenTour}
              className="h-10 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              title="دليل الاستخدام"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">دليل الاستخدام</span>
            </button>

            {/* Notifications */}
            {user && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
                aria-label="الإشعارات"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}
              </button>
            )}

            {/* Auth Profile & Real Logout */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (user.role === 'customer') onNavigate('customer-dashboard');
                    else if (user.role === 'provider') onNavigate('provider-dashboard');
                    else onNavigate('admin-dashboard');
                  }}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 max-w-[100px] truncate hidden sm:inline">
                      {user.name}
                    </span>
                    <div className="hidden sm:block">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                  <UserAvatar
                    src={user.avatarUrl}
                    name={user.name}
                    className="w-7 h-7 rounded-lg border border-slate-200"
                    iconClassName="w-4 h-4 text-slate-400"
                  />
                </button>

                {/* Real Logout Button */}
                <button
                  type="button"
                  onClick={() => logout()}
                  className="h-10 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 active:scale-95 text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="تسجيل الخروج من الحساب"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                تسجيل الدخول / إنشاء حساب
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-2">
            {user && (
              <div className="px-4 py-2.5 mb-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    src={user.avatarUrl}
                    name={user.name}
                    className="w-9 h-9 rounded-xl border border-slate-200"
                    iconClassName="w-5 h-5 text-slate-400"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>
            )}

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

            {user ? (
              <button
                type="button"
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-2 pt-3"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onOpenAuthModal(); setMobileMenuOpen(false); }}
                className="w-full text-center px-4 py-3 rounded-xl text-xs font-black bg-emerald-600 text-white mt-2"
              >
                تسجيل الدخول / إنشاء حساب
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
