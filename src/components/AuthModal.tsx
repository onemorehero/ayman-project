import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Mail, Phone, Lock, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import type { Category, Location } from '../types.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'customer' | 'provider';
}

export function AuthModal({ isOpen, onClose, defaultRole = 'customer' }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'customer' | 'provider'>(defaultRole);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [address, setAddress] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getCategories().then(setCategories).catch(() => {});
      api.getLocations().then(setLocations).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول، تحقق من البيانات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        name,
        email,
        phone,
        role,
        password,
        businessName: role === 'provider' ? businessName : undefined,
        bio: role === 'provider' ? bio : undefined,
        categoryIds: role === 'provider' ? selectedCategoryIds : undefined,
        areaIds: selectedAreaIds,
        experienceYears: role === 'provider' ? experienceYears : undefined,
        address
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              خ
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 leading-tight">
                {tab === 'login' ? 'تسجيل الدخول إلى خلصلى' : 'إنشاء حساب جديد في خلصلى'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                منصة الخدمات المصغرة والصيانة المنزلية بدون أي عمولة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 bg-slate-100/70 p-1.5 mx-5 mt-4 rounded-2xl">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              tab === 'login' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              tab === 'register' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            حساب جديد (تسجيل أول مرة)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="customer@demo.com"
                    className="w-full h-12 pl-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Demo Accounts Quick Login */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-right space-y-1.5 text-xs text-slate-700">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>حسابات تجريبية سريعة:</span>
                </p>
                <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                  <span
                    onClick={() => { setEmail('customer@demo.com'); setPassword('123456'); }}
                    className="cursor-pointer hover:text-emerald-700 font-medium"
                  >
                    👤 عميل: <strong>customer@demo.com</strong>
                  </span>
                  <span
                    onClick={() => { setEmail('provider@demo.com'); setPassword('123456'); }}
                    className="cursor-pointer hover:text-emerald-700 font-medium"
                  >
                    🛠️ فني: <strong>provider@demo.com</strong>
                  </span>
                  <span
                    onClick={() => { setEmail('admin@demo.com'); setPassword('123456'); }}
                    className="cursor-pointer hover:text-emerald-700 font-medium"
                  >
                    ⚙️ إدارة: <strong>admin@demo.com</strong>
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {submitting ? 'جاري التحقق...' : 'دخول إلى الحساب'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      role === 'customer'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>أنا عميل (أطلب خدمات)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      role === 'provider'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>أنا فني / حرفي</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="محمد أحمد علي"
                  className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01012345678"
                    dir="ltr"
                    className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                />
              </div>

              {role === 'provider' && (
                <>
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-bold text-emerald-800 mb-2">بيانات النشاط المهني للفني</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم النشاط أو الورشة</label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={e => setBusinessName(e.target.value)}
                          placeholder="مثال: فني تكييفات وتبريد المهندسين"
                          className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">التخصص الرئيسي</label>
                        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
                          {categories.map(cat => (
                            <label
                              key={cat.id}
                              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategoryIds.includes(cat.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedCategoryIds(prev => [...prev, cat.id]);
                                  } else {
                                    setSelectedCategoryIds(prev => prev.filter(id => id !== cat.id));
                                  }
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="font-medium text-slate-800">{cat.nameAr}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">مناطق الخدمة التي تغطيها</label>
                        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
                          {locations.map(loc => (
                            <label
                              key={loc.id}
                              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAreaIds.includes(loc.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedAreaIds(prev => [...prev, loc.id]);
                                  } else {
                                    setSelectedAreaIds(prev => prev.filter(id => id !== loc.id));
                                  }
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="font-medium text-slate-800">{loc.nameAr}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">سنوات الخبرة</label>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={experienceYears}
                          onChange={e => setExperienceYears(Number(e.target.value))}
                          className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">نبذة عن خبرتك</label>
                        <textarea
                          rows={2}
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          placeholder="اكتب نبذة مختصرة عن مهاراتك وسرعة استجابتك..."
                          className="w-full p-3 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium transition-all outline-none text-right resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {role === 'customer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">العنوان أو الحي</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="مثال: المعادي - شارع النصر"
                    className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {submitting ? 'جاري التسجيل...' : 'تسجيل حساب جديد فوراً'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
