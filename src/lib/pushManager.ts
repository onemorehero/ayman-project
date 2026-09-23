/**
 * Push Notification & Service Worker Manager for Khalasly (خلصلى)
 * Native Web Push Notification infrastructure without 3rd-party dependencies
 */

import { supabase } from './api.js';

// VAPID Public Key from environment variable or standard secure fallback
const VAPID_PUBLIC_KEY =
  ((import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string | undefined) ||
  'BBgprK4UOosNeN61HoTTJCiBz_InemWl-sCcQVCNcYp3Wu_WyI0FDEQnzkYfc5BXomRJopMMkZnaPXo0e9BUXpY';

/**
 * Converts a base64 string to a Uint8Array required by PushManager.subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
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
 * Registers the root Service Worker (/sw.js)
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) {
    console.warn('[PushManager] Service Worker or Push not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    // Wait for the service worker to become ready/active
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('[PushManager] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Retrieves existing push subscription if already active
 */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.warn('[PushManager] Error fetching existing push subscription:', error);
    return null;
  }
}

/**
 * Requests permission, registers Service Worker, subscribes to PushManager with VAPID key,
 * and securely saves the subscription object to Supabase users table and local cache.
 */
export async function subscribeUserToPush(userId: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    throw new Error('متصفحك لا يدعم الإشعارات الفورية (Push Notifications)');
  }

  // 1. Request user permission gracefully
  let permission = Notification.permission;
  if (permission !== 'granted') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    throw new Error('لم يتم منح إذن الإشعارات من قبل المستخدم');
  }

  // 2. Ensure Service Worker is registered
  let registration = await navigator.serviceWorker.getRegistration('/');
  if (!registration) {
    registration = await registerServiceWorker();
  }
  if (!registration) {
    throw new Error('فشل تسجيل الـ Service Worker');
  }

  await navigator.serviceWorker.ready;

  // 3. Check for existing subscription or create new
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    try {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    } catch (err: any) {
      console.error('[PushManager] Subscribe failed:', err);
      throw new Error(`تعذر تفعيل الاشتراك في خدمة الإشعارات: ${err.message || 'خطأ غير معروف'}`);
    }
  }

  const subscriptionJson = subscription.toJSON();

  // 4. Cache subscription locally
  try {
    localStorage.setItem(`khalasly_push_sub_${userId}`, JSON.stringify(subscriptionJson));
    localStorage.setItem('khalasly_push_enabled', 'true');
    localStorage.removeItem('khalasly_push_prompt_dismissed');
  } catch {
    // ignore local storage quota errors
  }

  // 5. Save subscription to Supabase users table
  if (supabase && userId) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          // Save complete push subscription JSON into user record
          push_subscription: subscriptionJson
        })
        .eq('id', userId);

      if (error) {
        // If column does not exist yet in Supabase, log migration guide non-destructively
        if (error.message && error.message.includes('push_subscription')) {
          console.info(
            '[PushManager] Note: "push_subscription" column not found in "users" table. Run SQL: "ALTER TABLE users ADD COLUMN IF NOT EXISTS push_subscription JSONB;" to enable cloud targeting.'
          );
        } else {
          console.warn('[PushManager] Supabase subscription update note:', error.message);
        }
      }
    } catch (dbErr) {
      console.warn('[PushManager] Supabase push_subscription save warning:', dbErr);
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
  } catch (error) {
    console.error('[PushManager] Unsubscribe failed:', error);
    return false;
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
    throw new Error('يرجى تفعيل صلاحية الإشعارات أولاً لتجربة الإشعار');
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
