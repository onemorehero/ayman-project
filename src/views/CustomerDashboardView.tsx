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
  MessageSquare,
  Sparkles,
  ChevronLeft,
  User,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { LocationMap } from '../components/LocationMap.js';
import { ReviewModal } from '../components/ReviewModal.js';
import type { Booking, Review } from '../types.js';

interface Props {
  onNavigateToProvider: (providerId: string) => void;
}

export function CustomerDashboardView({ onNavigateToProvider }: Props) {
  const { user, customer } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'account'>('active');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);

  const fetchBookings = () => {
    if (!user) return;
    setLoading(true);
    api.getBookings({ customerUserId: user.id })
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    const reason = prompt('يرجى كتابة سبب إلغاء الحجز:');
    if (reason === null) return;

    try {
      await api.updateBookingStatus(bookingId, 'CANCELLED', {
        changedByUserId: user?.id || 'customer',
        cancellationReason: reason || 'إلغاء من طرف العميل'
      });
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'فشل إلغاء الحجز');
    }
  };

  const activeBookings = bookings.filter(b =>
    ['PENDING', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)
  );

  const pastBookings = bookings.filter(b =>
    ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(b.status)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>قيد مراجعة الفني</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم قبول الطلب</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مؤكد والموعد محدد</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>جاري تنفيذ الصيانة حالياً</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مكتمل بنجاح</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            <span>تم الاعتذار عن الطلب</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3.5 h-3.5" />
            <span>ملغي</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/80 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300/60">
                حساب عميل
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              هاتف: <span className="font-mono text-slate-700">{user?.phone}</span> | بريد: <span className="text-slate-700">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">الطلبات الجارية</span>
            <span className="text-lg font-black text-amber-600">{activeBookings.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">الطلبات المنتهية</span>
            <span className="text-lg font-black text-emerald-600">{pastBookings.filter(b => b.status === 'COMPLETED').length}</span>
          </div>
          <button
            type="button"
            onClick={fetchBookings}
            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="تحديث الطلبات"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'active'
              ? 'border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>الطلبات الحالية</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-900 font-black">
            {activeBookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>سجل الطلبات والتقييمات</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-black">
            {pastBookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'account'
              ? 'border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          بيانات الحساب والعنوان
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                <div className="h-5 bg-slate-200 rounded w-1/6"></div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : activeTab === 'active' ? (
        <div className="space-y-4">
          {activeBookings.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">لا توجد طلبات جارية حالياً</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                هل تحتاج لخدمة سباكة، كهرباء، أو تكييف؟ تصفح الفنيين في منطقتك واحجز موعدك بسهولة.
              </p>
            </div>
          ) : (
            activeBookings.map(bk => (
              <div
                key={bk.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-sm text-slate-900">
                      طلب رقم {bk.bookingNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      • {new Date(bk.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div>{getStatusBadge(bk.status)}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Provider Info */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">مقدم الخدمة</span>
                    <p
                      onClick={() => onNavigateToProvider(bk.providerId)}
                      className="font-black text-slate-900 hover:text-amber-600 cursor-pointer text-sm transition-colors"
                    >
                      {bk.provider?.businessName}
                    </p>
                    <a
                      href={`tel:${bk.provider?.user?.phone || '01019876543'}`}
                      className="text-xs text-slate-600 hover:text-amber-600 flex items-center gap-1.5 font-mono font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bk.provider?.user?.phone || '01019876543'}</span>
                    </a>
                  </div>

                  {/* Service & Problem */}
                  <div className="space-y-1.5 md:col-span-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">الخدمة وتفاصيل العطل</span>
                    <p className="font-extrabold text-slate-900 text-sm">{bk.service?.nameAr}</p>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {bk.problemDescription}
                    </p>
                  </div>
                </div>

                {/* Logistics */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-3 border-t border-slate-100 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>العنوان: {bk.addressDetails} ({bk.location?.nameAr})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      الميعاد المفضل: {bk.preferredDate || 'حسب التنسيق'} ({bk.preferredTime})
                    </span>
                  </div>

                  {bk.urgency === 'nearest' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                      ⚡ طوارئ - أقرب موعد متاح
                    </span>
                  )}
                </div>

                {/* Location Map Toggle for Customer */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setExpandedMapId(expandedMapId === bk.id ? null : bk.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300/80 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{expandedMapId === bk.id ? 'إخفاء خريطة الموقع' : 'موقعك المحدد على الخريطة (Pin Drop)'}</span>
                    {bk.lat && bk.lng && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        إحداثيات مسجلة ✓
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
                        label={`موقعك: ${bk.addressDetails}`}
                      />
                    </div>
                  )}
                </div>

                {/* Notice & Cancel button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-950 text-[11px] font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>تذكير: السعر يتم الاتفاق عليه مباشرة مع الفني، والمنصة لا تحدد سعر الخدمة.</span>
                  </div>

                  {bk.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(bk.id)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      إلغاء الطلب
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'history' ? (
        <div className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">لا توجد طلبات سابقة مكتملة</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                ستظهر هنا تفاصيل الطلبات التي تم إنجازها لتتمكن من تقييم الفنيين ومراجعة الأسعار المتفق عليها.
              </p>
            </div>
          ) : (
            pastBookings.map(bk => (
              <div
                key={bk.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-sm text-slate-900">طلب رقم {bk.bookingNumber}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      • {new Date(bk.updatedAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div>{getStatusBadge(bk.status)}</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-black text-base text-slate-900">
                      {bk.service?.nameAr}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      مقدم الخدمة: <span className="font-bold text-slate-800">{bk.provider?.businessName}</span> ({bk.location?.nameAr})
                    </p>
                    {bk.finalPrice && (
                      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-block mt-1">
                        السعر النهائي المنفذ: {bk.finalPrice} ج.م
                      </p>
                    )}
                  </div>

                  {/* Review Action */}
                  {bk.status === 'COMPLETED' && (
                    <div>
                      {bk.review ? (
                        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/70 text-right space-y-1.5 max-w-sm shadow-2xs">
                          <div className="flex items-center gap-1.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= bk.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-amber-900 mr-1">
                              تم تقييمك ({bk.review.rating}/5)
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">{bk.review.comment}</p>
                          {bk.review.providerReply && (
                            <div className="text-[11px] text-amber-900 bg-white/80 p-2 rounded-xl border border-amber-200/50 mt-1">
                              <span className="font-bold block text-slate-700">رد الفني:</span>
                              <span>{bk.review.providerReply}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForReview(bk)}
                          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-slate-950" />
                          <span>أضف تقييمك للخدمة الآن</span>
                        </button>
                      )}
                    </div>
                  )}

                  {bk.status === 'REJECTED' && bk.rejectionReason && (
                    <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <span className="font-bold block mb-0.5">سبب الاعتذار:</span>
                      <span>{bk.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Account Info Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 max-w-xl">
          <h3 className="font-extrabold text-base text-slate-900">بيانات الحساب الشخصي</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold block mb-1">الاسم:</span>
              <p className="font-bold text-slate-800 text-sm">{user?.name}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-1">البريد الإلكتروني:</span>
              <p className="font-medium text-slate-800">{user?.email}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-1">رقم الهاتف:</span>
              <p className="font-medium text-slate-800">{user?.phone}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-1">العنوان المسجل:</span>
              <p className="font-medium text-slate-800">{customer?.address || 'شارع عباس العقاد، مدينة نصر، القاهرة'}</p>
            </div>
          </div>
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
          }}
        />
      )}
    </div>
  );
}
