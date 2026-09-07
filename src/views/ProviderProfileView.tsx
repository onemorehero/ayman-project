import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Award,
  Images,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api.js';
import { BookingModal } from '../components/BookingModal.js';
import type { Provider, Service, Location, Category, Review } from '../types.js';

interface Props {
  providerId: string;
  onBack: () => void;
  onBookingSuccess: (booking: any) => void;
}

export function ProviderProfileView({ providerId, onBack, onBookingSuccess }: Props) {
  const [provider, setProvider] = useState<(Provider & {
    services: Service[];
    categories: Category[];
    areas: Location[];
    reviews: Review[];
  }) | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'services' | 'photos' | 'reviews'>('services');

  const fetchProviderData = () => {
    setLoading(true);
    api.getProviderById(providerId)
      .then(data => setProvider(data))
      .catch(err => setError(err.message || 'فشل تحميل بيانات مقدم الخدمة'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviderData();
  }, [providerId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-5 w-36 bg-slate-200 rounded animate-pulse"></div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 animate-pulse space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 shrink-0"></div>
            <div className="flex-1 space-y-3 w-full">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-100 rounded w-1/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
            <div className="w-full sm:w-44 h-12 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse h-28"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="font-extrabold text-slate-900 text-lg">{error || 'مقدم الخدمة غير موجود'}</h3>
        <p className="text-xs text-slate-500 font-normal">
          ربما تم تغيير المعرف أو لم يعد الفني متاحاً حالياً.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
        >
          العودة لقائمة الفنيين
        </button>
      </div>
    );
  }

  const handleBookService = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-2xs cursor-pointer group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span>الرجوع إلى قائمة الفنيين</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={provider.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
            alt={provider.businessName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
          />

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {provider.businessName}
              </h1>
              {provider.isVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>موثق بالرقم القومي</span>
                </span>
              )}
            </div>

            <p className="text-sm font-bold text-slate-600">
              {provider.user?.name} | {provider.categories?.map(c => c.nameAr).join(' • ')}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5 font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-sm">{provider.rating}</span>
                <span className="text-slate-400 font-medium">({provider.reviewCount} تقييم)</span>
              </div>

              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1 text-slate-700 font-bold">
                <Award className="w-4 h-4 text-amber-500" />
                <span>خبرة {provider.experienceYears} سنوات</span>
              </div>

              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1 text-slate-700 font-medium">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  ساعات العمل: {provider.workingHours.start} - {provider.workingHours.end}
                </span>
              </div>
            </div>

            {/* Areas badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>مناطق التغطية:</span>
              </span>
              {provider.areas?.map(area => (
                <span
                  key={area.id}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  {area.nameAr}
                </span>
              ))}
            </div>
          </div>

          {/* Primary CTA Book button */}
          <div className="sm:text-left w-full sm:w-auto pt-4 sm:pt-0 shrink-0">
            <button
              type="button"
              onClick={() => handleBookService()}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 stroke-[2.5]" />
              <span>طلب حجز موعد</span>
            </button>
            <p className="text-[11px] text-slate-500 font-medium mt-2 text-center sm:text-left">
              اتفاق السعر مباشرة مع الفني
            </p>
          </div>
        </div>

        {/* Bio description */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            نبذة عن مقدم الخدمة والخبرات المهنية
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl font-normal">
            {provider.bio}
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          الخدمات المتاحة ({provider.services?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('photos')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'photos'
              ? 'border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Images className="w-4 h-4" />
          <span>أعمال منفذة ({provider.workPhotos?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>تقييمات العملاء ({provider.reviews?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Services List */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {provider.services?.length === 0 ? (
            <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-xs text-slate-400 font-medium">لم يتم إدراج خدمات محددة بعد، يمكنك طلب حجز عام بالضغط على الزر بالأعلى.</p>
            </div>
          ) : (
            provider.services?.map(srv => (
              <div
                key={srv.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-base text-slate-900 group-hover:text-amber-800 transition-colors">
                      {srv.nameAr}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 shrink-0">
                      متاحة للحجز
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    السعر: بالمعاينة والاتفاق
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBookService(srv.id)}
                    className="py-2 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-900 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>طلب الخدمة</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Photos Gallery */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          {provider.workPhotos?.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <Images className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">لم يقم الفني برفع صور لأعماله السابقة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {provider.workPhotos?.map((photo, index) => (
                <div
                  key={index}
                  className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 group relative aspect-video"
                >
                  <img
                    src={photo}
                    alt={`عمل سابق ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-bold">
                    عمل سابق موثق في الميدان
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{provider.rating}</span>
              <div>
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(provider.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">بناءً على {provider.reviewCount} تقييم حقيقي</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 max-w-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>التقييمات مقتصرة فقط على العملاء الذين اكتملت طلباتهم فعلياً عبر المنصة</span>
            </div>
          </div>

          <div className="space-y-3">
            {provider.reviews?.length === 0 ? (
              <div className="py-14 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                <Star className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">لا توجد تقييمات مكتوبة حتى الآن لهذا الفني</p>
              </div>
            ) : (
              provider.reviews?.map(rev => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={rev.customerName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{rev.customerName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            حجز مكتمل
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span>{new Date(rev.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {rev.comment}
                  </p>

                  {/* Provider Reply if exists */}
                  {rev.providerReply && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border-r-4 border-amber-500 text-xs text-slate-800 space-y-1">
                      <p className="font-black text-amber-900 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>رد الفني ({provider.businessName}):</span>
                      </p>
                      <p className="text-slate-700 leading-relaxed font-normal">{rev.providerReply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          provider={provider}
          initialServiceId={selectedServiceId}
          onBookingCreated={(newBooking) => {
            onBookingSuccess(newBooking);
            fetchProviderData();
          }}
        />
      )}
    </div>
  );
}
