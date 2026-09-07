import React, { useState } from 'react';
import { X, CheckCircle2, Calculator, Coins, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import type { Booking } from '../types.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  changedByUserId: string;
  commissionRate?: number; // e.g. 0.10
  onCompleted: (updatedBooking: any) => void;
}

export function CompleteBookingModal({
  isOpen,
  onClose,
  booking,
  changedByUserId,
  commissionRate = 0.10,
  onCompleted
}: Props) {
  const [price, setPrice] = useState<number>(500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const commission = Math.round(price * commissionRate);
  const providerEarnings = price - commission;

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
      setError(err.message || 'حدث خطأ أثناء تحديث حالة الحجز');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">إتمام تنفيذ طلب الخدمة</h3>
              <p className="text-xs text-slate-500">حجز رقم {booking.bookingNumber}</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              السعر الإجمالي النهائي المتفق عليه مع العميل (بالجنيه المصري) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="50"
                step="10"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-300 text-base font-bold focus:ring-2 focus:ring-emerald-500 text-right"
              />
              <span className="absolute left-3 top-3 text-xs font-bold text-slate-500">ج.م</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              المبلغ الإجمالي شامل المصنعية أو قطع الغيار المتفق عليها
            </p>
          </div>

          {/* Business Simulation Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-600 pb-1.5 border-b border-slate-200">
              <span className="font-semibold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-slate-500" />
                <span>محاكاة احتساب العمولة والأرباح</span>
              </span>
              <span className="text-[11px] bg-slate-200 px-2 py-0.5 rounded font-mono font-bold">
                نسبة المنصة: {Math.round(commissionRate * 100)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">عمولة المنصة ({Math.round(commissionRate * 100)}%):</span>
              <span className="font-bold text-rose-600">{commission} ج.م</span>
            </div>

            <div className="flex justify-between items-center text-sm pt-1 border-t border-dashed border-slate-200">
              <span className="font-bold text-slate-800">صافي مستحقات مقدم الخدمة:</span>
              <span className="font-extrabold text-emerald-700 text-base">
                {providerEarnings} ج.م
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'جاري التأكيد...' : 'تأكيد اكتمال الخدمة'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
