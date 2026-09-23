import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  MessageCircle,
  Share2,
  Check,
  Sparkles,
  Zap,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { api } from '../lib/api.js';
import { BookingModal } from '../components/BookingModal.js';
import type { Provider, Service, Review } from '../types.js';

interface Props {
  providerId: string;
  onBack: () => void;
  onBookingSuccess: (booking: any) => void;
}

export function ProviderProfileView({ providerId, onBack, onBookingSuccess }: Props) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'photos'>('services');

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.getProviderById(providerId)
      .then(data => {
        if (!isMounted) return;
        if (data) {
          setProvider(data);
        } else {
          setError('لم يتم العثور على الفني المطلوب');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Error fetching provider:', err);
        setError('تعذر تحميل بيانات الفني');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [providerId]);

  const handleCopyLink = async () => {
    const fullUrl = window.location.origin + `/provider/${provider?.slug || provider?.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleBookService = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingModalOpen(true);
  };

  // Prepare open WhatsApp Link (No restrictions)
  const getWhatsAppUrl = () => {
    const rawPhone = provider?.user?.phone || '01000000000';
    const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '20');
    const msg = `مرحباً أسطى ${provider?.businessName || ''}، أود الاستفسار عن خدمة صيانة منزلية من خلال منصة خلصلى.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1 text-center sm:text-right w-full">
              <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto sm:mx-0" />
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
          className="h-11 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 active:scale-95 transition-all inline-flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الفنيين</span>
        </button>
      </div>
    );
  }

  const rawServices = provider.services || [];
  // Catalog limit: Top 3 services
  const services = rawServices.slice(0, 3);
  const areas = provider.areas || [];
  const reviews = provider.reviews || [];
  const providerPhone = provider.user?.phone || '01000000000';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Bar: Navigation & Link Sharing */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
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

      {/* Hero Card - Open Catalog Identity */}
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
          <span>منصة خلصلى كتالوج مفتوح ومجاني 100%: تواصل مباشر بدون أي وسطاء أو استقطاعات مالية.</span>
        </div>

        {/* Open Contact Information & Action Bar (100% Public - No Hidden Condition) */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">بيانات التواصل المباشر مع الفني:</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
              متاح للاتصال الفوري
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Phone Call Button */}
            <a
              href={`tel:${providerPhone}`}
              className="h-13 px-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 active:scale-95 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <div className="text-right">
                <span className="block text-[10px] text-slate-400 font-medium leading-none mb-0.5">اتصال هاتفي</span>
                <span className="font-mono text-xs sm:text-sm">{providerPhone}</span>
              </div>
            </a>

            {/* Direct WhatsApp Button */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="h-13 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>تواصل واتساب مباشر</span>
            </a>

            {/* Quick Request Button */}
            <button
              type="button"
              onClick={() => handleBookService()}
              className="h-13 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>طلب خدمة سريع</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
            activeTab === 'services'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          خدمات الفني ({services.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
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
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
            activeTab === 'photos'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          معرض الأعمال ({provider.workPhotos?.length || 0})
        </button>
      </div>

      {/* Tab 1: Services (Limited to 3 + Other) */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {services.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-3"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                    خدمة معتمدة
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{service.nameAr}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{service.description || 'صيانة وإصلاح احترافي مباشر بأحدث المعدات.'}</p>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {service.basePrice ? `من ${service.basePrice} ج.م` : 'معاينة'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBookService(service.id)}
                    className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    طلب الخدمة
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Guaranteed "Custom / Other" card */}
          <div className="bg-slate-100/70 rounded-3xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="font-bold text-slate-900 text-sm">عطل أو خدمة أخرى غير مدرجة؟</h4>
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
            <p className="text-center py-10 text-xs text-slate-500">لا توجد تقييمات حتى الآن. كن أول من يقيّم الفني بعد إنجاز الطلب!</p>
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

      {/* Quick Request Booking Modal */}
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
