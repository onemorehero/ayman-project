import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function PushNotificationPrompt() {
  const {
    user,
    pushPermission,
    isPushSubscribed,
    requestPushSubscription
  } = useAuth();

  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Only show prompt if user is logged in, push is supported, and user hasn't granted yet or hasn't subscribed
    if (!user) {
      setDismissed(true);
      return;
    }

    if (pushPermission === 'unsupported' || pushPermission === 'denied') {
      setDismissed(true);
      return;
    }

    if (isPushSubscribed) {
      setDismissed(true);
      return;
    }

    // Check if dismissed recently (within 7 days)
    const dismissedUntil = localStorage.getItem('khalasly_push_prompt_dismissed');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      setDismissed(true);
      return;
    }

    // Delay prompt slightly so it's not jarring on initial page load
    const timer = setTimeout(() => {
      setDismissed(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, pushPermission, isPushSubscribed]);

  if (dismissed) return null;

  const handleEnable = async () => {
    setLoading(true);
    try {
      const ok = await requestPushSubscription();
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          setDismissed(true);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    // Dismiss for 7 days
    const nextPrompt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('khalasly_push_prompt_dismissed', nextPrompt.toString());
    setDismissed(true);
  };

  const isProvider = user?.role === 'provider';

  return (
    <div className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-emerald-100 text-right"
        dir="rtl"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            {success ? <Check className="w-5 h-5 text-emerald-700" /> : <BellRing className="w-5 h-5 animate-bounce" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>تفعيل التنبيهات الفورية</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h4>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isProvider
                ? 'فعّل التنبيهات الفورية حتى يصلك إشعار نظامي على هاتفك أو حاسوبك فور وصول طلب صيانة جديد من عميل في منطقتك!'
                : 'فعّل التنبيهات الفورية لتتابع رد الفنيين وتحديثات طلبات الصيانة لحظة بلحظة حتى لو كان المتصفح مغلقاً!'}
            </p>

            {success ? (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <Check className="w-4 h-4" />
                <span>تم تفعيل الإشعارات الفورية بنجاح!</span>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleEnable}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جارٍ التفعيل...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>تفعيل الإشعارات الآن</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
                >
                  لاحقاً
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
