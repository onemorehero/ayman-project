import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Briefcase,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Star,
  RefreshCw,
  Search,
  Sparkles,
  ShieldAlert,
  Zap,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { CategoryIcon } from '../components/CategoryIcon.js';
import type { Category, Service, Location, Provider, Booking, Customer, Review, User, Dispute } from '../types.js';

export function AdminDashboardView() {
  const { user, quickSwitch } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<(Customer & { user?: User })[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'disputes' | 'providers' | 'customers' | 'bookings' | 'reviews' | 'categories' | 'services' | 'locations'>('overview');

  // New Category Form
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Wrench');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Service Form
  const [newServiceNameAr, setNewServiceNameAr] = useState('');
  const [newServiceCatId, setNewServiceCatId] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // New Location Form
  const [newLocNameAr, setNewLocNameAr] = useState('');
  const [newLocGov, setNewLocGov] = useState('الجيزة');

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [st, cats, srvs, locs, provs, bks, custs, revs, disps] = await Promise.all([
        api.getAdminStats(),
        api.getCategories(),
        api.getServices(),
        api.getLocations(),
        api.getProviders({}),
        api.getBookings({}),
        api.getCustomers().catch(() => []),
        api.getReviews().catch(() => []),
        api.getDisputes().catch(() => [])
      ]);
      setStats(st);
      setCategories(cats);
      setServices(srvs);
      setLocations(locs);
      setProviders(provs);
      setBookings(bks);
      setCustomers(custs);
      setReviews(revs);
      setDisputes(disps);
      if (cats.length > 0 && !newServiceCatId) {
        setNewServiceCatId(cats[0].id);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Provider verification toggle
  const handleToggleVerification = async (providerId: string, current: boolean) => {
    try {
      await api.toggleProviderVerified(providerId);
      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, isVerified: !current } : p));
    } catch (err: any) {
      alert(err.message || 'فشل تحديث التوثيق');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      fetchAllAdminData();
    } catch (err: any) {
      alert(err.message || 'فشل حذف التقييم');
    }
  };

  const handleUpdateDispute = async (id: string, status: 'pending' | 'in_review' | 'resolved' | 'dismissed') => {
    try {
      await api.updateDisputeStatus(id, status);
      setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة النزاع');
    }
  };

  // Add category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr.trim()) return;
    try {
      const created = await api.createCategory({
        nameAr: newCatNameAr,
        nameEn: newCatNameEn || newCatNameAr,
        icon: newCatIcon,
        description: newCatDesc
      });
      setCategories(prev => [...prev, created]);
      setNewCatNameAr('');
      setNewCatNameEn('');
      setNewCatDesc('');
    } catch (err: any) {
      alert(err.message || 'فشل إضافة التصنيف');
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'فشل حذف التصنيف');
    }
  };

  // Add Service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceNameAr.trim() || !newServiceCatId) return;
    try {
      const created = await api.createService({
        nameAr: newServiceNameAr,
        categoryId: newServiceCatId,
        description: newServiceDesc
      });
      setServices(prev => [...prev, created]);
      setNewServiceNameAr('');
      setNewServiceDesc('');
    } catch (err: any) {
      alert(err.message || 'فشل إضافة الخدمة');
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    try {
      await api.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'فشل حذف الخدمة');
    }
  };

  // Add Location
  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocNameAr.trim()) return;
    try {
      const created = await api.createLocation({
        nameAr: newLocNameAr,
        governorate: newLocGov,
        isActive: true
      });
      setLocations(prev => [...prev, created]);
      setNewLocNameAr('');
    } catch (err: any) {
      alert(err.message || 'فشل إضافة المنطقة');
    }
  };

  // Delete Location
  const handleDeleteLocation = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المنطقة؟')) return;
    try {
      await api.deleteLocation(id);
      setLocations(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.message || 'فشل حذف المنطقة');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4" dir="rtl">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">صلاحيات إدارة المنصة فقط</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          هذه الصفحة مخصصة لإدارة منصة خلصلى (Admin) لإدارة الفئات والخدمات والفنيين والنزاعات. حسابك الحالي مسجل بدور: <span className="font-black text-slate-900">{user ? (user.role === 'provider' ? 'مقدم خدمة' : 'عميل') : 'زائر'}</span>.
        </p>
        <button
          type="button"
          onClick={() => quickSwitch('admin')}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Shield className="w-4 h-4 text-emerald-200" />
          <span>التبديل إلى حساب مسؤول المنصة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              لوحة التحكم وإدارة خلصلى
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              إدارة الفنيين، متابعة النزاعات، تنظيم الفئات والخدمات والمناطق في مصر
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAllAdminData}
          className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-2xl transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          نظرة عامة وإحصائيات
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disputes')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'disputes'
              ? 'bg-white text-rose-700 border-b-2 border-rose-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>البلاغات والمنازعات</span>
          <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[11px] font-black">
            {disputes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('providers')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-2xl transition-all ${
            activeTab === 'providers'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          مقدمو الخدمات ({providers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-2xl transition-all ${
            activeTab === 'customers'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          العملاء المسجلين ({customers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-2xl transition-all ${
            activeTab === 'bookings'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          الحجوزات والعمليات ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-2xl transition-all ${
            activeTab === 'reviews'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          التقييمات والآراء ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-2xl transition-all ${
            activeTab === 'categories'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          التصنيفات ({categories.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-2xl transition-all ${
            activeTab === 'services'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          الخدمات ({services.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('locations')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-2xl transition-all ${
            activeTab === 'locations'
              ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          المناطق والأحياء ({locations.length})
        </button>
      </div>

      {/* Tab 1: Overview KPIs */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Free platform reassurance banner */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/30">
                خ
              </div>
              <div>
                <h2 className="font-black text-base">منصة خلصلى - منصة مجانية 100% للخدمات الحرفية والصيانة</h2>
                <p className="text-xs text-slate-300 font-medium">منصة مجتمعية مفتوحة بالكامل بدون عمولات أو رسوم أو اشتراكات شهرية نهائياً.</p>
              </div>
            </div>
            <div className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full font-bold">
              عمولة المنصة: 0% دائماً
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-1">
              <span className="text-xs text-slate-500 font-bold block">إجمالي التعاملات المباشرة</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalBookingVolume || 0} ج.م</p>
              <p className="text-[11px] text-emerald-600 font-bold">100% أرباح مباشرة للفنيين</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-1">
              <span className="text-xs text-slate-500 font-bold block">إجمالي طلبات الصيانة</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalBookingsCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">{stats.completedBookingsCount} مكتملة بنجاح</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-1">
              <span className="text-xs text-slate-500 font-bold block">الفنيون المسجلون</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalProvidersCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">حرفيون ومراكز صيانة معتمدة</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-1">
              <span className="text-xs text-slate-500 font-bold block">العملاء المستفيدون</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalCustomersCount}</p>
              <p className="text-[11px] text-slate-400 font-medium">حسابات نشطة في مختلف المحافظات</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Disputes */}
      {activeTab === 'disputes' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 text-sm">إدارة البلاغات والمنازعات ({disputes.length})</h2>
              <p className="text-xs text-slate-400">متابعة شكاوى المستخدمين والفنيين والتدخل السريع لحل الخلافات وضمان العدالة</p>
            </div>
          </div>

          {disputes.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">لا توجد بلاغات أو منازعات مسجلة حالياً.</div>
          ) : (
            <div className="p-5 space-y-4">
              {disputes.map(disp => (
                <div key={disp.id} className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{disp.reasonCategory}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          disp.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          disp.status === 'in_review' ? 'bg-sky-100 text-sky-800' :
                          disp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {disp.status === 'pending' ? 'بانتظار المراجعة' :
                           disp.status === 'in_review' ? 'قيد المتابعة والتحقيق' :
                           disp.status === 'resolved' ? 'تم الحل والتسوية' : 'تم الرفض / الإغلاق'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        طلب رقم #{disp.bookingNumber} · تاريخ البلاغ: {new Date(disp.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>

                    {/* Quick status change buttons */}
                    <div className="flex items-center gap-1.5">
                      {disp.status !== 'in_review' && disp.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateDispute(disp.id, 'in_review')}
                          className="h-8 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-all"
                        >
                          بدء المراجعة
                        </button>
                      )}
                      {disp.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateDispute(disp.id, 'resolved')}
                          className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-sm"
                        >
                          تحديد كمحلول
                        </button>
                      )}
                      {disp.status !== 'dismissed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateDispute(disp.id, 'dismissed')}
                          className="h-8 px-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-[11px] font-medium transition-all"
                        >
                          إغلاق
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                      <span className="text-slate-400 block mb-0.5 font-bold">مقدم البلاغ:</span>
                      <p className="font-bold text-slate-900">{disp.userName} ({disp.userRole === 'customer' ? 'عميل' : 'فني'})</p>
                      <p className="text-slate-500 font-mono mt-0.5">{disp.userPhone || 'بدون هاتف'}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                      <span className="text-slate-400 block mb-0.5 font-bold">الطرف المشكو في حقه:</span>
                      <p className="font-bold text-slate-900">{disp.providerName}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs text-xs text-slate-800 leading-relaxed font-medium">
                    <span className="font-bold text-slate-900 block mb-1">تفاصيل الشكوى:</span>
                    <p className="whitespace-pre-wrap">{disp.details}</p>
                  </div>

                  {disp.photoUrl && (
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                      <span className="text-xs font-bold text-slate-700 block mb-1.5">صورة الإثبات المرفقة:</span>
                      <img
                        src={disp.photoUrl}
                        alt="صورة إثبات النزاع"
                        className="max-h-48 rounded-xl object-cover border border-slate-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Providers List */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-black text-slate-900 text-sm">قائمة الفنيين ومقدمي الخدمات ({providers.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/70 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">الفني / النشاط</th>
                  <th className="p-3.5">الهاتف</th>
                  <th className="p-3.5">التقييم</th>
                  <th className="p-3.5">الخبرة</th>
                  <th className="p-3.5">التوثيق</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={p.businessName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.businessName}</p>
                          <p className="text-[11px] text-slate-500">{p.user?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">{p.user?.phone}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-amber-600">⭐ {p.rating}</span>
                      <span className="text-slate-400 mr-1">({p.reviewCount})</span>
                    </td>
                    <td className="p-3.5 font-medium">{p.experienceYears} سنوات</td>
                    <td className="p-3.5">
                      {p.isVerified ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                          موثق
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                          غير موثق
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVerification(p.id, p.isVerified)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                          p.isVerified
                            ? 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        }`}
                      >
                        {p.isVerified ? 'إلغاء التوثيق' : 'توثيق الحساب'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: All Bookings */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-black text-slate-900 text-sm">سجل العمليات والطلبات ({bookings.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/70 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">رقم الطلب</th>
                  <th className="p-3.5">العميل</th>
                  <th className="p-3.5">مقدم الخدمة</th>
                  <th className="p-3.5">الخدمة والمنطقة</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">المبلغ المدفوع</th>
                  <th className="p-3.5">رسوم المنصة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">#{b.bookingNumber}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{b.customer?.user?.name}</p>
                      <p className="text-[11px] text-slate-400">{b.customerPhone}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{b.provider?.businessName}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{b.service?.nameAr}</p>
                      <p className="text-[11px] text-slate-400">{b.location?.nameAr}</p>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {b.finalPrice ? `${b.finalPrice} ج.م` : '-'}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">
                      0 ج.م (مجاني 100%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-black text-slate-900 text-sm">قائمة العملاء المسجلين بالمنصة ({customers.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/70 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">العميل</th>
                  <th className="p-3.5">رقم الهاتف</th>
                  <th className="p-3.5">البريد الإلكتروني</th>
                  <th className="p-3.5">العنوان الافتراضي</th>
                  <th className="p-3.5">الطلبات المرتبطة</th>
                  <th className="p-3.5">تاريخ الانضمام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => {
                  const custBookings = bookings.filter(b => b.customerUserId === c.userId || b.customerId === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={c.user?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                            alt={c.user?.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <p className="font-bold text-slate-900">{c.user?.name || 'عميل'}</p>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">{c.user?.phone || '-'}</td>
                      <td className="p-3.5 font-mono text-slate-500">{c.user?.email || '-'}</td>
                      <td className="p-3.5 text-slate-600">{c.address || 'القاهرة'}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                          {custBookings.length} طلبات
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {c.user?.createdAt ? new Date(c.user.createdAt).toLocaleDateString('ar-EG') : 'منذ بداية المنصة'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-black text-slate-900 text-sm">إدارة مراجعات وتقييمات العملاء ({reviews.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/70 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">العميل</th>
                  <th className="p-3.5">مقدم الخدمة</th>
                  <th className="p-3.5">التقييم</th>
                  <th className="p-3.5">تعليق العميل</th>
                  <th className="p-3.5">رد الفني</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map(r => {
                  const prov = providers.find(p => p.id === r.providerId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={r.customerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                            alt={r.customerName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900">{r.customerName}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{prov?.businessName || 'مقدم خدمة'}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-amber-600">⭐ {r.rating} / 5</span>
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-slate-700">{r.comment}</td>
                      <td className="p-3.5 max-w-xs truncate text-slate-500">
                        {r.providerReply ? (
                          <span className="text-emerald-700 font-medium">"{r.providerReply}"</span>
                        ) : (
                          <span className="text-slate-400 italic">لا يوجد رد</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف التقييم المخالف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Categories CRUD */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <h3 className="font-black text-sm text-slate-900">إضافة تصنيف جديد</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newCatNameAr}
                  onChange={e => setNewCatNameAr(e.target.value)}
                  placeholder="مثال: تركيب زجاج ومرايا"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-semibold outline-none transition-all text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالإنجليزية (اختياري)</label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={e => setNewCatNameEn(e.target.value)}
                  placeholder="Glass & Mirrors"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-semibold outline-none transition-all text-left"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الأيقونة (Lucide Icon)</label>
                <select
                  value={newCatIcon}
                  onChange={e => setNewCatIcon(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-semibold outline-none transition-all cursor-pointer"
                >
                  <option value="Wrench">Wrench (مفتاح صيانة)</option>
                  <option value="Zap">Zap (كهرباء)</option>
                  <option value="Droplets">Droplets (سباكة/مياه)</option>
                  <option value="Wind">Wind (تكييف)</option>
                  <option value="Paintbrush">Paintbrush (دهانات)</option>
                  <option value="Hammer">Hammer (نجارة/مطرقة)</option>
                  <option value="Sparkles">Sparkles (نظافة)</option>
                  <option value="Layers">Layers (أرضيات وسيراميك)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف التصنيف</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  placeholder="وصف مختصر للخدمات التابعة لهذا التصنيف..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-medium outline-none transition-all text-right resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                إضافة التصنيف
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">التصنيفات الحالية ({categories.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {categories.map(cat => (
                <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{cat.nameAr}</h4>
                      <p className="text-xs text-slate-400">{cat.description || cat.nameEn}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 px-2.5 py-1 rounded-full bg-slate-100 font-bold">
                      {cat.providersCount || 0} فني
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Services CRUD */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <h3 className="font-black text-sm text-slate-900">إضافة خدمة جديدة</h3>
            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الخدمة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newServiceNameAr}
                  onChange={e => setNewServiceNameAr(e.target.value)}
                  placeholder="مثال: تسليك بالوعات المطبخ والحمام"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-semibold outline-none transition-all text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تابع للتصنيف *</label>
                <select
                  value={newServiceCatId}
                  onChange={e => setNewServiceCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-semibold outline-none transition-all cursor-pointer text-right"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">شرح ومواصفات الخدمة</label>
                <textarea
                  rows={2}
                  value={newServiceDesc}
                  onChange={e => setNewServiceDesc(e.target.value)}
                  placeholder="تفاصيل حول ما تشمله الخدمة..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-medium outline-none transition-all text-right resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                إضافة الخدمة
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">الخدمات المسجلة ({services.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {services.map(srv => {
                const cat = categories.find(c => c.id === srv.categoryId);
                return (
                  <div key={srv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{srv.nameAr}</h4>
                      <p className="text-xs text-slate-400">{srv.description}</p>
                      <span className="inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        {cat?.nameAr || 'عام'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="حذف الخدمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Locations CRUD */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <h3 className="font-black text-sm text-slate-900">إضافة منطقة أو حي جديد</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنطقة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newLocNameAr}
                  onChange={e => setNewLocNameAr(e.target.value)}
                  placeholder="مثال: الشروق أو حدائق الأهرام"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-semibold outline-none transition-all text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المحافظة *</label>
                <select
                  value={newLocGov}
                  onChange={e => setNewLocGov(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-semibold outline-none transition-all cursor-pointer text-right"
                >
                  <option value="القاهرة">القاهرة</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                  <option value="القليوبية">القليوبية</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                إضافة المنطقة
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">المناطق المتاحة للتغطية ({locations.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {locations.map(loc => (
                <div key={loc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{loc.nameAr}</h4>
                      <p className="text-xs text-slate-400">محافظة {loc.governorate}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="حذف المنطقة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
