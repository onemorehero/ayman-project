import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  Wrench,
  SlidersHorizontal,
  ChevronLeft,
  X,
  Zap,
  Sparkles
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon.js';
import { api } from '../lib/api.js';
import type { Category, Location, Provider } from '../types.js';

interface Props {
  initialCategoryId?: string;
  initialAreaId?: string;
  initialSearchTerm?: string;
  onSelectProvider: (providerId: string) => void;
}

export function ProvidersListingView({
  initialCategoryId = '',
  initialAreaId = '',
  initialSearchTerm = '',
  onSelectProvider
}: Props) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [selectedArea, setSelectedArea] = useState(initialAreaId);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Load filters data
  useEffect(() => {
    Promise.all([api.getCategories(), api.getLocations()])
      .then(([cats, locs]) => {
        setCategories(cats);
        setLocations(locs);
      })
      .catch(console.error);
  }, []);

  // Fetch providers matching filters
  useEffect(() => {
    setLoading(true);
    api.getProviders({
      q: searchTerm || undefined,
      category: selectedCategory || undefined,
      area: selectedArea || undefined,
      verified: verifiedOnly || undefined,
      minRating: minRating > 0 ? minRating : undefined,
      activeOnly: true
    })
      .then(data => setProviders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchTerm, selectedCategory, selectedArea, verifiedOnly, minRating]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedArea('');
    setVerifiedOnly(false);
    setMinRating(0);
  };

  const hasActiveFilters = Boolean(searchTerm || selectedCategory || selectedArea || verifiedOnly || minRating > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          دليل الفنيين ومقدمي الخدمات
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          ابحث وتواصل مع فنيين موثوقين ومقيمين من عملاء حقيقيين في منطقتك بكل شفافية وبدون عمولة
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>خيارات التصفية السريعة</span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 active:scale-95 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="اسم الفني أو نوع العطل..."
              className="w-full h-11 pr-10 pl-3 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs sm:text-sm font-semibold transition-all outline-none text-right"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs sm:text-sm font-semibold transition-all outline-none text-right cursor-pointer"
            >
              <option value="">جميع التخصصات</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <select
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs sm:text-sm font-semibold transition-all outline-none text-right cursor-pointer"
            >
              <option value="">جميع المناطق والأحياء</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Rating filter */}
          <div>
            <select
              value={minRating}
              onChange={e => setMinRating(Number(e.target.value))}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs sm:text-sm font-semibold transition-all outline-none text-right cursor-pointer"
            >
              <option value="0">أي تقييم</option>
              <option value="4.8">⭐ 4.8 فأعلى (ممتاز جداً)</option>
              <option value="4.5">⭐ 4.5 فأعلى</option>
              <option value="4.0">⭐ 4.0 فأعلى</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Providers Grid */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm text-slate-600 font-bold">
          تم العثور على <span className="text-emerald-700 font-black">{providers.length}</span> فني متاح
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3 animate-pulse h-64" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Wrench className="w-8 h-8 stroke-1.5" />
          </div>
          <h3 className="font-black text-slate-900 text-lg">لم نجد نتائج مطابقة للبحث</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            جرب اختيار منطقة أخرى أو إعادة ضبط شروط البحث لعرض جميع الفنيين المتاحين حالياً في المنصة.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            عرض جميع الفنيين
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map(prov => {
            const primaryArea = locations.find(l => prov.areaIds.includes(l.id));
            const provCategories = categories.filter(c => prov.categoryIds.includes(c.id));

            return (
              <div
                key={prov.id}
                className="bg-white rounded-3xl border border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <img
                      src={prov.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                      alt={prov.businessName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-black text-base text-slate-900 truncate">
                          {prov.businessName}
                        </h3>
                        {prov.isVerified && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>موثق</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="flex items-center gap-1 font-bold text-slate-900">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{prov.rating.toFixed(1)}</span>
                        </span>
                        <span className="text-slate-400 font-medium">({prov.reviewCount} تقييم)</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 font-medium text-[11px]">خبرة {prov.experienceYears} سنوات</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3.5 line-clamp-2 leading-relaxed font-normal">
                    {prov.bio}
                  </p>

                  {/* Categories badges */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {provCategories.map(cat => (
                      <span
                        key={cat.id}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60"
                      >
                        {cat.nameAr}
                      </span>
                    ))}
                  </div>

                  {/* Areas covered */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prov.areaIds.map(areaId => {
                      const loc = locations.find(l => l.id === areaId);
                      return loc ? (
                        <span key={loc.id} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold">
                          {loc.nameAr}
                        </span>
                      ) : null;
                    })}
                  </div>

                  {/* Working hours */}
                  {prov.workingHours && (
                    <div className="mt-3.5 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        ساعات العمل: {prov.workingHours.start} - {prov.workingHours.end}
                        {prov.workingHours.daysOff?.length > 0 && ` (إجازة: ${prov.workingHours.daysOff.join('، ')})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectProvider(prov.slug || prov.id)}
                    className="w-full h-11 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>طلب الخدمة ومعاينة الملف</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
