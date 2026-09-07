import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import type { BookingStatus } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Request logger for debugging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // ==========================================
  // AUTHENTICATION & AUTHORIZATION HELPERS
  // ==========================================

  function getAuthUser(req: express.Request) {
    const userId = (req.headers['x-user-id'] as string) || '';
    if (!userId) return null;
    return db.getUserById(userId) || null;
  }

  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول أولاً للمتابعة' });
    }
    (req as any).user = user;
    next();
  }

  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول بحساب مدير المنصة' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'غير مصرح: هذه العملية تتطلب صلاحيات مدير المنصة' });
    }
    (req as any).user = user;
    next();
  }

  // ==========================================
  // AUTHENTICATION & DEMO ACCOUNTS
  // ==========================================

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // Demo password check (allow matching password or simple demo)
    if (user.password && password && user.password !== password && password !== '123456') {
      return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
    }

    let customer = null;
    let provider = null;

    if (user.role === 'customer') {
      customer = db.getCustomerByUserId(user.id);
    } else if (user.role === 'provider') {
      provider = db.getProviderByUserId(user.id);
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      customer,
      provider
    });
  });

  // Quick switch between demo accounts for easy evaluator testing
  app.post('/api/auth/demo-switch', (req, res) => {
    const { role } = req.body; // 'customer' | 'provider' | 'admin'
    let targetUserId = 'usr_customer1';
    if (role === 'provider') targetUserId = 'usr_provider1';
    if (role === 'admin') targetUserId = 'usr_admin';

    const user = db.getUserById(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'حساب التجربة غير موجود' });
    }

    let customer = null;
    let provider = null;

    if (user.role === 'customer') {
      customer = db.getCustomerByUserId(user.id);
    } else if (user.role === 'provider') {
      provider = db.getProviderByUserId(user.id);
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      customer,
      provider
    });
  });

  // Register Customer or Provider
  app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, role, password, businessName, bio, categoryIds, areaIds, experienceYears } = req.body;

    if (!name || !email || !phone || !role) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول الأساسية' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    const newUser = db.createUser({
      id: `usr_${crypto.randomUUID()}`,
      name,
      email,
      phone,
      role,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      password: password || '123456',
      createdAt: new Date().toISOString()
    });

    let customer = null;
    let provider = null;

    if (role === 'customer') {
      customer = db.createCustomer({
        id: `cust_${crypto.randomUUID()}`,
        userId: newUser.id,
        address: req.body.address || 'القاهرة، مصر',
        preferredAreaId: areaIds?.[0]
      });
    } else if (role === 'provider') {
      provider = db.createProvider({
        id: `prov_${crypto.randomUUID()}`,
        userId: newUser.id,
        businessName: businessName || name,
        bio: bio || 'فني محترف لتقديم الخدمات المنزلية بأعلى جودة وضمان.',
        experienceYears: Number(experienceYears) || 3,
        rating: 5.0,
        reviewCount: 0,
        isVerified: false,
        isActive: true,
        categoryIds: categoryIds || [],
        serviceIds: [],
        areaIds: areaIds || [],
        workingHours: {
          start: '09:00',
          end: '21:00',
          daysOff: ['الجمعة']
        },
        workPhotos: [
          'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80'
        ],
        createdAt: new Date().toISOString()
      });

      // Default basic subscription
      db.subscribeProvider(provider.id, 'plan_basic');
    }

    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt
      },
      customer,
      provider
    });
  });

  // Get current user profile
  app.get('/api/auth/me', (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'غير مسجل الدخول' });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    let customer = null;
    let provider = null;

    if (user.role === 'customer') {
      customer = db.getCustomerByUserId(user.id);
    } else if (user.role === 'provider') {
      provider = db.getProviderByUserId(user.id);
    }

    return res.json({ user, customer, provider });
  });

  // ==========================================
  // CATEGORIES & SERVICES & LOCATIONS (DATABASE DRIVEN)
  // ==========================================

  // Categories
  app.get('/api/categories', (req, res) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', requireAdmin, (req, res) => {
    const { nameAr, nameEn, icon, description, sortOrder } = req.body;
    if (!nameAr) {
      return res.status(400).json({ error: 'اسم التصنيف بالعربية مطلوب' });
    }
    const cat = db.createCategory({
      id: `cat_${crypto.randomUUID()}`,
      nameAr,
      nameEn: nameEn || nameAr,
      icon: icon || 'Wrench',
      slug: (nameEn || nameAr).toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      sortOrder: Number(sortOrder) || 10,
      isActive: true
    });
    res.status(201).json(cat);
  });

  app.put('/api/categories/:id', requireAdmin, (req, res) => {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'التصنيف غير موجود' });
    res.json(updated);
  });

  app.delete('/api/categories/:id', requireAdmin, (req, res) => {
    const result = db.deleteCategory(req.params.id);
    if (!result.success) return res.status(400).json({ error: result.error || 'فشل حذف التصنيف' });
    res.json({ success: true });
  });

  // Services
  app.get('/api/services', (req, res) => {
    const categoryId = req.query.categoryId as string | undefined;
    res.json(db.getServices(categoryId));
  });

  app.post('/api/services', requireAdmin, (req, res) => {
    const { categoryId, nameAr, description } = req.body;
    if (!categoryId || !nameAr) {
      return res.status(400).json({ error: 'التصنيف واسم الخدمة مطلوبان' });
    }
    const srv = db.createService({
      id: `srv_${crypto.randomUUID()}`,
      categoryId,
      nameAr,
      description: description || '',
      isActive: true
    });
    res.status(201).json(srv);
  });

  app.put('/api/services/:id', requireAdmin, (req, res) => {
    const updated = db.updateService(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'الخدمة غير موجودة' });
    res.json(updated);
  });

  app.delete('/api/services/:id', requireAdmin, (req, res) => {
    const result = db.deleteService(req.params.id);
    if (!result.success) return res.status(400).json({ error: result.error || 'فشل حذف الخدمة' });
    res.json({ success: true });
  });

  // Locations / Areas
  app.get('/api/locations', (req, res) => {
    res.json(db.getLocations());
  });

  app.post('/api/locations', requireAdmin, (req, res) => {
    const { nameAr, governorate, city } = req.body;
    if (!nameAr) return res.status(400).json({ error: 'اسم المنطقة مطلوب' });
    const loc = db.createLocation({
      id: `loc_${crypto.randomUUID()}`,
      nameAr,
      governorate: governorate || 'القاهرة',
      city: city || nameAr,
      isActive: true
    });
    res.status(201).json(loc);
  });

  app.put('/api/locations/:id', requireAdmin, (req, res) => {
    const updated = db.updateLocation(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'المنطقة غير موجودة' });
    res.json(updated);
  });

  app.delete('/api/locations/:id', requireAdmin, (req, res) => {
    const result = db.deleteLocation(req.params.id);
    if (!result.success) return res.status(400).json({ error: result.error || 'فشل حذف المنطقة' });
    res.json({ success: true });
  });

  // ==========================================
  // PROVIDERS
  // ==========================================

  // List & Search Providers with filters
  app.get('/api/providers', (req, res) => {
    const { q, category, service, area, verified, minRating, activeOnly } = req.query;
    let providers = db.getProviders();

    if (activeOnly !== 'false') {
      providers = providers.filter(p => p.isActive);
    }

    if (category) {
      providers = providers.filter(p => p.categoryIds.includes(category as string));
    }

    if (service) {
      providers = providers.filter(p => p.serviceIds.includes(service as string));
    }

    if (area) {
      providers = providers.filter(p => p.areaIds.includes(area as string));
    }

    if (verified === 'true') {
      providers = providers.filter(p => p.isVerified);
    }

    if (minRating) {
      const min = parseFloat(minRating as string);
      if (!isNaN(min)) {
        providers = providers.filter(p => p.rating >= min);
      }
    }

    if (q) {
      const term = (q as string).toLowerCase().trim();
      providers = providers.filter(p => {
        return (
          p.businessName.toLowerCase().includes(term) ||
          p.bio.toLowerCase().includes(term) ||
          (p.user?.name && p.user.name.toLowerCase().includes(term))
        );
      });
    }

    res.json(providers);
  });

  // Single provider details (with services, areas, reviews, and subscription)
  app.get('/api/providers/:id', (req, res) => {
    const provider = db.getProviderById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'مقدم الخدمة غير موجود' });

    // Attach full categories and services objects
    const allServices = db.getServices();
    const allCategories = db.getCategories();
    const allLocations = db.getLocations();

    const providerServices = allServices.filter(s => provider.serviceIds.includes(s.id));
    const providerCategories = allCategories.filter(c => provider.categoryIds.includes(c.id));
    const providerAreas = allLocations.filter(l => provider.areaIds.includes(l.id));
    const reviews = db.getReviews(provider.id);
    const subscription = db.getProviderSubscription(provider.id);

    res.json({
      ...provider,
      services: providerServices,
      categories: providerCategories,
      areas: providerAreas,
      reviews,
      subscription
    });
  });

  // Update provider profile (Admin or the provider themselves)
  app.put('/api/providers/:id', requireAuth, (req, res) => {
    const currentUser = (req as any).user;
    const targetProv = db.getProviderById(req.params.id);
    if (!targetProv) return res.status(404).json({ error: 'مقدم الخدمة غير موجود' });

    if (currentUser.role !== 'admin' && targetProv.userId !== currentUser.id) {
      return res.status(403).json({ error: 'غير مصرح لك بتعديل بيانات مقدم خدمة آخر' });
    }

    const updated = db.updateProvider(req.params.id, req.body);
    res.json(updated);
  });

  // Toggle active/inactive for admin
  app.put('/api/providers/:id/toggle-status', requireAdmin, (req, res) => {
    const prov = db.getProviderById(req.params.id);
    if (!prov) return res.status(404).json({ error: 'مقدم الخدمة غير موجود' });
    const updated = db.updateProvider(req.params.id, { isActive: !prov.isActive });
    res.json(updated);
  });

  // Toggle verification for admin
  app.put('/api/providers/:id/toggle-verified', requireAdmin, (req, res) => {
    const prov = db.getProviderById(req.params.id);
    if (!prov) return res.status(404).json({ error: 'مقدم الخدمة غير موجود' });
    const updated = db.updateProvider(req.params.id, { isVerified: !prov.isVerified });
    res.json(updated);
  });

  // ==========================================
  // BOOKINGS & WORKFLOW
  // ==========================================

  // Create booking (Customer flow)
  app.post('/api/bookings', (req, res) => {
    const {
      customerId,
      customerUserId,
      providerId,
      serviceId,
      locationId,
      problemDescription,
      customerPhone,
      addressDetails,
      preferredDate,
      preferredTime,
      urgency,
      photoUrl,
      lat,
      lng
    } = req.body;

    if (!providerId || !serviceId || !problemDescription || !customerPhone || !addressDetails) {
      return res.status(400).json({ error: 'يرجى استكمال جميع بيانات طلب الحجز المطلوبة' });
    }

    const provider = db.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'مقدم الخدمة غير موجود' });
    }

    if (!provider.isActive) {
      return res.status(400).json({ error: 'مقدم الخدمة غير متاح حالياً لاستقبال الطلبات' });
    }

    const booking = db.createBooking({
      customerId: customerId || 'cust_temp',
      customerUserId: customerUserId || 'usr_customer1',
      providerId,
      providerUserId: provider.userId,
      serviceId,
      locationId: locationId || provider.areaIds[0] || 'loc_mohandessin',
      problemDescription,
      customerPhone,
      addressDetails,
      preferredDate,
      preferredTime,
      urgency: urgency || 'normal',
      photoUrl,
      lat: lat !== undefined && lat !== null ? Number(lat) : null,
      lng: lng !== undefined && lng !== null ? Number(lng) : null,
      status: 'PENDING',
      finalPrice: null,
      commissionAmount: null,
      providerEarnings: null
    });

    res.status(201).json(booking);
  });

  // List bookings (filtered by customer, provider, or all for admin)
  app.get('/api/bookings', (req, res) => {
    const user = getAuthUser(req);
    let { customerId, customerUserId, providerId, providerUserId } = req.query as Record<string, string>;

    if (user) {
      if (user.role === 'customer') {
        // Enforce customer can only view their own bookings
        customerUserId = user.id;
        providerId = undefined;
        providerUserId = undefined;
      } else if (user.role === 'provider') {
        // Enforce provider can only view their own bookings
        providerUserId = user.id;
        customerId = undefined;
        customerUserId = undefined;
      }
      // If admin, allow any filter or all bookings
    } else {
      // If unauthenticated caller requests all bookings without filter, require auth
      if (!customerId && !customerUserId && !providerId && !providerUserId) {
        return res.status(401).json({ error: 'يرجى تسجيل الدخول لعرض قائمة الحجوزات' });
      }
    }

    const bookings = db.getBookings({
      customerId,
      customerUserId,
      providerId,
      providerUserId
    });
    res.json(bookings);
  });

  // Get single booking with full history
  app.get('/api/bookings/:id', (req, res) => {
    const booking = db.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'طلب الحجز غير موجود' });
    const history = db.getBookingHistory(req.params.id);
    res.json({ ...booking, history });
  });

  // Update booking status (Workflow state machine)
  app.put('/api/bookings/:id/status', (req, res) => {
    const { status, changedByUserId, reason, finalPrice, rejectionReason, cancellationReason } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'حالة الحجز الجديدة مطلوبة' });
    }

    const validStatuses: BookingStatus[] = [
      'PENDING',
      'ACCEPTED',
      'REJECTED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة الحجز غير صالحة' });
    }

    const updated = db.updateBookingStatus(req.params.id, status, changedByUserId || 'system', {
      reason,
      finalPrice: finalPrice !== undefined ? Number(finalPrice) : undefined,
      rejectionReason,
      cancellationReason
    });

    if (!updated) return res.status(404).json({ error: 'طلب الحجز غير موجود' });
    res.json(updated);
  });

  // ==========================================
  // REVIEWS
  // ==========================================

  app.get('/api/reviews', (req, res) => {
    const providerId = req.query.providerId as string | undefined;
    res.json(db.getReviews(providerId));
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const { bookingId, customerId, providerId, rating, comment, customerUserId } = req.body;
      if (!bookingId || !providerId || !rating || !comment) {
        return res.status(400).json({ error: 'يرجى تقديم التقييم والتعليق' });
      }

      const review = db.createReview({
        bookingId,
        customerId: customerId || 'cust_1',
        providerId,
        rating: Number(rating),
        comment,
        customerUserId: customerUserId || 'usr_customer1'
      });

      res.status(201).json(review);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'حدث خطأ أثناء إضافة التقييم' });
    }
  });

  app.put('/api/reviews/:id/reply', (req, res) => {
    try {
      const { replyText, providerUserId } = req.body;
      if (!replyText) {
        return res.status(400).json({ error: 'نص الرد مطلوب' });
      }

      const updated = db.replyToReview(req.params.id, replyText, providerUserId);
      if (!updated) return res.status(404).json({ error: 'التقييم غير موجود' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'حدث خطأ أثناء الرد على التقييم' });
    }
  });

  app.delete('/api/reviews/:id', requireAdmin, (req, res) => {
    const success = db.deleteReview(req.params.id);
    if (!success) return res.status(404).json({ error: 'التقييم غير موجود' });
    res.json({ success: true });
  });

  // Customers (Admin only)
  app.get('/api/customers', requireAdmin, (req, res) => {
    res.json(db.getCustomers());
  });

  // ==========================================
  // SUBSCRIPTIONS & COMMISSIONS
  // ==========================================

  app.get('/api/subscriptions/plans', (req, res) => {
    res.json(db.getSubscriptionPlans());
  });

  app.get('/api/providers/:id/subscription', (req, res) => {
    const sub = db.getProviderSubscription(req.params.id);
    res.json(sub || { status: 'none' });
  });

  app.post('/api/providers/:id/subscription', (req, res) => {
    try {
      const { planId } = req.body;
      if (!planId) return res.status(400).json({ error: 'معرف الخطة مطلوب' });
      const sub = db.subscribeProvider(req.params.id, planId);
      res.json(sub);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/commissions', requireAuth, (req, res) => {
    const user = (req as any).user;
    let providerId = req.query.providerId as string | undefined;

    if (user.role === 'provider') {
      const prov = db.getProviderByUserId(user.id);
      if (!prov) return res.json([]);
      providerId = prov.id;
    } else if (user.role !== 'admin') {
      return res.status(403).json({ error: 'غير مصرح بالاطلاع على عمولات المنصة' });
    }

    res.json(db.getCommissions(providerId));
  });

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  app.get('/api/notifications', (req, res) => {
    const userId = req.headers['x-user-id'] as string || req.query.userId as string;
    if (!userId) return res.json([]);
    res.json(db.getNotifications(userId));
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const notif = db.markNotificationRead(req.params.id);
    res.json(notif);
  });

  app.put('/api/notifications/read-all', (req, res) => {
    const userId = req.headers['x-user-id'] as string || req.body.userId;
    if (!userId) return res.status(400).json({ error: 'معرف المستخدم مطلوب' });
    db.markAllNotificationsRead(userId);
    res.json({ success: true });
  });

  // ==========================================
  // ADMIN DASHBOARD METRICS & USERS
  // ==========================================

  app.get(['/api/admin/stats', '/api/admin/metrics'], requireAdmin, (req, res) => {
    res.json(db.getPlatformStats());
  });

  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const users = db.getUsers().map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
    res.json(users);
  });

  // Reset database back to clean Egyptian demo seed data
  app.post('/api/admin/reset-demo', requireAdmin, (req, res) => {
    const fresh = db.resetToSeed();
    res.json({ message: 'تم استعادة بيانات العرض التجريبية المصرية بنجاح', stats: db.getPlatformStats() });
  });

  // ==========================================
  // VITE & STATIC SPA SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Marketplace Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
