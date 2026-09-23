import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { compressImage, fileToDataUrl } from './imageCompressor.js';
import type {
  User,
  Customer,
  Provider,
  Category,
  Service,
  Location,
  Booking,
  Review,
  SubscriptionPlan,
  ProviderSubscription,
  Commission,
  AppNotification,
  PlatformStats,
  BookingStatus,
  Dispute
} from '../types.js';

// ====================================================================
// 1. SUPABASE CLIENT INITIALIZATION
// ====================================================================

const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let currentUserId: string | null = null;

export function setApiUser(userId: string | null) {
  currentUserId = userId;
}

// ====================================================================
// DUAL NOTIFICATION TRIGGER INFRASTRUCTURE (Native Push + Email)
// ====================================================================

export interface NotificationTriggerPayload {
  eventType: 'BOOKING_CREATED' | 'BOOKING_STATUS_CHANGED' | 'BOOKING_COMPLETED' | 'NEW_REVIEW' | 'DISPUTE_RAISED';
  booking: {
    id: string;
    bookingNumber: string;
    serviceTitle: string;
    problemDescription: string;
    status: string;
    scheduledDate?: string;
    scheduledTime?: string;
    addressDetails?: string;
    totalPrice?: number;
    urgency?: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    pushSubscription?: any;
  };
  provider: {
    id: string;
    businessName: string;
    email: string;
    phone?: string;
    userId: string;
    pushSubscription?: any;
  };
  target: 'PROVIDER' | 'CUSTOMER' | 'BOTH';
  notification: {
    title: string;
    body: string;
    url: string;
    icon: string;
    badge: string;
  };
  emailDetails: {
    to: string;
    subject: string;
    previewText: string;
    htmlContent: string;
  };
  timestamp: string;
}

/**
 * Dispatches a dual notification (Native Web Push + Transactional Email)
 * through a secure server-side Webhook or Supabase Edge Function endpoint.
 */
export async function dispatchNotificationTrigger(payload: NotificationTriggerPayload): Promise<void> {
  const webhookUrl =
    ((import.meta as any).env?.VITE_NOTIFICATION_WEBHOOK as string | undefined)?.trim() ||
    ((import.meta as any).env?.VITE_NOTIFICATION_WEBHOOK_URL as string | undefined)?.trim() ||
    'https://onemorehero-my-n8n-app.hf.space/webhook/9e9ef1f1-48b4-4cfe-99f4-75b52bc42e61';

  // Engineering Log: Trace the dual trigger payload
  console.groupCollapsed(`[Notification Pipeline] 🚀 ${payload.eventType} => ${payload.target}`);
  console.log('Recipient Email:', payload.emailDetails.to);
  console.log('Subject:', payload.emailDetails.subject);
  console.log('Push Title:', payload.notification.title);
  console.log('Push Body:', payload.notification.body);
  console.log('Push Target URL:', payload.notification.url);
  console.log('Target Push Subscription:', payload.target === 'PROVIDER' ? payload.provider.pushSubscription : payload.customer.pushSubscription);
  console.log('Complete Payload:', payload);
  console.groupEnd();

  // 1. Dispatch to Webhook / Edge Function in the background
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(supabaseAnonKey ? { Authorization: `Bearer ${supabaseAnonKey}` } : {})
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
      .then(res => {
        clearTimeout(timeout);
        if (res.ok) {
          console.info(`[Notification Pipeline] Webhook dispatched successfully to ${webhookUrl}`);
        }
      })
      .catch(err => {
        clearTimeout(timeout);
        // Silent catch: Edge function might not be deployed yet in development
        console.info('[Notification Pipeline] Edge function call skipped or offline:', err.message);
      });
  } catch (err) {
    // Non-blocking
  }

  // 2. Also trigger a local Native Notification if the browser permits
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon || '/favicon.svg',
            badge: payload.notification.badge || '/favicon.svg',
            vibrate: [200, 100, 200],
            tag: `khalasly-${payload.booking.id}-${Date.now()}`,
            data: {
              url: payload.notification.url,
              bookingId: payload.booking.id
            }
          } as any);
        });
      }
    } catch {
      // ignore
    }
  }
}

// Fallback HTTP helper in case Supabase credentials are not supplied
async function fallbackRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (currentUserId) {
    headers['x-user-id'] = currentUserId;
  }

  const res = await fetch(path, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMsg = 'حدث خطأ في الخادم';
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// ====================================================================
// 2. DATA MAPPERS (snake_case -> camelCase)
// ====================================================================

function mapUser(row: any): User {
  if (!row) return {} as User;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    avatarUrl: row.avatar_url || row.avatarUrl || '',
    password: row.password,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    status: row.status || 'active',
    warningCount: Number(row.warning_count ?? row.warningCount ?? 0),
    lastWarningReason: row.last_warning_reason || row.lastWarningReason
  };
}

function mapCustomer(row: any, userDetails?: User): Customer {
  if (!row) return {} as Customer;
  return {
    id: row.id,
    userId: row.user_id,
    address: row.address,
    preferredAreaId: row.preferred_area_id,
    notes: row.notes || '',
    user: userDetails
  };
}

function mapCategory(row: any): Category {
  if (!row) return {} as Category;
  return {
    id: row.id,
    nameAr: row.name_ar || row.nameAr || '',
    nameEn: row.name_en || row.nameEn || row.name_ar || '',
    icon: row.icon || 'Wrench',
    slug: (row.id || '').replace('cat_', ''),
    description: row.description_ar || row.description || '',
    badge: row.badge || undefined,
    sortOrder: Number(row.sort_order || 1),
    isActive: Boolean(row.is_active !== false)
  };
}

function mapLocation(row: any): Location {
  if (!row) return {} as Location;
  return {
    id: row.id,
    nameAr: row.name_ar || row.nameAr || '',
    nameEn: row.name_en || row.nameEn || '',
    governorate: row.governorate || 'القاهرة / الجيزة',
    city: row.city || row.governorate || 'القاهرة',
    isActive: Boolean(row.is_active !== false)
  };
}

function mapService(row: any): Service {
  if (!row) return {} as Service;
  return {
    id: row.id,
    categoryId: row.category_id || row.categoryId || '',
    nameAr: row.name_ar || row.nameAr || '',
    nameEn: row.name_en || row.nameEn || '',
    description: row.description_ar || row.description || '',
    basePrice: row.base_price !== undefined ? Number(row.base_price) : undefined,
    priceType: row.price_type || undefined,
    durationApprox: row.duration_approx || undefined,
    isActive: Boolean(row.is_active !== false)
  };
}

