import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  ShieldCheck,
  ArrowLeft,
  Wrench,
  Clock,
  PhoneCall,
  Sparkles,
  Users,
  ChevronLeft
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon.js';
import { api } from '../lib/api.js';
import type { Category, Location, Provider } from '../types.js';

interface Props {
  onSelectCategory: (categoryId: string) => void;
  onSelectProvider: (providerId: string) => void;
  onSearch: (searchTerm: string, areaId: string) => void;
  onNavigate: (view: string) => void;
}

export function HomeView({ onSelectCategory, onSelectProvider, onSearch, onNavigate }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getLocations(),
      api.getProviders({ minRating: 4.8 })
    ])
      .then(([cats, locs, provs]) => {
        setCategories(cats);
        setLocations(locs);
        setFeaturedProviders(provs.slice(0, 6));
      })
      .catch(err => {
        console.error('Error fetching home data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, selectedArea);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle geometric dot grid pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute -top-40 right-1/2 translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>الدليل الرقمي الأول للحرفيين ومقدمي الخدمات في مصر</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight max-w-3xl mx-auto">
            محتاج فني شاطر وأمين؟{' '}
            <span className="text-amber-400 underline decoration-amber-400/40 decoration-wavy decoration-2">
              أفضل الحرفيين
            </span>{' '}
            في منطقتك
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            ابحث عن سباك، كهربائي، فني تكييف أو نجار بالقرب منك. تواصل مباشرة، قارن تقييمات العملاء الحقيقية، واطلب الخدمة في خطوات بسيطة.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col sm:flex-row gap-2 text-slate-900"
          >
            <div className="flex-1 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute right-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="عايز فني إيه؟ (سباكة، صيانة تكييف، قفلة كهرباء...)"
                className="w-full pl-3 pr-11 py-3 rounded-xl border border-transparent hover:border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold outline-none text-right placeholder:text-slate-400"
              />
            </div>

            <div className="sm:w-56 relative flex items-center border-t sm:border-t-0 sm:border-r border-slate-200 pt-2 sm:pt-0 sm:pr-2">
              <MapPin className="w-5 h-5 text-amber-500 absolute right-3 pointer-events-none" />
              <select
                value={selectedArea}
                onChange={e => setSelectedArea(e.target.value)}
                className="w-full pl-3 pr-10 py-3 rounded-xl border border-transparent hover:border-slate-200 focus:border-amber-500 text-sm font-bold outline-none bg-white text-right cursor-pointer"
              >
                <option value="">جميع المناطق (الكل)</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nameAr} ({loc.governorate})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="py-3 px-7 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>ابحث الآن</span>
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs">
            <span className="text-slate-400 font-semibold ml-1">الأكثر طلباً:</span>
            {['سباكة', 'تكييف', 'كهرباء', 'نجارة', 'أجهزة منزلية'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchTerm(tag);
                  onSearch(tag, selectedArea);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 text-[11px] font-bold border border-slate-700/80 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Transparency & Guarantee Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-amber-200/90 font-semibold pt-1">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تنبيه الشفافية: السعر يتم الاتفاق عليه مباشرة مع مقدم الخدمة، والمنصة لا تفرض تسعيرة إجبارية</span>
          </div>
        </div>
      </section>

      {/* Trust Highlights Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">فنيون تم التحقق منهم</p>
              <p className="text-[11px] text-slate-500 mt-0.5">فحص الهوية والخبرة الحرفية</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-r border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">اتفاق سعر مباشر ومرن</p>
              <p className="text-[11px] text-slate-500 mt-0.5">حسب المعاينة دون مصاريف سرية</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-r border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">تغطية أحياء القاهرة والجيزة</p>
              <p className="text-[11px] text-slate-500 mt-0.5">الدقي، زايد، المعادي، التجمع...</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-r border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">تقييمات حقيقية 100%</p>
              <p className="text-[11px] text-slate-500 mt-0.5">فقط من عملاء أكملوا طلباتهم</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              الخدمات والتخصصات الشائعة
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              اختر التخصص المطلوب لعرض أفضل الفنيين المتاحين حالياً
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('providers')}
            className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
          >
            <span>عرض كل التخصصات</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors flex items-center justify-center shadow-xs">
                    <CategoryIcon name={cat.icon} className="w-6 h-6" />
                  </div>
                  {cat.providersCount !== undefined && cat.providersCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {cat.providersCount} فني
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                    {cat.nameAr}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Providers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>الأعلى تقييماً في مصر</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              فنيون ومراكز معتمدة وموثوقة
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('providers')}
            className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
          >
            <span>عرض كل الفنيين</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-4">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-9 bg-slate-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProviders.map(prov => {
              const primaryArea = locations.find(l => prov.areaIds.includes(l.id));
              const primaryCat = categories.find(c => prov.categoryIds.includes(c.id));

              return (
                <div
                  key={prov.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      <img
                        src={prov.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                        alt={prov.businessName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-base text-slate-900 truncate">
                            {prov.businessName}
                          </h3>
                          {prov.isVerified && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              <span>موثق بالرقم القومي</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {primaryCat ? primaryCat.nameAr : 'خدمات منزلية'} • خبرة {prov.experienceYears} سنوات
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{prov.rating}</span>
                          </span>
                          <span className="text-slate-400 font-medium">({prov.reviewCount} تقييم)</span>
                          {primaryArea && (
                            <span className="text-slate-600 flex items-center gap-1 text-[11px] font-medium mr-auto">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{primaryArea.nameAr}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3.5 line-clamp-2 leading-relaxed font-normal">
                      {prov.bio}
                    </p>

                    {/* Areas tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {prov.areaIds.slice(0, 3).map(areaId => {
                        const loc = locations.find(l => l.id === areaId);
                        return loc ? (
                          <span key={loc.id} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                            {loc.nameAr}
                          </span>
                        ) : null;
                      })}
                      {prov.areaIds.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 font-bold">
                          +{prov.areaIds.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectProvider(prov.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs shadow-xs transition-all text-center cursor-pointer"
                    >
                      عرض الملف والتواصل
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/80 border-y border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
              تجربة مستخدم سهلة وسريعة
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">كيف تعمل المنصة؟</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto font-medium">
              ثلاث خطوات مباشرة تمكنك من حل أي مشكلة صيانة منزلية دون وسيط معقد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative">
              <span className="absolute -top-3.5 right-6 w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
                ١
              </span>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 mt-1">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 mb-2">اختر الخدمة والمنطقة</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                حدد التخصص (سباكة، كهرباء، تكييف...) والحي القريب منك للاطلاع على الفنيين المعتمدين وساعات عملهم.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative">
              <span className="absolute -top-3.5 right-6 w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
                ٢
              </span>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 mt-1">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 mb-2">أرسل طلب الحجز</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                اكتب تفاصيل العطل وعنوانك وحدد الموعد المفضل أو اختر أقرب موعد طوارئ، وسيصل إشعار فوري للفني للتأكيد.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative">
              <span className="absolute -top-3.5 right-6 w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
                ٣
              </span>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 mt-1">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 mb-2">الاتفاق والتقييم</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                يتم الاتفاق على السعر النهائي مباشرة مع الفني حسب المعاينة، وبعد إنجاز العمل يمكنك إضافة تقييمك لمساعدة باقي العملاء.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
