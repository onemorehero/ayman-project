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

let currentUserId: string | null = null;

export function setApiUser(userId: string | null) {
  currentUserId = userId;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (currentUserId) {
    headers['x-user-id'] = currentUserId;
  }

  // Support custom backend URL (if specified in VITE_API_BASE_URL) or default to relative path (/api/...)
  const baseUrl = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = `${baseUrl}${cleanPath}`;

  const res = await fetch(targetUrl, {
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

  // Prevent parsing HTML pages as JSON when SPA fallback happens
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
      throw new Error('تعذر الوصول إلى الـ API (تم استلام صفحة HTML بدلاً من JSON). يرجى التأكد من توجيهات vercel.json أو ملف api/index.ts');
    }
    throw new Error('استجابة غير متوقعة من الخادم');
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password?: string) =>
    request<{ user: User; customer: Customer | null; provider: Provider | null }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  quickSwitch: (role: 'customer' | 'provider' | 'admin') =>
    request<{ user: User; customer: Customer | null; provider: Provider | null }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role })
    }),

  register: (payload: {
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'provider';
    password?: string;
    businessName?: string;
    bio?: string;
    categoryIds?: string[];
    areaIds?: string[];
    experienceYears?: number;
    address?: string;
  }) =>
    request<{ user: User; customer: Customer | null; provider: Provider | null }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () =>
    request<{ user: User; customer: Customer | null; provider: Provider | null }>('/api/auth/me'),

  // Categories & Services & Locations
  getCategories: () => request<Category[]>('/api/categories'),
  createCategory: (data: Partial<Category>) =>
    request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<Category>) =>
    request<Category>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/api/categories/${id}`, { method: 'DELETE' }),

  getServices: (categoryId?: string) => {
    const q = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return request<Service[]>(`/api/services${q}`);
  },
  createService: (data: Partial<Service>) =>
    request<Service>('/api/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id: string, data: Partial<Service>) =>
    request<Service>(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id: string) =>
    request<{ success: boolean }>(`/api/services/${id}`, { method: 'DELETE' }),

  getLocations: () => request<Location[]>('/api/locations'),
  createLocation: (data: Partial<Location>) =>
    request<Location>('/api/locations', { method: 'POST', body: JSON.stringify(data) }),
  updateLocation: (id: string, data: Partial<Location>) =>
    request<Location>(`/api/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLocation: (id: string) =>
    request<{ success: boolean }>(`/api/locations/${id}`, { method: 'DELETE' }),

  // Providers
  getProviders: (params?: {
    q?: string;
    category?: string;
    service?: string;
    area?: string;
    verified?: boolean;
    minRating?: number;
    activeOnly?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.category) query.append('category', params.category);
    if (params?.service) query.append('service', params.service);
    if (params?.area) query.append('area', params.area);
    if (params?.verified) query.append('verified', 'true');
    if (params?.minRating) query.append('minRating', params.minRating.toString());
    if (params?.activeOnly === false) query.append('activeOnly', 'false');

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Provider[]>(`/api/providers${qs}`);
  },

  getProviderById: (id: string) =>
    request<Provider & {
      services: Service[];
      categories: Category[];
      areas: Location[];
      reviews: Review[];
      subscription: ProviderSubscription | null;
    }>(`/api/providers/${id}`),

  updateProvider: (id: string, data: Partial<Provider>) =>
    request<Provider>(`/api/providers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  toggleProviderStatus: (id: string) =>
    request<Provider>(`/api/providers/${id}/toggle-status`, { method: 'PUT' }),

  toggleProviderVerified: (id: string) =>
    request<Provider>(`/api/providers/${id}/toggle-verified`, { method: 'PUT' }),

  // Bookings
  createBooking: (data: {
    customerId?: string;
    customerUserId?: string;
    providerId: string;
    serviceId: string;
    locationId: string;
    problemDescription: string;
    customerPhone: string;
    addressDetails: string;
    preferredDate?: string;
    preferredTime?: string;
    urgency?: 'normal' | 'urgent' | 'nearest';
    photoUrl?: string;
    lat?: number | null;
    lng?: number | null;
  }) =>
    request<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),

  getBookings: (params?: {
    customerId?: string;
    customerUserId?: string;
    providerId?: string;
    providerUserId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.customerUserId) query.append('customerUserId', params.customerUserId);
    if (params?.providerId) query.append('providerId', params.providerId);
    if (params?.providerUserId) query.append('providerUserId', params.providerUserId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Booking[]>(`/api/bookings${qs}`);
  },

  getBookingById: (id: string) =>
    request<Booking & { history: any[] }>(`/api/bookings/${id}`),

  updateBookingStatus: (
    id: string,
    status: BookingStatus,
    options?: {
      changedByUserId?: string;
      reason?: string;
      finalPrice?: number;
      rejectionReason?: string;
      cancellationReason?: string;
    }
  ) =>
    request<Booking>(`/api/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...options })
    }),

  // Reviews
  getReviews: (providerId?: string) => {
    const qs = providerId ? `?providerId=${encodeURIComponent(providerId)}` : '';
    return request<Review[]>(`/api/reviews${qs}`);
  },

  createReview: (data: {
    bookingId: string;
    customerId?: string;
    providerId: string;
    rating: number;
    comment: string;
    customerUserId?: string;
  }) =>
    request<Review>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),

  replyReview: (id: string, replyText: string, providerUserId: string) =>
    request<Review>(`/api/reviews/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify({ replyText, providerUserId })
    }),

  deleteReview: (id: string) =>
    request<{ success: boolean }>(`/api/reviews/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () =>
    request<(Customer & { user?: User })[]>('/api/customers'),

  // Subscriptions & Plans
  getSubscriptionPlans: () => request<SubscriptionPlan[]>('/api/subscriptions/plans'),
  getProviderSubscription: (providerId: string) =>
    request<ProviderSubscription>(`/api/providers/${providerId}/subscription`),
  subscribeProvider: (providerId: string, planId: string) =>
    request<ProviderSubscription>(`/api/providers/${providerId}/subscription`, {
      method: 'POST',
      body: JSON.stringify({ planId })
    }),

  // Commissions
  getCommissions: (providerId?: string) => {
    const qs = providerId ? `?providerId=${encodeURIComponent(providerId)}` : '';
    return request<Commission[]>(`/api/commissions${qs}`);
  },

  // Notifications
  getNotifications: (userId: string) =>
    request<AppNotification[]>(`/api/notifications?userId=${encodeURIComponent(userId)}`),
  markNotificationRead: (id: string) =>
    request<AppNotification>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: (userId: string) =>
    request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT',
      body: JSON.stringify({ userId })
    }),

  // Admin stats
  getAdminStats: () => request<PlatformStats>('/api/admin/stats'),
  getAdminUsers: () => request<User[]>('/api/admin/users'),
  resetDemoData: () => request<{ message: string; stats: PlatformStats }>('/api/admin/reset-demo', { method: 'POST' })
};
