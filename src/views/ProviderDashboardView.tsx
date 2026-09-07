import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  CreditCard,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Award,
  Calendar,
  Sparkles,
  DollarSign,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { LocationMap } from '../components/LocationMap.js';
import { CompleteBookingModal } from '../components/CompleteBookingModal.js';
import type { Booking, Provider, ProviderSubscription, Review, BookingStatus, Service, Location } from '../types.js';

export function ProviderDashboardView() {
  const { user, provider, quickSwitch } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerDetails, setProviderDetails] = useState<any>(null);
  const [subscription, setSubscription] = useState<ProviderSubscription | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'earnings' | 'subscription' | 'reviews' | 'profile'>('bookings');

  // Complete booking modal state
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);

  // Map toggle state
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);

  // Reply to review state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  // Profile Edit Form State
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editExperienceYears, setEditExperienceYears] = useState(3);
  const [editServiceIds, setEditServiceIds] = useState<string[]>([]);
  const [editAreaIds, setEditAreaIds] = useState<string[]>([]);
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndTime, setEditEndTime] = useState('21:00');
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let provData = provider;
      if (!provData) {
        const allProvs = await api.getProviders({});
        provData = allProvs.find(p => p.userId === user.id) || allProvs[0] || null;
      }

      const [servicesList, locationsList] = await Promise.all([
        api.getServices().catch(() => []),
        api.getLocations().catch(() => [])
      ]);
      setAllServices(servicesList);
      setAllLocations(locationsList);

      if (provData) {
        setProviderDetails(provData);
        setEditBusinessName(provData.businessName || '');
        setEditBio(provData.bio || '');
        setEditExperienceYears(provData.experienceYears || 3);
        setEditServiceIds(provData.serviceIds || []);
        setEditAreaIds(provData.areaIds || []);
        setEditStartTime(provData.workingHours?.start || '09:00');
        setEditEndTime(provData.workingHours?.end || '21:00');
        setEditIsActive(provData.isActive ?? true);

        const [provBookings, provSub, provReviews] = await Promise.all([
          api.getBookings({ providerId: provData.id }),
          api.getProviderSubscription(provData.id).catch(() => null),
          api.getReviews(provData.id).catch(() => [])
        ]);
        setBookings(provBookings);
        setSubscription(provSub);
        setReviews(provReviews);
      }
    } catch (err) {
      console.error('Error fetching provider dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    if (!user) return;

    if (newStatus === 'REJECTED') {
      const reason = prompt('يرجى ذكر سبب الاعتذار عن الطلب (سيصل للعميل):');
      if (reason === null) return;
      try {
        await api.updateBookingStatus(bookingId, 'REJECTED', {
          changedByUserId: user.id,
          rejectionReason: reason || 'غير متاح في هذا التوقيت'
        });
        fetchDashboardData();
      } catch (err: any) {
        alert(err.message || 'فشل تحديث الحالة');
      }
      return;
    }

    if (newStatus === 'COMPLETED') {
      const targetBk = bookings.find(b => b.id === bookingId);
      if (targetBk) {
        setCompletingBooking(targetBk);
      }
      return;
    }

    try {
      await api.updateBookingStatus(bookingId, newStatus as BookingStatus, {
        changedByUserId: user.id
      });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث الحالة');
    }
  };

  const handleRenewSubscription = async () => {
    if (!providerDetails) return;
    try {
      const renewed = await api.subscribeProvider(providerDetails.id, 'sub_standard');
      setSubscription(renewed);
      alert('تم تجديد الاشتراك الشهري بنجاح بقيمة 250 ج.م');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'فشل تجديد الاشتراك');
    }
  };

  const handleSendReply = async (reviewId: string) => {
    const replyText = replyTextMap[reviewId];
    if (!replyText || !replyText.trim() || !user) return;

    setSubmittingReply(reviewId);
    try {
      await api.replyReview(reviewId, replyText.trim(), user.id);
      setReplyTextMap(prev => ({ ...prev, [reviewId]: '' }));
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'فشل إرسال الرد');
    } finally {
      setSubmittingReply(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerDetails) return;
    setSavingProfile(true);
    try {
      // Derive categoryIds from selected services
      const selectedServices = allServices.filter(s => editServiceIds.includes(s.id));
      const derivedCategoryIds: string[] = Array.from(new Set(selectedServices.map(s => s.categoryId)));

      const updated = await api.updateProvider(providerDetails.id, {
        businessName: editBusinessName,
        bio: editBio,
        experienceYears: Number(editExperienceYears),
        serviceIds: editServiceIds,
        categoryIds: derivedCategoryIds,
        areaIds: editAreaIds,
        workingHours: {
          start: editStartTime,
          end: editEndTime,
          daysOff: providerDetails.workingHours?.daysOff || ['الجمعة']
        },
        isActive: editIsActive
      });
      setProviderDetails(updated);
      setProfileSuccessMsg('تم حفظ وتحديث بيانات الملف المهني، الخدمات، والمواعيد بنجاح!');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث البيانات');
    } finally {
      setSavingProfile(false);
    }
  };

  // Role Access Barrier
  if (user?.role !== 'provider') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4" dir="rtl">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Briefcase className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">لوحة مقدمي الخدمات والفنيين</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          هذه الصفحة مخصصة للمهنيين ومقدمي الخدمات لمتابعة الطلبات، إدارة العروض، وتعديل المواعيد وقائمة الخدمات. حسابك الحالي مسجل بدور: <span className="font-bold text-slate-900">{user ? (user.role === 'admin' ? 'مدير المنصة' : 'عميل') : 'زائر'}</span>.
        </p>
        <button
          type="button"
          onClick={() => quickSwitch('provider')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          <span>التبديل إلى حساب مقدم الخدمة (الأسطى محمود حسن)</span>
        </button>
      </div>
    );
  }

  // Earnings calculations
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
  const totalCommission = completedBookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);
  const totalNetEarnings = completedBookings.reduce((sum, b) => sum + (b.providerEarnings || 0), 0);

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const activeBookings = bookings.filter(b => ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Stats */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {providerDetails?.businessName || user?.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  فني معتمد
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                التقييم العام: ⭐ {providerDetails?.rating || 5.0} ({providerDetails?.reviewCount || 0} تقييم) | هاتف: {user?.phone}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-amber-900 block">طلبات جديدة</span>
              <span className="text-xl font-extrabold text-amber-700">{pendingBookings.length}</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-emerald-900 block">صافي الأرباح</span>
              <span className="text-xl font-extrabold text-emerald-700">{totalNetEarnings} ج.م</span>
            </div>
            <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-blue-900 block">طلبات منجزة</span>
              <span className="text-xl font-extrabold text-blue-700">{completedBookings.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>إدارة الطلبات والحجوزات</span>
          {pendingBookings.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
              {pendingBookings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('earnings')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'earnings'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>الأرباح والعمولات ({totalNetEarnings} ج.م)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscription')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'subscription'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>الاشتراك الشهري</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            subscription?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {subscription?.status === 'ACTIVE' ? 'نشط' : 'منتهي'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'reviews'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>التقييمات والردود ({reviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>تعديل الملف والخدمات والمواعيد</span>
        </button>
      </div>

      {/* Tab 1: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Pending requests highlight */}
          {pendingBookings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>طلبات جديدة في انتظار قرارك (قبول أو اعتذار)</span>
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {pendingBookings.map(bk => (
                  <div
                    key={bk.id}
                    className="bg-amber-50/40 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-200">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900">
                          طلب جديد #{bk.bookingNumber}
                        </span>
                        <span className="text-xs text-slate-500 mr-2">
                          العميل: <strong>{bk.customer?.user?.name}</strong> (هاتف: {bk.customerPhone})
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                        في انتظار القبول
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">الخدمة: {bk.service?.nameAr}</p>
                      <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                        <strong>وصف العطل:</strong> {bk.problemDescription}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>العنوان: {bk.addressDetails} ({bk.location?.nameAr})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>الموعد المفضل: {bk.preferredDate || 'حسب التنسيق'} ({bk.preferredTime})</span>
                      </span>
                      {bk.urgency === 'nearest' && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                          ⚡ طلب طوارئ - أقرب وقت
                        </span>
                      )}
                    </div>

                    {/* Location Map Toggle for Provider */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedMapId(expandedMapId === bk.id ? null : bk.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300/80 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{expandedMapId === bk.id ? 'إخفاء خريطة الموقع' : 'عرض موقع العميل على الخريطة (Pin Drop)'}</span>
                        {bk.lat && bk.lng && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                            إحداثيات محددة ✓
                          </span>
                        )}
                        {expandedMapId === bk.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {expandedMapId === bk.id && (
                        <div className="mt-2.5 p-3 bg-white rounded-2xl border border-amber-200/90 shadow-2xs">
                          <LocationMap
                            mode="view"
                            coordinates={bk.lat && bk.lng ? { lat: bk.lat, lng: bk.lng } : null}
                            initialAreaName={bk.location?.nameAr}
                            addressText={bk.addressDetails}
                            heightClass="h-48 sm:h-56"
                            label={`موقع العميل: ${bk.customer?.name || 'العميل'} (${bk.addressDetails})`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-amber-200/80 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(bk.id, 'ACCEPTED')}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>قبول الطلب والتواصل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(bk.id, 'REJECTED')}
                        className="py-2 px-4 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs"
                      >
                        اعتذار عن الطلب
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Bookings (ACCEPTED / CONFIRMED / IN_PROGRESS) */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800">الطلبات الجارية وقيد التنفيذ</h2>

            {activeBookings.length === 0 ? (
              <div className="py-8 text-center bg-white rounded-2xl border border-slate-200 p-4 text-xs text-slate-400">
                لا توجد طلبات جارية حالياً
              </div>
            ) : (
              activeBookings.map(bk => (
                <div key={bk.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900">
                        طلب #{bk.bookingNumber} - {bk.service?.nameAr}
                      </span>
                      <span className="text-xs text-slate-500 mr-2">
                        العميل: {bk.customer?.user?.name} ({bk.customerPhone})
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900">
                      {bk.status === 'ACCEPTED' && 'تم القبول (بانتظار التأكيد)'}
                      {bk.status === 'CONFIRMED' && 'موعد مؤكد'}
                      {bk.status === 'IN_PROGRESS' && 'جاري العمل في الموقع'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    {bk.problemDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span>العنوان: {bk.addressDetails} ({bk.location?.nameAr})</span>
                    <span>الموعد: {bk.preferredDate || 'بالتنسيق'} ({bk.preferredTime})</span>
                  </div>

                  {/* Location Map Toggle for Active Order */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedMapId(expandedMapId === bk.id ? null : bk.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-300/80 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                      <span>{expandedMapId === bk.id ? 'إخفاء خريطة الموقع' : 'عرض خريطة الموقع والوصول للعميل (GPS)'}</span>
                      {bk.lat && bk.lng && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                          إحداثيات محددة ✓
                        </span>
                      )}
                      {expandedMapId === bk.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedMapId === bk.id && (
                      <div className="mt-2.5 p-3 bg-white rounded-2xl border border-sky-200/90 shadow-2xs">
                        <LocationMap
                          mode="view"
                          coordinates={bk.lat && bk.lng ? { lat: bk.lat, lng: bk.lng } : null}
                          initialAreaName={bk.location?.nameAr}
                          addressText={bk.addressDetails}
                          heightClass="h-48 sm:h-56"
                          label={`موقع العميل: ${bk.customer?.name || 'العميل'} (${bk.addressDetails})`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Progressive Actions for Provider */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {bk.status === 'ACCEPTED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(bk.id, 'CONFIRMED')}
                        className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                      >
                        تأكيد الميعاد مع العميل
                      </button>
                    )}

                    {bk.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(bk.id, 'IN_PROGRESS')}
                        className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                      >
                        بدء العمل في الموقع الآن
                      </button>
                    )}

                    {(bk.status === 'IN_PROGRESS' || bk.status === 'CONFIRMED' || bk.status === 'ACCEPTED') && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(bk.id, 'COMPLETED')}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>إكمال العمل وتسجيل السعر المتفق عليه</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Completed Bookings History */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800">الطلبات المكتملة مسبقاً ({completedBookings.length})</h2>
            <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
              {completedBookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">لا توجد طلبات مكتملة حتى الآن</div>
              ) : (
                completedBookings.map(bk => (
                  <div key={bk.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">
                        {bk.bookingNumber} - {bk.service?.nameAr}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        العميل: {bk.customer?.user?.name} | {bk.location?.nameAr}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 block">{bk.finalPrice} ج.م</span>
                        <span className="text-[10px] text-slate-400">
                          عمولة المنصة: {bk.commissionAmount} ج.م | صافي لك: {bk.providerEarnings} ج.م
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        مكتمل
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Earnings & Commission Simulation */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-bold">إجمالي إيرادات العمليات</span>
              <p className="text-2xl font-black text-slate-900">{totalRevenue} ج.م</p>
              <p className="text-[11px] text-slate-400">إجمالي المبالغ المتفق عليها مع العملاء</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-rose-600 font-bold">عمولات المنصة المستقطعة (10%)</span>
              <p className="text-2xl font-black text-rose-600">{totalCommission} ج.م</p>
              <p className="text-[11px] text-slate-400">عمولة التشغيل والدعم الفني والإعلانات</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-emerald-600 font-bold">صافي أرباح الفني المستلمة</span>
              <p className="text-2xl font-black text-emerald-700">{totalNetEarnings} ج.م</p>
              <p className="text-[11px] text-slate-400">مستحقاتك الصافية المتبقية بعد خصم العمولة</p>
            </div>
          </div>

          {/* Business Model Explanation */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>نموذج العمل والأرباح في المنصة:</span>
            </h3>
            <ul className="text-xs text-amber-900 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>مقدم الخدمة يدفع اشتراكاً شهرياً رمزياً للتواجد في الدليل والظهور في نتائج البحث.</li>
              <li>المنصة تخصم عمولة قدرها 10% من قيمة كل خدمة مكتملة بنجاح.</li>
              <li>العملاء لا يرون أسعار الخدمات داخل المنصة، ويتم الاتفاق على السعر مباشرة بين الفني والعميل حسب طبيعة العمل.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Monthly Subscription */}
      {activeTab === 'subscription' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 max-w-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">حالة الاشتراك الشهري</h2>
              <p className="text-xs text-slate-500 mt-0.5">الباقة الاحترافية لإدراج الفنيين في الدليل المعتمد</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              subscription?.status === 'ACTIVE'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {subscription?.status === 'ACTIVE' ? 'الاشتراك سارٍ ونشط' : 'الاشتراك منتهي'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">قيمة الاشتراك الشهري:</span>
              <span className="font-extrabold text-slate-900 text-base">
                {subscription?.price || 250} ج.م / شهر
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">تاريخ انتهاء الاشتراك:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('ar-EG') : 'غير محدد'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <p className="font-bold text-amber-950">مزايا الاشتراك النشط:</p>
            <p className="text-slate-700 leading-relaxed">
              • الظهور المستمر في نتائج بحث العملاء في مناطقك المسجلة.<br />
              • استقبال إشعارات طلبات الحجز الفورية على مدار الساعة.<br />
              • إمكانية توثيق الحساب والحصول على شارة فني معتمد.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRenewSubscription}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>تجديد الاشتراك لمدة شهر إضافي (250 ج.م)</span>
          </button>
        </div>
      )}

      {/* Tab 4: Reviews & Replies */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800">
            تقييمات العملاء وإمكانية الرد عليها ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6 text-xs text-slate-400">
              لا توجد تقييمات مكتوبة حتى الآن
            </div>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.customerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                      alt={rev.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{rev.customerName}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                        <span className="text-[11px] text-slate-400 font-normal mr-1">
                          {new Date(rev.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {rev.comment}
                </p>

                {/* Reply section */}
                {rev.providerReply ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                    <p className="font-bold text-amber-900 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>ردك على العميل:</span>
                    </p>
                    <p className="text-slate-700">{rev.providerReply}</p>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyTextMap[rev.id] || ''}
                      onChange={e => setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })}
                      placeholder="اكتب رداً مهنياً للعميل (مثال: شرفتنا يا فندم ودائماً في الخدمة)..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 text-right"
                    />
                    <button
                      type="button"
                      disabled={submittingReply === rev.id || !replyTextMap[rev.id]?.trim()}
                      onClick={() => handleSendReply(rev.id)}
                      className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs disabled:opacity-50"
                    >
                      {submittingReply === rev.id ? 'جاري الإرسال...' : 'إرسال الرد'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Profile, Services & Availability Management */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                <span>إعدادات الملف المهني، الخدمات، والمواعيد</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                حدد اسم شهرتك، النبذة، سنوات الخبرة، الخدمات التي تقدمها، ومواعيد استقبالك للطلبات
              </p>
            </div>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            {/* 1. Basic Info */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
                1. البيانات المهنية الأساسية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الشهرة أو النشاط التجاري *</label>
                  <input
                    type="text"
                    required
                    value={editBusinessName}
                    onChange={e => setEditBusinessName(e.target.value)}
                    placeholder="مثال: الأسطى محمود حسن لأعمال السباكة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-right focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">سنوات الخبرة العملية *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={editExperienceYears}
                    onChange={e => setEditExperienceYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-right focus:ring-2 focus:ring-amber-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نبذة تعريفية بالخبرات والضمانات للعميل</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="اكتب نبذة عن مهاراتك والضمان الذي تقدمه للعملاء بعد الصيانة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-right focus:ring-2 focus:ring-amber-500 text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* 2. Services Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  2. الخدمات التي تقدمها ({editServiceIds.length} خدمة محددة)
                </h3>
                <span className="text-slate-400 text-[11px]">اضغط على الخدمة لتفعيلها أو إيقافها</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {allServices.map(srv => {
                  const isChecked = editServiceIds.includes(srv.id);
                  return (
                    <label
                      key={srv.id}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-amber-400 bg-amber-50/70 text-slate-950 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setEditServiceIds(prev =>
                            isChecked ? prev.filter(id => id !== srv.id) : [...prev, srv.id]
                          );
                        }}
                        className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                      />
                      <span className="text-xs">{srv.nameAr}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Coverage Areas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  3. مناطق وأحياء العمل والتغطية ({editAreaIds.length} منطقة محددة)
                </h3>
                <span className="text-slate-400 text-[11px]">اختر الأحياء التي تستطيع التوجه إليها</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {allLocations.map(loc => {
                  const isChecked = editAreaIds.includes(loc.id);
                  return (
                    <label
                      key={loc.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-amber-400 bg-amber-50/70 text-slate-950 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setEditAreaIds(prev =>
                            isChecked ? prev.filter(id => id !== loc.id) : [...prev, loc.id]
                          );
                        }}
                        className="rounded text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                      />
                      <span className="text-xs">{loc.nameAr}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Availability & Working Hours */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
                4. مواعيد العمل وحالة التواجد لاستقبال الطلبات
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ساعة بدء العمل يومياً</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={e => setEditStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ساعة انتهاء العمل يومياً</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={e => setEditEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center font-mono text-xs"
                  />
                </div>

                <div className="pt-4 sm:pt-0">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={e => setEditIsActive(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {editIsActive ? 'متاح الآن لاستقبال الطلبات' : 'مشغول / إيقاف استقبال الطلبات'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {editIsActive ? 'يظهر حسابك في نتائج البحث للعملاء' : 'مخفي مؤقتاً من نتائج البحث'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'جاري حفظ التعديلات...' : 'حفظ كافة التعديلات في الملف والخدمات'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complete Booking Modal */}
      {completingBooking && (
        <CompleteBookingModal
          isOpen={Boolean(completingBooking)}
          onClose={() => setCompletingBooking(null)}
          booking={completingBooking}
          changedByUserId={user?.id || 'provider'}
          commissionRate={0.10}
          onCompleted={() => {
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
