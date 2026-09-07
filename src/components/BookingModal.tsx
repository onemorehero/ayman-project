import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, CheckCircle2, ShieldCheck, MapPin, Phone, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { LocationMap, Coordinates } from './LocationMap.js';
import type { Provider, Service, Location } from '../types.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider & { services: Service[]; areas: Location[] };
  initialServiceId?: string;
  onBookingCreated: (booking: any) => void;
}

export function BookingModal({ isOpen, onClose, provider, initialServiceId, onBookingCreated }: Props) {
  const { user, customer } = useAuth();

  const [serviceId, setServiceId] = useState(initialServiceId || provider.services?.[0]?.id || '');
  const [problemDescription, setProblemDescription] = useState('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '01123456789');
  const [locationId, setLocationId] = useState(provider.areaIds?.[0] || '');
  const [addressDetails, setAddressDetails] = useState(customer?.address || 'شارع التحرير، برج الأطباء، الدور الرابع');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('صباحاً (10 - 2)');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'nearest'>('normal');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedLocation = provider.areas?.find(loc => loc.id === locationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!serviceId) {
      setError('يرجى اختيار الخدمة المطلوبة');
      return;
    }

    if (!problemDescription.trim()) {
      setError('يرجى كتابة وصف مختصر للمشكلة أو العطل');
      return;
    }

    if (!customerPhone.trim()) {
      setError('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }

    if (!addressDetails.trim()) {
      setError('يرجى إدخال تفاصيل العنوان للزيارة');
      return;
    }

    setLoading(true);
    try {
      const newBooking = await api.createBooking({
        customerId: customer?.id || 'cust_temp',
        customerUserId: user?.id || 'usr_customer1',
        providerId: provider.id,
        serviceId,
        locationId: locationId || provider.areaIds[0] || 'loc_mohandessin',
        problemDescription,
        customerPhone,
        addressDetails,
        preferredDate: urgency === 'nearest' ? 'أقرب موعد متاح' : preferredDate,
        preferredTime: urgency === 'nearest' ? 'طوارئ فوري' : preferredTime,
        urgency,
        photoUrl: photoUrl || undefined,
        lat: coordinates?.lat,
        lng: coordinates?.lng
      });

      onBookingCreated(newBooking);
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال طلب الحجز');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
              حجز
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                طلب حجز خدمة مع {provider.businessName}
              </h3>
              <p className="text-xs text-slate-500">
                خبرة {provider.experienceYears} سنوات | تقييم {provider.rating} ⭐
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Mandatory Business Notice Requirement */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold mb-0.5">تنبيه هام حول السعر والاتفاق:</p>
              <p className="text-amber-900 font-semibold">
                "السعر يتم الاتفاق عليه مع مقدم الخدمة، والمنصة لا تحدد سعر الخدمة."
              </p>
            </div>
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">الخدمة المطلوبة *</label>
            <select
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="" disabled>-- اختر الخدمة --</option>
              {provider.services?.map(srv => (
                <option key={srv.id} value={srv.id}>
                  {srv.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Problem description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              وصف المشكلة أو تفاصيل الطلب *
            </label>
            <textarea
              required
              rows={3}
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              placeholder="صف المشكلة بدقة (مثال: تسريب مياه من خلاط المطبخ أو قفلة كهرباء في الصالة، وتوضيح الأدوات المطلوبة إن وجدت)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right leading-relaxed"
            />
          </div>

          {/* Urgency Option */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">سرعة الاستجابة المطلوبة</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                  urgency === 'normal'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                عادي (حسب التنسيق)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('urgent')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                  urgency === 'urgent'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                عاجل (خلال ساعات)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('nearest')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                  urgency === 'nearest'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ⚡ أقرب موعد متاح
              </button>
            </div>
          </div>

          {/* Timing options (if not urgent nearest) */}
          {urgency !== 'nearest' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  تاريخ الزيارة المفضل (اختياري)
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  الوقت المفضل (اختياري)
                </label>
                <select
                  value={preferredTime}
                  onChange={e => setPreferredTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="صباحاً (10 - 2)">صباحاً (10:00 ص - 2:00 م)</option>
                  <option value="عصراً (2 - 5)">عصراً (2:00 م - 5:00 م)</option>
                  <option value="مساءً (5 - 9)">مساءً (5:00 م - 9:00 م)</option>
                </select>
              </div>
            </div>
          )}

          {/* Contact phone & area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">رقم الهاتف للتواصل *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">المنطقة *</label>
              <select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {provider.areas?.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nameAr} ({loc.governorate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address details */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              العنوان بالتفصيل (الشارع، رقم العمارة، الشقة) *
            </label>
            <input
              type="text"
              required
              value={addressDetails}
              onChange={e => setAddressDetails(e.target.value)}
              placeholder="مثال: 14 شارع مصدق، الدور 3، شقة 7، بجوار مسجد..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
            />
          </div>

          {/* Interactive Leaflet Map for Pin Drop */}
          <div className="pt-1 pb-1">
            <LocationMap
              mode="picker"
              coordinates={coordinates}
              onChange={setCoordinates}
              initialAreaName={selectedLocation?.nameAr}
              heightClass="h-52 sm:h-60"
              label="تحديد موقع العطل / المنزل بدقة على الخريطة (Pin Drop)"
            />
          </div>

          {/* Optional photo URL */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              صورة للمشكلة أو المكان (اختياري)
            </label>
            <div className="relative">
              <input
                type="url"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="رابط صورة لتوضيح العطل إن توفر..."
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right"
              />
              <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>جاري إرسال الطلب...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد وإرسال طلب الحجز الآن</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
