import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  PhoneCall,
  CalendarCheck
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon.js';
import { api } from '../lib/api.js';
import type { Category, Location, Provider } from '../types.js';

interface Props {
  onSelectCategory: (categoryId: string) => void;
  onSelectProvider: (providerIdOrSlug: string) => void;
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
      .then(async ([cats, locs, provs]) => {
        setCategories(cats);
        setLocations(locs);
        if (provs.length > 0) {
          setFeaturedProviders(provs.slice(0, 6));
        } else {
          const fallbackProvs = await api.getProviders({ activeOnly: true }).catch(() => []);
          setFeaturedProviders(fallbackProvs.slice(0, 6));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, selectedArea);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-slate-50/50 to-white py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold shadow-xs">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>منصة خلصلى · خدمات مصغرة فورية ومجانية 100% بدون أي عمولة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            خلّص كل صيانات بيتك{' '}
            <span className="text-emerald-600 block sm:inline">مع أمهر الفنيين في ثواني</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            سباكة، كهرباء، تكييف، نجارة، وأجهزة منزلية. ابحث عن الفني الأقرب لمنزلك، اطلب خدمتك، وتواصل مباشرة عبر واتساب وهاتفياً بدون أي وسيط.
          </p>

          {/* Interactive Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white p-2.5 rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col sm:flex-row gap-2 transition-all hover:shadow-[0_16px_50px_rgb(0,0,0,0.09)]"
          >
            <div className="flex-1 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute right-4 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="محتاج فني إيه؟ (سباك، كهربائي، تكييف...)"
                className="w-full h-12 pl-4 pr-12 rounded-2xl bg-slate-50/70 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold outline-none text-right placeholder:text-slate-400 transition-all"
              />
            </div>

            <div className="sm:w-52 relative flex items-center">
              <MapPin className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
              <select
                value={selectedArea}
                onChange={e => setSelectedArea(e.target.value)}
                className="w-full h-12 pl-3 pr-10 rounded-2xl bg-slate-50/70 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs sm:text-sm font-bold outline-none text-right cursor-pointer transition-all"
              >
                <option value="">جميع الأحياء</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="h-12 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>بحث سريع</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              تخصصات الصيانة والحرف
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              اختر التخصص المطلوب لعرض الفنيين المتوفرين في منطقتك
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('providers')}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>عرض كل الفنيين</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-5 rounded-3xl bg-white border border-slate-100 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-xs">
                  <CategoryIcon name={cat.icon} className="w-6 h-6" />
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                    {cat.nameAr}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Providers Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              أفضل الفنيين تقييماً في خلصلى
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              حرفيون معتمدون بتقييمات حقيقية من العملاء بعد إنجاز العمل
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('providers')}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>استعراض الدليل</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProviders.map(prov => {
            const primaryArea = locations.find(l => prov.areaIds.includes(l.id));
            const primaryCat = categories.find(c => prov.categoryIds.includes(c.id));
            const targetId = prov.slug || prov.id;

            return (
              <div
                key={prov.id}
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={prov.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                      alt={prov.businessName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-slate-900 truncate">
                        {prov.businessName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {primaryCat ? primaryCat.nameAr : 'خدمات صيانة'} · خبرة {prov.experienceYears} سنوات
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="flex items-center gap-1 font-bold text-slate-900">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{prov.rating.toFixed(1)}</span>
                        </span>
                        <span className="text-slate-400">({prov.reviewCount} تقييم)</span>
                        {primaryArea && (
                          <span className="text-emerald-700 font-semibold mr-auto text-[11px]">
                            {primaryArea.nameAr}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {prov.bio}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectProvider(targetId)}
                    className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>طلب الخدمة ومعاينة الملف</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Steps Guide - Inspired by TaskRabbit & Uber */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold">
              <span>بكل بساطة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">كيف يعمل تطبيق خلصلى؟</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              3 خطوات سريعة وبسيطة للحصول على أفضل صيانة لمنزلك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-3 hover:-translate-y-1 transition-transform">
              <span className="w-9 h-9 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                ١
              </span>
              <h3 className="font-bold text-base text-white">اختر الفني المناسب</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                تصفح الفنيين حسب التخصص والحي، واطلع على تقييمات العملاء الحقيقية وسنوات الخبرة بدون أي وسيط.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-3 hover:-translate-y-1 transition-transform">
              <span className="w-9 h-9 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                ٢
              </span>
              <h3 className="font-bold text-base text-white">اطلب الخدمة في ثوانٍ</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                حدد المشكلة وموقعك، وفور قبول الفني يمكنك مراسلته عبر واتساب بنقرة واحدة والاتصال به مباشرة.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-3 hover:-translate-y-1 transition-transform">
              <span className="w-9 h-9 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                ٣
              </span>
              <h3 className="font-bold text-base text-white">إنجاز العمل والدفع</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                تستلم خدمتك وتدفع للفني مباشرة 100% بدون أي استقطاع، ثم تترك تقييمك لحماية مجتمعنا.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
