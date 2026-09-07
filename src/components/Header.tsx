import React, { useState } from 'react';
import {
  Bell,
  Search,
  User,
  Shield,
  Briefcase,
  CheckCircle,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface Props {
  activeView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuthModal: () => void;
  onOpenNotifications: () => void;
}

export function Header({ activeView, onNavigate, onOpenAuthModal, onOpenNotifications }: Props) {
  const { user, switchRole, logout, unreadNotificationsCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Demo Banner & Quick Role Switcher */}
      <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-semibold text-[11px] sm:text-xs">
              نموذج العرض التجريبي المتكامل • السوق المصري
            </span>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <span className="hidden md:inline-block text-amber-400/90 text-[11px]">
              التبديل الفوري بين الحسابات للاختبار:
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              id="switch-to-customer"
              type="button"
              onClick={() => switchRole('customer')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                user?.role === 'customer'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>👤</span>
              <span>عميل (سارة)</span>
            </button>

            <button
              id="switch-to-provider"
              type="button"
              onClick={() => switchRole('provider')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                user?.role === 'provider'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🛠️</span>
              <span>فني (محمود)</span>
            </button>

            <button
              id="switch-to-admin"
              type="button"
              onClick={() => switchRole('admin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                user?.role === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>⚙️</span>
              <span>الإدارة (أحمد)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 text-right focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl text-slate-900 tracking-tight block leading-tight">
                    سوق الخدمات <span className="text-amber-600">المصرية</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300/60 leading-none">
                    مصر
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                  شبكة الفنيين والحرفيين المعتمدين
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeView === 'home'
                    ? 'text-amber-700 bg-amber-50 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                الرئيسية
              </button>

              <button
                type="button"
                onClick={() => onNavigate('providers')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeView === 'providers'
                    ? 'text-amber-700 bg-amber-50 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                دليل الفنيين
              </button>

              {user?.role === 'customer' && (
                <button
                  type="button"
                  onClick={() => onNavigate('customer-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeView === 'customer-dashboard'
                      ? 'text-amber-700 bg-amber-50 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  حجوزاتي وطلباتي
                </button>
              )}

              {user?.role === 'provider' && (
                <button
                  type="button"
                  onClick={() => onNavigate('provider-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    activeView === 'provider-dashboard'
                      ? 'text-amber-700 bg-amber-50 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  <span>لوحة الفني</span>
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    activeView === 'admin-dashboard'
                      ? 'text-amber-700 bg-amber-50 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>لوحة الإدارة</span>
                </button>
              )}
            </nav>
          </div>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button for quick exploration */}
            <button
              type="button"
              onClick={() => onNavigate('providers')}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="بحث عن خدمة أو فني"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Bell */}
            <button
              id="notifications-bell-btn"
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* User Profile info */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  </div>
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-extrabold text-slate-900 leading-tight truncate max-w-[130px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-amber-700 font-bold">
                      {user.role === 'customer' && 'عميل مسجل'}
                      {user.role === 'provider' && 'فني معتمد'}
                      {user.role === 'admin' && 'مدير المنصة'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {roleDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right"
                    onClick={() => setRoleDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-extrabold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                          {user.role === 'customer' ? 'حساب عميل' : user.role === 'provider' ? 'حساب فني' : 'حساب إدارة'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium dir-ltr">
                          {user.phone}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {user.role === 'customer' && (
                        <button
                          type="button"
                          onClick={() => onNavigate('customer-dashboard')}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            <span>حجوزاتي ومتابعة الطلبات</span>
                          </span>
                        </button>
                      )}

                      {user.role === 'provider' && (
                        <button
                          type="button"
                          onClick={() => onNavigate('provider-dashboard')}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-amber-600" />
                            <span>لوحة تحكم الفني</span>
                          </span>
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => onNavigate('admin-dashboard')}
                          className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-600" />
                            <span>لوحة الإدارة الشاملة</span>
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full text-right px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>تسجيل الخروج</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-sm transition-colors"
              >
                تسجيل الدخول
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 py-3 px-1 space-y-1 bg-white animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'home' ? 'bg-amber-50 text-amber-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              الرئيسية
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('providers');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'providers' ? 'bg-amber-50 text-amber-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              دليل الفنيين ومقدمي الخدمات
            </button>

            {user?.role === 'customer' && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('customer-dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'customer-dashboard' ? 'bg-amber-50 text-amber-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                حجوزاتي وطلباتي
              </button>
            )}

            {user?.role === 'provider' && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('provider-dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeView === 'provider-dashboard' ? 'bg-amber-50 text-amber-900' : 'text-amber-700 hover:bg-amber-50/50'
                }`}
              >
                <span>لوحة تحكم الفني</span>
                <Briefcase className="w-4 h-4 text-amber-600" />
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeView === 'admin-dashboard' ? 'bg-indigo-50 text-indigo-900' : 'text-indigo-700 hover:bg-indigo-50/50'
                }`}
              >
                <span>لوحة الإدارة العامة</span>
                <Shield className="w-4 h-4 text-indigo-600" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
