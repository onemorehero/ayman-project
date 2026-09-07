import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Briefcase,
  Calendar,
  DollarSign,
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
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { CategoryIcon } from '../components/CategoryIcon.js';
import type { Category, Service, Location, Provider, Booking, Customer, Review, User } from '../types.js';

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
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'customers' | 'bookings' | 'reviews' | 'categories' | 'services' | 'locations'>('overview');

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
      const [st, cats, srvs, locs, provs, bks, custs, revs] = await Promise.all([
        api.getAdminStats(),
        api.getCategories(),
        api.getServices(),
        api.getLocations(),
        api.getProviders({}),
        api.getBookings({}),
        api.getCustomers().catch(() => []),
        api.getReviews().catch(() => [])
      ]);
      setStats(st);
      setCategories(cats);
      setServices(srvs);
      setLocations(locs);
      setProviders(provs);
      setBookings(bks);
      setCustomers(custs);
      setReviews(revs);
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
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">صلاحيات إدارة المنصة فقط</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          هذه الصفحة مخصصة لمدير المنصة (Admin) لإدارة الفئات والخدمات والفنيين والعملاء. حسابك الحالي مسجل بدور: <span className="font-bold text-slate-900">{user ? (user.role === 'provider' ? 'مقدم خدمة' : 'عميل') : 'زائر'}</span>.
        </p>
        <button
          type="button"
          onClick={() => quickSwitch('admin')}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
        >
          <Shield className="w-4 h-4 text-amber-400" />
          <span>التبديل إلى حساب مدير المنصة (أحمد زهران)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              لوحة التحكم والإدارة الشاملة
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              إدارة الفنيين، الطلبات، العمولات، التصنيفات والمناطق في جمهورية مصر العربية
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAllAdminData}
          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-5 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          نظرة عامة وإحصائيات
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('providers')}
          className={`py-3 px-5 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'providers'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          مقدمو الخدمات ({providers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className={`py-3 px-5 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'customers'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          العملاء المسجلين ({customers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-5 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'bookings'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          الحجوزات والعمليات ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-5 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          التقييمات والآراء ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`py-3 px-5 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'categories'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          التصنيفات ({categories.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`py-3 px-5 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'services'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          الخدمات ({services.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('locations')}
          className={`py-3 px-5 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'locations'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          المناطق والأحياء ({locations.length})
        </button>
      </div>

      {/* Tab 1: Overview KPIs */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-bold block">إجمالي أرباح المنصة</span>
              <p className="text-2xl font-black text-amber-600">{stats.totalPlatformRevenue} ج.م</p>
              <p className="text-[11px] text-slate-400">عمولات حجوزات + اشتراكات فنيين</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-bold block">إجمالي عمولات الحجوزات (10%)</span>
              <p className="text-2xl font-black text-emerald-600">{stats.totalCommissionEarned} ج.م</p>
              <p className="text-[11px] text-slate-400">من {stats.completedBookingsCount} طلب مكتمل</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-bold block">إيراد الاشتراكات الشهرية</span>
              <p className="text-2xl font-black text-indigo-600">{stats.totalSubscriptionRevenue} ج.م</p>
              <p className="text-[11px] text-slate-400">من باقات الفنيين النشطة</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-bold block">إجمالي طلبات الحجز</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalBookingsCount}</p>
              <p className="text-[11px] text-slate-400">{stats.completedBookingsCount} مكتملة بنجاح</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">مقدمو الخدمات المسجلين</span>
              <p className="text-3xl font-black text-slate-800 mt-2">{stats.totalProvidersCount}</p>
              <p className="text-xs text-slate-500 mt-1">فنيون ومراكز صيانة معتمدة</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">العملاء المسجلين</span>
              <p className="text-3xl font-black text-slate-800 mt-2">{stats.totalCustomersCount}</p>
              <p className="text-xs text-slate-500 mt-1">عملاء أصحاب حسابات نشطة</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold">متوسط قيمة العملية المنفذة</span>
              <p className="text-3xl font-black text-slate-800 mt-2">
                {stats.completedBookingsCount > 0 ? Math.round(stats.totalBookingVolume / stats.completedBookingsCount) : 0} ج.م
              </p>
              <p className="text-xs text-slate-500 mt-1">حسب الأسعار المتفق عليها ميدانياً</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Providers List */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-sm">قائمة الفنيين ومقدمي الخدمات ({providers.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">الفني / النشاط</th>
                  <th className="p-3">الهاتف</th>
                  <th className="p-3">التقييم</th>
                  <th className="p-3">الخبرة</th>
                  <th className="p-3">التوثيق</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={p.businessName}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.businessName}</p>
                          <p className="text-[11px] text-slate-500">{p.user?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono">{p.user?.phone}</td>
                    <td className="p-3">
                      <span className="font-bold text-amber-600">⭐ {p.rating}</span>
                      <span className="text-slate-400 mr-1">({p.reviewCount})</span>
                    </td>
                    <td className="p-3">{p.experienceYears} سنوات</td>
                    <td className="p-3">
                      {p.isVerified ? (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                          موثق
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                          غير موثق
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVerification(p.id, p.isVerified)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                          p.isVerified
                            ? 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-sm">سجل العمليات والحجوزات ({bookings.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">رقم الحجز</th>
                  <th className="p-3">العميل</th>
                  <th className="p-3">مقدم الخدمة</th>
                  <th className="p-3">الخدمة والمنطقة</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">السعر النهائي</th>
                  <th className="p-3">عمولة المنصة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-900">{b.bookingNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{b.customer?.user?.name}</p>
                      <p className="text-[11px] text-slate-400">{b.customerPhone}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{b.provider?.businessName}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{b.service?.nameAr}</p>
                      <p className="text-[11px] text-slate-400">{b.location?.nameAr}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-700">
                      {b.finalPrice ? `${b.finalPrice} ج.م` : '-'}
                    </td>
                    <td className="p-3 font-bold text-amber-700">
                      {b.commissionAmount ? `${b.commissionAmount} ج.م` : '-'}
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-sm">قائمة العملاء المسجلين بالمنصة ({customers.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">العميل</th>
                  <th className="p-3">رقم الهاتف</th>
                  <th className="p-3">البريد الإلكتروني</th>
                  <th className="p-3">العنوان الافتراضي</th>
                  <th className="p-3">الطلبات المرتبطة</th>
                  <th className="p-3">تاريخ الانضمام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => {
                  const custBookings = bookings.filter(b => b.customerUserId === c.userId || b.customerId === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.user?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                            alt={c.user?.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <p className="font-bold text-slate-900">{c.user?.name || 'عميل'}</p>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{c.user?.phone || '-'}</td>
                      <td className="p-3 font-mono text-slate-500">{c.user?.email || '-'}</td>
                      <td className="p-3 text-slate-600">{c.address || 'القاهرة'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                          {custBookings.length} طلبات
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-sm">إدارة مراجعات وتقييمات العملاء ({reviews.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">العميل</th>
                  <th className="p-3">مقدم الخدمة</th>
                  <th className="p-3">التقييم</th>
                  <th className="p-3">تعليق العميل</th>
                  <th className="p-3">رد الفني</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map(r => {
                  const prov = providers.find(p => p.id === r.providerId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={r.customerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                            alt={r.customerName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900">{r.customerName}</span>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{prov?.businessName || 'مقدم خدمة'}</td>
                      <td className="p-3">
                        <span className="font-bold text-amber-600">⭐ {r.rating} / 5</span>
                      </td>
                      <td className="p-3 max-w-xs truncate text-slate-700">{r.comment}</td>
                      <td className="p-3 max-w-xs truncate text-slate-500">
                        {r.providerReply ? (
                          <span className="text-emerald-700 font-medium">"{r.providerReply}"</span>
                        ) : (
                          <span className="text-slate-400 italic">لا يوجد رد</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3 text-center">
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">إضافة تصنيف جديد</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newCatNameAr}
                  onChange={e => setNewCatNameAr(e.target.value)}
                  placeholder="مثال: تركيب زجاج ومرايا"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم بالإنجليزية (اختياري)</label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={e => setNewCatNameEn(e.target.value)}
                  placeholder="Glass & Mirrors"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-left"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الأيقونة (Lucide Icon)</label>
                <select
                  value={newCatIcon}
                  onChange={e => setNewCatIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-right"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
              >
                إضافة التصنيف
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">التصنيفات الحالية ({categories.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {categories.map(cat => (
                <div key={cat.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{cat.nameAr}</h4>
                      <p className="text-xs text-slate-500">{cat.description || cat.nameEn}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                      {cat.providersCount || 0} فني
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">إضافة خدمة جديدة</h3>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الخدمة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newServiceNameAr}
                  onChange={e => setNewServiceNameAr(e.target.value)}
                  placeholder="مثال: تسليك بالوعات المطبخ والحمام"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تابع للتصنيف *</label>
                <select
                  value={newServiceCatId}
                  onChange={e => setNewServiceCatId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-right"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-right"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
              >
                إضافة الخدمة
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">الخدمات المسجلة ({services.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {services.map(srv => {
                const cat = categories.find(c => c.id === srv.categoryId);
                return (
                  <div key={srv.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{srv.nameAr}</h4>
                      <p className="text-xs text-slate-500">{srv.description}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold">
                        {cat?.nameAr || 'عام'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">إضافة منطقة أو حي جديد</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنطقة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newLocNameAr}
                  onChange={e => setNewLocNameAr(e.target.value)}
                  placeholder="مثال: الشروق أو حدائق الأهرام"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المحافظة *</label>
                <select
                  value={newLocGov}
                  onChange={e => setNewLocGov(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-right"
                >
                  <option value="القاهرة">القاهرة</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                  <option value="القليوبية">القليوبية</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
              >
                إضافة المنطقة
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">المناطق المتاحة للتغطية ({locations.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {locations.map(loc => (
                <div key={loc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{loc.nameAr}</h4>
                      <p className="text-xs text-slate-400">محافظة {loc.governorate}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
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
