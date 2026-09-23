import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Star,
  MessageCircle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Zap,
  Sparkles,
  ChevronLeft,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { ReviewModal } from '../components/ReviewModal.js';
import { DisputeModal } from '../components/DisputeModal.js';
import { BookingModal, type InitialBookingData } from '../components/BookingModal.js';
import { EditProfileModal } from '../components/EditProfileModal.js';
import { UserAvatar } from '../components/UserAvatar.js';
import type { Booking, Provider } from '../types.js';

interface Props {
  onNavigateToProvider: (providerId: string) => void;
}

export function CustomerDashboardView({ onNavigateToProvider }: Props) {
  const { user, customer, updateCustomerProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'pending' | 'completed'>('all');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Modals state
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState<Booking | null>(null);
  const [rebookingProvider, setRebookingProvider] = useState<Provider | null>(null);
  const [rebookingInitialServiceId, setRebookingInitialServiceId] = useState<string | undefined>(undefined);
  const [rebookingInitialData, setRebookingInitialData] = useState<InitialBookingData | undefined>(undefined);

  // Alternative providers cache by booking ID and category
  const [suggestedProvidersMap, setSuggestedProvidersMap] = useState<Record<string, Provider[]>>({});

  const fetchBookings = () => {
    if (!user) return;
    setLoading(true);
    api.getBookings({ customerUserId: user.id })
      .then(data => {
        setBookings(data);
        // Preload alternative providers for both rejected and cancelled bookings
        const needsAlternatives = data.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED');
        needsAlternatives.forEach(b => {
          const catId = b.service?.categoryId || b.category?.id;
          api.getAlternativeProviders(catId, b.providerId, b.serviceId).then(alts => {
            setSuggestedProvidersMap(prev => ({
              ...prev,
              [b.id]: alts,
              ...(catId ? { [catId]: alts } : {})
            }));
          }).catch(() => {});
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleOneClickResubmit = (booking: Booking, targetProvider: Provider) => {
    setRebookingProvider(targetProvider);
    setRebookingInitialServiceId(booking.serviceId);
    setRebookingInitialData({
      problemDescription: booking.problemDescription,
      addressDetails: booking.addressDetails,
      customerPhone: booking.customerPhone || user?.phone || '',
      urgency: booking.urgency || 'normal',
      locationId: booking.locationId
    });
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (booking: Booking) => {
    const reason = prompt('يرجى كتابة سبب إلغاء الطلب:');
    if (reason === null) return;

    try {
      await api.updateBookingStatus(booking.id, 'CANCELLED', {
        changedByUserId: user?.id || 'customer',
        cancellationReason: reason.trim() || 'إلغاء من طرف العميل'
      });
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'تعذر إلغاء الطلب');
    }
  };

  const getWhatsAppLink = (phone: string, booking: Booking) => {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '20');
    const msg = `مرحباً، أتواصل معك بخصوص طلب الخدمة رقم (${booking.bookingNumber}) - خدمة: ${booking.service?.nameAr || 'خدمة صيانة'} عبر تطبيق خلصلى.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    if (activeTab === 'accepted') return b.status === 'ACCEPTED' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS';
    if (activeTab === 'pending') return b.status === 'PENDING';
    if (activeTab === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4" dir="rtl">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">طلبات الصيانة والخدمات</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          يرجى تسجيل الدخول أو إنشاء حساب لعرض ومتابعة قائمة طلباتك والتواصل مع الفنيين.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Profile Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-right">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group">
            <UserAvatar
              src={user?.avatarUrl}
              name={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs"
              iconClassName="w-8 h-8 sm:w-10 sm:h-10 text-slate-400"
            />
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute -bottom-1 -left-1 w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="تعديل الصورة والبيانات"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name || 'حساب العميل'}</h1>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>تعديل الحساب</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 font-medium">
              <span>{user?.phone || 'بدون هاتف مسجل'}</span>
              <span>·</span>
              <span>{customer?.address || 'العنوان غير محدد'}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 max-w-xs text-center sm:text-right">
          <p className="font-bold text-slate-900 mb-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>منصة خلصلى</span>
          </p>
          <p className="text-[11px] text-slate-500">تواصل مباشر مع الفنيين بدون أي رسوم وساطة أو عمولات إضافية.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          جميع الطلبات ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('accepted')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'accepted' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          المقبولة والجارية ({bookings.filter(b => ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          قيد المراجعة ({bookings.filter(b => b.status === 'PENDING').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
            activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          المكتملة ({bookings.filter(b => b.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse h-40" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">لا توجد طلبات في هذا القسم</h3>
          <p className="text-xs text-slate-500">يمكنك استعراض الفنيين وطلب خدمة فورية وبشكل مجاني 100%.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(b => {
            const isAccepted = ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status);
            const isCompleted = b.status === 'COMPLETED';
            const isRejected = b.status === 'REJECTED';
            const isPending = b.status === 'PENDING';
            const isCancelled = b.status === 'CANCELLED';

            const providerPhone = b.provider?.user?.phone || '01000000000';
            const catId = b.service?.categoryId || b.category?.id;
            const alternatives = suggestedProvidersMap[b.id] || (catId ? (suggestedProvidersMap[catId] || []) : []);

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 space-y-4 transition-all duration-300 hover:shadow-lg"
              >
                {/* Top Row: Provider info, Status, & Subtle Dispute Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={b.provider?.user?.avatarUrl}
                      name={b.provider?.businessName}
                      className="w-12 h-12 rounded-2xl border border-slate-200 shrink-0"
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => onNavigateToProvider(b.providerId)}
                        className="font-bold text-slate-900 text-base hover:text-emerald-600 transition-colors text-right flex items-center gap-1.5 group"
                      >
                        <span>{b.provider?.businessName || 'مقدم الخدمة'}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                      </button>
                      <p className="text-xs text-slate-400">
                        طلب رقم #{b.bookingNumber} · {new Date(b.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>قيد مراجعة الفني</span>
                      </span>
                    )}
                    {isAccepted && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم قبول الطلب</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>مكتمل بنجاح</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 inline-flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>اعتذر الفني عن الطلب</span>
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 inline-flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>طلب ملغي</span>
                      </span>
                    )}

                    {/* "إبلاغ عن مشكلة" button */}
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForDispute(b)}
                      className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer active:scale-95"
                      title="إبلاغ عن مشكلة أو تلاعب"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>إبلاغ عن مشكلة</span>
                    </button>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      الخدمة: {b.service?.nameAr || 'خدمة صيانة وإصلاح'}
                    </span>
                    {b.preferredDate && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{b.preferredDate} ({b.preferredTime})</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {b.problemDescription}
                  </p>
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{b.addressDetails}</span>
                    </span>
                    {isCompleted && b.finalPrice && (
                      <span className="font-bold text-slate-900">
                        التكلفة الإجمالية: {b.finalPrice} ج.م
                      </span>
                    )}
                  </div>
                </div>

                {/* CASE: REJECTED or CANCELLED -> Suggest alternative providers with One-Click Resubmit */}
                {(isRejected || isCancelled) && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>فنيين مقترحين كبديل:</span>
                        </h4>
                        <p className="text-[11px] text-amber-900/80">
                          {isRejected
                            ? 'اعتذر الفني عن هذا الطلب؛ يمكنك إرسال نفس تفاصيل طلبك مباشرة بنقرة واحدة لفني بديل متاح:'
                            : 'تم إلغاء هذا الطلب؛ يمكنك إعادة إرسال نفس تفاصيل طلبك مباشرة لأحد الفنيين البدلاء:'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigateToProvider('')}
                        className="text-[11px] font-bold text-amber-900 hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>كل الفنيين</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {alternatives.length > 0 ? (
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory pt-1">
                        {alternatives.map(alt => (
                          <div
                            key={alt.id}
                            className="min-w-[240px] max-w-[260px] shrink-0 bg-white rounded-2xl p-3.5 border border-amber-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3 snap-start"
                          >
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                src={alt.user?.avatarUrl}
                                name={alt.businessName}
                                className="w-10 h-10 rounded-xl shrink-0 border border-slate-200"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{alt.businessName}</p>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span className="font-bold text-slate-800">
                                    {alt.rating ? alt.rating.toFixed(1) : '5.0'}
                                  </span>
                                  <span>·</span>
                                  <span>{alt.experienceYears || 3} سنين خبرة</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOneClickResubmit(b, alt)}
                              className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 text-white" />
                              <span>إرسال نفس الطلب</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-200 text-xs text-slate-600">
                        <span>لا توجد ترشيحات مباشرة حالياً في هذا القسم</span>
                        <button
                          type="button"
                          onClick={() => onNavigateToProvider('')}
                          className="font-bold text-emerald-700 hover:underline"
                        >
                          استعراض الدليل العام
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions: Communication & Rating (Strictly only for ACCEPTED or COMPLETED) */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* WhatsApp button - ONLY for ACCEPTED or COMPLETED */}
                    {(isAccepted || isCompleted) && (
                      <a
                        href={getWhatsAppLink(providerPhone, b)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 inline-flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>تواصل عبر واتساب ({providerPhone})</span>
                      </a>
                    )}

                    {/* Direct phone call button - ONLY for ACCEPTED or COMPLETED */}
                    {(isAccepted || isCompleted) && (
                      <a
                        href={`tel:${providerPhone}`}
                        className="h-11 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>اتصال هاتفي</span>
                      </a>
                    )}

                    {/* Cancel booking option for pending or accepted */}
                    {(isPending || isAccepted) && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b)}
                        className="h-11 px-3.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 active:scale-95 text-xs font-semibold transition-all"
                      >
                        إلغاء الطلب
                      </button>
                    )}
                  </div>

                  {/* Review Button: ONLY for ACCEPTED or COMPLETED. STRICTLY HIDDEN for PENDING or REJECTED */}
                  {(isAccepted || isCompleted) && (
                    <div>
                      {b.review ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-3 py-2 rounded-xl border border-amber-200/60">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>تقييمك: {b.review.rating} / 5 نجوم</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForReview(b)}
                          className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
                        >
                          <Star className="w-4 h-4 text-amber-400" />
                          <span>تقييم تجربة الفني</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <ReviewModal
          isOpen={Boolean(selectedBookingForReview)}
          onClose={() => setSelectedBookingForReview(null)}
          booking={selectedBookingForReview}
          onReviewSubmitted={() => {
            fetchBookings();
            setSelectedBookingForReview(null);
          }}
        />
      )}

      {/* Dispute Modal */}
      {selectedBookingForDispute && (
        <DisputeModal
          isOpen={Boolean(selectedBookingForDispute)}
          onClose={() => setSelectedBookingForDispute(null)}
          booking={selectedBookingForDispute}
          onDisputeSubmitted={() => {
            fetchBookings();
            setSelectedBookingForDispute(null);
          }}
        />
      )}

      {/* Re-booking Modal for Suggested Alternative Provider */}
      {rebookingProvider && (
        <BookingModal
          isOpen={Boolean(rebookingProvider)}
          onClose={() => {
            setRebookingProvider(null);
            setRebookingInitialData(undefined);
            setRebookingInitialServiceId(undefined);
          }}
          provider={rebookingProvider}
          initialServiceId={rebookingInitialServiceId}
          initialBookingData={rebookingInitialData}
          onBookingCreated={() => {
            setRebookingProvider(null);
            setRebookingInitialData(undefined);
            setRebookingInitialServiceId(undefined);
            fetchBookings();
          }}
        />
      )}

      {/* Edit Customer Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialName={user?.name || ''}
        initialPhone={user?.phone || ''}
        initialAddress={customer?.address || ''}
        initialAvatarUrl={user?.avatarUrl || ''}
        onSave={async (data) => {
          await updateCustomerProfile(data);
        }}
      />
    </div>
  );
}