export function generateProviderSlug(businessName: string, id: string): string {
  const clean = (businessName || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0621-\u064A0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const idShort = id.replace(/^prov_/, '');
  return clean ? `${clean}-${idShort}` : id;
}

function mapProvider(row: any, userDetails?: User): Provider {
  if (!row) return {} as Provider;
  const businessName = row.business_name || row.businessName || '';
  const slug = row.slug || generateProviderSlug(businessName, row.id);
  return {
    id: row.id,
    userId: row.user_id || row.userId || '',
    businessName,
    bio: row.bio || '',
    experienceYears: Number(row.experience_years ?? row.experienceYears ?? 1),
    rating: Number(row.average_rating ?? row.rating ?? 5.0),
    reviewCount: Number(row.total_reviews ?? row.reviewCount ?? 0),
    isVerified: Boolean(row.is_verified ?? row.isVerified ?? false),
    isActive: Boolean(row.is_active !== false),
    completedJobs: Number(row.completed_jobs ?? row.completedJobs ?? 0),
    bankAccount: row.bank_account || row.bankAccount,
    categoryIds: Array.isArray(row.category_ids) ? row.category_ids : Array.isArray(row.categoryIds) ? row.categoryIds : [],
    serviceIds: Array.isArray(row.service_ids) ? row.service_ids : Array.isArray(row.serviceIds) ? row.serviceIds : [],
    areaIds: Array.isArray(row.area_ids) ? row.area_ids : Array.isArray(row.areaIds) ? row.areaIds : [],
    workingHours: row.working_hours || row.workingHours || { start: '09:00', end: '21:00', daysOff: ['الجمعة'] },
    workPhotos: row.work_photos || row.workPhotos || [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    slug,
    user: userDetails
  };
}

function mapBooking(row: any): Booking {
  if (!row) return {} as Booking;
  const normalizedStatus = (row.status || 'PENDING').toString().toUpperCase() as BookingStatus;
  const booking: Booking = {
    id: row.id,
    bookingNumber: row.booking_number || row.bookingNumber || '',
    customerId: row.customer_id || row.customerId || '',
    customerUserId: row.customer_user_id || row.customerUserId || '',
    providerId: row.provider_id || row.providerId || '',
    providerUserId: row.provider_user_id || row.providerUserId || '',
    serviceId: row.service_id || row.serviceId || '',
    locationId: row.location_id || row.locationId || '',
    problemDescription: row.problem_description || row.problemDescription || '',
    customerPhone: row.customer_phone || row.customerPhone || '',
    addressDetails: row.address_details || row.addressDetails || '',
    preferredDate: row.preferred_date || row.preferredDate || null,
    preferredTime: row.preferred_time || row.preferredTime || null,
    urgency: row.urgency || 'normal',
    photoUrl: row.photo_url || row.photoUrl || null,
    lat: row.lat ? Number(row.lat) : null,
    lng: row.lng ? Number(row.lng) : null,
    status: normalizedStatus,
    finalPrice: row.final_price ? Number(row.final_price) : row.finalPrice ? Number(row.finalPrice) : null,
    commissionAmount: row.commission_amount ? Number(row.commission_amount) : row.commissionAmount ? Number(row.commissionAmount) : null,
    providerEarnings: row.provider_earnings ? Number(row.provider_earnings) : row.providerEarnings ? Number(row.providerEarnings) : null,
    rejectionReason: row.rejection_reason || row.rejectionReason,
    cancellationReason: row.cancellation_reason || row.cancellationReason,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };

  // Hydrate Relations if present from joins
  if (row.services) booking.service = mapService(row.services);
  if (row.locations) booking.location = mapLocation(row.locations);
  if (row.providers) {
    booking.provider = {
      businessName: row.providers.business_name || row.providers.businessName || '',
      user: row.providers.users ? mapUser(row.providers.users) : undefined
    };
  }
  if (row.customer_user) {
    booking.customer = {
      name: row.customer_user.name || 'عميل المنصة',
      phone: row.customer_phone || row.customer_user.phone || '',
      avatarUrl: row.customer_user.avatar_url,
      user: mapUser(row.customer_user)
    };
  } else if (row.customers) {
    booking.customer = {
      name: row.customers.users?.name || 'عميل المنصة',
      phone: row.customer_phone || row.customers.users?.phone || '',
      avatarUrl: row.customers.users?.avatar_url,
      user: row.customers.users ? mapUser(row.customers.users) : undefined
    };
  }

  return booking;
}

function mapReview(row: any): Review {
  if (!row) return {} as Review;
  return {
    id: row.id,
    bookingId: row.booking_id || row.bookingId || '',
    customerId: row.customer_id || row.customerId || '',
    providerId: row.provider_id || row.providerId || '',
    rating: Number(row.rating || 5),
    comment: row.comment || '',
    providerReply: row.provider_reply || row.providerReply,
    repliedAt: row.replied_at || row.repliedAt,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    customerName: row.customer_name || row.customerName || 'عميل المنصة',
    customerAvatar: row.customer_avatar || row.customerAvatar || ''
  };
}

function mapNotification(row: any): AppNotification {
  if (!row) return {} as AppNotification;
  return {
    id: row.id,
    userId: row.user_id || row.userId || '',
    title: row.title || '',
    message: row.message || '',
    type: row.type || 'system',
    link: row.link,
    isRead: Boolean(row.is_read ?? row.isRead ?? false),
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

// ====================================================================
// 3. COMPLETE API IMPLEMENTATION
// ====================================================================

export const api = {
  // ------------------------------------------------------------------
  // AUTHENTICATION (SUPABASE AUTH + DATABASE TABLES)
  // ------------------------------------------------------------------
  login: async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    let authUser: any = null;

    // 1. Attempt Supabase Auth signInWithPassword if password is provided
    if (password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (!authError && authData.user) {
          authUser = authData.user;
        }
      } catch {
        // Fallback to checking public.users table directly for pre-existing or direct database accounts
      }
    }

    // 2. Fetch user profile from public.users table
    let query = supabase.from('users').select('*').ilike('email', cleanEmail);
    if (authUser?.id) {
      query = supabase.from('users').select('*').or(`id.eq.${authUser.id},email.ilike.${cleanEmail}`);
    }
    const { data: userRow, error: userErr } = await query.maybeSingle();

    if (userErr) throw new Error(`خطأ أثناء تسجيل الدخول: ${userErr.message}`);
    if (!userRow) {
      if (authUser) {
        const meta = authUser.user_metadata || {};
        const role = meta.role || 'customer';
        const newUserData = {
          id: authUser.id,
          email: cleanEmail,
          name: meta.name || cleanEmail.split('@')[0],
          phone: meta.phone || '',
          role,
          password: password || '123456',
          created_at: new Date().toISOString()
        };
        await supabase.from('users').insert(newUserData);
        return api.getMe(authUser.id);
      }
      throw new Error('البريد الإلكتروني غير مسجل، يرجى إنشاء حساب جديد');
    }

    // 3. Verify password if not already verified via supabase.auth
    if (!authUser && password && userRow.password && userRow.password !== password) {
      throw new Error('كلمة المرور غير صحيحة');
    }

    const user = mapUser(userRow);

    // 4. Check user penalties
    const pen = api.getUserPenaltyInfo(user.id);
    if (pen.status === 'suspended' || user.status === 'suspended') {
      throw new Error('تم إيقاف حسابك مؤقتاً بسبب مخالفة سياسات المنصة أو وجود شكوى قيد التحقيق. يرجى مراجعة إدارة خلصلى.');
    }
    if (pen.status === 'banned' || user.status === 'banned') {
      throw new Error('تم حظر هذا الحساب نهائياً لمخالفة ميثاق مجتمع خلصلى.');
    }

    setApiUser(user.id);

    let customer: Customer | null = null;
    let provider: Provider | null = null;

    if (user.role === 'customer') {
      const { data: custRow } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (custRow) customer = mapCustomer(custRow, user);
    } else if (user.role === 'provider') {
      const { data: provRow } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (provRow) provider = mapProvider(provRow, user);
    }

    return { user, customer, provider };
  },

  register: async (payload: {
    email: string;
    password?: string;
    name: string;
    phone: string;
    role: 'customer' | 'provider';
    businessName?: string;
    bio?: string;
    categoryIds?: string[];
    serviceIds?: string[];
    areaIds?: string[];
    experienceYears?: number;
    address?: string;
    notes?: string;
  }): Promise<{ user: User; customer: Customer | null; provider: Provider | null }> => {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanPhone = (payload.phone || '').trim();

    if (cleanPhone && api.isPhoneBanned(cleanPhone)) {
      throw new Error('رقم الهاتف هذا محظور نهائياً من التسجيل في منصة خلصلى لمخالفة ميثاق المجتمع.');
    }

    // Check if email is already in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      throw new Error('البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.');
    }

    // Register in Supabase Auth
    let authUserId: string | null = null;
    if (payload.password) {
      try {
        const { data: authData } = await supabase.auth.signUp({
          email: cleanEmail,
          password: payload.password,
          options: {
            data: {
              name: payload.name,
              phone: cleanPhone,
              role: payload.role
            }
          }
        });
        if (authData?.user?.id) {
          authUserId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('Supabase auth.signUp note:', authErr);
      }
    }

    const userId = authUserId || 'usr_' + Math.random().toString(36).substring(2, 9);
    const userPayload = {
      id: userId,
      name: payload.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role: payload.role,
      password: payload.password || '123456',
      avatar_url: payload.role === 'provider'
        ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80'
        : null,
      created_at: new Date().toISOString()
    };

    const { error: userError } = await supabase.from('users').insert(userPayload);
    if (userError) throw new Error(`تعذر حفظ بيانات المستخدم: ${userError.message}`);

    const user = mapUser(userPayload);
    setApiUser(user.id);

    let customer: Customer | null = null;
    let provider: Provider | null = null;

    if (payload.role === 'customer') {
      const custId = 'cust_' + Math.random().toString(36).substring(2, 9);
      const custPayload = {
        id: custId,
        user_id: userId,
        address: payload.address || 'القاهرة',
        notes: payload.notes || '',
        created_at: new Date().toISOString()
      };
      const { error: custError } = await supabase.from('customers').insert(custPayload);
      if (custError) throw new Error(`تعذر حفظ بيانات العميل: ${custError.message}`);
      customer = mapCustomer(custPayload, user);
    } else {
      const provId = 'prov_' + Math.random().toString(36).substring(2, 9);
      const provPayload = {
        id: provId,
        user_id: userId,
        business_name: payload.businessName || payload.name,
        bio: payload.bio || '',
        experience_years: Number(payload.experienceYears || 1),
        category_ids: payload.categoryIds || [],
        service_ids: payload.serviceIds || [],
        area_ids: payload.areaIds || [],
        is_verified: false,
        is_active: true,
        average_rating: 5.0,
        total_reviews: 0,
        completed_jobs: 0,
        created_at: new Date().toISOString()
      };
      const { error: provError } = await supabase.from('providers').insert(provPayload);
      if (provError) throw new Error(`تعذر حفظ بيانات الفني: ${provError.message}`);
      provider = mapProvider(provPayload, user);
    }

    return { user, customer, provider };
  },

  updateCustomerProfile: async (
    userId: string,
    data: {
      name: string;
      phone: string;
      address?: string;
      avatarUrl?: string;
    }
  ): Promise<{ user: User; customer: Customer | null }> => {
    const userUpdates: any = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      avatar_url: data.avatarUrl !== undefined && data.avatarUrl.trim().length > 0 ? data.avatarUrl.trim() : null
    };

    const { data: updatedUserRow, error: uErr } = await supabase
      .from('users')
      .update(userUpdates)
      .eq('id', userId)
      .select('*')
      .single();

    if (uErr) throw new Error(`تعذر حفظ بيانات المستخدم: ${uErr.message}`);

    let customer: Customer | null = null;
    if (data.address !== undefined) {
      const { data: existingCust } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingCust) {
        const { data: updatedCustRow, error: cErr } = await supabase
          .from('customers')
          .update({ address: data.address.trim() })
          .eq('user_id', userId)
          .select('*')
          .single();
        if (!cErr && updatedCustRow) {
          customer = mapCustomer(updatedCustRow, mapUser(updatedUserRow));
        }
      } else {
        const { data: newCustRow, error: cErr } = await supabase
          .from('customers')
          .insert({
            id: 'cust_' + Math.random().toString(36).substring(2, 9),
            user_id: userId,
            address: data.address.trim(),
            notes: '',
            created_at: new Date().toISOString()
          })
          .select('*')
          .single();
        if (!cErr && newCustRow) {
          customer = mapCustomer(newCustRow, mapUser(updatedUserRow));
        }
      }
    }

    if (!customer) {
      const { data: custRow } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (custRow) {
        customer = mapCustomer(custRow, mapUser(updatedUserRow));
      }
    }

    const user = mapUser(updatedUserRow);
    return { user, customer };
  },

  uploadUserAvatar: async (
    userId: string,
    rawFile: File
  ): Promise<{
    url: string;
    originalSizeKB: number;
    compressedSizeKB: number;
    savedPercentage: number;
  }> => {
    if (!rawFile) {
      throw new Error('يرجى تحديد ملف صورة صالح');
    }

    // 1. Client-side compression strictly under 0.2MB (200KB) and max 800x800px
    const compression = await compressImage(rawFile);
    const compressedFile = compression.compressedFile;

    // 2. Prepare path
    const cleanUserId = userId ? userId.replace(/[^a-zA-Z0-9_-]/g, '_') : 'user';
    const ext = (compressedFile.name.split('.').pop() || 'jpg').toLowerCase();
    const filePath = `avatars/${cleanUserId}_${Date.now()}.${ext}`;

    let finalUrl = '';

    if (supabase) {
      try {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, compressedFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: compressedFile.type || 'image/jpeg'
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          finalUrl = publicUrlData.publicUrl;
        } else {
          // If 'avatars' bucket is not yet provisioned in Supabase, fallback cleanly
          // to the lightweight compressed DataURL so avatar updates never fail
          finalUrl = await fileToDataUrl(compressedFile);
        }
      } catch {
        finalUrl = await fileToDataUrl(compressedFile);
      }
    } else {
      finalUrl = await fileToDataUrl(compressedFile);
    }

    return {
      url: finalUrl,
      originalSizeKB: compression.originalSizeKB,
      compressedSizeKB: compression.compressedSizeKB,
      savedPercentage: compression.savedPercentage
    };
  },

  registerCustomer: async (data: { name: string; email: string; phone: string; password?: string; address: string; notes?: string }) => {
    return api.register({
      ...data,
      role: 'customer'
    });
  },

  registerProvider: async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    businessName: string;
    bio: string;
    experienceYears: number;
    categoryIds: string[];
    serviceIds: string[];
    areaIds: string[];
  }) => {
    return api.register({
      ...data,
      role: 'provider'
    });
  },

  logout: async () => {
    setApiUser(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  },

  getMe: async (userIdOverride?: string) => {
    const targetUserId = userIdOverride || currentUserId;
    if (!targetUserId) throw new Error('يرجى تسجيل الدخول أولاً');

    const { data: userRow, error } = await supabase.from('users').select('*').eq('id', targetUserId).maybeSingle();
    if (error || !userRow) throw new Error('المستخدم غير موجود');

    const user = mapUser(userRow);
    setApiUser(user.id);
    let customer: Customer | null = null;
    let provider: Provider | null = null;

    if (user.role === 'customer') {
      const { data: custRow } = await supabase.from('customers').select('*').eq('user_id', user.id).maybeSingle();
      if (custRow) customer = mapCustomer(custRow, user);
    } else if (user.role === 'provider') {
      const { data: provRow } = await supabase.from('providers').select('*').eq('user_id', user.id).maybeSingle();
      if (provRow) provider = mapProvider(provRow, user);
    }

    return { user, customer, provider };
  },

  // ------------------------------------------------------------------
  // CATEGORIES, SERVICES & LOCATIONS (DROPDOWNS FIX)
  // ------------------------------------------------------------------
  getCategories: async (): Promise<Category[]> => {
    if (!supabase) return fallbackRequest<Category[]>('/api/categories');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);

    if (error) throw new Error(error.message);
    return (data || []).map(mapCategory);
  },

  getCategory: async (id: string): Promise<Category> => {
    if (!supabase) return fallbackRequest<Category>(`/api/categories/${id}`);
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return mapCategory(data);
  },

  createCategory: async (data: { nameAr: string; nameEn?: string; icon: string; description?: string }) => {
    if (!supabase) {
      return fallbackRequest<Category>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
    const catId = 'cat_' + Math.random().toString(36).substring(2, 8);
    const payload = {
      id: catId,
      name_ar: data.nameAr,
      name_en: data.nameEn || data.nameAr,
      icon: data.icon || 'Wrench',
      description_ar: data.description || '',
      is_active: true,
      created_at: new Date().toISOString()
    };
    const { data: inserted, error } = await supabase.from('categories').insert(payload).select('*').single();
    if (error) throw new Error(error.message);
    return mapCategory(inserted);
  },

  deleteCategory: async (id: string) => {
    if (!supabase) return fallbackRequest<{ success: boolean }>(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  getServices: async (categoryId?: string): Promise<Service[]> => {
    if (!supabase) {
      return fallbackRequest<Service[]>(categoryId ? `/api/services?categoryId=${categoryId}` : '/api/services');
    }
    
    // جلب كل الخدمات المتاحة مباشرة لضمان عدم ظهور القائمة فارغة أبداً
    let query = supabase.from('services').select('*');
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      // خطأ احتياطي: لو ملقش بالقسم، هات كل الخدمات الموجودة في القاعدة
      const { data: fallbackData } = await supabase.from('services').select('*');
      return (fallbackData || []).map(mapService);
    }

    return (data || []).map(mapService);
  },

  createService: async (data: { categoryId: string; nameAr: string; description?: string }) => {
    if (!supabase) {
      return fallbackRequest<Service>('/api/admin/services', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
    const srvId = 'srv_' + Math.random().toString(36).substring(2, 8);
    const payload = {
      id: srvId,
      category_id: data.categoryId,
      name_ar: data.nameAr,
      name_en: data.nameAr,
      description_ar: data.description || '',
      is_active: true,
      created_at: new Date().toISOString()
    };
    const { data: inserted, error } = await supabase.from('services').insert(payload).select('*').single();
    if (error) throw new Error(error.message);
    return mapService(inserted);
  },

  deleteService: async (id: string) => {
    if (!supabase) return fallbackRequest<{ success: boolean }>(`/api/admin/services/${id}`, { method: 'DELETE' });
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  getLocations: async (): Promise<Location[]> => {
    if (!supabase) return fallbackRequest<Location[]>('/api/locations');
    const { data, error } = await supabase.from('locations').select('*').eq('is_active', true);
    if (error) throw new Error(error.message);
    return (data || []).map(mapLocation);
  },

  createLocation: async (data: { nameAr: string; governorate: string; isActive?: boolean }) => {
    if (!supabase) {
      return fallbackRequest<Location>('/api/admin/locations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
    const locId = 'loc_' + Math.random().toString(36).substring(2, 8);
    const payload = {
      id: locId,
      name_ar: data.nameAr,
      name_en: data.nameAr,
      governorate: data.governorate,
      is_active: data.isActive !== false,
      created_at: new Date().toISOString()
    };
    const { data: inserted, error } = await supabase.from('locations').insert(payload).select('*').single();
    if (error) throw new Error(error.message);
    return mapLocation(inserted);
  },

  deleteLocation: async (id: string) => {
    if (!supabase) return fallbackRequest<{ success: boolean }>(`/api/admin/locations/${id}`, { method: 'DELETE' });
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // ------------------------------------------------------------------
  // PROVIDERS DIRECTORY (MAPPER + FILTERING)
  // ------------------------------------------------------------------
  getProviders: async (params?: {
    categoryId?: string;
    category?: string;
    areaId?: string;
    area?: string;
    search?: string;
    q?: string;
    minRating?: number;
    verified?: boolean;
    activeOnly?: boolean;
    isActive?: boolean;
  }): Promise<Provider[]> => {
    const categoryFilter = params?.categoryId || params?.category;
    const areaFilter = params?.areaId || params?.area;
    const searchFilter = params?.search || params?.q;

    if (!supabase) {
      const query = new URLSearchParams();
      if (categoryFilter) query.append('categoryId', categoryFilter);
      if (areaFilter) query.append('areaId', areaFilter);
      if (searchFilter) query.append('search', searchFilter);
      if (params?.verified) query.append('verified', 'true');
      const qs = query.toString();
      return fallbackRequest<Provider[]>(qs ? `/api/providers?${qs}` : '/api/providers');
    }

    let query = supabase.from('providers').select('*, users(*)');

    if (params?.isActive !== undefined) {
      query = query.eq('is_active', params.isActive);
    } else if (params?.activeOnly !== false) {
      query = query.eq('is_active', true);
    }

    if (categoryFilter) {
      query = query.contains('category_ids', [categoryFilter]);
    }
    if (areaFilter) {
      query = query.contains('area_ids', [areaFilter]);
    }
    if (params?.minRating) {
      query = query.gte('average_rating', params.minRating);
    }
    if (params?.verified) {
      query = query.eq('is_verified', true);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let providers = (data || []).map((row: any) => {
      const userDetails = row.users ? mapUser(row.users) : undefined;
      return mapProvider(row, userDetails);
    });

    if (searchFilter) {
      const s = searchFilter.trim().toLowerCase();
      providers = providers.filter(p =>
        p.businessName.toLowerCase().includes(s) ||
        p.bio.toLowerCase().includes(s) ||
        p.user?.name.toLowerCase().includes(s)
      );
    }

    // Safety fallback: if minRating was specified but returned 0 results, query all active providers
    if (providers.length === 0 && params?.minRating && !categoryFilter && !areaFilter && !searchFilter) {
      const { data: allProvs } = await supabase.from('providers').select('*, users(*)').eq('is_active', true);
      providers = (allProvs || []).map((row: any) => mapProvider(row, row.users ? mapUser(row.users) : undefined));
    }

    return providers;
  },

  getProvider: async (id: string): Promise<Provider> => {
    if (!supabase) return fallbackRequest<Provider>(`/api/providers/${id}`);
    const { data, error } = await supabase.from('providers').select('*, users(*)').eq('id', id).single();
    if (error) throw new Error(error.message);
    const userDetails = data.users ? mapUser(data.users) : undefined;
    const provider = mapProvider(data, userDetails);

    // Hydrate provider's services, areas, and reviews
    const serviceIds = provider.serviceIds || [];
    const areaIds = provider.areaIds || [];
    const [srvRes, locRes, revRes] = await Promise.all([
      serviceIds.length > 0 ? supabase.from('services').select('*').in('id', serviceIds) : Promise.resolve({ data: [] }),
      areaIds.length > 0 ? supabase.from('locations').select('*').in('id', areaIds) : Promise.resolve({ data: [] }),
      supabase.from('reviews').select('*').eq('provider_id', id).order('created_at', { ascending: false })
    ]);

    (provider as any).services = (srvRes.data || []).map(mapService);
    (provider as any).areas = (locRes.data || []).map(mapLocation);
    (provider as any).reviews = (revRes.data || []).map(mapReview);

    return provider;
  },

  getProviderById: async (id: string): Promise<Provider> => {
    return api.getProvider(id);
  },

  getProviderBySlugOrId: async (slugOrId: string): Promise<Provider> => {
    if (!slugOrId) throw new Error('معرف الفني مطلوب');
    // If it's a direct ID, fetch directly
    if (slugOrId.startsWith('prov_')) {
      try {
        return await api.getProvider(slugOrId);
      } catch (e) {
        // Fallback to searching
      }
    }
    // Search across providers by slug or id or name
    const all = await api.getProviders();
    const match = all.find(p => p.id === slugOrId || p.slug === slugOrId || p.businessName.includes(slugOrId));
    if (match) {
      return api.getProvider(match.id);
    }
    return api.getProvider(slugOrId);
  },

  getAlternativeProviders: async (categoryId?: string, excludeProviderId?: string, serviceId?: string): Promise<Provider[]> => {
    const all = await api.getProviders();
    return all
      .filter(p => {
        if (excludeProviderId && p.id === excludeProviderId) return false;
        if (p.isActive === false) return false;
        if (serviceId && Array.isArray(p.serviceIds) && p.serviceIds.includes(serviceId)) {
          return true;
        }
        if (categoryId && Array.isArray(p.categoryIds) && p.categoryIds.length > 0) {
          return p.categoryIds.includes(categoryId);
        }
        return !categoryId && !serviceId;
      })
      .slice(0, 4);
  },

  updateProvider: async (id: string, data: Partial<Provider>): Promise<Provider> => {
    return api.updateProviderProfile(id, data);
  },

  updateProviderProfile: async (id: string, data: Partial<Provider>): Promise<Provider> => {
    if (!supabase) {
      return fallbackRequest<Provider>(`/api/providers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }

    const updatePayload: Record<string, any> = {};
    if (data.businessName !== undefined) updatePayload.business_name = data.businessName;
    if (data.bio !== undefined) updatePayload.bio = data.bio;
    if (data.experienceYears !== undefined) updatePayload.experience_years = data.experienceYears;
    if (data.categoryIds !== undefined) updatePayload.category_ids = data.categoryIds;
    if (data.serviceIds !== undefined) updatePayload.service_ids = data.serviceIds;
    if (data.areaIds !== undefined) updatePayload.area_ids = data.areaIds;
    if (data.workingHours !== undefined) updatePayload.working_hours = data.workingHours;
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if ((data as any).avatarUrl !== undefined) updatePayload.avatar_url = (data as any).avatarUrl;

    const { data: updated, error } = await supabase
      .from('providers')
      .update(updatePayload)
      .eq('id', id)
      .select('*, users(*)')
      .single();

    if (error) throw new Error(error.message);
    return mapProvider(updated, updated.users ? mapUser(updated.users) : undefined);
  },

  toggleProviderVerified: async (providerId: string) => {
    if (!supabase) return fallbackRequest<{ isVerified: boolean }>(`/api/admin/providers/${providerId}/verify`, { method: 'POST' });
    const { data: prov } = await supabase.from('providers').select('is_verified').eq('id', providerId).single();
    const newStatus = !prov?.is_verified;
    const { error } = await supabase.from('providers').update({ is_verified: newStatus }).eq('id', providerId);
    if (error) throw new Error(error.message);
    return { isVerified: newStatus };
  },

  // ------------------------------------------------------------------
  // BOOKINGS ENGINE
  // ------------------------------------------------------------------
  createBooking: async (data: {
    serviceId: string;
    providerId: string;
    locationId: string;
    customerPhone: string;
    addressDetails: string;
    customerId?: string;
    customerUserId?: string;
    preferredDate?: string;
    preferredTime?: string;
    problemDescription: string;
    urgency?: 'normal' | 'urgent' | 'nearest';
    photoUrl?: string;
    lat?: number;
    lng?: number;
  }): Promise<Booking> => {
    if (!supabase) {
      return fallbackRequest<Booking>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    const bookingId = 'bk_' + Math.random().toString(36).substring(2, 9);
    const bookingNumber = 'EG-' + Math.floor(100000 + Math.random() * 900000);

    // Require real logged-in user authentication
    const activeUserId = data.customerUserId || currentUserId;
    if (!activeUserId) {
      throw new Error('يجب تسجيل الدخول كعميل أولاً لتتمكن من إرسال طلب الحجز');
    }

    // Verify user exists in database
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', activeUserId)
      .maybeSingle();

    if (userErr || !userRow) {
      throw new Error('حساب العميل غير مسجل في النظام. يرجى تسجيل الدخول أولاً');
    }

    // Resolve or establish customer profile for this verified user
    let finalCustomerId = data.customerId;
    if (!finalCustomerId) {
      const { data: custRow } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', activeUserId)
        .maybeSingle();

      if (custRow?.id) {
        finalCustomerId = custRow.id;
      } else {
        const newCustId = 'cust_' + Math.random().toString(36).substring(2, 9);
        const { data: newCust, error: custErr } = await supabase
          .from('customers')
          .insert({
            id: newCustId,
            user_id: activeUserId,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (custErr) throw new Error(`تعذر ربط سجل العميل: ${custErr.message}`);
        finalCustomerId = newCust.id;
      }
    } else {
      // Validate provided customerId actually exists
      const { data: custCheck } = await supabase
        .from('customers')
        .select('id')
        .eq('id', finalCustomerId)
        .maybeSingle();

      if (!custCheck) {
        const { data: custByUser } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', activeUserId)
          .maybeSingle();

        if (custByUser?.id) {
          finalCustomerId = custByUser.id;
        } else {
          const newCustId = 'cust_' + Math.random().toString(36).substring(2, 9);
          const { data: newCust } = await supabase
            .from('customers')
            .insert({
              id: newCustId,
              user_id: activeUserId,
              created_at: new Date().toISOString()
            })
            .select('id')
            .single();
          finalCustomerId = newCust?.id || finalCustomerId;
        }
      }
    }

    const bookingPayload = {
      id: bookingId,
      booking_number: bookingNumber,
      customer_id: finalCustomerId,
      customer_user_id: activeUserId,
      provider_id: data.providerId,
      service_id: data.serviceId,
      location_id: data.locationId,
      problem_description: data.problemDescription,
      customer_phone: data.customerPhone,
      address_details: data.addressDetails,
      preferred_date: data.preferredDate || null,
      preferred_time: data.preferredTime || null,
      urgency: data.urgency || 'normal',
      photo_url: data.photoUrl || null,
      lat: data.lat || null,
      lng: data.lng || null,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: inserted, error } = await supabase
      .from('bookings')
      .insert(bookingPayload)
      .select('*, services(*), locations(*), providers(*, users(*)), customer_user:users!customer_user_id(*)')
      .single();

    if (error) throw new Error(`فشل إنشاء الحجز: ${error.message}`);

    const { data: providerRow } = await supabase.from('providers').select('user_id').eq('id', data.providerId).maybeSingle();
    if (providerRow?.user_id) {
      try {
        await supabase.from('notifications').insert({
          id: 'notif_' + Math.random().toString(36).substring(2, 9),
          user_id: providerRow.user_id,
          title: 'طلب خدمة جديد',
          message: `لديك طلب حجز جديد برقم ${bookingNumber}`,
          type: 'booking_new',
          link: '/provider-dashboard',
          is_read: false,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Failed to insert notification:', err);
      }
    }

    // ====================================================================
    // DUAL NOTIFICATION TRIGGER (Native Web Push + Email to Provider)
    // ====================================================================
    const providerUser = inserted.providers?.users;
    const providerEmail = providerUser?.email || 'provider@khalasly.com';
    const customerName = inserted.customer_user?.name || userRow?.name || 'عميل خلصلى';
    const serviceTitle = inserted.services?.title || 'طلب صيانة';

    dispatchNotificationTrigger({
      eventType: 'BOOKING_CREATED',
      target: 'PROVIDER',
      booking: {
        id: inserted.id,
        bookingNumber: inserted.booking_number,
        serviceTitle,
        problemDescription: inserted.problem_description,
        status: inserted.status,
        scheduledDate: inserted.preferred_date || undefined,
        scheduledTime: inserted.preferred_time || undefined,
        addressDetails: inserted.address_details,
        urgency: inserted.urgency
      },
      customer: {
        id: activeUserId,
        name: customerName,
        phone: inserted.customer_phone || data.customerPhone,
        email: inserted.customer_user?.email || undefined,
        address: inserted.address_details
      },
      provider: {
        id: data.providerId,
        userId: providerRow?.user_id || inserted.providers?.user_id || '',
        businessName: inserted.providers?.business_name || 'الفني',
        email: providerEmail,
        phone: providerUser?.phone || '',
        pushSubscription: providerUser?.push_subscription || null
      },
      notification: {
        title: `طلب حجز جديد | ${serviceTitle} 🛠️`,
        body: `طلب جديد من العميل (${customerName}) برقم ${inserted.booking_number}: ${inserted.problem_description.substring(0, 90)}`,
        url: '/?view=provider-dashboard',
        icon: '/favicon.svg',
        badge: '/favicon.svg'
      },
      emailDetails: {
        to: providerEmail,
        subject: `[خلصلى] طلب صيانة جديد برقم ${inserted.booking_number} من ${customerName}`,
        previewText: `طلب حجز جديد لخدمة ${serviceTitle} في ${inserted.address_details}`,
        htmlContent: `
          <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
            <h2 style="color: #059669;">طلب حجز جديد على منصة خلصلى! 🚀</h2>
            <p>مرحباً <strong>${inserted.providers?.business_name || 'يا فني'}</strong>،</p>
            <p>وصلك طلب حجز صيانة جديد من العميل <strong>${customerName}</strong>.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-right: 4px solid #059669; margin: 15px 0;">
              <p><strong>رقم الطلب:</strong> ${inserted.booking_number}</p>
              <p><strong>الخدمة:</strong> ${serviceTitle}</p>
              <p><strong>الموعد المقترح:</strong> ${inserted.preferred_date || 'في أقرب وقت'} - ${inserted.preferred_time || ''}</p>
              <p><strong>العنوان:</strong> ${inserted.address_details}</p>
              <p><strong>هاتف العميل:</strong> ${inserted.customer_phone}</p>
              <p><strong>وصف العطل:</strong> ${inserted.problem_description}</p>
            </div>
            <p><a href="/?view=provider-dashboard" style="display: inline-block; background: #059669; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">الانتقال للوحة التحكم لقبول الطلب</a></p>
          </div>
        `
      },
      timestamp: new Date().toISOString()
    }).catch(err => console.warn('[Notification Pipeline Error]:', err));

    return mapBooking(inserted);
  },

  getBookings: async (params?: { role?: string; status?: BookingStatus; customerUserId?: string; providerId?: string }): Promise<Booking[]> => {
    if (!supabase) {
      const query = new URLSearchParams();
      if (params?.role) query.append('role', params.role);
      if (params?.status) query.append('status', params.status);
      const qs = query.toString();
      return fallbackRequest<Booking[]>(qs ? `/api/bookings?${qs}` : '/api/bookings');
    }

    let query = supabase
      .from('bookings')
      .select('*, services(*), locations(*), providers(*, users(*)), customer_user:users!customer_user_id(*)')
      .order('created_at', { ascending: false });

    if (params?.status) {
      const sLower = params.status.toLowerCase();
      const sUpper = params.status.toUpperCase();
      query = query.or(`status.eq.${sLower},status.eq.${sUpper}`);
    }

    if (params?.customerUserId) {
      query = query.eq('customer_user_id', params.customerUserId);
    } else if (params?.role === 'customer' && currentUserId) {
      query = query.eq('customer_user_id', currentUserId);
    }

    if (params?.providerId) {
      query = query.eq('provider_id', params.providerId);
    } else if (params?.role === 'provider' && currentUserId) {
      const { data: provRow } = await supabase.from('providers').select('id').eq('user_id', currentUserId).maybeSingle();
      if (provRow) {
        query = query.eq('provider_id', provRow.id);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => mapBooking(row));
  },

  getBooking: async (id: string): Promise<Booking> => {
    if (!supabase) return fallbackRequest<Booking>(`/api/bookings/${id}`);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(*), locations(*), providers(*, users(*)), customer_user:users!customer_user_id(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return mapBooking(data);
  },

  updateBookingStatus: async (
    id: string,
    status: BookingStatus,
    details?: string | { changedByUserId?: any; cancellationReason?: string; rejectionReason?: string; finalPrice?: number; reason?: string }
  ): Promise<Booking> => {
    if (!supabase) {
      return fallbackRequest<Booking>(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, details })
      });
    }

    const statusForDb = (status || '').toString().toUpperCase();
    const updatePayload: Record<string, any> = {
      status: statusForDb,
      updated_at: new Date().toISOString()
    };

    if (typeof details === 'string') {
      if (status === 'REJECTED') updatePayload.rejection_reason = details;
      if (status === 'CANCELLED') updatePayload.cancellation_reason = details;
    } else if (details && typeof details === 'object') {
      if (details.rejectionReason) updatePayload.rejection_reason = details.rejectionReason;
      if (details.cancellationReason) updatePayload.cancellation_reason = details.cancellationReason;
      if (details.reason && status === 'REJECTED') updatePayload.rejection_reason = details.reason;
      if (details.reason && status === 'CANCELLED') updatePayload.cancellation_reason = details.reason;
      if (details.finalPrice !== undefined) {
        updatePayload.final_price = details.finalPrice;
        const comm = Math.round(details.finalPrice * 0.10);
        updatePayload.commission_amount = comm;
        updatePayload.provider_earnings = details.finalPrice - comm;
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', id)
      .select('*, services(*), locations(*), providers(*, users(*)), customer_user:users!customer_user_id(*)')
      .single();
    if (error) throw new Error(error.message);

    if (data.customer_user_id) {
      const statusText = status === 'ACCEPTED' ? 'تم قبول طلبك' : status === 'REJECTED' ? 'تم الاعتذار عن طلبك' : `تحديث في طلبك: ${status}`;
      await supabase.from('notifications').insert({
        id: 'notif_' + Math.random().toString(36).substring(2, 9),
        user_id: data.customer_user_id,
        title: statusText,
        message: `تم تحديث حالة طلبك رقم ${data.booking_number} إلى (${status})`,
        type: status === 'ACCEPTED' ? 'booking_accepted' : status === 'REJECTED' ? 'booking_rejected' : 'booking_status',
        link: '/customer-dashboard',
        is_read: false,
        created_at: new Date().toISOString()
      });

      // ====================================================================
      // DUAL NOTIFICATION TRIGGER (Native Web Push + Email to Customer)
      // ====================================================================
      const customerEmail = data.customer_user?.email || 'customer@khalasly.com';
      const customerName = data.customer_user?.name || 'عميلنا العزيز';
      const providerName = data.providers?.business_name || 'الفني';
      const serviceTitle = data.services?.title || 'خدمة الصيانة';

      let statusArabic = statusForDb;
      if (statusForDb === 'ACCEPTED') statusArabic = 'تم قبول طلبك ✅';
      else if (statusForDb === 'REJECTED') statusArabic = 'تم الاعتذار عن الطلب ❌';
      else if (statusForDb === 'IN_PROGRESS') statusArabic = 'الفني في طريقه إليك / جارٍ العمل 🚗';
      else if (statusForDb === 'COMPLETED') statusArabic = 'تم اكتمال تنفيذ الخدمة بنجاح 🎉';
      else if (statusForDb === 'CANCELLED') statusArabic = 'تم إلغاء الطلب ⚠️';

      dispatchNotificationTrigger({
        eventType: 'BOOKING_STATUS_CHANGED',
        target: 'CUSTOMER',
        booking: {
          id: data.id,
          bookingNumber: data.booking_number,
          serviceTitle,
          problemDescription: data.problem_description || '',
          status: statusForDb,
          scheduledDate: data.preferred_date || undefined,
          scheduledTime: data.preferred_time || undefined,
          addressDetails: data.address_details,
          totalPrice: data.final_price || undefined
        },
        customer: {
          id: data.customer_user_id,
          name: customerName,
          phone: data.customer_phone,
          email: customerEmail,
          address: data.address_details,
          pushSubscription: data.customer_user?.push_subscription || null
        },
        provider: {
          id: data.provider_id,
          userId: data.providers?.user_id || '',
          businessName: providerName,
          email: data.providers?.users?.email || '',
          phone: data.providers?.users?.phone || ''
        },
        notification: {
          title: `${statusArabic} | طلب رقم ${data.booking_number}`,
          body: `قام الفني (${providerName}) بتحديث حالة طلبك (${serviceTitle}) إلى: ${statusArabic}`,
          url: '/?view=customer-dashboard',
          icon: '/favicon.svg',
          badge: '/favicon.svg'
        },
        emailDetails: {
          to: customerEmail,
          subject: `[خلصلى] تحديث في حالة طلبك رقم ${data.booking_number}: ${statusArabic}`,
          previewText: `قام الفني ${providerName} بتحديث حالة طلبك إلى ${statusArabic}`,
          htmlContent: `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
              <h2 style="color: #059669;">تحديث في حالة طلبك على خلصلى ✅</h2>
              <p>مرحباً <strong>${customerName}</strong>،</p>
              <p>نود إعلامك بأن الفني <strong>${providerName}</strong> قد قام بتحديث حالة طلبك برقم <strong>${data.booking_number}</strong>.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-right: 4px solid #059669; margin: 15px 0;">
                <p><strong>الخدمة:</strong> ${serviceTitle}</p>
                <p><strong>الحالة الحالية:</strong> ${statusArabic}</p>
                ${data.rejection_reason ? `<p><strong>سبب الاعتذار:</strong> ${data.rejection_reason}</p>` : ''}
                ${data.cancellation_reason ? `<p><strong>سبب الإلغاء:</strong> ${data.cancellation_reason}</p>` : ''}
              </div>
              <p><a href="/?view=customer-dashboard" style="display: inline-block; background: #059669; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">متابعة تفاصيل الطلب في لوحة التحكم</a></p>
            </div>
          `
        },
        timestamp: new Date().toISOString()
      }).catch(err => console.warn('[Notification Pipeline Error]:', err));
    }

    return mapBooking(data);
  },

  completeBooking: async (id: string, data: { finalPrice: number; notes?: string }) => {
    if (!supabase) {
      return fallbackRequest<{ booking: Booking; commission: Commission }>(`/api/bookings/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    const commissionRate = 0;
    const commissionAmount = 0;
    const providerEarnings = data.finalPrice;

    const { data: updatedBooking, error: bookingErr } = await supabase
      .from('bookings')
      .update({
        status: 'COMPLETED',
        final_price: data.finalPrice,
        commission_amount: 0,
        provider_earnings: data.finalPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (bookingErr) throw new Error(bookingErr.message);

    const commId = 'comm_' + Math.random().toString(36).substring(2, 9);
    const commPayload = {
      id: commId,
      booking_id: id,
      provider_id: updatedBooking.provider_id,
      booking_amount: data.finalPrice,
      commission_rate: 0,
      commission_amount: 0,
      provider_earnings: data.finalPrice,
      status: 'waived',
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('commissions').insert(commPayload);
    } catch (e) {
      console.warn('Commission record notice:', e);
    }

    if (updatedBooking.customer_user_id) {
      try {
        await supabase.from('notifications').insert({
          id: 'notif_' + Math.random().toString(36).substring(2, 9),
          user_id: updatedBooking.customer_user_id,
          title: 'اكتملت الخدمة بنجاح',
          message: `تم إكمال الخدمة بمبلغ ${data.finalPrice} ج.م. شاركنا برأيك وقيم الفني الآن!`,
          type: 'booking_status',
          link: '/customer-dashboard',
          is_read: false,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Completion notification notice:', e);
      }
    }

    return {
      booking: mapBooking(updatedBooking),
      commission: {
        id: commPayload.id,
        bookingId: commPayload.booking_id,
        providerId: commPayload.provider_id,
        totalBookingAmount: commPayload.booking_amount,
        commissionRate: commPayload.commission_rate,
        commissionAmount: commPayload.commission_amount,
        providerPayout: commPayload.provider_earnings,
        status: 'pending',
        createdAt: commPayload.created_at
      }
    };
  },

  // ------------------------------------------------------------------
  // REVIEWS & RATINGS
  // ------------------------------------------------------------------
  createReview: async (data: { bookingId: string; rating: number; comment: string; customerId?: string; providerId?: string; customerUserId?: string }) => {
    if (!supabase) {
      return fallbackRequest<Review>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    const { data: booking } = await supabase.from('bookings').select('*').eq('id', data.bookingId).single();
    if (!booking) throw new Error('الحجز غير موجود');

    let customerName = 'عميل المنصة';
    let customerAvatar: string | undefined = undefined;
    if (booking.customer_user_id) {
      const { data: u } = await supabase.from('users').select('name, avatar_url').eq('id', booking.customer_user_id).maybeSingle();
      if (u?.name) customerName = u.name;
      if (u?.avatar_url) customerAvatar = u.avatar_url;
    }

    const reviewId = 'rev_' + Math.random().toString(36).substring(2, 9);
    const reviewPayload = {
      id: reviewId,
      booking_id: data.bookingId,
      customer_id: booking.customer_id,
      customer_name: customerName,
      customer_avatar: customerAvatar || null,
      provider_id: booking.provider_id,
      rating: data.rating,
      comment: data.comment,
      created_at: new Date().toISOString()
    };

    const { data: inserted, error } = await supabase.from('reviews').insert(reviewPayload).select('*').single();
    if (error) throw new Error(error.message);

    const { data: allReviews } = await supabase.from('reviews').select('rating').eq('provider_id', booking.provider_id);
    if (allReviews && allReviews.length > 0) {
      const avg = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(2));
      await supabase.from('providers').update({
        average_rating: avg,
        total_reviews: allReviews.length
      }).eq('id', booking.provider_id);
    }

    return mapReview(inserted);
  },

  getReviews: async (providerIdOrOptions?: string | { providerId?: string }): Promise<Review[]> => {
    const provId = typeof providerIdOrOptions === 'string' ? providerIdOrOptions : providerIdOrOptions?.providerId;
    if (!supabase) {
      return fallbackRequest<Review[]>(provId ? `/api/reviews?providerId=${provId}` : '/api/reviews');
    }
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (provId) {
      query = query.eq('provider_id', provId);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map(mapReview);
  },

  getProviderReviews: async (providerId: string): Promise<Review[]> => {
    return api.getReviews(providerId);
  },

  replyReview: async (reviewId: string, reply: string, _userId?: string) => {
    return api.replyToReview(reviewId, reply);
  },

  replyToReview: async (reviewId: string, reply: string) => {
    if (!supabase) {
      return fallbackRequest<Review>(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply })
      });
    }
    const { data, error } = await supabase.from('reviews').update({ provider_reply: reply }).eq('id', reviewId).select('*').single();
    if (error) throw new Error(error.message);
    return mapReview(data);
  },

  deleteReview: async (id: string) => {
    if (!supabase) return fallbackRequest<{ success: boolean }>(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // ------------------------------------------------------------------
  // SUBSCRIPTIONS & COMMISSIONS
  // ------------------------------------------------------------------
  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    return [
      { id: 'plan_free', nameAr: 'الباقة المجانية', pricePerMonth: 0, features: ['عمولة قياسية 10%', 'تلقي حتى 10 طلبات شهرياً', 'دعم فني عادي'], commissionRate: 0.10, maxBookingsPerMonth: 10, isActive: true },
      { id: 'plan_pro', nameAr: 'باقة المحترف (PRO)', pricePerMonth: 299, features: ['عمولة مخفضة 5% فقط', 'طلبات غير محدودة', 'أولوية الظهور في نتائج البحث', 'شارة فني موثوق'], commissionRate: 0.05, maxBookingsPerMonth: 9999, isPopular: true, isActive: true },
      { id: 'plan_vip', nameAr: 'باقة النخبة (VIP)', pricePerMonth: 599, features: ['عمولة 2% رمزية', 'ظهور مميز في الصفحة الرئيسية', 'دعم فني مخصص 24/7', 'تقارير أداء دورية'], commissionRate: 0.02, maxBookingsPerMonth: 9999, isActive: true }
    ];
  },

  getMySubscription: async (): Promise<ProviderSubscription> => {
    if (!currentUserId) throw new Error('يرجى تسجيل الدخول');
    if (!supabase) return fallbackRequest<ProviderSubscription>('/api/subscription/my-plan');

    const { data: prov } = await supabase.from('providers').select('id').eq('user_id', currentUserId).maybeSingle();
    if (!prov) throw new Error('حساب فني غير موجود');

    return api.getProviderSubscription(prov.id);
  },

  getProviderSubscription: async (providerId: string): Promise<ProviderSubscription> => {
    if (!supabase) return fallbackRequest<ProviderSubscription>(`/api/providers/${providerId}/subscription`);

    const { data } = await supabase.from('provider_subscriptions').select('*').eq('provider_id', providerId).maybeSingle();
    return {
      id: data?.id || 'sub_default',
      providerId,
      planId: data?.plan ? `plan_${data.plan.toLowerCase()}` : 'plan_free',
      status: (data?.status?.toLowerCase() as any) || 'active',
      startDate: new Date().toISOString(),
      endDate: data?.expires_at || new Date(Date.now() + 30 * 86400000).toISOString(),
      autoRenew: true
    };
  },

  subscribeProvider: async (providerId: string, plan: string = 'PRO'): Promise<ProviderSubscription> => {
    if (!supabase) {
      return fallbackRequest<ProviderSubscription>(`/api/providers/${providerId}/subscribe`, {
        method: 'POST',
        body: JSON.stringify({ plan })
      });
    }

    const { data } = await supabase.from('provider_subscriptions').upsert({
      provider_id: providerId,
      plan: plan.toUpperCase().includes('VIP') ? 'VIP' : 'PRO',
      monthly_fee: plan.toUpperCase().includes('VIP') ? 599 : 299,
      commission_discount: 0.05,
      status: 'ACTIVE',
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString()
    }).select('*').single();

    return {
      id: data?.id || 'sub_new',
      providerId,
      planId: `plan_${plan.toLowerCase()}`,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: data?.expires_at || new Date(Date.now() + 30 * 86400000).toISOString(),
      autoRenew: true
    };
  },

  upgradeSubscription: async (plan: 'PRO' | 'VIP'): Promise<ProviderSubscription> => {
    const mySub = await api.getMySubscription();
    return api.subscribeProvider(mySub.providerId, plan);
  },

  getProviderCommissions: async (): Promise<Commission[]> => {
    if (!supabase) return fallbackRequest<Commission[]>('/api/provider/commissions');
    if (!currentUserId) return [];
    const { data: prov } = await supabase.from('providers').select('id').eq('user_id', currentUserId).maybeSingle();
    if (!prov) return [];

    const { data, error } = await supabase.from('commissions').select('*, bookings(booking_number)').eq('provider_id', prov.id).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => ({
      id: row.id,
      bookingId: row.booking_id,
      providerId: row.provider_id,
      totalBookingAmount: Number(row.booking_amount),
      commissionRate: Number(row.commission_rate),
      commissionAmount: Number(row.commission_amount),
      providerPayout: Number(row.provider_earnings),
      status: row.status as any,
      createdAt: row.created_at,
      bookingNumber: row.bookings?.booking_number
    }));
  },

  // ------------------------------------------------------------------
  // NOTIFICATIONS
  // ------------------------------------------------------------------
  getNotifications: async (userId?: string): Promise<AppNotification[]> => {
    const targetUserId = userId || currentUserId;
    if (!supabase) return fallbackRequest<AppNotification[]>('/api/notifications');
    if (!targetUserId) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(mapNotification);
  },

  markNotificationRead: async (id: string) => {
    return api.markNotificationAsRead(id);
  },

  markNotificationAsRead: async (id: string) => {
    if (!supabase) return fallbackRequest<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PATCH' });
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  markAllNotificationsRead: async (userId?: string) => {
    return api.markAllNotificationsAsRead(userId || currentUserId || '');
  },

  markAllNotificationsAsRead: async (userId: string) => {
    if (!supabase) return fallbackRequest<{ success: boolean }>(`/api/notifications/user/${userId}/read-all`, { method: 'POST' });
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // ------------------------------------------------------------------
  // ADMIN & STATS
  // ------------------------------------------------------------------
  getAdminStats: async (): Promise<PlatformStats> => {
    return api.getPlatformStats();
  },

  getPlatformStats: async (): Promise<PlatformStats> => {
    if (!supabase) return fallbackRequest<PlatformStats>('/api/admin/stats');

    const [
      { count: customersCount },
      { count: providersCount },
      { count: bookingsCount },
      { data: bookingsData },
      { data: reviewsData }
    ] = await Promise.all([
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('providers').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('status, final_price, commission_amount, provider_earnings'),
      supabase.from('reviews').select('rating')
    ]);

    const completed = (bookingsData || []).filter(b => (b.status || '').toString().toUpperCase() === 'COMPLETED');
    const pending = (bookingsData || []).filter(b => (b.status || '').toString().toUpperCase() === 'PENDING');
    const totalRevenue = completed.reduce((sum, b) => sum + (Number(b.final_price) || 0), 0);
    const totalCommission = completed.reduce((sum, b) => sum + (Number(b.commission_amount) || 0), 0);
    const totalEarnings = completed.reduce((sum, b) => sum + (Number(b.provider_earnings) || 0), 0);

    const totalReviews = reviewsData?.length || 0;
    const averageRating = totalReviews > 0
      ? Number(((reviewsData || []).reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(2))
      : 5.0;

    return {
      totalCustomers: customersCount || 0,
      totalProviders: providersCount || 0,
      activeProviders: providersCount || 0,
      totalBookings: bookingsCount || 0,
      completedBookings: completed.length,
      pendingBookings: pending.length,
      totalRevenueVolume: totalRevenue,
      totalPlatformCommission: totalCommission,
      totalProviderEarnings: totalEarnings,
      averageRating,
      totalReviews
    };
  },

  getCustomers: async (): Promise<Customer[]> => {
    if (!supabase) return fallbackRequest<Customer[]>('/api/admin/customers');
    const { data, error } = await supabase.from('customers').select('*, users(*)');
    if (error) throw new Error(error.message);
    return (data || []).map((row: any) => mapCustomer(row, row.users ? mapUser(row.users) : undefined));
  },

  getAllUsers: async (): Promise<User[]> => {
    if (!supabase) return fallbackRequest<User[]>('/api/admin/users');
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(mapUser);
  },

  submitDispute: async (data: {
    bookingId: string;
    bookingNumber?: string;
    userId: string;
    userName?: string;
    userPhone?: string;
    userRole: 'customer' | 'provider';
    customerUserId?: string;
    customerName?: string;
    customerPhone?: string;
    providerId: string;
    providerUserId?: string;
    providerName?: string;
    providerPhone?: string;
    reasonCategory: string;
    details: string;
    photoUrl?: string;
  }): Promise<Dispute> => {
    const disputeId = 'disp_' + Math.random().toString(36).substring(2, 9);
    const dispute: Dispute = {
      id: disputeId,
      bookingId: data.bookingId,
      bookingNumber: data.bookingNumber || '',
      userId: data.userId,
      userName: data.userName || 'مستخدم المنصة',
      userPhone: data.userPhone || '',
      userRole: data.userRole,
      customerUserId: data.customerUserId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      providerId: data.providerId,
      providerUserId: data.providerUserId,
      providerName: data.providerName || 'مقدم الخدمة',
      providerPhone: data.providerPhone,
      reasonCategory: data.reasonCategory,
      details: data.details,
      photoUrl: data.photoUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Store in localStorage for instant offline/hybrid support
    try {
      const stored = localStorage.getItem('khalasly_disputes');
      const list: Dispute[] = stored ? JSON.parse(stored) : [];
      list.unshift(dispute);
      localStorage.setItem('khalasly_disputes', JSON.stringify(list));
      localStorage.setItem('zahraa_disputes', JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Try posting to backend server
    try {
      await fallbackRequest<Dispute>('/api/disputes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (e) {
      // Backend may be offline or handled by mock, fallback is fine
    }

    try {
      if (supabase) {
        const { data: adminUser } = await supabase.from('users').select('id').eq('role', 'admin').limit(1).maybeSingle();
        if (adminUser?.id) {
          await supabase.from('notifications').insert({
            id: 'notif_' + Math.random().toString(36).substring(2, 9),
            user_id: adminUser.id,
            title: 'بلاغ نزاع جديد في منصة خلصلى',
            message: `تم تقديم بلاغ نزاع على الطلب ${data.bookingNumber || data.bookingId}: ${data.reasonCategory}`,
            type: 'system',
            link: '/admin',
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.warn('Dispute notification error:', e);
    }

    return dispute;
  },

  getDisputes: async (): Promise<Dispute[]> => {
    // First try backend
    try {
      const res = await fallbackRequest<Dispute[]>('/api/disputes');
      if (Array.isArray(res) && res.length > 0) {
        localStorage.setItem('khalasly_disputes', JSON.stringify(res));
        return res;
      }
    } catch (e) {
      // ignore
    }

    try {
      const stored = localStorage.getItem('khalasly_disputes') || localStorage.getItem('zahraa_disputes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    return [];
  },

  updateDisputeStatus: async (id: string, status: 'pending' | 'in_review' | 'resolved' | 'dismissed', adminNotes?: string): Promise<Dispute | null> => {
    try {
      await fallbackRequest<Dispute>(`/api/disputes/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminNotes })
      });
    } catch (e) {}

    try {
      const stored = localStorage.getItem('khalasly_disputes') || localStorage.getItem('zahraa_disputes');
      let list: Dispute[] = stored ? JSON.parse(stored) : [];
      const index = list.findIndex(d => d.id === id);
      if (index !== -1) {
        list[index].status = status;
        if (adminNotes !== undefined) list[index].adminNotes = adminNotes;
        if (status === 'resolved') list[index].resolvedAt = new Date().toISOString();
        localStorage.setItem('khalasly_disputes', JSON.stringify(list));
        localStorage.setItem('zahraa_disputes', JSON.stringify(list));
        return list[index];
      }
    } catch (e) {
      console.warn('Dispute update error:', e);
    }
    return null;
  },

  // Apply strict penalties: 'warn' | 'suspend' | 'ban' | 'activate'
  applyUserPenalty: async (
    userId: string,
    action: 'warn' | 'suspend' | 'ban' | 'activate',
    reason?: string,
    phone?: string
  ): Promise<{ success: boolean; user: any; message: string }> => {
    // 1. Try sending to backend
    try {
      const serverRes = await fallbackRequest<any>(`/api/admin/users/${encodeURIComponent(userId)}/penalty`, {
        method: 'POST',
        body: JSON.stringify({ action, reason })
      });
      if (serverRes) {
        // Also sync local cache
        const storedPenaltiesRaw = localStorage.getItem('khalasly_penalties') || '{}';
        const storedPenalties = JSON.parse(storedPenaltiesRaw);
        storedPenalties[userId] = {
          status: serverRes.user.status,
          warningCount: serverRes.user.warningCount,
          lastWarningReason: serverRes.user.lastWarningReason
        };
        localStorage.setItem('khalasly_penalties', JSON.stringify(storedPenalties));
        return serverRes;
      }
    } catch (e) {
      // Backend request fallback to localStorage
    }

    // 2. Local fallback
    const storedPenaltiesRaw = localStorage.getItem('khalasly_penalties') || '{}';
    const storedPenalties = JSON.parse(storedPenaltiesRaw);
    const userPen = storedPenalties[userId] || { status: 'active', warningCount: 0, lastWarningReason: '' };

    if (action === 'warn') {
      userPen.warningCount = (userPen.warningCount || 0) + 1;
      userPen.lastWarningReason = reason || 'مخالفة ميثاق التعامل وشروط الاستخدام';
    } else if (action === 'suspend') {
      userPen.status = 'suspended';
    } else if (action === 'ban') {
      userPen.status = 'banned';
      if (phone) {
        const bannedPhones: string[] = JSON.parse(localStorage.getItem('khalasly_banned_phones') || '[]');
        if (!bannedPhones.includes(phone)) {
          bannedPhones.push(phone);
          localStorage.setItem('khalasly_banned_phones', JSON.stringify(bannedPhones));
        }
      }
    } else if (action === 'activate') {
      userPen.status = 'active';
    }

    storedPenalties[userId] = userPen;
    localStorage.setItem('khalasly_penalties', JSON.stringify(storedPenalties));

    // Create notification for the user
    try {
      const notifMsg = action === 'warn'
        ? `⚠️ إنذار رسمي: ${reason || 'تم تسجيل مخالفة لميثاق المجتمع. تكرار المخالفة يعرض حسابك للإيقاف.'}`
        : action === 'suspend'
        ? '🚫 تم إيقاف حسابك مؤقتاً لمخالفة سياسات المنصة أو لوجود شكوى قيد التحقيق.'
        : action === 'ban'
        ? '⛔ تم حظر هذا الحساب نهائياً لمخالفة ميثاق مجتمع خلصلى.'
        : 'تمت استعادة تنشيط الحساب بنجاح.';

      const notifs: AppNotification[] = JSON.parse(localStorage.getItem('khalasly_local_notifs_' + userId) || '[]');
      notifs.unshift({
        id: 'notif_' + Math.random().toString(36).substring(2, 9),
        userId,
        title: action === 'warn' ? '⚠️ إنذار رسمي من إدارة خلصلى' : action === 'suspend' ? '🚫 إيقاف مؤقت للحساب' : '⛔ حظر نهائي للحساب',
        message: notifMsg,
        type: 'system',
        link: '/terms',
        isRead: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('khalasly_local_notifs_' + userId, JSON.stringify(notifs));
    } catch (e) {}

    const msg = action === 'warn'
      ? 'تم إرسال الإنذار الرسمي للحساب بنجاح'
      : action === 'suspend'
      ? 'تم إيقاف الحساب مؤقتاً ومنعه من الدخول'
      : action === 'ban'
      ? 'تم حظر الحساب نهائياً وحظر رقم الهاتف من إعادة التسجيل'
      : 'تمت استعادة تنشيط الحساب';

    return {
      success: true,
      user: { id: userId, ...userPen },
      message: msg
    };
  },

  getUserPenaltyInfo: (userId: string) => {
    try {
      const stored = localStorage.getItem('khalasly_penalties');
      if (stored) {
        const penalties = JSON.parse(stored);
        if (penalties[userId]) return penalties[userId];
      }
    } catch {}
    return { status: 'active', warningCount: 0 };
  },

  isPhoneBanned: (phone: string): boolean => {
    try {
      const stored = localStorage.getItem('khalasly_banned_phones');
      if (stored) {
        const banned: string[] = JSON.parse(stored);
        const clean = phone.trim().replace(/\s+/g, '');
        return banned.some(p => clean.includes(p) || p.includes(clean));
      }
    } catch {}
    return false;
  },

  resetDemoData: async () => {
    return {
      message: 'تم تحديث البيانات بنجاح',
      stats: await api.getPlatformStats()
    };
  }
};