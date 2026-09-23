import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Images,
  ArrowRight,
  Zap,
  MessageSquare,
  Sparkles
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
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.getProviderBySlugOrId(providerId)
      .then(data => {
        if (!isMounted) return;
        setProvider(data as any);

        // Update URL to clean /provider/:slug without reloading
        const targetSlug = data.slug || data.id;
        if (window.location.pathname !== `/provider/${targetSlug}`) {
          window.history.replaceState({ providerId: data.id }, '', `/provider/${targetSlug}`);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message || 'فشل تحميل بيانات مقدم الخدمة');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [providerId]);

  const handleCopyLink = () => {
    const slug = provider?.slug || provider?.id || providerId;
    const url = `${window.location.origin}/provider/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handleBookService = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-6 animate-pulse">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-3 w-full text-center sm:text-right">
              <div className="h-7 bg-slate-200 rounded w-1/2 mx-auto sm:mx-0" />
              <div className="h-4 bg-slate-100 rounded w-1/3 mx-auto sm:mx-0" />
              <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto sm:mx-0" />
            </div>
          </div>
          <div className="h-14 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">{error || 'مقدم الخدمة غير موجود'}</h3>
        <p className="text-xs text-slate-500">
          ربما تم تعديل الرابط أو لم يعد حساب الفني متوفراً في الوقت الحالي.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 active:scale-95 transition-all inline-flex items-center gap-2 shadow-md shadow-emerald-600/20"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الفنيين</span>
        </button>
      </div>
    );
  }

  const services = provider.services || [];
  const areas = provider.areas || [];
  const reviews = provider.reviews || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Bar: Navigation & Link Sharing */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تصفح كل الفنيين</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
          title="مشاركة رابط الفني المباشر"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">تم نسخ الرابط!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>مشاركة الرابط الشخصي</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-100/80 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-right">
          <img
            src={provider.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
            alt={provider.businessName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border border-slate-200 shadow-sm shrink-0"
          />

          <div className="flex-1 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {provider.businessName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  الرابط المباشر: <span className="font-mono text-emerald-700 font-bold">/provider/{provider.slug || provider.id}</span>
                </p>
              </div>

              {provider.isVerified && (
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 self-center sm:self-auto bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">حرفي معتمد وموثق</span>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed max-w-2xl font-normal">
              {provider.bio || 'فني محترف ومتخصص في تقديم خدمات الصيانة والإصلاح بجودة عالية وبشكل مباشر.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-3 text-xs text-slate-600 pt-1 font-medium">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-900">{provider.rating.toFixed(1)}</span>
                <span className="text-slate-400">({provider.reviewCount} تقييم)</span>
              </div>
              <span className="text-slate-300">·</span>
              <span>خبرة {provider.experienceYears} سنوات</span>
              <span className="text-slate-300">·</span>
              <span>{provider.completedJobs || 0} خدمة منجزة</span>
              {areas.length > 0 && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{areas.map(a => a.nameAr).join('، ')}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Free platform reassurance notice */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-950 font-medium">
          <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>منصة خلصلى مجانية 100%: تواصل مباشر مع الفني بدون أي عمولات أو رسوم وساطة مستقطعة.</span>
        </div>

        {/* Large Prominent Mobile-First CTA Button */}
        <div>
          <button
            type="button"
            onClick={() => handleBookService()}
            className="w-full h-14 sm:h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>طلب خدمة فوري من {provider.businessName}</span>
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
            activeTab === 'services'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الخدمات المتاحة ({services.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
            activeTab === 'reviews'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تقييمات العملاء ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('photos')}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
            activeTab === 'photos'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          معرض الأعمال ({provider.workPhotos?.length || 0})
        </button>
      </div>

      {/* Tab 1: Services */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {services.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-3"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">{service.nameAr}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{service.description || 'صيانة وفحص وإصلاح متخصص بأحدث المعدات.'}</p>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {service.basePrice ? `يبدأ من ${service.basePrice} ج.م تقريباً` : 'تسعير مباشر حسب المعاينة'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBookService(service.id)}
                    className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    طلب هذه الخدمة
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Guaranteed "Custom / Other" card */}
          <div className="bg-slate-100/70 rounded-3xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="font-bold text-slate-900 text-sm">لم تجد الخدمة المحددة في القائمة؟</h4>
              <p className="text-xs text-slate-600">يمكنك إرسال طلب لخدمة مخصصة وسيتواصل معك الفني لتحديد التفاصيل فوراً.</p>
            </div>
            <button
              type="button"
              onClick={() => handleBookService('other')}
              className="h-11 px-5 rounded-2xl border border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white active:scale-95 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
            >
              طلب صيانة مخصصة
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Reviews */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">تقييمات وتجارب العملاء</h3>
              <p className="text-xs text-slate-400">تقييمات حقيقية موثقة من عملاء أنجز الفني خدماتهم</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-slate-900 text-sm">{provider.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-500">لا توجد تقييمات مكتوبة حتى الآن. كن أول من يقيّم الفني بعد إنجاز الطلب!</p>
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

      {/* Tab 3: Photos */}
      {activeTab === 'photos' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {provider.workPhotos && provider.workPhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {provider.workPhotos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`عمل ${idx + 1}`}
                  className="w-full h-44 rounded-2xl object-cover border border-slate-100 hover:opacity-95 transition-opacity"
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-xs text-slate-500">لم يقم الفني برفع صور في معرض الأعمال حتى الآن.</p>
          )}
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
            setIsBookingModalOpen(false);
            onBookingSuccess(newBooking);
          }}
        />
      )}
    </div>
  );
}
