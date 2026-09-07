import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  Customer,
  Provider,
  Category,
  Service,
  Location,
  ProviderService,
  Booking,
  BookingStatusHistory,
  Review,
  SubscriptionPlan,
  ProviderSubscription,
  Commission,
  ProviderAvailability,
  AppNotification,
  BookingStatus
} from '../src/types.js';

export interface DatabaseSchema {
  users: User[];
  customers: Customer[];
  providers: Provider[];
  categories: Category[];
  services: Service[];
  locations: Location[];
  providerServices: ProviderService[];
  providerAvailabilities: ProviderAvailability[];
  bookings: Booking[];
  bookingStatusHistories: BookingStatusHistory[];
  reviews: Review[];
  subscriptionPlans: SubscriptionPlan[];
  providerSubscriptions: ProviderSubscription[];
  commissions: Commission[];
  notifications: AppNotification[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'marketplace.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialSeedData(): DatabaseSchema {
  const users: User[] = [
    {
      id: 'usr_admin',
      name: 'أحمد زهران (مدير المنصة)',
      email: 'admin@demo.com',
      phone: '01001234567',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      password: 'admin',
      createdAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'usr_customer1',
      name: 'سارة أحمد حسن',
      email: 'customer@demo.com',
      phone: '01123456789',
      role: 'customer',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-10T12:00:00Z'
    },
    {
      id: 'usr_customer2',
      name: 'طارق عبد المنعم',
      email: 'tarek@example.com',
      phone: '01234567890',
      role: 'customer',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-15T14:00:00Z'
    },
    {
      id: 'usr_provider1',
      name: 'الأسطى محمود حسن',
      email: 'provider@demo.com',
      phone: '01019876543',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-05T09:00:00Z'
    },
    {
      id: 'usr_provider2',
      name: 'المهندس أحمد الشافعي',
      email: 'ahmed.electric@demo.com',
      phone: '01155554321',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-06T10:00:00Z'
    },
    {
      id: 'usr_provider3',
      name: 'كابتن حسام الصياد',
      email: 'hossam.hvac@demo.com',
      phone: '01222223344',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-07T11:00:00Z'
    },
    {
      id: 'usr_provider4',
      name: 'عماد النجار',
      email: 'emad.wood@demo.com',
      phone: '01066667788',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-08T09:30:00Z'
    },
    {
      id: 'usr_provider5',
      name: 'مصطفى الجوهري',
      email: 'mostafa.paint@demo.com',
      phone: '01177778899',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-09T08:00:00Z'
    },
    {
      id: 'usr_provider6',
      name: 'م / شريف عبد الوهاب',
      email: 'sherif.appliances@demo.com',
      phone: '01288889900',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-10T11:30:00Z'
    },
    {
      id: 'usr_provider7',
      name: 'إيمان فتحي (شركة النقاء للتنظيف)',
      email: 'alnaqaa.clean@demo.com',
      phone: '01099990011',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-11T12:00:00Z'
    },
    {
      id: 'usr_provider8',
      name: 'الصقر لنقل وتغليف الأثاث',
      email: 'alsaqr.movers@demo.com',
      phone: '01100001122',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-12T13:00:00Z'
    },
    {
      id: 'usr_provider9',
      name: 'الأسطى إبراهيم خليل',
      email: 'ibrahim.plumber@demo.com',
      phone: '01211112233',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-13T14:00:00Z'
    },
    {
      id: 'usr_provider10',
      name: 'كريم الصاوي',
      email: 'karim.electric@demo.com',
      phone: '01033334455',
      role: 'provider',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      password: 'demo',
      createdAt: '2026-01-14T15:00:00Z'
    }
  ];

  const customers: Customer[] = [
    {
      id: 'cust_1',
      userId: 'usr_customer1',
      address: 'شارع عباس العقاد - مدينة نصر',
      preferredAreaId: 'loc_nasr',
      notes: 'عميل مميز'
    },
    {
      id: 'cust_2',
      userId: 'usr_customer2',
      address: 'شارع مصدق - الدقي',
      preferredAreaId: 'loc_dokki',
      notes: ''
    }
  ];

  const categories: Category[] = [
    {
      id: 'cat_plumbing',
      nameAr: 'سباكة',
      nameEn: 'Plumbing',
      icon: 'Wrench',
      slug: 'plumbing',
      description: 'صيانة وتأسيس شبكات المياه والصرف، تركيب الخلاطات والسخانات وكشف التسريبات',
      sortOrder: 1,
      isActive: true
    },
    {
      id: 'cat_electricity',
      nameAr: 'كهرباء',
      nameEn: 'Electricity',
      icon: 'Zap',
      slug: 'electricity',
      description: 'صيانة الأعطال الكهربائية، تركيب النجف والليدات، وتأسيس وتوصيل لوحات التوزيع',
      sortOrder: 2,
      isActive: true
    },
    {
      id: 'cat_hvac',
      nameAr: 'تكييف وتبريد',
      nameEn: 'HVAC',
      icon: 'Wind',
      slug: 'hvac',
      description: 'شحن فريون، غسيل وصيانة الوحدات الداخلية والخارجية، وفك ونقل التكييفات',
      sortOrder: 3,
      isActive: true
    },
    {
      id: 'cat_carpentry',
      nameAr: 'نجارة',
      nameEn: 'Carpentry',
      icon: 'Hammer',
      slug: 'carpentry',
      description: 'صيانة وتفصيل الأبواب والشبابيك، تركيب الكالونات وتصليح المطابخ وغرف النوم',
      sortOrder: 4,
      isActive: true
    },
    {
      id: 'cat_painting',
      nameAr: 'نقاشة ودهانات',
      nameEn: 'Painting',
      icon: 'Paintbrush',
      slug: 'painting',
      description: 'دهانات حديثة، معالجة الرطوبة والشروخ، تركيب ورق حائط وبديل الرخام والخشب',
      sortOrder: 5,
      isActive: true
    },
    {
      id: 'cat_appliances',
      nameAr: 'صيانة أجهزة منزلية',
      nameEn: 'Home Appliances',
      icon: 'Tv',
      slug: 'appliances',
      description: 'صيانة الغسالات الفول أوتوماتيك، الثلاجات، البوتاجازات، والميكروويف وقطع غيار أصلية',
      sortOrder: 6,
      isActive: true
    },
    {
      id: 'cat_cleaning',
      nameAr: 'تنظيف منزلي',
      nameEn: 'Cleaning',
      icon: 'Sparkles',
      slug: 'cleaning',
      description: 'تنظيف عميق للشقق والفلل، غسيل السجاد والأنتريهات بالبخار، والتعقيم الشامل',
      sortOrder: 7,
      isActive: true
    },
    {
      id: 'cat_moving',
      nameAr: 'نقل أثاث',
      nameEn: 'Moving',
      icon: 'Truck',
      slug: 'moving',
      description: 'سيارات نقل مجهزة، ونش هيدروليكي للأدوار المرتفعة، وفك وتغليف احترافي',
      sortOrder: 8,
      isActive: true
    }
  ];

  const services: Service[] = [
    // سباكة
    { id: 'srv_plumb_leaks', categoryId: 'cat_plumbing', nameAr: 'كشف تسريبات المياه ومعالجة الصرف', description: 'كشف إلكتروني لأماكن الرشح وعلاج التسريب بدون تكسير عشوائي', isActive: true },
    { id: 'srv_plumb_mixers', categoryId: 'cat_plumbing', nameAr: 'تركيب وصيانة الخلاطات والدش وقواعد الحمام', description: 'تغيير قلب الخلاط وتركيب مستلزمات الحمام والشطافات', isActive: true },
    { id: 'srv_plumb_heaters', categoryId: 'cat_plumbing', nameAr: 'تركيب وصيانة السخانات والفلاتر والمضخات', description: 'تركيب وتوصيل سخانات الغاز والكهرباء ومضخات الرفع ومحطات الفلاتر', isActive: true },
    // كهرباء
    { id: 'srv_elec_short', categoryId: 'cat_electricity', nameAr: 'إصلاح قفلات وشورت الكهرباء المفاجئ', description: 'تتبع الأعطال وعلاج القفلات وتغيير القواطع الأوتوماتيكية', isActive: true },
    { id: 'srv_elec_lighting', categoryId: 'cat_electricity', nameAr: 'تركيب النجف والسبوتات وليد بروفايل', description: 'توزيع الإضاءة العصرية وتثبيت أحدث أنواع الديكور الضوئي', isActive: true },
    { id: 'srv_elec_wiring', categoryId: 'cat_electricity', nameAr: 'تأسيس وتجديد شبكات الكهرباء للشقق', description: 'سحب أسلاك السويدي المعتمدة وتركيب المفاتيح والبرايز', isActive: true },
    // تكييف
    { id: 'srv_hvac_freon', categoryId: 'cat_hvac', nameAr: 'شحن فريون أصلي وكشف تسريب غاز التكييف', description: 'شحن غاز R410A / R22 مع ضمان التبريد', isActive: true },
    { id: 'srv_hvac_cleaning', categoryId: 'cat_hvac', nameAr: 'غسيل وصيانة دورية للتكييف بالضغط العالي', description: 'تنظيف الفلاتر وسربنتينة الوحدة الخارجية للتخلص من الروائح وضعف التبريد', isActive: true },
    { id: 'srv_hvac_moving', categoryId: 'cat_hvac', nameAr: 'فك ونقل وتركيب التكييفات بجميع القدرات', description: 'فك احترافي بدون تسريب الفريون مع التمديدات النحاسية', isActive: true },
    // نجارة
    { id: 'srv_carp_locks', categoryId: 'cat_carpentry', nameAr: 'تركيب وصيانة الكالونات والمقابض والأبواب', description: 'تغيير كالونات الأمان وضبط الأبواب المريحة والشبابيك', isActive: true },
    { id: 'srv_carp_kitchen', categoryId: 'cat_carpentry', nameAr: 'صيانة وتعديل المطابخ والدواليب والسحابات', description: 'تغيير المفصلات الهيدروليك وتعديل رخامات ومطابخ الخشب والخشمونيوم', isActive: true },
    // نقاشة
    { id: 'srv_paint_apt', categoryId: 'cat_painting', nameAr: 'تشطيب ودهانات الشقق والفلل بأجود الخامات', description: 'تأسيس معجون وسيلر وتشطيب دهانات سايبس وجوتن قابلة للغسيل', isActive: true },
    { id: 'srv_paint_decor', categoryId: 'cat_painting', nameAr: 'ديكورات بديل الرخام وبديل الخشب وورق الحائط', description: 'تركيب أحدث التكسيات الجدارية الديكورية مع الإضاءة المخفية', isActive: true },
    // صيانة أجهزة
    { id: 'srv_app_washing', categoryId: 'cat_appliances', nameAr: 'صيانة الغسالات الفول أوتوماتيك وفوق أوتوماتيك', description: 'علاج مشاكل الطرد، العصر، الكارتة، ورولمان البلي بقطع أصلية', isActive: true },
    { id: 'srv_app_fridge', categoryId: 'cat_appliances', nameAr: 'صيانة الثلاجات والديب فريزر والنوفروست', description: 'حل مشكلة عدم التبريد، شحن فريون، وتغيير الثرموستات والتايمر', isActive: true },
    // تنظيف
    { id: 'srv_clean_deep', categoryId: 'cat_cleaning', nameAr: 'تنظيف عميق شامل للمنازل وما بعد التشطيب', description: 'جلي وتلميع الأرضيات، تنظيف الشبابيك والمطابخ والحمامات بأجهزة حديثة', isActive: true },
    { id: 'srv_clean_sofa', categoryId: 'cat_cleaning', nameAr: 'غسيل الأنتريهات والسجاد والمفروشات بالبخار', description: 'إزالة البقع الصعبة وتعطير الأقمشة في مكانها مع التجفيف السريع', isActive: true },
    // نقل أثاث
    { id: 'srv_move_full', categoryId: 'cat_moving', nameAr: 'نقل عفش شامل بالونش الهيدروليكي وسيارات مغلقة', description: 'سيارات صندوقية مجهزة لحماية الأثاث من الأتربة والأمطار', isActive: true },
    { id: 'srv_move_pack', categoryId: 'cat_moving', nameAr: 'تغليف احترافي للأثاث والتحف والزجاج مع الفك والتركيب', description: 'استخدام كراتين مضلعة وبابلز واسترتش وفنيين نجارة وتكييف متخصصين', isActive: true }
  ];

  const locations: Location[] = [
    { id: 'loc_mohandessin', nameAr: 'المهندسين', governorate: 'الجيزة', city: 'الجيزة', isActive: true },
    { id: 'loc_dokki', nameAr: 'الدقي', governorate: 'الجيزة', city: 'الجيزة', isActive: true },
    { id: 'loc_agouza', nameAr: 'العجوزة', governorate: 'الجيزة', city: 'الجيزة', isActive: true },
    { id: 'loc_haram', nameAr: 'الهرم', governorate: 'الجيزة', city: 'الجيزة', isActive: true },
    { id: 'loc_faisal', nameAr: 'فيصل', governorate: 'الجيزة', city: 'الجيزة', isActive: true },
    { id: 'loc_nasr', nameAr: 'مدينة نصر', governorate: 'القاهرة', city: 'القاهرة', isActive: true },
    { id: 'loc_heliopolis', nameAr: 'مصر الجديدة', governorate: 'القاهرة', city: 'القاهرة', isActive: true },
    { id: 'loc_maadi', nameAr: 'المعادي', governorate: 'القاهرة', city: 'القاهرة', isActive: true },
    { id: 'loc_tagamoa', nameAr: 'التجمع الخامس', governorate: 'القاهرة', city: 'القاهرة الجديدة', isActive: true },
    { id: 'loc_zayed', nameAr: 'الشيخ زايد', governorate: 'الجيزة', city: '6 أكتوبر', isActive: true }
  ];

  const providers: Provider[] = [
    {
      id: 'prov_1',
      userId: 'usr_provider1',
      businessName: 'الأسطى محمود للسباكة الحديثة',
      bio: 'سباك صحي خبرة أكثر من 14 عاماً في صيانة وتأسيس الفلل والشقق، كشف التسريب بأحدث الأجهزة الإلكترونية دون تكسير، ودقة عالية في المواعيد وجودة في التسليم.',
      experienceYears: 14,
      rating: 4.9,
      reviewCount: 42,
      isVerified: true,
      isActive: true,
      categoryIds: ['cat_plumbing'],
      serviceIds: ['srv_plumb_leaks', 'srv_plumb_mixers', 'srv_plumb_heaters'],
      areaIds: ['loc_mohandessin', 'loc_dokki', 'loc_agouza', 'loc_zayed'],
      workingHours: { start: '08:00', end: '22:00', daysOff: ['الجمعة'] },
      workPhotos: [
        'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: '28405120102345',
      createdAt: '2026-01-05T09:00:00Z'
    },
    {
      id: 'prov_2',
      userId: 'usr_provider2',
      businessName: 'الشافعي للكهرباء الهندسية والإنارة',
      bio: 'فني كهرباء معتمد نقابياً، متخصص في إصلاح القفلات المعقدة، تأسيس شبكات المنازل، وتركيب ليد بروفايل والنجف الذكي. نستخدم أفضل خامات الكابلات والقواطع.',
      experienceYears: 11,
      rating: 4.85,
      reviewCount: 38,
      isVerified: true,
      isActive: true,
      categoryIds: ['cat_electricity'],
      serviceIds: ['srv_elec_short', 'srv_elec_lighting', 'srv_elec_wiring'],
      areaIds: ['loc_nasr', 'loc_heliopolis', 'loc_tagamoa', 'loc_maadi'],
      workingHours: { start: '09:00', end: '23:00', daysOff: [] },
      workPhotos: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: '29011030104567',
      createdAt: '2026-01-06T10:00:00Z'
    },
    {
      id: 'prov_3',
      userId: 'usr_provider3',
      businessName: 'الصياد إير كوندشنينج وتبريد',
      bio: 'مركز متخصص في صيانة وغسيل جميع أنواع التكييفات (شارب، كاريير، إل جي، تورنيدو). شحن فريون أمريكي معتمد، فحص الكومبريسور وتسريب الغاز بضمان حقيقي.',
      experienceYears: 9,
      rating: 4.92,
      reviewCount: 56,
      isVerified: true,
      isActive: true,
      categoryIds: ['cat_hvac'],
      serviceIds: ['srv_hvac_freon', 'srv_hvac_cleaning', 'srv_hvac_moving'],
      areaIds: ['loc_mohandessin', 'loc_dokki', 'loc_haram', 'loc_faisal', 'loc_zayed'],
      workingHours: { start: '10:00', end: '22:00', daysOff: [] },
      workPhotos: [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: '29302150107890',
      createdAt: '2026-01-07T11:00:00Z'
    },
    {
      id: 'prov_4',
      userId: 'usr_provider4',
      businessName: 'ورشة عماد للأعمال الخشبية والموبيليا',
      bio: 'نجار محترف لجميع أعمال صيانة وتصليح الأبواب والشبابيك، تركيب وتفصيل المطابخ الحديثة، وصيانة غرف النوم والدواليب السحاب وتغيير الكالونات والمفصلات.',
      experienceYears: 16,
      rating: 4.78,
      reviewCount: 29,
      isVerified: true,
      isActive: true,
      categoryIds: ['cat_carpentry'],
      serviceIds: ['srv_carp_locks', 'srv_carp_kitchen'],
      areaIds: ['loc_dokki', 'loc_mohandessin', 'loc_agouza', 'loc_haram'],
      workingHours: { start: '09:00', end: '20:00', daysOff: ['الأحد'] },
      workPhotos: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: '28108190101122',
      createdAt: '2026-01-08T09:30:00Z'
    },
    {
      id: 'prov_5',
      userId: 'usr_provider5',
      businessName: 'الجوهري للديكور والتشطيبات الحديثة',
      bio: 'فريق نقاشة وديكورات عالية المستوى، خبرة في دهانات جوتن وورق الحائط 3D وبديل الرخام والخشب. التزام تام بنظافة المكان ودقة ميعاد التسليم.',
      experienceYears: 8,
      rating: 4.88,
      reviewCount: 34,
      isVerified: true,
      isActive: true,
      categoryIds: ['cat_painting'],
      serviceIds: ['srv_paint_apt', 'srv_paint_decor'],
      areaIds: ['loc_nasr', 'loc_heliopolis', 'loc_tagamoa'],
      workingHours: { start: '08:30', end: '19:00', daysOff: ['الجمعة'] },
      workPhotos: [
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: '29509200109988',
      createdAt: '2026-01-09T08:00:00Z'
    },
    {
      id: 'prov_6',
      userId: 'usr_provider6',
      businessName: 'المركز الفني لصيانة الأجهزة المنزلية',
      bio: 'صيانة فورية بالمنزل للغسالات الأوتوماتيك، الثلاجات والديب فريزر بقطع غيار أصلية وضمان كتابي معتمد. كشف فني دقيق وأمانة مهنية كاملة.',
      experienceYears: 12,
      rating: 4.75,
      reviewCount: 22,
      isVerified: true,
      isActive: true,
      categoryIds: ['cat_appliances'],
      serviceIds: ['srv_app_washing', 'srv_app_fridge'],
      areaIds: ['loc_mohandessin', 'loc_dokki', 'loc_haram', 'loc_faisal', 'loc_zayed'],
      workingHours: { start: '10:00', end: '21:00', daysOff: [] },
      workPhotos: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: '28604110103344',
      createdAt: '2026-01-10T11:30:00Z'
    },
    {
      id: 'prov_7',
      userId: 'usr_provider7',
      businessName: 'شركة النقاء لخدمات التنظيف الشامل',
      bio: 'خدمات تنظيف احترافية للشقق والفلل والشركات، غسيل السجاد والأنتريهات بالبخار والتعقيم الصحي، عمالة مدربة وأحدث ماكينات التنظيف الإيطالية.',
      experienceYears: 7,
      rating: 4.95,
      reviewCount: 65,
      isVerified: true,
      isActive: true,
      categoryIds: ['cat_cleaning'],
      serviceIds: ['srv_clean_deep', 'srv_clean_sofa'],
      areaIds: ['loc_tagamoa', 'loc_nasr', 'loc_heliopolis', 'loc_maadi', 'loc_dokki', 'loc_mohandessin'],
      workingHours: { start: '08:00', end: '20:00', daysOff: [] },
      workPhotos: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: 'سجل تجاري 104928',
      createdAt: '2026-01-11T12:00:00Z'
    },
    {
      id: 'prov_8',
      userId: 'usr_provider8',
      businessName: 'الصقر لنقل العفش والموبيليا مع الونش',
      bio: 'أسطول سيارات مغلقة لحماية الأثاث، ونش رفع هيدروليكي حتى الدور العشرين، فنيين نجارة وتكييف لفك وتركيب كل قطعة بأمان تام وتغليف كرتوني ممتاز.',
      experienceYears: 10,
      rating: 4.82,
      reviewCount: 48,
      isVerified: true,
      isActive: true,
      categoryIds: ['cat_moving'],
      serviceIds: ['srv_move_full', 'srv_move_pack'],
      areaIds: ['loc_mohandessin', 'loc_dokki', 'loc_haram', 'loc_faisal', 'loc_nasr', 'loc_heliopolis', 'loc_tagamoa', 'loc_zayed', 'loc_maadi'],
      workingHours: { start: '07:00', end: '23:00', daysOff: [] },
      workPhotos: [
        'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: 'سجل تجاري 882190',
      createdAt: '2026-01-12T13:00:00Z'
    },
    {
      id: 'prov_9',
      userId: 'usr_provider9',
      businessName: 'خليل لخدمات السباكة والشبكات',
      bio: 'فني سباكة متخصص في مضخات المياه الإيطالية، سخانات الغاز والكهرباء، وعزل وتصليح حمامات ومطابخ الشقق القديمة والجديدة بمهارة وسرعة استجابة.',
      experienceYears: 15,
      rating: 4.7,
      reviewCount: 19,
      isVerified: false,
      isActive: true,
      categoryIds: ['cat_plumbing'],
      serviceIds: ['srv_plumb_leaks', 'srv_plumb_mixers', 'srv_plumb_heaters'],
      areaIds: ['loc_haram', 'loc_faisal', 'loc_dokki'],
      workingHours: { start: '09:00', end: '21:00', daysOff: ['الجمعة'] },
      workPhotos: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: '28203020108899',
      createdAt: '2026-01-13T14:00:00Z'
    },
    {
      id: 'prov_10',
      userId: 'usr_provider10',
      businessName: 'الصاوي للأعمال الكهربائية والسمارت هوم',
      bio: 'مهندس تنفيذ وتركيب أنظمة سمارت هوم، لوحات تحكم وتوزيع، وإنارة ديكورية متميزة. سرعة في التلبية وخدمة طوارئ في نطاق مدينة نصر ومصر الجديدة.',
      experienceYears: 6,
      rating: 4.9,
      reviewCount: 25,
      isVerified: true,
      isActive: true,
      categoryIds: ['cat_electricity'],
      serviceIds: ['srv_elec_short', 'srv_elec_lighting'],
      areaIds: ['loc_nasr', 'loc_heliopolis', 'loc_tagamoa'],
      workingHours: { start: '10:00', end: '23:00', daysOff: [] },
      workPhotos: [
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80'
      ],
      nationalIdOrLicense: '29810140106677',
      createdAt: '2026-01-14T15:00:00Z'
    }
  ];

  const providerServices: ProviderService[] = [
    { id: 'ps_1', providerId: 'prov_1', serviceId: 'srv_plumb_leaks', customDescription: 'كشف تسريب بجهاز الفحص الألماني' },
    { id: 'ps_2', providerId: 'prov_1', serviceId: 'srv_plumb_mixers', customDescription: 'تركيب خلاطات جروهي وإيديال ستاندرد' },
    { id: 'ps_3', providerId: 'prov_1', serviceId: 'srv_plumb_heaters', customDescription: 'تركيب سخانات أوليمبيك وتورنيدو وفلاتر مياه 7 مراحل' },
    { id: 'ps_4', providerId: 'prov_2', serviceId: 'srv_elec_short', customDescription: 'إصلاح القفلات وحل مشكلة نزول المفتاح الرئيسي' },
    { id: 'ps_5', providerId: 'prov_2', serviceId: 'srv_elec_lighting', customDescription: 'تأسيس وتركيب شريط ليد بروفايل والاسبوتات' },
    { id: 'ps_6', providerId: 'prov_3', serviceId: 'srv_hvac_freon', customDescription: 'شحن فريون هندي وأمريكي مع كشف التسريب' },
    { id: 'ps_7', providerId: 'prov_3', serviceId: 'srv_hvac_cleaning', customDescription: 'غسيل داخلي وخارجي كامل بضغط الماء المعقم' }
  ];

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'plan_basic',
      nameAr: 'الباقة الأساسية',
      pricePerMonth: 150,
      features: [
        'إدراج الحساب في نتائج البحث بالمنطقة',
        'استقبال حتى 15 طلب حجز شهرياً',
        'لوحة تحكم لإدارة الحجوزات',
        'نسبة عمولة المنصة 12%'
      ],
      commissionRate: 0.12,
      maxBookingsPerMonth: 15,
      isPopular: false,
      isActive: true
    },
    {
      id: 'plan_pro',
      nameAr: 'باقة المحترفين (الأكثر طلباً)',
      pricePerMonth: 350,
      features: [
        'ظهور مميز في الصفحة الرئيسية ومقدمة البحث',
        'استقبال حجوزات غير محدودة شهرياً',
        'شارة الفني الموثوق والمعتمد',
        'تخفيض عمولة المنصة إلى 10%',
        'إمكانية رفع صور أعمال غير محدودة في المعرض'
      ],
      commissionRate: 0.10,
      maxBookingsPerMonth: 9999,
      isPopular: true,
      isActive: true
    },
    {
      id: 'plan_elite',
      nameAr: 'باقة النخبة والشركات',
      pricePerMonth: 700,
      features: [
        'تغطية حتى 8 مناطق جغرافية في نفس الوقت',
        'شارة التوثيق الذهبية للشركات والمراكز',
        'أقل نسبة عمولة للمنصة 8% فقط',
        'حجوزات غير محدودة وتنبيهات SMS فورية',
        'مدير حساب ودعم فني مخصص 24/7'
      ],
      commissionRate: 0.08,
      maxBookingsPerMonth: 9999,
      isPopular: false,
      isActive: true
    }
  ];

  const providerSubscriptions: ProviderSubscription[] = [
    {
      id: 'sub_1',
      providerId: 'prov_1',
      planId: 'plan_pro',
      status: 'active',
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      autoRenew: true
    },
    {
      id: 'sub_2',
      providerId: 'prov_2',
      planId: 'plan_pro',
      status: 'active',
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      autoRenew: true
    },
    {
      id: 'sub_3',
      providerId: 'prov_3',
      planId: 'plan_basic',
      status: 'active',
      startDate: '2026-02-01T00:00:00Z',
      endDate: '2026-03-01T23:59:59Z',
      autoRenew: true
    }
  ];

  const bookings: Booking[] = [
    {
      id: 'bk_demo_completed',
      bookingNumber: 'EGY-10024',
      customerId: 'cust_1',
      customerUserId: 'usr_customer1',
      providerId: 'prov_1',
      providerUserId: 'usr_provider1',
      serviceId: 'srv_plumb_mixers',
      locationId: 'loc_dokki',
      problemDescription: 'عندي خلاط المطبخ فيه تسريب مستمر من الأسفل ومحتاج تغيير قلب أو تغيير كامل مع فحص المحبس.',
      customerPhone: '01123456789',
      addressDetails: 'شارع مصدق، برج الأطباء، الدور الخامس شقة 12',
      preferredDate: '2026-02-15',
      preferredTime: 'مساءً (4 - 8)',
      urgency: 'normal',
      status: 'COMPLETED',
      finalPrice: 500,
      commissionAmount: 50,
      providerEarnings: 450,
      lat: 30.0382,
      lng: 31.2114,
      createdAt: '2026-02-14T10:00:00Z',
      updatedAt: '2026-02-15T18:30:00Z'
    },
    {
      id: 'bk_demo_pending',
      bookingNumber: 'EGY-10025',
      customerId: 'cust_1',
      customerUserId: 'usr_customer1',
      providerId: 'prov_1',
      providerUserId: 'usr_provider1',
      serviceId: 'srv_plumb_heaters',
      locationId: 'loc_dokki',
      problemDescription: 'سخان الغاز فيه مشكلة في الإشعال الذاتي وضعف ضغط مياه ساخنة.',
      customerPhone: '01123456789',
      addressDetails: 'شارع التحرير - أمام محطة مترو الدقي',
      preferredDate: '2026-03-10',
      preferredTime: 'صباحاً (10 - 2)',
      urgency: 'urgent',
      status: 'PENDING',
      finalPrice: null,
      commissionAmount: null,
      providerEarnings: null,
      lat: 30.0401,
      lng: 31.2155,
      createdAt: '2026-03-07T08:00:00Z',
      updatedAt: '2026-03-07T08:00:00Z'
    },
    {
      id: 'bk_demo_accepted',
      bookingNumber: 'EGY-10026',
      customerId: 'cust_2',
      customerUserId: 'usr_customer2',
      providerId: 'prov_1',
      providerUserId: 'usr_provider1',
      serviceId: 'srv_plumb_leaks',
      locationId: 'loc_mohandessin',
      problemDescription: 'رشح مياه في حائط الحمام المشترك مع الصالة ومحتاجين كشف إلكتروني لتحديد مكان العيب.',
      customerPhone: '01234567890',
      addressDetails: 'شارع جامعة الدول العربية، خلف البنك الأهلي',
      preferredDate: '2026-03-08',
      preferredTime: 'عصراً (2 - 5)',
      urgency: 'nearest',
      status: 'ACCEPTED',
      finalPrice: null,
      commissionAmount: null,
      providerEarnings: null,
      lat: 30.0571,
      lng: 31.2007,
      createdAt: '2026-03-06T15:00:00Z',
      updatedAt: '2026-03-06T16:20:00Z'
    },
    {
      id: 'bk_demo_inprogress',
      bookingNumber: 'EGY-10027',
      customerId: 'cust_2',
      customerUserId: 'usr_customer2',
      providerId: 'prov_2',
      providerUserId: 'usr_provider2',
      serviceId: 'srv_elec_short',
      locationId: 'loc_heliopolis',
      problemDescription: 'انقطاع تام في كهرباء نصف الشقة والمفتاح الرئيسي يسقط عند التشغيل.',
      customerPhone: '01234567890',
      addressDetails: 'شارع الحجاز - ميدان المحكمة',
      preferredDate: '2026-03-07',
      preferredTime: 'صباحاً (9 - 12)',
      urgency: 'urgent',
      status: 'IN_PROGRESS',
      finalPrice: null,
      commissionAmount: null,
      providerEarnings: null,
      lat: 30.0911,
      lng: 31.3262,
      createdAt: '2026-03-07T07:30:00Z',
      updatedAt: '2026-03-07T09:15:00Z'
    }
  ];

  const bookingStatusHistories: BookingStatusHistory[] = [
    {
      id: 'bsh_1',
      bookingId: 'bk_demo_completed',
      fromStatus: null,
      toStatus: 'PENDING',
      changedByUserId: 'usr_customer1',
      reason: 'إنشاء طلب حجز جديد',
      timestamp: '2026-02-14T10:00:00Z'
    },
    {
      id: 'bsh_2',
      bookingId: 'bk_demo_completed',
      fromStatus: 'PENDING',
      toStatus: 'ACCEPTED',
      changedByUserId: 'usr_provider1',
      reason: 'تم قبول الطلب والتواصل مع العميل لتأكيد الموعد',
      timestamp: '2026-02-14T11:00:00Z'
    },
    {
      id: 'bsh_3',
      bookingId: 'bk_demo_completed',
      fromStatus: 'ACCEPTED',
      toStatus: 'IN_PROGRESS',
      changedByUserId: 'usr_provider1',
      reason: 'الفني وصل وبدأ في صيانة خلاط المياه',
      timestamp: '2026-02-15T16:00:00Z'
    },
    {
      id: 'bsh_4',
      bookingId: 'bk_demo_completed',
      fromStatus: 'IN_PROGRESS',
      toStatus: 'COMPLETED',
      changedByUserId: 'usr_provider1',
      reason: 'تم إنهاء الصيانة بنجاح والاتفاق على السعر 500 ج.م',
      timestamp: '2026-02-15T18:30:00Z'
    },
    {
      id: 'bsh_5',
      bookingId: 'bk_demo_pending',
      fromStatus: null,
      toStatus: 'PENDING',
      changedByUserId: 'usr_customer1',
      reason: 'إنشاء طلب حجز جديد',
      timestamp: '2026-03-07T08:00:00Z'
    },
    {
      id: 'bsh_6',
      bookingId: 'bk_demo_accepted',
      fromStatus: null,
      toStatus: 'PENDING',
      changedByUserId: 'usr_customer2',
      reason: 'طلب جديد',
      timestamp: '2026-03-06T15:00:00Z'
    },
    {
      id: 'bsh_7',
      bookingId: 'bk_demo_accepted',
      fromStatus: 'PENDING',
      toStatus: 'ACCEPTED',
      changedByUserId: 'usr_provider1',
      reason: 'تم قبول الطلب والتنسيق مع الأستاذ طارق',
      timestamp: '2026-03-06T16:20:00Z'
    }
  ];

  const reviews: Review[] = [
    {
      id: 'rev_1',
      bookingId: 'bk_demo_completed',
      customerId: 'cust_1',
      providerId: 'prov_1',
      rating: 5,
      comment: 'ما شاء الله على الأسطى محمود، راجل محترم جداً ووصل في الميعاد بالظبط، حل مشكلة الخلاط وفحص باقي السباكة ونضف مكانه قبل ما يمشي، تسلم إيدك وبإذن الله هتعامل معاه دايماً.',
      providerReply: 'شكراً جداً لحضرتك يا فندم وشهادة أعتز بيها، وتشرفت بخدمتكم في أي وقت!',
      repliedAt: '2026-02-16T10:00:00Z',
      createdAt: '2026-02-15T19:30:00Z',
      customerName: 'سارة أحمد حسن',
      customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 'rev_seed_2',
      bookingId: 'bk_seed_historical_1',
      customerId: 'cust_2',
      providerId: 'prov_1',
      rating: 5,
      comment: 'خبرة وأمانة في السعر وقطع الغيار، عمل كشف تسريب وفر علينا تكسير الحمام كله.',
      providerReply: 'ألف شكر لحضرتك يا باشا، هدفنا دايماً راحة العميل وتوفير التكاليف الزيادة.',
      repliedAt: '2026-01-22T12:00:00Z',
      createdAt: '2026-01-21T18:00:00Z',
      customerName: 'طارق عبد المنعم',
      customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    }
  ];

  const commissions: Commission[] = [
    {
      id: 'comm_1',
      bookingId: 'bk_demo_completed',
      providerId: 'prov_1',
      totalBookingAmount: 500,
      commissionRate: 0.10,
      commissionAmount: 50,
      providerPayout: 450,
      status: 'collected',
      createdAt: '2026-02-15T18:30:00Z',
      bookingNumber: 'EGY-10024',
      providerName: 'الأسطى محمود للسباكة الحديثة'
    }
  ];

  const providerAvailabilities: ProviderAvailability[] = [];

  const notifications: AppNotification[] = [
    {
      id: 'notif_1',
      userId: 'usr_provider1',
      title: 'طلب حجز جديد 🔔',
      message: 'وصلك طلب حجز جديد لصيانة سخان في الدقي من العميل سارة أحمد (حجز رقم EGY-10025).',
      type: 'booking_new',
      link: '/provider/bookings',
      isRead: false,
      createdAt: '2026-03-07T08:00:00Z'
    },
    {
      id: 'notif_2',
      userId: 'usr_customer1',
      title: 'تقييم الخدمة المكتملة ⭐',
      message: 'شكراً لتعاملك مع سوق الخدمات المصرية! تم اكتمال حجزك مع الأسطى محمود، يمكنك الآن كتابة تقييمك للخدمة.',
      type: 'booking_status',
      link: '/customer/bookings',
      isRead: true,
      createdAt: '2026-02-15T18:35:00Z'
    }
  ];

  return {
    users,
    customers,
    providers,
    categories,
    services,
    locations,
    providerServices,
    providerAvailabilities,
    bookings,
    bookingStatusHistories,
    reviews,
    subscriptionPlans,
    providerSubscriptions,
    commissions,
    notifications
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDirectory();
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Verify key tables exist
        if (parsed.users && parsed.providers && parsed.categories && parsed.bookings) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database, re-seeding default data:', err);
    }

    const seed = getInitialSeedData();
    this.saveImmediate(seed);
    return seed;
  }

  private saveImmediate(data: DatabaseSchema) {
    try {
      ensureDataDirectory();
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  public save() {
    this.saveImmediate(this.data);
  }

  // Quick reset to clean seed if requested
  public resetToSeed() {
    this.data = getInitialSeedData();
    this.save();
    return this.data;
  }

  // --- Users & Auth ---
  public getUsers() {
    return this.data.users;
  }

  public getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // --- Customers ---
  public getCustomers() {
    return this.data.customers.map(c => {
      const user = this.getUserById(c.userId);
      return { ...c, user };
    });
  }

  public getCustomerByUserId(userId: string) {
    return this.data.customers.find(c => c.userId === userId);
  }

  public createCustomer(customer: Customer) {
    this.data.customers.push(customer);
    this.save();
    return customer;
  }

  // --- Providers ---
  public getProviders() {
    return this.data.providers.map(p => {
      const user = this.getUserById(p.userId);
      return { ...p, user };
    });
  }

  public getProviderById(id: string) {
    const prov = this.data.providers.find(p => p.id === id);
    if (!prov) return null;
    const user = this.getUserById(prov.userId);
    return { ...prov, user };
  }

  public getProviderByUserId(userId: string) {
    const prov = this.data.providers.find(p => p.userId === userId);
    if (!prov) return null;
    const user = this.getUserById(userId);
    return { ...prov, user };
  }

  public updateProvider(id: string, updates: Partial<Provider>) {
    const index = this.data.providers.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.providers[index] = { ...this.data.providers[index], ...updates };
    this.save();
    return this.getProviderById(id);
  }

  public createProvider(provider: Provider) {
    this.data.providers.push(provider);
    this.save();
    return provider;
  }

  // --- Categories ---
  public getCategories() {
    return this.data.categories.map(c => {
      const servicesCount = this.data.services.filter(s => s.categoryId === c.id && s.isActive).length;
      const providersCount = this.data.providers.filter(p => p.categoryIds.includes(c.id) && p.isActive).length;
      return { ...c, servicesCount, providersCount };
    });
  }

  public getCategoryById(id: string) {
    return this.data.categories.find(c => c.id === id);
  }

  public createCategory(cat: Category) {
    this.data.categories.push(cat);
    this.save();
    return cat;
  }

  public updateCategory(id: string, updates: Partial<Category>) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): { success: boolean; error?: string } {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'التصنيف غير موجود' };

    // Prevent deleting category if services are linked to it
    const linkedServices = this.data.services.filter(s => s.categoryId === id);
    if (linkedServices.length > 0) {
      return {
        success: false,
        error: `لا يمكن حذف هذا التصنيف لأنه يحتوي على ${linkedServices.length} خدمة مرتبطة به. يرجى حذف أو نقل الخدمات أولاً.`
      };
    }

    // Clean up category from providers categoryIds
    this.data.providers.forEach(p => {
      if (p.categoryIds.includes(id)) {
        p.categoryIds = p.categoryIds.filter(cId => cId !== id);
      }
    });

    this.data.categories.splice(idx, 1);
    this.save();
    return { success: true };
  }

  // --- Services ---
  public getServices(categoryId?: string) {
    if (categoryId) {
      return this.data.services.filter(s => s.categoryId === categoryId);
    }
    return this.data.services;
  }

  public getServiceById(id: string) {
    return this.data.services.find(s => s.id === id);
  }

  public createService(srv: Service) {
    this.data.services.push(srv);
    this.save();
    return srv;
  }

  public updateService(id: string, updates: Partial<Service>) {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.services[idx] = { ...this.data.services[idx], ...updates };
    this.save();
    return this.data.services[idx];
  }

  public deleteService(id: string): { success: boolean; error?: string } {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, error: 'الخدمة غير موجودة' };

    // Check if any ongoing/active bookings use this service
    const activeBookings = this.data.bookings.filter(
      b => b.serviceId === id && ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'CONFIRMED'].includes(b.status)
    );
    if (activeBookings.length > 0) {
      return {
        success: false,
        error: `لا يمكن حذف هذه الخدمة لوجود ${activeBookings.length} طلب حجز جاري مرتبط بها.`
      };
    }

    // Clean up from providers serviceIds and providerServices table
    this.data.providers.forEach(p => {
      if (p.serviceIds.includes(id)) {
        p.serviceIds = p.serviceIds.filter(sId => sId !== id);
      }
    });
    this.data.providerServices = this.data.providerServices.filter(ps => ps.serviceId !== id);

    this.data.services.splice(idx, 1);
    this.save();
    return { success: true };
  }

