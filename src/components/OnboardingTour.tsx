import React, { useState } from 'react';
import {
  Search,
  Send,
  Star,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  Inbox,
  Check,
  PhoneCall,
  BarChart3,
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface StepItem {
  number: number;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlights: string[];
}

export function OnboardingTour() {
  const { user, isFirstLogin, dismissTour } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Strictly do NOT show if not logged in or not flagged as first registration login
  if (!user || !isFirstLogin) {
    return null;
  }

  const role = user.role || 'customer';

  // Customer Tour steps
  const customerSteps: StepItem[] = [
    {
      number: 1,
      title: 'ابحث عن فني أمين بالقرب منك',
      tagline: 'دليل شامل وموثوق',
      description: 'تصفح قائمة الحرفيين والفنيين المعتمدين في منطقتك حسب التخصص (كهرباء، سباكة، تكييف، نجارة وغيرها). اطلع على تقييمات العملاء السابقة وسنوات الخبرة بدون أي وسطاء.',
      icon: Search,
      highlights: [
        'فلترة سريعة حسب المنطقة والحي الأقرب لمنزلك',
        'مقارنة أسعار وتقييمات حقيقية من عملاء سابقين',
        'ملف شخصي شفاف لكل فني ونماذج لأعماله السابقة'
      ]
    },
    {
      number: 2,
      title: 'اطلب الخدمة في ثوانٍ معدودة',
      tagline: 'تجربة حجز سلسة وفورية',
      description: 'اختر الخدمة أو اكتب عطلاً مخصصاً في ثوانٍ. يتم ملء بياناتك تلقائياً لتسريع الطلب، ويصل الإشعار فوراً لهاتف الفني للرد عليك.',
      icon: Send,
      highlights: [
        'تعبئة تلقائية لبيانات التواصل والعنوان',
        'إمكانية تحديد موعد الزيارة الأنسب لجدولك',
        'إشعار لحظي فور قبول الفني للطلب'
      ]
    },
    {
      number: 3,
      title: 'الدفع والتقييم بعد إنجاز العمل',
      tagline: 'بدون أي عمولة أو رسوم وساطة',
      description: 'بمجرد قبول الفني، يتاح لك التواصل الفوري عبر واتساب والاتصال الهاتفي. بعد انتهاء الصيانة بنجاح، تدفع للفني مباشرة وتقيّم تجربتك لمساعدة المجتمع.',
      icon: Star,
      highlights: [
        'محادثة واتساب مجهزة برقم وتفاصيل حجزك بنقرة واحدة',
        'منصة خلصلى مجانية 100% بدون أي استقطاع أو وسيط',
        'نظام تقييم عادل وموثق لحماية حقوق الجميع'
      ]
    }
  ];

  // Provider Tour steps
  const providerSteps: StepItem[] = [
    {
      number: 1,
      title: 'استقبل طلبات العملاء في منطقتك',
      tagline: 'فرص عمل يومية مباشرة',
      description: 'تصلك طلبات صيانة وخدمات من عملاء قريبين منك مباشرة على هاتفك مع كامل التفاصيل وتوصيف المشكلة بدقة.',
      icon: Inbox,
      highlights: [
        'إشعارات فورية بكل طلب جديد في تخصصك وحيك',
        'معاينة المشكلة وموعد الزيارة المقترح قبل القبول',
        'رابط شخصي فريد ومباشر لملفك لمشاركته مع زبائنك'
      ]
    },
    {
      number: 2,
      title: 'اقبل أو اعتذر بكل حرية',
      tagline: 'تحكم كامل في جدول عملك',
      description: 'أنت مدير نفسك؛ راجع تفاصيل الطلب وتأكد من ملاءمته لوقتك ثم اقبل بنقرة زر واحدة أو اعتذر ليتم توجيه العميل لبديل.',
      icon: Check,
      highlights: [
        'حرية تامة في إدارة أوقات العمل والراحات',
        'تنبيهات فورية للعميل عند تغيير حالة الطلب',
        'حماية أوقات الفنيين بدون أي التزامات مفروضة'
      ]
    },
    {
      number: 3,
      title: 'تواصل وابدأ العمل واحتفظ بكامل أتعابك',
      tagline: '0% عمولة - أرباحك لك بالكامل',
      description: 'فور القبول يتاح لك الاتصال بالعميل ومراسلته عبر واتساب للاتفاق على السعر النهائي وموعد المعاينة، وتستلم كامل المبلغ بيدك.',
      icon: PhoneCall,
      highlights: [
        'تواصل هاتفي ومراسلة واتساب مباشرة مع العميل',
        'لا نخصم أي نسبة من أجرتك إطلاقاً (مجاني 100%)',
        'التقييمات الإيجابية ترفع ترتيبك وترشحك لمزيد من العملاء'
      ]
    }
  ];

  // Admin Tour steps
  const adminSteps: StepItem[] = [
    {
      number: 1,
      title: 'راقب النشاط ومؤشرات المنصة',
      tagline: 'رؤية شاملة ومباشرة',
      description: 'تابع حركة الحجوزات ونسب الإنجاز ونمو شبكة الفنيين المسجلين في أحياء القاهرة والجيزة في لوحة تحكم عصرية.',
      icon: BarChart3,
      highlights: [
        'إحصائيات فورية عن الطلبات الجارية والمكتملة',
        'متابعة نشاط الفنيين والتحقق من جودة الخدمات',
        'مراقبة تغطية المناطق الجغرافية والاحتياجات'
      ]
    },
    {
      number: 2,
      title: 'إدارة النزاعات وحماية المجتمع',
      tagline: 'عدالة وسرعة في المعالجة',
      description: 'فحص البلاغات والشكاوى المرفوعة من العملاء أو الفنيين، مع إمكانية مراجعة مرفقات الصور وأدلة المشكلة واتخاذ الإجراء اللازم.',
      icon: ShieldAlert,
      highlights: [
        'سجل مركزي لكل المنازعات والبلاغات المفتوحة',
        'فحص صور الأدلة وحالة التواصل بين الطرفين',
        'إمكانية اتخاذ قرارات فورية لحظر المسيئين أو تسوية النزاع'
      ]
    }
  ];

  const steps = role === 'admin' ? adminSteps : role === 'provider' ? providerSteps : customerSteps;
  const activeStep = steps[currentStep - 1] || steps[0];
  const StepIcon = activeStep.icon;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      dismissTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const roleLabel = role === 'admin' ? 'الإدارة' : role === 'provider' ? 'الفني' : 'العميل';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100/80 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-emerald-600/20">
              خ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">مرحباً بك في خلصلى</h3>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  حساب {roleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">جولة سريعة للتعرف على طريقة الاستخدام</p>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissTour}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            title="تخطي"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-5 pb-2">
          <div className="grid grid-cols-3 gap-2.5">
            {steps.map(s => {
              const isCurrent = s.number === currentStep;
              const isDone = s.number < currentStep;
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setCurrentStep(s.number)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-600'
                      : isDone
                      ? 'bg-emerald-300'
                      : 'bg-slate-100'
                  }`}
                  title={`الخطوة ${s.number}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>الخطوة {currentStep} من {steps.length}</span>
            <span className="text-emerald-700 font-bold">{activeStep.tagline}</span>
          </div>
        </div>

        {/* Main Step Content */}
        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/80 shadow-xs">
              <StepIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                {activeStep.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeStep.description}
              </p>
            </div>
          </div>

          {/* Highlights Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80 space-y-2.5">
            <p className="text-xs font-bold text-slate-800">أهم ما يميز هذه الخطوة:</p>
            <ul className="space-y-2">
              {activeStep.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reassurance note */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-950">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>منصة "خلصلى" مجانية 100% وتضمن تجربة مباشرة وشفافة بالكامل لكل المستخدمين.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={dismissTour}
            className="text-xs text-slate-400 hover:text-slate-700 font-semibold px-2 py-2 transition-colors"
          >
            تخطي الجولة
          </button>

          <div className="flex items-center gap-2.5">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <span>{currentStep === steps.length ? 'ابدأ الاستخدام الآن' : 'التالي'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
