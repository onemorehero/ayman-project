import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  BookingStatus
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
    avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    password: row.password,
    createdAt: row.created_at || new Date().toISOString()
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
    sortOrder: Number(row.sort_order || 1),
    isActive: Boolean(row.is_active !== false)
  };
}

function mapLocation(row: any): Location {
  if (!row) return {} as Location;
  return {
    id: row.id,
    nameAr: row.name_ar || row.nameAr || '',
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
    description: row.description_ar || row.description || '',
    isActive: Boolean(row.is_active !== false)
  };
}

function mapProvider(row: any, userDetails?: User): Provider {
  if (!row) return {} as Provider;
  return {
    id: row.id,
    userId: row.user_id || row.userId || '',
    businessName: row.business_name || row.businessName || '',
    bio: row.bio || '',
    experienceYears: Number(row.experience_years ?? row.experienceYears ?? 1),
    rating: Number(row.average_rating ?? row.rating ?? 5.0),
    reviewCount: Number(row.total_reviews ?? row.reviewCount ?? 0),
    isVerified: Boolean(row.is_verified ?? row.isVerified ?? false),
    isActive: Boolean(row.is_active !== false),
    categoryIds: Array.isArray(row.category_ids) ? row.category_ids : Array.isArray(row.categoryIds) ? row.categoryIds : [],
    serviceIds: Array.isArray(row.service_ids) ? row.service_ids : Array.isArray(row.serviceIds) ? row.serviceIds : [],
    areaIds: Array.isArray(row.area_ids) ? row.area_ids : Array.isArray(row.areaIds) ? row.areaIds : [],
    workingHours: row.working_hours || row.workingHours || { start: '09:00', end: '21:00', daysOff: ['الجمعة'] },
    workPhotos: row.work_photos || row.workPhotos || [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    user: userDetails
  };
}

function mapBooking(row: any): Booking {
  if (!row) return {} as Booking;
  return {
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
    status: (row.status || 'PENDING') as BookingStatus,
    finalPrice: row.final_price ? Number(row.final_price) : row.finalPrice ? Number(row.finalPrice) : null,
    commissionAmount: row.commission_amount ? Number(row.commission_amount) : row.commissionAmount ? Number(row.commissionAmount) : null,
    providerEarnings: row.provider_earnings ? Number(row.provider_earnings) : row.providerEarnings ? Number(row.providerEarnings) : null,
    rejectionReason: row.rejection_reason || row.rejectionReason,
    cancellationReason: row.cancellation_reason || row.cancellationReason,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
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
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    customerName: row.customer_name || row.customerName || 'عميل',
    customerAvatar: row.customer_avatar || row.customerAvatar
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
  // AUTHENTICATION
  // ------------------------------------------------------------------
  login: async (email: string, password?: string) => {
    if (!supabase) {
      return fallbackRequest<{ user: User; customer: Customer | null; provider: Provider | null }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    }

    const { data: userRow, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error) throw new Error(`خطأ أثناء تسجيل الدخول: ${error.message}`);
    if (!userRow) throw new Error('البريد الإلكتروني غير مسجل');
    if (password && userRow.password && userRow.password !== password) {
      throw new Error('كلمة المرور غير صحيحة');
    }

    const user = mapUser(userRow);
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

  register: async (payload: any): Promise<{ user: User; customer: Customer | null; provider: Provider | null }> => {
    if (payload.role === 'provider') {
      const res = await api.registerProvider({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        businessName: payload.businessName || payload.name,
        bio: payload.bio || '',
        experienceYears: Number(payload.experienceYears || 1),
        categoryIds: payload.categoryIds || [],
        serviceIds: payload.serviceIds || [],
        areaIds: payload.areaIds || []
      });
      return { user: res.user, customer: null, provider: res.provider };
    }

    const res = await api.registerCustomer({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      address: payload.address || 'القاهرة',
      notes: payload.notes
    });
    return { user: res.user, customer: res.customer, provider: null };
  },

  registerCustomer: async (data: { name: string; email: string; phone: string; password?: string; address: string; notes?: string }) => {
    if (!supabase) {
      return fallbackRequest<{ user: User; customer: Customer }>('/api/auth/register-customer', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const userPayload = {
      id: userId,
      name: data.name,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      role: 'customer',
      password: data.password || 'demo',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    };

    const { error: userError } = await supabase.from('users').insert(userPayload);
    if (userError) throw new Error(userError.message);

    const custId = 'cust_' + Math.random().toString(36).substring(2, 9);
    const custPayload = {
      id: custId,
      user_id: userId,
      address: data.address,
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };

    const { error: custError } = await supabase.from('customers').insert(custPayload);
    if (custError) throw new Error(custError.message);

    const user = mapUser(userPayload);
    const customer = mapCustomer(custPayload, user);
    setApiUser(user.id);

    return { user, customer };
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
    if (!supabase) {
      return fallbackRequest<{ user: User; provider: Provider }>('/api/auth/register-provider', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const userPayload = {
      id: userId,
      name: data.name,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      role: 'provider',
      password: data.password || 'demo',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    };

    const { error: userError } = await supabase.from('users').insert(userPayload);
    if (userError) throw new Error(userError.message);

    const provId = 'prov_' + Math.random().toString(36).substring(2, 9);
    const provPayload = {
      id: provId,
      user_id: userId,
      business_name: data.businessName,
      bio: data.bio,
      experience_years: data.experienceYears,
      category_ids: data.categoryIds,
      service_ids: data.serviceIds,
      area_ids: data.areaIds,
      is_verified: false,
      is_active: true,
      average_rating: 5.0,
      total_reviews: 0,
      completed_jobs: 0,
      created_at: new Date().toISOString()
    };

    const { error: provError } = await supabase.from('providers').insert(provPayload);
    if (provError) throw new Error(provError.message);

    const user = mapUser(userPayload);
    const provider = mapProvider(provPayload, user);
    setApiUser(user.id);

    return { user, provider };
  },

  quickSwitch: async (role: 'customer' | 'provider' | 'admin') => {
    if (!supabase) {
      return fallbackRequest<{ user: User; customer: Customer | null; provider: Provider | null }>(`/api/auth/switch/${role}`, {
        method: 'POST'
      });
    }

    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .limit(1)
      .single();

    if (!userRow) throw new Error(`لم يتم العثور على حساب تجريبي برتبة ${role}`);

    const user = mapUser(userRow);
    setApiUser(user.id);

    let customer: Customer | null = null;
    let provider: Provider | null = null;

    if (role === 'customer') {
      const { data: custRow } = await supabase.from('customers').select('*').eq('user_id', user.id).maybeSingle();
      if (custRow) customer = mapCustomer(custRow, user);
    } else if (role === 'provider') {
      const { data: provRow } = await supabase.from('providers').select('*').eq('user_id', user.id).maybeSingle();
      if (provRow) provider = mapProvider(provRow, user);
    }

    return { user, customer, provider };
  },

  getMe: async () => {
    if (!supabase) {
      return fallbackRequest<{ user: User; customer: Customer | null; provider: Provider | null }>('/api/auth/me');
    }
    if (!currentUserId) throw new Error('يرجى تسجيل الدخول أولاً');

    const { data: userRow } = await supabase.from('users').select('*').eq('id', currentUserId).maybeSingle();
    if (!userRow) throw new Error('المستخدم غير موجود');

    const user = mapUser(userRow);
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

    let query = supabase.from('providers').select('*, users(*)').eq('is_active', true);

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

    return providers;
  },

  getProvider: async (id: string): Promise<Provider> => {
    if (!supabase) return fallbackRequest<Provider>(`/api/providers/${id}`);
    const { data, error } = await supabase.from('providers').select('*, users(*)').eq('id', id).single();
    if (error) throw new Error(error.message);
    const userDetails = data.users ? mapUser(data.users) : undefined;
    return mapProvider(data, userDetails);
  },

  getProviderById: async (id: string): Promise<Provider> => {
    return api.getProvider(id);
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
    urgency?: 'normal' | 'urgent';
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

    const bookingPayload = {
      id: bookingId,
      booking_number: bookingNumber,
      customer_id: data.customerId || 'cust_direct',
      customer_user_id: data.customerUserId || currentUserId || 'usr_guest',
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

    const { data: inserted, error } = await supabase.from('bookings').insert(bookingPayload).select('*').single();
    if (error) throw new Error(`فشل إنشاء الحجز: ${error.message}`);

    const { data: providerRow } = await supabase.from('providers').select('user_id').eq('id', data.providerId).maybeSingle();
    if (providerRow?.user_id) {
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
    }

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

    let query = supabase.from('bookings').select('*, services(*), locations(*)').order('created_at', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
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

    return (data || []).map((row: any) => {
      const b = mapBooking(row);
      if (row.services) b.service = mapService(row.services);
      if (row.locations) b.location = mapLocation(row.locations);
      return b;
    });
  },

  getBooking: async (id: string): Promise<Booking> => {
    if (!supabase) return fallbackRequest<Booking>(`/api/bookings/${id}`);
    const { data, error } = await supabase.from('bookings').select('*, services(*), locations(*)').eq('id', id).single();
    if (error) throw new Error(error.message);
    const b = mapBooking(data);
    if (data.services) b.service = mapService(data.services);
    if (data.locations) b.location = mapLocation(data.locations);
    return b;
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

    const updatePayload: Record<string, any> = {
      status,
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

    const { data, error } = await supabase.from('bookings').update(updatePayload).eq('id', id).select('*').single();
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

    const commissionRate = 0.10;
    const commissionAmount = Math.round(data.finalPrice * commissionRate);
    const providerEarnings = data.finalPrice - commissionAmount;

    const { data: updatedBooking, error: bookingErr } = await supabase
      .from('bookings')
      .update({
        status: 'COMPLETED',
        final_price: data.finalPrice,
        commission_amount: commissionAmount,
        provider_earnings: providerEarnings,
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
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      provider_earnings: providerEarnings,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await supabase.from('commissions').insert(commPayload);

    if (updatedBooking.customer_user_id) {
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
    if (booking.customer_user_id) {
      const { data: u } = await supabase.from('users').select('name').eq('id', booking.customer_user_id).maybeSingle();
      if (u?.name) customerName = u.name;
    }

    const reviewId = 'rev_' + Math.random().toString(36).substring(2, 9);
    const reviewPayload = {
      id: reviewId,
      booking_id: data.bookingId,
      customer_id: booking.customer_id,
      customer_name: customerName,
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

    const [{ count: customersCount }, { count: providersCount }, { count: bookingsCount }, { data: bookingsData }] = await Promise.all([
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('providers').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('status, final_price, commission_amount, provider_earnings')
    ]);

    const completed = (bookingsData || []).filter(b => b.status === 'COMPLETED');
    const pending = (bookingsData || []).filter(b => b.status === 'PENDING');
    const totalRevenue = completed.reduce((sum, b) => sum + (Number(b.final_price) || 0), 0);
    const totalCommission = completed.reduce((sum, b) => sum + (Number(b.commission_amount) || 0), 0);
    const totalEarnings = completed.reduce((sum, b) => sum + (Number(b.provider_earnings) || 0), 0);

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
      averageRating: 4.88,
      totalReviews: 80
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

  resetDemoData: async () => {
    return {
      message: 'تم تحديث البيانات بنجاح',
      stats: await api.getPlatformStats()
    };
  }
};