export type UserRole = 'customer' | 'provider' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';

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
  status?: UserStatus;
  warningCount?: number;
  lastWarningReason?: string;
}

export interface Customer {
  id: string;
  userId: string;
  address: string;
  preferredAreaId?: string;
  notes?: string;
  user?: User;
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
  completedJobs?: number;
  bankAccount?: any;
  nationalIdOrLicense?: string;
  createdAt: string;
  slug?: string;
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
  badge?: string;
  sortOrder?: number;
  isActive: boolean;
  servicesCount?: number;
  providersCount?: number;
}

export interface Service {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn?: string;
  description: string;
  basePrice?: number;
  priceType?: string;
  durationApprox?: string;
  icon?: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  nameAr: string;
  nameEn?: string;
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
    id?: string;
    name: string;
    phone: string;
    avatarUrl?: string;
    user?: {
      id?: string;
      name: string;
      phone: string;
      avatarUrl?: string;
    };
  };
  provider?: {
    id?: string;
    businessName: string;
    user?: {
      id?: string;
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
  plan?: string | SubscriptionPlan;
  monthlyFee?: number;
  commissionDiscount?: number;
  status: 'active' | 'expired' | 'pending' | 'ACTIVE' | 'EXPIRED' | 'PENDING';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface Commission {
  id: string;
  bookingId: string;
  providerId: string;
  totalBookingAmount: number;
  commissionRate: number;
  commissionAmount: number;
  providerPayout: number;
  status: 'collected' | 'pending' | 'waived' | 'COLLECTED' | 'PENDING' | 'WAIVED';
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

export interface Dispute {
  id: string;
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
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}
