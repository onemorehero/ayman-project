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
  X
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          دليل الفنيين ومقدمي الخدمات
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          ابحث وتواصل مع فنيين موثوقين ومقيمين من عملاء حقيقيين في منطقتك
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            <span>تصفية واختيار الفنيين المناسبين</span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-slate-500 hover:text-amber-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء جميع الفلاتر</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو الخدمة..."
              className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-right outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white text-right font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">جميع التخصصات</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Area Dropdown */}
          <div>
            <select
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white text-right font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">جميع المناطق (الكل)</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.nameAr} ({loc.governorate})
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <select
              value={minRating}
              onChange={e => setMinRating(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white text-right font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value={0}>جميع التقييمات</option>
              <option value={4.5}>4.5 نجوم فأعلى ⭐⭐⭐⭐⭐</option>
              <option value={4.8}>4.8 نجوم فأعلى ⭐⭐⭐⭐⭐</option>
            </select>
          </div>
        </div>

        {/* Extra Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={e => setVerifiedOnly(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-blue-900 bg-blue-50/70 border border-blue-200/70 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>فنيون تم التحقق من بطاقتهم القومية فقط</span>
            </span>
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 font-bold px-1">
        <span>
          تم العثور على <strong className="text-amber-600 text-base">{providers.length}</strong> مقدم خدمة متاح
        </span>
        <span className="text-slate-400 font-medium text-xs">
          يتم الفرز حسب النشاط والتقييمات الموثقة
        </span>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-4/5"></div>
              <div className="h-9 bg-slate-200 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Wrench className="w-8 h-8 stroke-1.5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">لم نجد نتائج مطابقة لبحثك</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-normal">
            جرب اختيار منطقة أخرى أو مسح بعض شروط التصفية لعرض جميع الفنيين المتاحين حالياً.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer"
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
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-300 transition-all flex flex-col justify-between"
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
                            <span>موثق</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="flex items-center gap-1 font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{prov.rating}</span>
                        </span>
                        <span className="text-slate-400 font-medium">({prov.reviewCount} تقييم)</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 font-medium text-[11px]">خبرة {prov.experienceYears} سنوات</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3.5 line-clamp-3 leading-relaxed font-normal">
                    {prov.bio}
                  </p>

                  {/* Categories badges */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {provCategories.map(cat => (
                      <span
                        key={cat.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-extrabold border border-amber-200/60"
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
                        <span key={loc.id} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                          {loc.nameAr}
                        </span>
                      ) : null;
                    })}
                  </div>

                  {/* Working hours */}
                  {prov.workingHours && (
                    <div className="mt-3.5 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        ساعات التواجد: {prov.workingHours.start} - {prov.workingHours.end}
                        {prov.workingHours.daysOff?.length > 0 && ` (إجازة: ${prov.workingHours.daysOff.join('، ')})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectProvider(prov.id)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>عرض الملف الشخصي وحجز موعد</span>
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
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