  // --- Locations ---
  public getLocations() {
    return this.data.locations;
  }

  public getLocationById(id: string) {
    return this.data.locations.find(l => l.id === id);
  }

  public createLocation(loc: Location) {
    this.data.locations.push(loc);
    this.save();
    return loc;
  }

  public updateLocation(id: string, updates: Partial<Location>) {
    const idx = this.data.locations.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.locations[idx] = { ...this.data.locations[idx], ...updates };
    this.save();
    return this.data.locations[idx];
  }

  public deleteLocation(id: string): { success: boolean; error?: string } {
    const idx = this.data.locations.findIndex(l => l.id === id);
    if (idx === -1) return { success: false, error: 'المنطقة غير موجودة' };

    // Check if any active bookings are in this location
    const activeBookings = this.data.bookings.filter(
      b => b.locationId === id && ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'CONFIRMED'].includes(b.status)
    );
    if (activeBookings.length > 0) {
      return {
        success: false,
        error: `لا يمكن حذف هذه المنطقة لوجود ${activeBookings.length} طلب حجز جاري مرتبط بها.`
      };
    }

    // Clean up areaIds from providers
    this.data.providers.forEach(p => {
      if (p.areaIds.includes(id)) {
        p.areaIds = p.areaIds.filter(aId => aId !== id);
      }
    });

