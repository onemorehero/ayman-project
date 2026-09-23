import React, { useState } from 'react';
import {
  X,
  CheckCheck,
  Check,
  Bell,
  BellRing,
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Star,
  ArrowLeft,
  Sparkles,
  Loader2,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function NotificationsModal({ isOpen, onClose, onNavigate }: Props) {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    user,
    pushPermission,
    isPushSubscribed,
    requestPushSubscription,
    unsubscribePush,
    sendTestPushNotification
  } = useAuth();

  const [togglingPush, setTogglingPush] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    onClose();
    if (notif.link) {
      if (notif.link.includes('customer')) {
        onNavigate('customer-dashboard');
      } else if (notif.link.includes('provider')) {
        onNavigate('provider-dashboard');
      }
    }
  };

  const handleTogglePush = async () => {
    setTogglingPush(true);
    try {
      if (isPushSubscribed) {
        await unsubscribePush();
      } else {
        await requestPushSubscription();
      }
    } finally {
      setTogglingPush(false);
    }
  };

  const handleSendTestPush = async () => {
    setSendingTest(true);
    try {
      await sendTestPushNotification(
        'منصة خلصلى | إشعار نظامي 🚀',
        'تم اختبار التنبيه الفوري بنجاح! ستصلك تنبيهات الحجوزات والرسائل لحظة بلحظة.'
      );
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingTest(false);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'NEW_BOOKING':
        return <CalendarCheck className="w-4 h-4 text-amber-600" />;
      case 'BOOKING_ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'BOOKING_REJECTED':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'BOOKING_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-sky-600" />;
      case 'NEW_REVIEW':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">التنبيهات والإشعارات</h3>
              <p className="text-xs text-slate-500">متابعة فورية ومباشرة لحالة الحجوزات والتقييمات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some(n => !n.isRead) && (
              <button
                type="button"
                onClick={() => markAllNotificationsAsRead()}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                title="تحديد جميع الإشعارات كمقروءة"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Native Web Push Status & Control Banner */}
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isPushSubscribed ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">
                  {isPushSubscribed ? 'الإشعارات الفورية (Web Push): ' : 'إشعارات الويب الفورية: '}
                </span>
                <span
                  className={
                    isPushSubscribed
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-500 font-medium'
                  }
                >
                  {isPushSubscribed ? 'مفعّلة على هذا المتصفح' : 'غير مفعّلة'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPushSubscribed && (
                <button
                  type="button"
                  disabled={sendingTest}
                  onClick={handleSendTestPush}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="إرسال إشعار تجريبي لاختبار التنبيه الفوري"
                >
                  {sendingTest ? (
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                  ) : testSent ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Send className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>{testSent ? 'تم الإرسال!' : 'إشعار تجريبي'}</span>
                </button>
              )}

              {pushPermission !== 'unsupported' && (
                <button
                  type="button"
                  disabled={togglingPush}
                  onClick={handleTogglePush}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                    isPushSubscribed
                      ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  {togglingPush ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>جارٍ التحديث...</span>
                    </>
                  ) : isPushSubscribed ? (
                    <span>تعطيل</span>
                  ) : (
                    <>
                      <BellRing className="w-3 h-3" />
                      <span>تفعيل الآن</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {notifications.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <Bell className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">لا توجد إشعارات حالياً</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                ستصلك التنبيهات هنا فور طلب حجز جديد، قبول الفني، أو إكمال الخدمة والتقييم
              </p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  notif.isRead
                    ? 'bg-white border-slate-200/70 hover:bg-slate-50/80 text-slate-600'
                    : 'bg-amber-50/60 border-amber-200 hover:bg-amber-50 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.isRead ? 'bg-slate-100' : 'bg-white shadow-2xs'
                  }`}>
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 shrink-0">
                          جديد
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100/80 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(notif.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(notif.id);
                            }}
                            className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 hover:underline"
                            title="تحديد كمقروء"
                          >
                            <Check className="w-3 h-3" />
                            <span>تحديد كمقروء</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(notif)}
                          className="text-slate-700 hover:text-amber-600 font-bold flex items-center gap-0.5 bg-slate-100 hover:bg-amber-100 px-2 py-0.5 rounded transition-colors"
                        >
                          <span>عرض التفاصيل</span>
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-500">
            تصلك الإشعارات تلقائياً عند طلب خدمة جديدة أو قبول الفني أو إكمال العمل
          </p>
        </div>
      </div>
    </div>
  );
}
