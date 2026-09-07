import React, { useState } from 'react';
import { X, Star, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import type { Booking } from '../types.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onReviewSubmitted: (review: any) => void;
}

export function ReviewModal({ isOpen, onClose, booking, onReviewSubmitted }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('يرجى كتابة تعليق يوضح تجربتك مع مقدم الخدمة');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const review = await api.createReview({
        bookingId: booking.id,
        customerId: booking.customerId,
        providerId: booking.providerId,
        rating,
        comment,
        customerUserId: user?.id || 'usr_customer1'
      });

      onReviewSubmitted(review);
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال التقييم');
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
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">تقييم الخدمة المنجزة</h3>
              <p className="text-xs text-slate-500">
                طلب رقم {booking.bookingNumber} | {booking.provider?.businessName}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="text-center py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-2">ما هو تقييمك العام لجودة وأمانة العمل؟</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-slate-300 stroke-1'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-amber-600 mt-2">
              {rating === 5 && 'ممتاز جداً ونوصي به ⭐⭐⭐⭐⭐'}
              {rating === 4 && 'جيد جداً وخبرة محترمة ⭐⭐⭐⭐'}
              {rating === 3 && 'مقبول ومتوسط ⭐⭐⭐'}
              {rating === 2 && 'أقل من المتوقع ⭐⭐'}
              {rating === 1 && 'سيء وغير مرضٍ ⭐'}
            </p>
          </div>

          {/* Comment text */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              اكتب رأيك وتجربتك بالتفصيل *
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="هل وصل الفني في الموعد؟ هل تم إنجاز العمل بإتقان ونظافة؟ رأيك يساعد العملاء الآخرين ويدعم الفنيين المتميزين..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 text-right leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'جاري الحفظ...' : 'نشر التقييم'}</span>
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
