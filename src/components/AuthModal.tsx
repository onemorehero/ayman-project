import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Mail, Phone, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {tab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h3>
            <p className="text-xs text-slate-500">
              سوق الخدمات المصرية - الحرفيين ومقدمي الخدمات
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="مثال: customer@demo.com"
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-right"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-right"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">لحسابات العرض التجريبية يمكنك استخدام أي كلمة مرور أو 123456</p>
              </div>

              {/* Demo Accounts Helper Card */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 text-right space-y-1.5 text-xs text-slate-700">
                <p className="font-bold text-amber-900">حسابات تجريبية جاهزة للاختبار:</p>
                <div className="flex flex-col gap-1 text-[11px]">
                  <span
                    onClick={() => { setEmail('customer@demo.com'); setPassword('123456'); }}
                    className="cursor-pointer hover:text-amber-800 underline"
                  >
                    👤 عميل: <strong>customer@demo.com</strong> (سارة أحمد)
                  </span>
                  <span
                    onClick={() => { setEmail('provider@demo.com'); setPassword('123456'); }}
                    className="cursor-pointer hover:text-amber-800 underline"
                  >
                    🛠️ فني: <strong>provider@demo.com</strong> (الأسطى محمود)
                  </span>
                  <span
                    onClick={() => { setEmail('admin@demo.com'); setPassword('123456'); }}
                    className="cursor-pointer hover:text-amber-800 underline"
                  >
                    ⚙️ إدارة: <strong>admin@demo.com</strong> (أحمد زهران)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
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
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'customer'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>أنا عميل (أبحث عن خدمات)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'provider'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>أنا فني / مقدم خدمة</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: محمد السيد إبراهيم"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (مصر)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
                />
              </div>

              {role === 'provider' && (
                <>
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-xs font-bold text-amber-700 mb-2">بيانات النشاط المهني للفني</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">اسم النشاط أو الورشة</label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={e => setBusinessName(e.target.value)}
                          placeholder="مثال: الأسطى محمد لأعمال السباكة"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">التخصص الرئيسي (التصنيف)</label>
                        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-slate-200 rounded-xl">
                          {categories.map(cat => (
                            <label
                              key={cat.id}
                              className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs"
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
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span>{cat.nameAr}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">مناطق الخدمة التي تغطيها</label>
                        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-slate-200 rounded-xl">
                          {locations.map(loc => (
                            <label
                              key={loc.id}
                              className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs"
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
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span>{loc.nameAr}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">سنوات الخبرة</label>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={experienceYears}
                          onChange={e => setExperienceYears(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">نبذة عن خبرتك وخدماتك</label>
                        <textarea
                          rows={2}
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          placeholder="اكتب نبذة مختصرة عن مهاراتك وسرعة استجابتك وأجهزة الفحص المستخدمة..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {role === 'customer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">العنوان أو المنطقة المفضلة</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="مثال: الدقي - شارع مصدق"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
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
