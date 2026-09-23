import React from 'react';
import { ShieldCheck, UserCheck, Wrench, AlertTriangle, ArrowRight, Scale, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsView() {
  const navigate = useNavigate();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Breadcrumb & Title */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-xs">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">ميثاق المجتمع والشروط</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              حقوق العميل والفني في منصة "خلصلى" لضمان تعامل آمن، عادل، ومحترف
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Customer Rights & Provider Rights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Rights */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">حقوق العميل</h2>
              <span className="text-xs text-sky-600 font-bold">حماية الخدمة والأمانة</span>
            </div>
          </div>

          <ul className="space-y-3.5 text-xs text-slate-700 leading-relaxed font-medium">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>الالتزام بالمواعيد:</strong> الحضور في الميعاد المحدد بدقة أو إخطارك مسبقاً في حال أي طارئ.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>شفافية التكاليف:</strong> عدم طلب أي مبالغ إضافية أو رسوم خفية خارج ما تم الاتفاق عليه بوضوح.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>جودة الخدمة وإتقان العمل:</strong> فحص العطل بدقة وتقديم حلول هندسية وفنية سليمة خالية من العشوائية.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>سرية البيانات:</strong> الحفاظ على خصوصية عنوانك وبيانات منزلك وعدم مشاركتها مع أي طرف آخر.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>حق الشكوى والتحكيم:</strong> إمكانية فتح بلاغ رسمي من صفحة طلباتك والبت فيه بحزم من الإدارة.</span>
            </li>
          </ul>
        </div>

        {/* Provider Rights */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">حقوق الفني ومقدم الخدمة</h2>
              <span className="text-xs text-amber-700 font-bold">احترام الجهد والوقت</span>
            </div>
          </div>

          <ul className="space-y-3.5 text-xs text-slate-700 leading-relaxed font-medium">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>صحة العنوان والبيانات:</strong> الحصول على تفاصيل عنوان واضحة ووصف صحيح للمشكلة قبل التوجه للموقع.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>تواجد العميل والرد:</strong> التواجد في الموعد والرد على الهاتف لتجنب إهدار وقت وجهد الفني.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>استحقاق المقابل المالي:</strong> استلام رسوم المعاينة أو تكلفة الصيانة المتفق عليها فور انتهاء العمل دون مماطلة.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>الاحترام المتبادل:</strong> توفير بيئة عمل لائقة وآمنة خالية من أي إساءة أو تجاوز لفظي.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>حق الدفاع وتقديم الإثبات:</strong> إمكانية رفع صور وسكرين شوت للمحادثة لإثبات موقفه في النزاعات.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Penalties Policy Section */}
      <div className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-rose-950">سياسة العقوبات والنزاعات الصارمة</h3>
            <p className="text-xs text-rose-700 font-medium">تطبق منصة "خلصلى" إجراءات تصاعدية فورية لحماية حقوق الطرفين</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs space-y-1">
            <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">1. إنذار رسمي</span>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              إشعار تحذيري مسجل في ملف الحساب عند حدوث مخالفة أولى كالتأخر غير المبرر أو سوء التفاهم.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs space-y-1">
            <span className="text-xs font-black text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md inline-block">2. إيقاف مؤقت</span>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              تجميد فوري للحساب ومنعه من الدخول واستقبال أو إرسال طلبات جديدة أثناء التحقيق في الشكوى.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs space-y-1">
            <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-block">3. حظر نهائي</span>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              حظر الحساب كلياً وإدراج رقم الهاتف في القائمة السوداء لمنع إعادة التسجيل في المنصة نهائياً.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Badge */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>منصة خلصلى تضمن حقوق جميع الأطراف وتلتزم بالشفافية والعدالة الكاملة</span>
      </div>
    </div>
  );
}
