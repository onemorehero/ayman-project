import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  MessageSquare,
  AlertCircle,
  Calendar,
  Sparkles,
  Edit2,
  Save,
  Share2,
  Copy,
  Check,
  ShieldAlert,
  Zap,
  User,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { CompleteBookingModal } from '../components/CompleteBookingModal.js';
import { DisputeModal } from '../components/DisputeModal.js';
import type { Booking, Provider, Review, BookingStatus, Service, Location } from '../types.js';

export function ProviderDashboardView() {
  const { user, provider } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerDetails, setProviderDetails] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: Minimalist & 100% free - no subscription or commission tabs
  const [activeTab, setActiveTab] = useState<'bookings' | 'reviews' | 'profile'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  // Modals
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);
  const [disputeBooking, setDisputeBooking] = useState<Booking | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile Edit Form State
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editExperienceYears, setEditExperienceYears] = useState(3);
  const [editServiceIds, setEditServiceIds] = useState<string[]>([]);
  const [editAreaIds, setEditAreaIds] = useState<string[]>([]);
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
        setEditServiceIds((provData.serviceIds || []).slice(0, 3));
        setEditAreaIds(provData.areaIds || []);
        setEditIsActive(provData.isActive ?? true);

        const [provBookings, provReviews] = await Promise.all([
          api.getBookings({ providerId: provData.id }),
          api.getReviews(provData.id).catch(() => [])
        ]);
        setBookings(provBookings);
        setReviews(provReviews);
      }
    } catch (err) {
      console.error('Error loading provider dashboard:', err);
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
      const reason = prompt('يرجى ذكر سبب الاعتذار عن الطلب (سيصل للعميل مع ترشيح فنيين بدلاء):');
      if (reason === null) return;
      try {
        await api.updateBookingStatus(bookingId, 'REJECTED', {
          changedByUserId: user.id,
          rejectionReason: reason || 'غير متاح حالياً'
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerDetails) return;

    if (editServiceIds.length > 3) {
      alert('لا يمكنك اختيار أكثر من 3 خدمات رئيسية لملفك المهني في كتالوج خلصلى.');
      return;
    }

    setSavingProfile(true);
    setProfileSuccessMsg(null);
    try {
      const updated = await api.updateProvider(providerDetails.id, {
        businessName: editBusinessName.trim(),
        bio: editBio.trim(),
        experienceYears: editExperienceYears,
        serviceIds: editServiceIds,
        areaIds: editAreaIds,
        isActive: editIsActive
      });
      setProviderDetails(updated);
      setProfileSuccessMsg('تم حفظ بيانات ملفك الشخصي بنجاح');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'فشل حفظ الملف الشخصي');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyProviderLink = () => {
    const slug = providerDetails?.slug || providerDetails?.id || '';
    const url = `${window.location.origin}/provider/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const getWhatsAppLink = (phone: string, booking: Booking) => {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '20');
    const msg = `مرحباً أستاذنا، أنا ${providerDetails?.businessName || 'الفني'}، أتواصل معك بخصوص طلب الخدمة رقم (${booking.bookingNumber}) عبر منصة خلصلى لتنسيق موعد المعاينة والبدء.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'all') return true;
    if (bookingFilter === 'pending') return b.status === 'PENDING';
    if (bookingFilter === 'accepted') return ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status);
    if (bookingFilter === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Profile Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-right">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src={providerDetails?.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
              alt={providerDetails?.businessName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{providerDetails?.businessName || 'لوحة تحكم الفني'}</h1>
                <span className="text-xs text-emerald-700 font-mono font-bold">({providerDetails?.slug || providerDetails?.id})</span>
              </div>
              <p className="text-xs text-slate-500 max-w-md font-medium">
                {providerDetails?.bio || 'خدمات حرفية وصيانة مباشرة للعملاء عبر منصة خلصلى.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {providerDetails?.rating?.toFixed(1) || '5.0'} ({reviews.length} تقييم)
                </span>
                <span>·</span>
                <span>{completedBookings.length} طلب منجز</span>
              </div>
            </div>
          </div>

          {/* Direct Link Share Button */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyProviderLink}
              className="h-11 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 text-xs font-bold transition-all inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">تم نسخ الرابط!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>مشاركة رابط ملفك الشخصي</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 100% Free Platform Guarantee */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-950 font-medium">
          <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>منصة خلصلى مجانية 100%: لا توجد أي اشتراكات شهرية ولا عمولات، وتستلم كامل أتعابك مباشرة من العميل.</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
            activeTab === 'bookings' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الطلبات الواردة ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
            activeTab === 'reviews' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تقييمات العملاء ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
            activeTab === 'profile' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تعديل الملف والخدمات
        </button>
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Sub-filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setBookingFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                bookingFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              الكل ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setBookingFilter('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                bookingFilter === 'pending'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              طلبات جديدة بانتظار ردك ({pendingBookings.length})
            </button>
            <button
              type="button"
              onClick={() => setBookingFilter('accepted')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                bookingFilter === 'accepted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              مقبولة وجارية ({bookings.filter(b => ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length})
            </button>
            <button
              type="button"
              onClick={() => setBookingFilter('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                bookingFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              مكتملة ({completedBookings.length})
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse h-40" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-black text-slate-900 text-base">لا توجد طلبات في هذا القسم</h3>
              <p className="text-xs text-slate-500">ستظهر الطلبات الجديدة هنا فور قيام العملاء بحجز خدماتك.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(b => {
                const isPending = b.status === 'PENDING';
                const isAccepted = ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status);
                const isCompleted = b.status === 'COMPLETED';
                const isRejected = b.status === 'REJECTED';
                const isCancelled = b.status === 'CANCELLED';

                const customerPhone = b.customerPhone || b.customer?.user?.phone || '01000000000';

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:border-slate-200 transition-all duration-300"
                  >
                    {/* Top Row: Customer Info & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">
                            {b.customer?.name || 'عميل منصة خلصلى'}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono">#{b.bookingNumber}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          تاريخ الطلب: {new Date(b.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>

                      {/* Status badge */}
                      <div>
                        {isPending && (
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>طلب جديد بانتظار موافقتك</span>
                          </span>
                        )}
                        {isAccepted && (
                          <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مقبول وجارٍ التنسيق</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مكتمل بنجاح</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>اعتذرت عن الطلب</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ملغي</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Service & Address Info */}
                    <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          الخدمة المطلوبة: {b.service?.nameAr || 'خدمة صيانة مخصصة'}
                        </span>
                        {b.preferredDate && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{b.preferredDate} ({b.preferredTime})</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {b.problemDescription}
                      </p>

                      <div className="pt-2 border-t border-slate-200/50 flex flex-wrap items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{b.addressDetails}</span>
                        </span>
                        {isCompleted && b.finalPrice && (
                          <span className="font-black text-slate-900">
                            المبلغ المستلم منك بالكامل: {b.finalPrice} ج.م
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions & WhatsApp & Reviews */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                      {/* PENDING: Provider Accept / Reject */}
                      {isPending && (
                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(b.id, 'ACCEPTED')}
                            className="flex-1 sm:flex-none h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20"
                          >
                            قبول الطلب
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(b.id, 'REJECTED')}
                            className="flex-1 sm:flex-none h-11 px-4 rounded-2xl border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 active:scale-95 text-xs font-bold transition-colors"
                          >
                            اعتذار عن الطلب
                          </button>
                        </div>
                      )}

                      {/* ACCEPTED / COMPLETED: WhatsApp & Direct Contact */}
                      {(isAccepted || isCompleted) && (
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={getWhatsAppLink(customerPhone, b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-11 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>تواصل عبر واتساب ({customerPhone})</span>
                          </a>

                          <a
                            href={`tel:${customerPhone}`}
                            className="h-11 px-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>اتصال بالعميل</span>
                          </a>

                          {/* Complete button: ONLY for ACCEPTED */}
                          {isAccepted && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                              className="h-11 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>إتمام الخدمة واستلام المبلغ</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Dispute Button: Available if cancelled or conflict */}
                      {(isCancelled || isAccepted) && (
                        <button
                          type="button"
                          onClick={() => setDisputeBooking(b)}
                          className="h-11 px-3.5 rounded-2xl border border-rose-200 text-rose-800 hover:bg-rose-50 active:scale-95 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>إبلاغ الإدارة عن نزاع</span>
                        </button>
                      )}

                      {/* Review status (Strictly hidden for PENDING or REJECTED) */}
                      {(isAccepted || isCompleted) && b.review && (
                        <div className="flex items-center gap-1 text-xs text-amber-800 font-bold bg-amber-50 px-3 py-2 rounded-2xl border border-amber-200/60">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>تقييم العميل لك: {b.review.rating} نجوم</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base">تقييمات وآراء العملاء</h3>
              <p className="text-xs text-slate-400">تقييمات موثقة من عملاء أنجزت لهم خدمات سابقة</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-slate-900 text-sm">{providerDetails?.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-center py-12 text-xs text-slate-500">لا توجد تقييمات حتى الآن. ستظهر آراء العملاء هنا فور إتمامهم للطلبات.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviews.map(rev => (
                <div key={rev.id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={rev.customerName || 'عميل'}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{rev.customerName || 'عميل خلصلى'}</p>
                        <p className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pr-10">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-black text-slate-900 text-base">تعديل الملف المهني والخدمات</h3>
            <p className="text-xs text-slate-400">حدّث بياناتك لتظهر للعملاء في نتائج البحث ورابطك المباشر</p>
          </div>

          {profileSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">اسم العمل / المهنة:</label>
            <input
              type="text"
              value={editBusinessName}
              onChange={e => setEditBusinessName(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">نبذة تعريفية عن خبرتك:</label>
            <textarea
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              rows={3}
              className="w-full p-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium transition-all outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">سنوات الخبرة:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={editExperienceYears}
                onChange={e => setEditExperienceYears(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">حالة الحساب وتلقي الطلبات:</label>
              <select
                value={editIsActive ? 'active' : 'inactive'}
                onChange={e => setEditIsActive(e.target.value === 'active')}
                className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none cursor-pointer"
              >
                <option value="active">متاح واستقبل طلبات العملاء</option>
                <option value="inactive">غير متاح مؤقتاً (إجازة)</option>
              </select>
            </div>
          </div>

          {/* Services Checklist - Strictly Limited to Max 3 Services */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                الخدمات التي تقدمها (حد أقصى 3 خدمات فقط):
              </label>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                editServiceIds.length >= 3
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {editServiceIds.length} من 3 خدمات كحد أقصى
              </span>
            </div>

            {editServiceIds.length >= 3 ? (
              <p className="text-[11px] text-amber-700 font-bold bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                ⚠️ لقد بلغت الحد الأقصى المسموح به (3 خدمات). منصة خلصلى تركز على التخصص والسرعة. لاستبدال خدمة، قم بإلغاء تحديد إحداها أولاً.
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                اختر حتى 3 خدمات تمثل مجالك الأساسي لعرضها في الكتالوج السريع لملفك.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-100">
              {allServices.map(s => {
                const checked = editServiceIds.includes(s.id);
                const isLimitReached = editServiceIds.length >= 3;
                const disabled = !checked && isLimitReached;

                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2 p-2 rounded-xl transition-all text-xs select-none ${
                      disabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-100/60 text-slate-400'
                        : checked
                          ? 'bg-white border border-emerald-200 shadow-xs text-emerald-950 font-bold cursor-pointer'
                          : 'hover:bg-white text-slate-800 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={e => {
                        if (e.target.checked) {
                          if (editServiceIds.length >= 3) {
                            return;
                          }
                          setEditServiceIds(prev => [...prev, s.id]);
                        } else {
                          setEditServiceIds(prev => prev.filter(id => id !== s.id));
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span>{s.nameAr}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Complete Booking Modal */}
      {completingBooking && (
        <CompleteBookingModal
          isOpen={Boolean(completingBooking)}
          onClose={() => setCompletingBooking(null)}
          booking={completingBooking}
          changedByUserId={user?.id || 'provider'}
          onCompleted={() => {
            fetchDashboardData();
            setCompletingBooking(null);
          }}
        />
      )}

      {/* Dispute Modal */}
      {disputeBooking && (
        <DisputeModal
          isOpen={Boolean(disputeBooking)}
          onClose={() => setDisputeBooking(null)}
          booking={disputeBooking}
          onDisputeSubmitted={() => {
            fetchDashboardData();
            setDisputeBooking(null);
          }}
        />
      )}
    </div>
  );
}
