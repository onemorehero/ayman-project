export type UserRole = 'customer' | 'provider' | 'admin';

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
  password?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  address: string;
  preferredAreaId?: string;
  notes?: string;
}

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  bio: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  categoryIds: string[];
  serviceIds: string[];
  areaIds: string[];
  workingHours: {
    start: string;
    end: string;
    daysOff: string[];
  };
  workPhotos: string[];
  nationalIdOrLicense?: string;
  createdAt: string;
  // Hydrated user details if present
  user?: User;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  servicesCount?: number;
  providersCount?: number;
}

export interface Service {
  id: string;
  categoryId: string;
  nameAr: string;
  description: string;
  icon?: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  nameAr: string;
  governorate: string;
  city: string;
  isActive: boolean;
}

export interface ProviderService {
  id: string;
  providerId: string;
  serviceId: string;
  customDescription?: string;
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  note?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerUserId: string;
  providerId: string;
  providerUserId: string;
  serviceId: string;
  locationId: string;
  problemDescription: string;
  customerPhone: string;
  addressDetails: string;
  preferredDate?: string;
  preferredTime?: string;
  urgency: 'normal' | 'urgent' | 'nearest';
  photoUrl?: string;
  lat?: number | null;
  lng?: number | null;
  status: BookingStatus;
  finalPrice: number | null;
  commissionAmount: number | null;
  providerEarnings: number | null;
  rejectionReason?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  // Relations for convenient UI rendering
  customer?: {
    name: string;
    phone: string;
    avatarUrl?: string;
  };
  provider?: {
    businessName: string;
    user?: {
      name: string;
      phone: string;
      avatarUrl?: string;
    };
  };
  service?: Service;
  category?: Category;
  location?: Location;
  review?: Review;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedByUserId: string;
  reason?: string;
  timestamp: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number; // 1 - 5
  comment: string;
  providerReply?: string;
  repliedAt?: string;
  createdAt: string;
  customerName?: string;
  customerAvatar?: string;
}

export interface SubscriptionPlan {
  id: string;
  nameAr: string;
  pricePerMonth: number;
  features: string[];
  commissionRate: number; // e.g. 0.10 for 10%
  maxBookingsPerMonth: number;
  isPopular?: boolean;
  isActive: boolean;
}

export interface ProviderSubscription {
  id: string;
  providerId: string;
  planId: string;
  status: 'active' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  plan?: SubscriptionPlan;
}

export interface Commission {
  id: string;
  bookingId: string;
  providerId: string;
  totalBookingAmount: number;
  commissionRate: number;
  commissionAmount: number;
  providerPayout: number;
  status: 'collected' | 'pending' | 'waived';
  createdAt: string;
  bookingNumber?: string;
  providerName?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'booking_new'
    | 'booking_accepted'
    | 'booking_rejected'
    | 'booking_status'
    | 'review_new'
    | 'subscription'
    | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalCustomers: number;
  totalProviders: number;
  activeProviders: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalRevenueVolume: number;
  totalPlatformCommission: number;
  totalProviderEarnings: number;
  averageRating: number;
  totalReviews: number;
}
