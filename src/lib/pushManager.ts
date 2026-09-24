/**
 * Push Notification & Service Worker Manager for Khalasly (خلصلى)
 * Native Web Push Notification infrastructure without 3rd-party dependencies
 */

import { supabase } from './api.js';

// VAPID Public Key from environment variable or standard secure fallback
const DEFAULT_VAPID_PUBLIC_KEY =
  'BBgprK4UOosNeN61HoTTJCiBz_InemWl-sCcQVCNcYp3Wu_WyI0FDEQnzkYfc5BXomRJopMMkZnaPXo0e9BUXpY';

export function getVapidPublicKey(): string {
  const envKey = ((import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim();
  if (envKey && envKey.length > 20) {
    return envKey;
  }
  return DEFAULT_VAPID_PUBLIC_KEY;
}

/**
 * Promise timeout wrapper to prevent any async call from hanging indefinitely
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string
): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });

  return Promise.race([
    promise.then(result => {
      clearTimeout(timeoutId);
      return result;
    }),
    timeoutPromise
  ]);
}

/**
 * Converts a base64 VAPID string to a Uint8Array required by PushManager.subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('مفتاح VAPID العام مفقود أو بصيغة غير صالحة.');
  }

  const cleanBase64 = base64String.trim().replace(/['"]/g, '');
  const padding = '='.repeat((4 - (cleanBase64.length % 4)) % 4);
  const base64 = (cleanBase64 + padding).replace(/-/g, '+').replace(/_/g, '/');

  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (err: any) {
    throw new Error(`تعذر فك تشفير مفتاح VAPID العام: ${err.message || 'صيغة Base64 غير صالحة'}`);
  }
}

/**
 * Verifies if Push Notifications and Service Workers are supported in the current browser
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Returns current permission state
 */
export function getPushPermissionState(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Registers the root Service Worker (/sw.js) with strict timeout & error tracking
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!isPushSupported()) {
    throw new Error('متصفحك الحالي لا يدعم تقنية الـ Service Worker أو الإشعارات الفورية.');
  }

  try {
    // 1. Register sw.js with timeout
    const registration = await withTimeout(
      navigator.serviceWorker.register('/sw.js', { scope: '/' }),
      8000,
      'استغرق تسجيل ملف sw.js وقتاً طويلاً ولم يستجب المتصفح.'
    );

    // 2. Await readiness with a graceful timeout so it NEVER hangs forever
    await withTimeout(
      navigator.serviceWorker.ready,
      6000,
      'لم يكتمل تجهيز الـ Service Worker في الوقت المحدد.'
    ).catch(readyErr => {
      console.warn('[PushManager] Ready timeout warning (proceeding):', readyErr.message);
    });

    return registration;
  } catch (error: any) {
    console.error('[PushManager] Service Worker registration failed:', error);
    throw new Error(`فشل تسجيل ملف Service Worker (/sw.js): ${error.message || 'خطأ غير معروف'}`);
  }
}

/**
 * Retrieves existing push subscription if already active
 */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    let registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      registration = await registerServiceWorker();
    }
    if (!registration || !registration.pushManager) return null;

    return await withTimeout(
      registration.pushManager.getSubscription(),
      5000,
      'استغرق فحص الاشتراك الحالي وقتاً طويلاً'
    );
  } catch (error) {
    console.warn('[PushManager] Error fetching existing push subscription:', error);
    return null;
  }
}

/**
 * Requests permission, ensures Service Worker is active, subscribes to PushManager with VAPID key,
 * and securely saves the subscription object to Supabase users table and local cache.
 */
