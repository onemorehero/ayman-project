import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Phone,
  FileText,
  Sparkles,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import type { Provider, Service, Location } from '../types.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider & { services?: Service[]; areas?: Location[] };
  initialServiceId?: string;
  onBookingCreated: (booking: any) => void;
}

export function BookingModal({ isOpen, onClose, provider, initialServiceId, onBookingCreated }: Props) {
  const { user, customer } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId || '');
  const [customServiceName, setCustomServiceName] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [locationId, setLocationId] = useState('');
  const [addressDetails, setAddressDetails] = useState(customer?.address || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('صباحاً (10 - 2)');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync phone & address from Auth
  useEffect(() => {
    if (user?.phone && !customerPhone) {
      setCustomerPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (customer?.address && !addressDetails) {
      setAddressDetails(customer.address);
    }
  }, [customer]);

  // Load services and locations for this provider
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadData = async () => {
      try {
        const [allServices, allLocations] = await Promise.all([
          api.getServices().catch(() => []),
          api.getLocations().catch(() => [])
        ]);

        if (!isMounted) return;

        // Filter services for provider
        let provServices = (allServices || []).filter(srv => {
          const inServiceIds = Array.isArray(provider.serviceIds) && provider.serviceIds.includes(srv.id);
          const inCategoryIds = Array.isArray(provider.categoryIds) && provider.categoryIds.includes(srv.categoryId);
          return inServiceIds || inCategoryIds;
        });

        if (provServices.length === 0 && provider.services && provider.services.length > 0) {
          provServices = provider.services;
        }

        if (provServices.length === 0) {
          provServices = allServices || [];
        }

        setServices(provServices);

        // Filter locations for provider
        let provLocations = (allLocations || []).filter(loc =>
          Array.isArray(provider.areaIds) && provider.areaIds.length > 0 ? provider.areaIds.includes(loc.id) : true
        );
        if (provLocations.length === 0 && provider.areas && provider.areas.length > 0) {
          provLocations = provider.areas;
        }
        if (provLocations.length === 0) {
          provLocations = allLocations || [];
        }
        setLocations(provLocations);

        // Set default selection
        if (initialServiceId && provServices.some(s => s.id === initialServiceId)) {
          setSelectedServiceId(initialServiceId);
        } else if (provServices.length > 0) {
          setSelectedServiceId(provServices[0].id);
        } else {
          setSelectedServiceId('other');
        }

        if (provLocations.length > 0) {
          setLocationId(provLocations[0].id);
        }
      } catch (err) {
        console.error('Error loading booking options:', err);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, initialServiceId, provider]);

  if (!isOpen) return null;

  const isOther = selectedServiceId === 'other';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !user.id) {
      setError('يجب تسجيل الدخول كعميل أولاً لتتمكن من إرسال طلب الحجز');
      return;
    }

    if (!selectedServiceId) {
      setError('يرجى اختيار الخدمة المطلوبة أو تحديد "أخرى"');
      return;
    }

    if (isOther && !customServiceName.trim() && !problemDescription.trim()) {
      setError('يرجى كتابة نوع الخدمة أو وصف المطلوب');
      return;
    }

    if (!problemDescription.trim()) {
      setError('يرجى كتابة تفاصيل المشكلة أو الطلب');
      return;
    }

    if (!customerPhone.trim()) {
      setError('يرجى كتابة رقم الهاتف للتواصل');
      return;
    }

    if (!addressDetails.trim()) {
      setError('يرجى كتابة تفاصيل العنوان للزيارة');
      return;
    }

    const effectiveLocationId = locationId || locations[0]?.id || provider.areaIds?.[0] || 'loc_1';

    const effectiveServiceId = isOther
      ? (services[0]?.id || 'srv_general')
      : selectedServiceId;

    const fullDescription = isOther && customServiceName.trim()
      ? `[خدمة مخصصة: ${customServiceName.trim()}] - ${problemDescription.trim()}`
      : problemDescription.trim();

    setLoading(true);
    try {
      const newBooking = await api.createBooking({
        customerId: customer?.id,
        customerUserId: user.id,
        providerId: provider.id,
        serviceId: effectiveServiceId,
        locationId: effectiveLocationId,
        problemDescription: fullDescription,
        customerPhone: customerPhone.trim(),
        addressDetails: addressDetails.trim(),
        preferredDate: preferredDate || new Date().toISOString().split('T')[0],
        preferredTime,
        urgency
      });

      onBookingCreated(newBooking);
      onClose();
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setError(err.message || 'حدث خطأ أثناء حفظ طلب الحجز، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={provider.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={provider.businessName}
              className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                طلب خدمة من {provider.businessName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                منصة خلصلى · حجز فوري بدون وسيط أو عمولة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-right">
          {!user && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold mb-0.5">تسجيل الدخول مطلوب</p>
                <p>يجب تسجيل الدخول كعميل لتتمكن من إرسال الطلب ومتابعته عبر خلصلى.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Service Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              الخدمة المطلوبة: <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
              <option value="other" className="font-bold text-slate-900">
                ✦ أخرى (خدمة أو صيانة مخصصة)
              </option>
            </select>
          </div>

          {/* Custom service name */}
          {isOther && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 block">
                حدد الخدمة أو المشكلة المخصصة:
              </label>
              <input
                type="text"
                value={customServiceName}
                onChange={e => setCustomServiceName(e.target.value)}
                placeholder="مثال: تركيب إضاءة مخفية، صيانة مضخة مياه..."
                className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium transition-all outline-none"
              />
            </div>
          )}

          {/* Problem Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              تفاصيل العطل أو الطلب: <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              rows={3}
              placeholder="اكتب وصفاً موجزاً للمشكلة لمساعدة الفني في إحضار القطع والمعدات المناسبة..."
              className="w-full p-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium transition-all outline-none resize-none"
            />
          </div>

          {/* Auto-filled Phone & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                رقم هاتفك للتواصل: <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                dir="ltr"
                className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold text-right transition-all outline-none"
              />
              <span className="text-[10px] text-slate-400 block">معبأ تلقائياً من حسابك</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                المنطقة / الحي:
              </label>
              <select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="w-full h-12 px-3 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              العنوان التفصيلي للزيارة: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={addressDetails}
              onChange={e => setAddressDetails(e.target.value)}
              placeholder="الشارع، رقم العمارة، رقم الشقة..."
              className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium transition-all outline-none"
            />
            <span className="text-[10px] text-slate-400 block">معبأ تلقائياً من ملفك الشخصي</span>
          </div>

          {/* Date & Time Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">تاريخ الزيارة المقترح:</label>
              <input
                type="date"
                value={preferredDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setPreferredDate(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">الوقت المفضل:</label>
              <select
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
                className="w-full h-12 px-3 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none"
              >
                <option value="صباحاً (10 - 2)">صباحاً (10 ص - 2 ظ)</option>
                <option value="عصراً (2 - 6)">عصراً (2 ظ - 6 م)</option>
                <option value="مساءً (6 - 10)">مساءً (6 م - 10 م)</option>
                <option value="أي وقت متاح">أي وقت متاح للفني</option>
              </select>
            </div>
          </div>

          {/* Free Guarantee Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 flex items-center gap-2.5 text-xs text-emerald-950">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>منصة خلصلى مجانية بالكامل. لا عمولات ولا رسوم وساطة، ويتم الحساب مع الفني مباشرة بعد الانتهاء.</span>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !user}
              className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:bg-slate-300 text-white font-black text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>جارٍ إرسال الطلب...</span>
              ) : (
                <>
                  <span>إرسال طلب الخدمة الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
