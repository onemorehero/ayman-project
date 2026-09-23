import React from 'react';
import { Zap, ShieldCheck, MapPin, Heart } from 'lucide-react';
import { Logo } from './Logo.js';

interface Props {
  onNavigate: (view: string) => void;
}

export function Footer({ onNavigate }: Props) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-12 pb-8 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <Logo className="text-emerald-400 h-10 w-auto" />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                مجاني 100%
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed font-normal">
              منصة عصرية لحجز الحرفيين والفنيين المعتمدين في منطقتك بكل بساطة وسرعة، بدون أي وسطاء، وبدون خصم أي عمولات أو فرض رسوم اشتراك على الإطلاق.
            </p>
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed max-w-md flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>الاتفاق المالي يتم مباشرة بينك وبين الفني، بدون أي نسبة مستقطعة من أتعابه.</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">روابط سريعة</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('providers')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  دليل الفنيين
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('customer-dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  متابعة الطلبات
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('provider-dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  لوحة تحكم الفني
                </button>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">مناطق التغطية الفورية</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">المهندسين</span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">الدقي</span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">مدينة نصر</span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">مصر الجديدة</span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">المعادي</span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">التجمع الخامس</span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">الشيخ زايد</span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">الهرم وفيصل</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} منصة خلصلى للخدمات المصغرة والصيانة المنزلية.</p>
          <div className="flex items-center gap-1.5">
            <span>صُنع لتسهيل حياة كل بيت مصري</span>
            <span className="text-emerald-500">⚡</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
