import React, { useState } from 'react';
import { X, CheckCircle2, HeartHandshake, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import type { Booking } from '../types.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  changedByUserId: string;
  commissionRate?: number;
  onCompleted: (updatedBooking: any) => void;
}

export function CompleteBookingModal({
  isOpen,
  onClose,
  booking,
  changedByUserId,
  onCompleted
}: Props) {
  const [price, setPrice] = useState<number>(350);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (price <= 0) {
      setError('يرجى إدخال مبلغ صحيح للخدمة');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await api.updateBookingStatus(booking.id, 'COMPLETED', {
        changedByUserId,
        finalPrice: price,
        reason: `تم إكمال العمل بنجاح وتسجيل السعر المتفق عليه (${price} ج.م)`
      });

      onCompleted(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إتمام الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden"
        dir="rtl"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">إتمام تنفيذ طلب الخدمة</h3>
              <p className="text-xs text-slate-500">طلب رقم #{booking.bookingNumber}</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              المبلغ الإجمالي المستحق عن الخدمة (بالجنيه المصري):
            </label>
            <div className="relative">
              <input
                type="number"
                min="10"
                step="10"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full h-12 pl-14 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-base font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-right"
              />
              <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-500">ج.م</span>
            </div>
            <p className="text-[11px] text-slate-500">
              المبلغ الفعلي المتفق عليه مع العميل واستلمته منه باليد أو التحويل.
            </p>
          </div>

          {/* 100% Free Platform Reassurance Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
              <HeartHandshake className="w-4 h-4 text-emerald-700" />
              <span>منصة خلصلى · مجانية 100%</span>
            </div>
            <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
              كامل المبلغ المسجل (<span className="font-black text-emerald-950">{price} ج.م</span>) يذهب لك بالكامل مباشرة. لا توجد أي استقطاعات أو عمولات منصة على الإطلاق.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:bg-slate-300 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>جارٍ حفظ الإتمام...</span>
              ) : (
                <span>تأكيد إتمام الخدمة بنجاح</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
