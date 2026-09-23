import React, { useState } from 'react';
import { AlertCircle, Upload, X, CheckCircle2, ShieldAlert, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { compressImage, fileToDataUrl } from '../lib/imageCompressor.js';
import type { Booking, Dispute } from '../types.js';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onDisputeSubmitted?: (dispute: Dispute) => void;
}

const CUSTOMER_REASONS = [
  'تأخر عن الموعد',
  'طلب مبلغ إضافي',
  'جودة سيئة',
  'أخرى'
];

const PROVIDER_REASONS = [
  'عنوان وهمي',
  'العميل لم يرد',
  'رفض الدفع',
  'أخرى'
];

export function DisputeModal({ isOpen, onClose, booking, onDisputeSubmitted }: DisputeModalProps) {
  const { user } = useAuth();
  const isProvider = user?.role === 'provider' || user?.id === booking.providerUserId || user?.id === booking.provider?.user?.id;
  const reasons = isProvider ? PROVIDER_REASONS : CUSTOMER_REASONS;

  const [reasonCategory, setReasonCategory] = useState(reasons[0]);
  const [details, setDetails] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [compressingImage, setCompressingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync reason category if role context switches
  React.useEffect(() => {
    setReasonCategory(reasons[0]);
  }, [isProvider]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار ملف صورة صالح');
        return;
      }
      setCompressingImage(true);
      setError(null);
      try {
        const { compressedFile } = await compressImage(file);
        const result = await fileToDataUrl(compressedFile);
        setImagePreview(result);
        setPhotoUrl(result);
      } catch (err: any) {
        setError(err.message || 'فشل ضغط الصورة');
      } finally {
        setCompressingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!details.trim()) {
      setError('يرجى كتابة تفاصيل الشكوى أو المشكلة لتتمكن الإدارة من المتابعة واتخاذ الإجراء');
      return;
    }

    setSubmitting(true);
    try {
      const dispute = await api.submitDispute({
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        userId: user?.id || (isProvider ? (booking.providerUserId || 'usr_provider1') : (booking.customerUserId || 'usr_customer1')),
        userName: user?.name || (isProvider ? booking.provider?.businessName : booking.customer?.name) || (isProvider ? 'الفني' : 'العميل'),
        userPhone: user?.phone || (isProvider ? booking.provider?.user?.phone : booking.customerPhone) || '',
        userRole: isProvider ? 'provider' : 'customer',
        customerUserId: booking.customerUserId || booking.customerId || 'usr_customer1',
        customerName: booking.customer?.name || booking.customer?.user?.name || 'العميل',
        customerPhone: booking.customerPhone || booking.customer?.phone || booking.customer?.user?.phone || '',
        providerId: booking.providerId,
        providerUserId: booking.providerUserId || booking.provider?.user?.id || 'usr_provider1',
        providerName: booking.provider?.businessName || 'مقدم الخدمة',
        providerPhone: booking.provider?.user?.phone || '',
        reasonCategory,
        details: details.trim(),
        photoUrl: photoUrl || undefined
      });

      setSuccess(true);
      if (onDisputeSubmitted) {
        onDisputeSubmitted(dispute);
      }
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'تعذر إرسال البلاغ، يرجى المحاولة مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">إبلاغ عن مشكلة / نزاع</h3>
              <p className="text-xs text-slate-500">طلب #{booking.bookingNumber} - {booking.service?.nameAr}</p>
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

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900">تم تسجيل البلاغ بنجاح</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed font-medium">
              تم إرسال الشكوى مباشرة إلى فريق إدارة منصة خلصلى. سيتم مراجعة تفاصيل المشكلة والتواصل معك للحل في أسرع وقت.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">سبب الشكوى أو النزاع:</label>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {isProvider ? 'خيارات الفني' : 'خيارات العميل'}
                </span>
              </div>
              <select
                value={reasonCategory}
                onChange={e => setReasonCategory(e.target.value)}
                className="w-full h-12 px-3.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-slate-900 text-sm font-semibold transition-all outline-none cursor-pointer"
              >
                {reasons.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">تفاصيل المشكلة والوقائع:</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={4}
                placeholder="اشرح ما حدث بالتفصيل (مثل: الموعد، المحادثات، الخلاف الذي نشأ)..."
                className="w-full p-4 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-slate-900 text-sm font-medium transition-all outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">رفع صورة (إثبات المحادثة / سكرين شوت - اختياري):</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-slate-400 transition-colors bg-slate-50/50">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="معاينة إثبات المحادثة"
                      className="max-h-36 rounded-xl object-cover border border-slate-200 mx-auto shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setPhotoUrl('');
                      }}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700 active:scale-95"
                      title="حذف الصورة"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    {compressingImage ? (
                      <div className="py-2 flex flex-col items-center">
                        <Loader2 className="w-6 h-6 text-rose-600 animate-spin mb-1.5" />
                        <span className="text-xs font-bold text-rose-700 block">جارٍ ضغط الصورة تلقائياً...</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">يتم تقليص الحجم لأقل من 200KB</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                        <span className="text-xs font-semibold text-slate-600 block">انقر لرفع صورة إثبات (سكرين شوت المحادثة أو العطل)</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">ضغط تلقائي حتى 200KB و 800x800 بكسل</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={compressingImage}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-100/80 p-3.5 rounded-2xl leading-relaxed font-medium">
              * إدارة منصة خلصلى تتابع جميع الشكاوى لضمان بيئة عمل آمنة وموثوقة، وتتخذ الإجراءات المناسبة فوراً.
            </p>

            {/* Submit button - Large ergonomic */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 disabled:bg-slate-300 text-white font-black text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>جارٍ إرسال البلاغ...</span>
                ) : (
                  <span>إرسال البلاغ للإدارة</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