export async function subscribeUserToPush(userId: string): Promise<PushSubscription> {
  if (!isPushSupported()) {
    throw new Error('متصفحك لا يدعم الإشعارات الفورية (Push Notifications).');
  }

  // 1. Request user permission with timeout and explicit exception handling
  let permission = Notification.permission;
  if (permission !== 'granted') {
    try {
      permission = await withTimeout(
        Notification.requestPermission(),
        15000,
        'لم يتم الاستجابة لطلب إذن الإشعارات من المتصفح في الوقت المحدد.'
      );
    } catch (permErr: any) {
      throw new Error(
        `تعذر طلب إذن الإشعارات من المتصفح: ${permErr.message || 'قد تكون صلاحيات الإشعارات مقيدة أو أنك تتصفح داخل إطار مدمج (Iframe).'}`
      );
    }
  }

  if (permission === 'denied') {
    throw new Error('تم حظر صلاحية الإشعارات في إعدادات المتصفح لهذا الموقع. يرجى تفعيلها من إعدادات المتصفح والمحاولة مجدداً.');
  }

  if (permission !== 'granted') {
    throw new Error('لم يتم منح إذن الإشعارات. يرجى الموافقة على طلب المتصفح لتفعيل التنبيهات.');
  }

  // 2. Ensure Service Worker (/sw.js) is registered and active
  let registration: ServiceWorkerRegistration;
  try {
    registration = await registerServiceWorker();
  } catch (swErr: any) {
    throw new Error(`خطأ في الـ Service Worker: ${swErr.message}`);
  }

  if (!registration || !registration.pushManager) {
    throw new Error('واجهة PushManager غير متاحة في الـ Service Worker لهذا المتصفح.');
  }

  // 3. Prepare and validate VAPID key
  const vapidKeyString = getVapidPublicKey();
  let applicationServerKey: Uint8Array;
  try {
    applicationServerKey = urlBase64ToUint8Array(vapidKeyString);
    if (!applicationServerKey || applicationServerKey.length === 0) {
      throw new Error('طول المفتاح العام غير صالح.');
    }
  } catch (vapidErr: any) {
    throw new Error(`فشل معالجة مفتاح VAPID العام: ${vapidErr.message}`);
  }

  // 4. Subscribe with PushManager
  let subscription: PushSubscription;
  try {
    const existing = await withTimeout(
      registration.pushManager.getSubscription(),
      4000,
      'مهلة فحص الاشتراك'
    ).catch(() => null);

    if (existing) {
      subscription = existing;
    } else {
      subscription = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        }),
        10000,
        'استغرق الاتصال بخدمة PushManager للمتصفح وقتاً طويلاً. تأكد من تفعيل الإنترنت.'
      );
    }
  } catch (subErr: any) {
    console.error('[PushManager] PushManager.subscribe failed:', subErr);
    throw new Error(`فشل اشتراك المتصفح في الإشعارات: ${subErr.message || 'تأكد من دعم المتصفح لخدمات Google Push/Mozilla Push.'}`);
  }

  const subscriptionJson = subscription.toJSON();

  // 5. Cache locally
  try {
    localStorage.setItem(`khalasly_push_sub_${userId}`, JSON.stringify(subscriptionJson));
    localStorage.setItem('khalasly_push_enabled', 'true');
    localStorage.removeItem('khalasly_push_prompt_dismissed');
  } catch {
    // ignore local storage errors
  }

  // 6. Save subscription to Supabase users table (with non-blocking safety)
  if (supabase && userId) {
    try {
      const dbPromise = new Promise<{ error: any }>((resolve) => {
        (supabase
          .from('users')
          .update({
            push_subscription: subscriptionJson
          })
          .eq('id', userId) as PromiseLike<any>)
          .then(resolve, (err) => resolve({ error: err }));
      });

      const { error: dbError } = await withTimeout(
        dbPromise,
        5000,
        'استغرق حفظ الاشتراك في قاعدة البيانات وقتاً أطول من المعتاد'
      );

      if (dbError) {
        if (dbError.message && dbError.message.includes('push_subscription')) {
          console.info(
            '[PushManager] Note: "push_subscription" column missing in Supabase users table. Subscription active locally.'
          );
        } else {
          console.warn('[PushManager] Supabase note:', dbError.message);
        }
      }
    } catch (saveErr: any) {
      // Non-blocking: even if Supabase save times out, the browser subscription succeeded
      console.warn('[PushManager] Non-blocking Supabase sync error:', saveErr.message);
    }
  }

  return subscription;
}

/**
 * Unsubscribes user from Push Notifications
 */
export async function unsubscribeUserFromPush(userId: string): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    // Clear local storage
    localStorage.removeItem(`khalasly_push_sub_${userId}`);
    localStorage.setItem('khalasly_push_enabled', 'false');

    // Clear from Supabase
    if (supabase && userId) {
      try {
        await supabase
          .from('users')
          .update({ push_subscription: null })
          .eq('id', userId);
      } catch {
        // ignore
      }
    }

    return true;
  } catch (error: any) {
    console.error('[PushManager] Unsubscribe failed:', error);
    throw new Error(`تعذر إلغاء الاشتراك: ${error.message}`);
  }
}

/**
 * Sends a local native test notification to verify Service Worker notifications in real-time
 */
export async function sendLocalTestNotification(
  title: string = 'منصة خلصلى | إشعار تجريبي 🚀',
  body: string = 'الإشعارات الفورية تعمل بكفاءة على جهازك الآن!',
  url: string = '/'
): Promise<void> {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    throw new Error('يرجى تفعيل صلاحية الإشعارات أولاً لتجربة الإشعار.');
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      tag: 'khalasly-test-' + Date.now(),
      dir: 'rtl',
      lang: 'ar',
      data: { url, timestamp: Date.now() }
    } as any);
  } catch {
    // Fallback to Window Notification API
    new Notification(title, {
      body,
      icon: '/favicon.svg'
    });
  }
}
