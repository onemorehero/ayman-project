import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Mail, Phone, Lock, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import type { Category, Location } from '../types.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'customer' | 'provider';
}

export function AuthModal({ isOpen, onClose, defaultRole = 'customer' }: Props) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'customer' | 'provider'>(defaultRole);

  // Form fields
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      api.getCategories().then(setCategories).catch(() => {});
      api.getLocations().then(setLocations).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('يرجى كتابة البريد الإلكتروني وكلمة المرور');
      return;
    }

    setSubmitting(true);
    try {
      await login(cleanEmail, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول، يرجى التأكد من صحة البريد وكلمة المرور');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    if (!cleanName) {
      setError('يرجى كتابة الاسم بالكامل');
      return;
    }
    if (!cleanEmail) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if (!cleanPhone) {
      setError('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }
    if (!password || password.length < 6) {
      setError('يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام');
      return;
    }
    if (role === 'provider' && !businessName.trim()) {
      setError('يرجى كتابة اسم النشاط أو الورشة أو التخصص المهني');
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role,
        password,
        businessName: role === 'provider' ? businessName.trim() : undefined,
        bio: role === 'provider' ? bio.trim() : undefined,
        categoryIds: role === 'provider' ? selectedCategoryIds : undefined,
        areaIds: selectedAreaIds,
        experienceYears: role === 'provider' ? Number(experienceYears) : undefined,
        address: role === 'customer' ? address.trim() : undefined
      });
      setSuccessMsg('تم إنشاء الحساب بنجاح! جاري توجيهك...');
      setTimeout(() => {
        onClose();
      }, 700);
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
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              خ
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 leading-tight">
                {tab === 'login' ? 'تسجيل الدخول إلى حسابك' : 'إنشاء حساب جديد في منصة خلصلى'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                خدمات مصغرة وصيانة منزلية مباشرة ومجانية 100% بدون أي وسيط
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 bg-slate-100/70 p-1.5 mx-5 mt-4 rounded-2xl">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              tab === 'login' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              tab === 'register' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
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
                    placeholder="name@example.com"
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
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>جاري تسجيل الدخول...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>دخول إلى الحساب</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تحديد نوع الحساب</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'customer'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>عميل (طلب خدمات)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'provider'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>فني / مقدم خدمة</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="مثال: أحمد محمد مصطفى"
                    className="w-full h-12 pl-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-12 pl-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف (للتواصل)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="01012345678"
                      dir="ltr"
                      className="w-full h-12 pl-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور (6 خانات أو أكثر)</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Provider-specific fields */}
              {role === 'provider' && (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <p className="text-xs font-black text-emerald-800">بيانات النشاط المهني للفني:</p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم النشاط أو الورشة</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="مثال: العالمية لأعمال السباكة وكشف التسريبات"
                      className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 text-slate-900 text-xs font-semibold outline-none text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">سنوات الخبرة</label>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      value={experienceYears}
                      onChange={e => setExperienceYears(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 text-slate-900 text-xs font-semibold outline-none text-right"
                    />
                  </div>

                  {categories.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">التخصصات والأقسام الرئيسية</label>
                      <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 bg-white border border-slate-200 rounded-xl">
                        {categories.map(cat => (
                          <label
                            key={cat.id}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
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
                            <span className="font-semibold text-slate-800">{cat.nameAr}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نبذة عن خبراتك وخدماتك</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="اكتب نبذة مختصرة عن مهاراتك الفنية وسرعة استجابتك للعملاء..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 text-slate-900 text-xs font-medium outline-none text-right resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Customer-specific field */}
              {role === 'customer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">المنطقة أو العنوان التقريبي</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="مثال: القاهرة - المعادي / الجيزة - الدقي"
                    className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب والبدء الآن'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
