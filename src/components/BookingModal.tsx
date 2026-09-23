import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  MapPin,
  Phone,
  FileText,
  Zap,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import type { Provider, Service, Location } from '../types.js';

export interface InitialBookingData {
  problemDescription?: string;
  addressDetails?: string;
  customerPhone?: string;
  urgency?: 'normal' | 'urgent';
  locationId?: string;
  customServiceName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider & { services?: Service[]; areas?: Location[] };
  initialServiceId?: string;
  initialBookingData?: InitialBookingData;
  onBookingCreated: (booking: any) => void;
}

export function BookingModal({
  isOpen,
  onClose,
  provider,
  initialServiceId,
  initialBookingData,
  onBookingCreated
}: Props) {
  const { user, customer } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Form state - Quick Request (No visit date or time)
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId || '');
  const [customServiceName, setCustomServiceName] = useState(initialBookingData?.customServiceName || '');
  const [problemDescription, setProblemDescription] = useState(initialBookingData?.problemDescription || '');
  const [customerPhone, setCustomerPhone] = useState(initialBookingData?.customerPhone || user?.phone || '');
  const [locationId, setLocationId] = useState(initialBookingData?.locationId || '');
  const [addressDetails, setAddressDetails] = useState(initialBookingData?.addressDetails || customer?.address || '');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>(initialBookingData?.urgency || 'normal');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens or initialBookingData changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialBookingData) {
      if (initialBookingData.problemDescription !== undefined) {
        setProblemDescription(initialBookingData.problemDescription);
      }
      if (initialBookingData.addressDetails !== undefined) {
        setAddressDetails(initialBookingData.addressDetails);
      }
      if (initialBookingData.customerPhone !== undefined) {
        setCustomerPhone(initialBookingData.customerPhone);
      }
      if (initialBookingData.urgency !== undefined) {
        setUrgency(initialBookingData.urgency);
      }
      if (initialBookingData.locationId !== undefined) {
        setLocationId(initialBookingData.locationId);
      }
      if (initialBookingData.customServiceName !== undefined) {
        setCustomServiceName(initialBookingData.customServiceName);
      }
    } else {
      if (user?.phone && !customerPhone) {
        setCustomerPhone(user.phone);
      }
      if (customer?.address && !addressDetails) {
        setAddressDetails(customer.address);
      }
    }

    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
    }
  }, [isOpen, initialBookingData, initialServiceId, user, customer]);

  // Load services and locations for this provider (Enforce max 3 services for provider + Other)
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
          provServices = (allServices || []).slice(0, 3);
        }

        // Enforce maximum 3 services for the provider's catalog
        const limitedServices = provServices.slice(0, 3);
        setServices(limitedServices);

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
        if (initialServiceId && limitedServices.some(s => s.id === initialServiceId)) {
          setSelectedServiceId(initialServiceId);
        } else if (limitedServices.length > 0) {
          setSelectedServiceId(limitedServices[0].id);
        } else {
          setSelectedServiceId('other');
        }

        if (initialBookingData?.locationId && provLocations.some(l => l.id === initialBookingData.locationId)) {
          setLocationId(initialBookingData.locationId);
        } else if (provLocations.length > 0) {
          setLocationId(provLocations[0].id);
        }
      } catch (err) {
        console.error('Error loading quick request options:', err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialServiceId, initialBookingData, provider]);

  if (!isOpen) return null;

  const isOther = selectedServiceId === 'other';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !user.id) {
      setError('يجب تسجيل الدخول كعميل أولاً لتتمكن من إرسال الطلب');
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
      setError('يرجى كتابة تفاصيل العطل أو المشكلة');
      return;
    }

    if (!customerPhone.trim()) {
      setError('يرجى كتابة رقم الهاتف للتواصل');
      return;
    }

    if (!addressDetails.trim()) {
      setError('يرجى كتابة تفاصيل العنوان');
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
        preferredDate: null as any,
        preferredTime: null as any,
        urgency
      });

      onBookingCreated(newBooking);
      onClose();
    } catch (err: any) {
      console.error('Quick request submission error:', err);
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header - Quick Request Identity */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={provider.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={provider.businessName}
              className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  طلب خدمة سريع
                </h3>
                <span className="text-[10px] font-black bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  فوري
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                إلى الفني: <span className="font-bold text-slate-800">{provider.businessName}</span> · منصة خلصلى
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If prefilled from previous booking */}
        {initialBookingData && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-950 font-semibold animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم ملء بيانات طلبك السابق تلقائياً؛ يمكنك مراجعتها وتأكيد الإرسال فوراً بضغطة زر.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-right">
          {!user && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold mb-0.5">تسجيل الدخول مطلوب</p>
                <p>يجب تسجيل الدخول كعميل لتتمكن من إرسال الطلب والتواصل مع الفني عبر خلصلى.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Service Selector: Displays provider's max 3 services + fixed "أخرى" */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                الخدمة المطلوبة من الفني: <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                كتالوج خدمات الفني ({services.length})
              </span>
            </div>
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none cursor-pointer"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
              <option value="other" className="font-bold text-slate-900">
                ✦ أخرى (طلب خدمة أو صيانة مخصصة)
              </option>
            </select>
          </div>

          {/* Custom service name if "other" is selected */}
          {isOther && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 block">
                حدد نوع الخدمة أو العطل المطلوب:
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

          {/* Problem Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              تفاصيل العطل أو الطلب: <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              rows={3}
              placeholder="اكتب وصفاً موجزاً للمشكلة لمساعدة الفني في إحضار الأدوات وقطع الغيار المناسبة..."
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
              <span className="text-[10px] text-slate-400 block font-medium">معبأ تلقائياً من بيانات حسابك</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                المنطقة / الحي:
              </label>
              <select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="w-full h-12 px-3 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none cursor-pointer"
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
              العنوان التفصيلي: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={addressDetails}
              onChange={e => setAddressDetails(e.target.value)}
              placeholder="الشارع، رقم العمارة، رقم الشقة..."
              className="w-full h-12 px-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium transition-all outline-none"
            />
            <span className="text-[10px] text-slate-400 block font-medium">معبأ تلقائياً من ملفك الشخصي</span>
          </div>

          {/* Urgency selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">أولوية الطلب:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  urgency === 'normal'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                طلب عادي
              </button>
              <button
                type="button"
                onClick={() => setUrgency('urgent')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  urgency === 'urgent'
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                ⚡ عاجل (في أقرب وقت)
              </button>
            </div>
          </div>

          {/* 100% Free Reassurance Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 flex items-center gap-2.5 text-xs text-emerald-950 font-medium">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>طلب فوري ومجاني 100%: يتواصل الفني معك مباشرة دون عمولات أو رسوم وساطة مستقطعة.</span>
          </div>

          {/* Primary Action Button: "إرسال الطلب" */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !user}
              className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:bg-slate-300 text-white font-black text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>جارٍ إرسال الطلب...</span>
              ) : (
                <>
                  <span>إرسال الطلب الآن</span>
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