    this.data.locations.splice(idx, 1);
    this.save();
    return { success: true };
  }

  // --- Bookings ---
  public getBookings(filter?: { customerId?: string; customerUserId?: string; providerId?: string; providerUserId?: string }) {
    let result = this.data.bookings;
    if (filter?.customerId) {
      result = result.filter(b => b.customerId === filter.customerId);
    }
    if (filter?.customerUserId) {
      result = result.filter(b => b.customerUserId === filter.customerUserId);
    }
    if (filter?.providerId) {
      result = result.filter(b => b.providerId === filter.providerId);
    }
    if (filter?.providerUserId) {
      result = result.filter(b => b.providerUserId === filter.providerUserId);
    }

    // Hydrate relations
    return result.map(b => this.hydrateBooking(b));
  }

  public getBookingById(id: string) {
    const booking = this.data.bookings.find(b => b.id === id);
    if (!booking) return null;
    return this.hydrateBooking(booking);
  }

  private hydrateBooking(b: Booking): Booking {
    const customerUser = this.getUserById(b.customerUserId);
    const provider = this.getProviderById(b.providerId);
    const service = this.getServiceById(b.serviceId);
    const category = service ? this.getCategoryById(service.categoryId) : undefined;
    const location = this.getLocationById(b.locationId);
    const review = this.data.reviews.find(r => r.bookingId === b.id);

    return {
      ...b,
      customer: customerUser
        ? {
            name: customerUser.name,
            phone: b.customerPhone || customerUser.phone,
            avatarUrl: customerUser.avatarUrl
          }
        : undefined,
      provider: provider
        ? {
            businessName: provider.businessName,
            user: provider.user
              ? {
                  name: provider.user.name,
                  phone: provider.user.phone,
                  avatarUrl: provider.user.avatarUrl
                }
              : undefined
          }
        : undefined,
      service,
      category,
      location,
      review
    };
  }

  public createBooking(bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt'>) {
    const nextNum = 10028 + this.data.bookings.length;
    const newBooking: Booking = {
      ...bookingData,
      id: `bk_${crypto.randomUUID()}`,
      bookingNumber: `EGY-${nextNum}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.bookings.unshift(newBooking);

    // Record status history
    this.addBookingStatusHistory({
      bookingId: newBooking.id,
      fromStatus: null,
      toStatus: newBooking.status,
      changedByUserId: newBooking.customerUserId,
      reason: 'إنشاء طلب حجز جديد'
    });

    // Create Notification for provider
    const provider = this.getProviderById(newBooking.providerId);
    const customerUser = this.getUserById(newBooking.customerUserId);
    const customerName = customerUser?.name || 'أحد العملاء';
    if (provider) {
      this.createNotification({
        userId: provider.userId,
        title: 'طلب حجز جديد 🛎️',
        message: `لديك طلب خدمة جديد من ${customerName}`,
        type: 'booking_new',
        link: '/provider/bookings'
      });
    }

    this.save();
    return this.hydrateBooking(newBooking);
  }

  public updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    changedByUserId: string,
    options?: {
      reason?: string;
      finalPrice?: number;
      rejectionReason?: string;
      cancellationReason?: string;
    }
  ) {
    const idx = this.data.bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return null;

    const currentBooking = this.data.bookings[idx];
    const previousStatus = currentBooking.status;

    let commissionAmount = currentBooking.commissionAmount;
    let providerEarnings = currentBooking.providerEarnings;
    let finalPrice = options?.finalPrice !== undefined ? options.finalPrice : currentBooking.finalPrice;

    // When status changes to COMPLETED and price is provided, calculate 10% commission simulation
    if (newStatus === 'COMPLETED') {
      const price = finalPrice || 500; // default simulation 500 EGP if not specified
      finalPrice = price;
      // Get provider commission rate from subscription or default 0.10
      const sub = this.data.providerSubscriptions.find(s => s.providerId === currentBooking.providerId && s.status === 'active');
      const plan = sub ? this.data.subscriptionPlans.find(p => p.id === sub.planId) : null;
      const rate = plan?.commissionRate || 0.10;

      commissionAmount = Math.round(price * rate);
      providerEarnings = price - commissionAmount;

      // Create commission record if not exists
      const existingComm = this.data.commissions.find(c => c.bookingId === bookingId);
      const provider = this.getProviderById(currentBooking.providerId);
      if (!existingComm) {
        this.data.commissions.unshift({
          id: `comm_${crypto.randomUUID()}`,
          bookingId: currentBooking.id,
          providerId: currentBooking.providerId,
          totalBookingAmount: price,
          commissionRate: rate,
          commissionAmount: commissionAmount,
          providerPayout: providerEarnings,
          status: 'collected',
          createdAt: new Date().toISOString(),
          bookingNumber: currentBooking.bookingNumber,
          providerName: provider?.businessName || 'مقدم الخدمة'
        });
      }
    }

    const updatedBooking: Booking = {
      ...currentBooking,
      status: newStatus,
      finalPrice,
      commissionAmount,
      providerEarnings,
      rejectionReason: options?.rejectionReason || currentBooking.rejectionReason,
      cancellationReason: options?.cancellationReason || currentBooking.cancellationReason,
      updatedAt: new Date().toISOString()
    };

    this.data.bookings[idx] = updatedBooking;

    // Record history
    this.addBookingStatusHistory({
      bookingId,
      fromStatus: previousStatus,
      toStatus: newStatus,
      changedByUserId,
      reason: options?.reason || `تغيير الحالة إلى ${newStatus}`
    });

    // Notify appropriate party
    if (changedByUserId === currentBooking.providerUserId) {
      // Provider changed status -> Notify customer
      let title = `تحديث في حجزك ${currentBooking.bookingNumber}`;
      let msg = `قام مقدم الخدمة بتحديث حالة الحجز إلى: ${newStatus}`;
      if (newStatus === 'ACCEPTED') {
        title = 'تم قبول طلب الحجز 🎉';
        msg = 'تم قبول طلبك من قبل الفني';
      } else if (newStatus === 'REJECTED') {
        title = 'تم رفض طلب الحجز';
        msg = 'تم رفض طلبك من قبل الفني';
      } else if (newStatus === 'COMPLETED') {
        title = 'اكتملت الخدمة بنجاح ✅';
        msg = 'تم إكمال الخدمة، يرجى تقييم الفني';
      }

      this.createNotification({
        userId: currentBooking.customerUserId,
        title,
        message: msg,
        type: 'booking_status',
        link: '/customer/bookings'
      });
    } else {
      // Customer changed status (e.g. cancelled) -> Notify provider
      this.createNotification({
        userId: currentBooking.providerUserId,
        title: `تحديث حجز من العميل ${currentBooking.bookingNumber}`,
        message: `تم تغيير حالة الحجز إلى ${newStatus}.`,
        type: 'booking_status',
        link: '/provider/bookings'
      });
    }

    this.save();
    return this.hydrateBooking(updatedBooking);
  }

  public addBookingStatusHistory(item: Omit<BookingStatusHistory, 'id' | 'timestamp'>) {
    const entry: BookingStatusHistory = {
      ...item,
      id: `bsh_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString()
    };
    this.data.bookingStatusHistories.push(entry);
  }

  public getBookingHistory(bookingId: string) {
    return this.data.bookingStatusHistories.filter(h => h.bookingId === bookingId);
  }

  // --- Reviews ---
  public getReviews(providerId?: string) {
    if (providerId) {
      return this.data.reviews.filter(r => r.providerId === providerId);
    }
    return this.data.reviews;
  }

  public createReview(data: {
    bookingId: string;
    customerId: string;
    providerId: string;
    rating: number;
    comment: string;
    customerUserId: string;
  }) {
    // Only 1 review per booking
    const existing = this.data.reviews.find(r => r.bookingId === data.bookingId);
    if (existing) {
      throw new Error('تم إضافة تقييم لهذا الحجز مسبقاً');
    }

    // Verify booking is COMPLETED
    const booking = this.data.bookings.find(b => b.id === data.bookingId);
    if (!booking || booking.status !== 'COMPLETED') {
      throw new Error('لا يمكن تقييم الخدمة إلا بعد اكتمالها بنجاح');
    }

    const customerUser = this.getUserById(data.customerUserId);

    const review: Review = {
      id: `rev_${crypto.randomUUID()}`,
      bookingId: data.bookingId,
      customerId: data.customerId,
      providerId: data.providerId,
      rating: Math.max(1, Math.min(5, data.rating)),
      comment: data.comment,
      createdAt: new Date().toISOString(),
      customerName: customerUser?.name || 'عميل في المنصة',
      customerAvatar: customerUser?.avatarUrl
    };

    this.data.reviews.unshift(review);

    // Recompute provider rating and review count
    const provReviews = this.data.reviews.filter(r => r.providerId === data.providerId);
    const avgRating = provReviews.reduce((sum, r) => sum + r.rating, 0) / provReviews.length;
    const roundedRating = Math.round(avgRating * 10) / 10;

    this.updateProvider(data.providerId, {
      rating: roundedRating,
      reviewCount: provReviews.length
    });

    // Notify provider
    const prov = this.getProviderById(data.providerId);
    if (prov) {
      this.createNotification({
        userId: prov.userId,
        title: 'تقييم جديد لرصيدك ⭐',
        message: `حصلت على تقييم جديد (${review.rating} نجوم) من ${review.customerName}.`,
        type: 'review_new',
        link: '/provider/reviews'
      });
    }

    this.save();
    return review;
  }

  public replyToReview(reviewId: string, replyText: string, providerUserId: string) {
    const idx = this.data.reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) return null;

    const review = this.data.reviews[idx];
    const prov = this.getProviderById(review.providerId);
    if (!prov || prov.userId !== providerUserId) {
      throw new Error('غير مصرح لك بالرد على هذا التقييم');
    }

    review.providerReply = replyText;
    review.repliedAt = new Date().toISOString();

    // Notify customer
    const booking = this.data.bookings.find(b => b.id === review.bookingId);
    if (booking) {
      this.createNotification({
        userId: booking.customerUserId,
        title: 'رد من مقدم الخدمة 💬',
        message: `قام ${prov.businessName} بالرد على تقييمك.`,
        type: 'review_new',
        link: '/customer/bookings'
      });
    }

    this.save();
    return review;
  }

  public deleteReview(id: string) {
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx === -1) return false;

    const provId = this.data.reviews[idx].providerId;
    this.data.reviews.splice(idx, 1);

    // Recalculate provider rating and review count
    const provReviews = this.data.reviews.filter(r => r.providerId === provId);
    const avgRating = provReviews.length
      ? provReviews.reduce((sum, r) => sum + r.rating, 0) / provReviews.length
      : 5.0;
    const roundedRating = Math.round(avgRating * 10) / 10;

    this.updateProvider(provId, {
      rating: roundedRating,
      reviewCount: provReviews.length
    });

    this.save();
    return true;
  }

  // --- Subscriptions ---
  public getSubscriptionPlans() {
    return this.data.subscriptionPlans;
  }

  public getProviderSubscription(providerId: string) {
    const sub = this.data.providerSubscriptions.find(s => s.providerId === providerId && s.status === 'active');
    if (!sub) return null;
    const plan = this.data.subscriptionPlans.find(p => p.id === sub.planId);
    return { ...sub, plan };
  }

  public subscribeProvider(providerId: string, planId: string) {
    const plan = this.data.subscriptionPlans.find(p => p.id === planId);
    if (!plan) throw new Error('خطة الاشتراك غير موجودة');

    // End previous active subscriptions
    this.data.providerSubscriptions.forEach(s => {
      if (s.providerId === providerId && s.status === 'active') {
        s.status = 'expired';
      }
    });

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    const sub: ProviderSubscription = {
      id: `sub_${crypto.randomUUID()}`,
      providerId,
      planId,
      status: 'active',
      startDate: now.toISOString(),
      endDate: nextMonth.toISOString(),
      autoRenew: true,
      plan
    };

    this.data.providerSubscriptions.unshift(sub);
    this.save();
    return sub;
  }

  // --- Commissions ---
  public getCommissions(providerId?: string) {
    if (providerId) {
      return this.data.commissions.filter(c => c.providerId === providerId);
    }
    return this.data.commissions;
  }

  // --- Notifications ---
  public getNotifications(userId: string) {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) {
    const notif: AppNotification = {
      ...data,
      id: `notif_${crypto.randomUUID()}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public markNotificationRead(id: string) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
    return notif;
  }

  public markAllNotificationsRead(userId: string) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    this.save();
    return true;
  }

  // --- Platform Statistics for Admin ---
  public getPlatformStats() {
    const totalCustomers = this.data.customers.length;
    const totalProviders = this.data.providers.length;
    const activeProviders = this.data.providers.filter(p => p.isActive).length;
    const totalBookings = this.data.bookings.length;
    const completedBookings = this.data.bookings.filter(b => b.status === 'COMPLETED').length;
    const pendingBookings = this.data.bookings.filter(b => b.status === 'PENDING').length;

    const totalRevenueVolume = this.data.commissions.reduce((acc, c) => acc + (c.totalBookingAmount || 0), 0);
    const totalPlatformCommission = this.data.commissions.reduce((acc, c) => acc + (c.commissionAmount || 0), 0);
    const totalProviderEarnings = this.data.commissions.reduce((acc, c) => acc + (c.providerPayout || 0), 0);

    const ratingsSum = this.data.reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = this.data.reviews.length ? Math.round((ratingsSum / this.data.reviews.length) * 10) / 10 : 5.0;

    return {
      totalCustomers,
      totalProviders,
      activeProviders,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRevenueVolume,
      totalPlatformCommission,
      totalProviderEarnings,
      averageRating,
      totalReviews: this.data.reviews.length
    };
  }
}

export const db = new Database();
