import React from 'react';
import { Sparkles, ShieldCheck, Heart, MapPin, Phone, Mail } from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
}

export function Footer({ onNavigate }: Props) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl text-white">
                سوق الخدمات <span className="text-amber-500">المصرية</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              المنصة الرائدة لربط العملاء بأفضل الفنيين والحرفيين المعتمدين في القاهرة والجيزة وجميع محافظات مصر. سباكة، كهرباء، تكييف، نجارة، وصيانة الأجهزة المنزلية.
            </p>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-amber-400/90 leading-relaxed max-w-md">
              ⚖️ <strong>ملاحظة تسعير الخدمات:</strong> "السعر يتم الاتفاق عليه مع مقدم الخدمة، والمنصة لا تحدد سعر الخدمة."
            </div>
          </div>

          {/* Col 2: Fast Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">روابط سريعة</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('providers')}
                  className="hover:text-amber-400 transition-colors"
                >
                  تصفح الفنيين ومقدمي الخدمات
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('customer-dashboard')}
                  className="hover:text-amber-400 transition-colors"
                >
                  متابعة طلباتك وحجوزاتك
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('provider-dashboard')}
                  className="hover:text-amber-400 transition-colors"
                >
                  بوابة الفنيين والاشتراكات
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Coverage Areas */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">مناطق التغطية الحالية</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">المهندسين</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">الدقي</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">العجوزة</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">مدينة نصر</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">مصر الجديدة</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">المعادي</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">التجمع الخامس</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">الهرم وفيصل</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">الشيخ زايد</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} سوق الخدمات المصرية. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-1">
            <span>تم التطوير كنسخة تفاعلية كاملة للسوق المصري</span>
            <span className="text-rose-500">🇪🇬</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
