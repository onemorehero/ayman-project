import React, { useState } from 'react';
import { Search, Send, MessageCircle, Star, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, HeartHandshake, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'كيف تبحث وتختار الفني المناسب؟',
      tagline: 'بحث مباشر وشفاف',
      description: 'تصفح قائمة الحرفيين والفنيين المعتمدين في منطقتك حسب التخصص (كهرباء، سباكة، تكييف، نجارة وغيرها). اطلع على تقييمات العملاء السابقة ونماذج أعمالهم الحقيقية بكل شفافية.',
      icon: Search,
      tips: [
        'فلترة حسب الحي أو المنطقة القريبة منك',
        'مشاهدة سجل أعمال الفني وصور خدماته',
        'مقارنة التقييمات الشفافة بدون أي خوارزميات مدفوعة'
      ]
    },
    {
      step: 2,
      title: 'كيف ترسل طلب الخدمة؟',
      tagline: 'طلب سلس وبسيط',
      description: 'ادخل على صفحة الفني واضغط على زر "طلب خدمة". اختر الخدمة المحددة أو حدد خيار "أخرى" لكتابة طلب مخصص. تفاصيل عنوانك ورقم هاتفك تُملأ تلقائياً لتوفير وقتك.',
      icon: Send,
      tips: [
        'حدد الخدمة المطلوبة أو اختر "أخرى" لطلب مخصص',
        'اكتب وصفاً واضحاً للعطل أو المطلوب',
        'الطلب يذهب للفني مباشرة دون أي وسيط'
      ]
    },
    {
      step: 3,
      title: 'كيف تتواصل وتقيّم التجربة؟',
      tagline: 'تواصل مباشر عبر واتساب وتقييم حقيقي',
      description: 'بمجرد قبول الفني للطلب، يظهر لك زر المحادثة عبر واتساب والاتصال الهاتفي مباشرة للاتفاق على التفاصيل والزيارة. وبعد إتمام الخدمة، قيّم الفني بكل أمانة لدعم المجتمع.',
      icon: MessageCircle,
      tips: [
        'زر واتساب مباشر يفتح محادثة برقم وتفاصيل الحجز',
        'المنصة مجانية 100% ولا نتقاضى أي عمولات أو رسوم',
        'التقييم يفعّل فقط بعد قبول الطلب لحماية الطرفين'
      ]
    }
  ];

  const activeStepData = steps[currentStep - 1];
  const StepIcon = activeStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('zahraa_onboarding_completed', 'true');
    } catch (e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              ز
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">دليل استخدام مشروع زهراء</h3>
              <p className="text-xs text-slate-500">منصة مجانية 100% للخدمات المصغرة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleComplete}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step progress pills */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-3 gap-2">
            {steps.map(s => {
              const isActive = s.step === currentStep;
              const isPast = s.step < currentStep;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-slate-900' : isPast ? 'bg-slate-300' : 'bg-slate-100'
                  }`}
                  title={`الخطوة ${s.step}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-slate-400 font-medium">
            <span>الخطوة {currentStep} من {steps.length}</span>
            <span className="text-slate-600 font-semibold">{activeStepData.tagline}</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0 border border-slate-200/70">
              <StepIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {activeStepData.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {activeStepData.description}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
            <p className="text-xs font-bold text-slate-700">أبرز النقاط:</p>
            <ul className="space-y-2">
              {activeStepData.tips.map((tip, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center gap-3 text-xs text-sky-950">
            <HeartHandshake className="w-5 h-5 text-sky-700 shrink-0" />
            <span>منصة زهراء مبادرة مجتمعية غير هادفة للربح، بدون أي رسوم تسجيل أو استقطاع عمولات من الفني أو العميل.</span>
          </div>
        </div>

        {/* Footer Actions with large ergonomic buttons */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleComplete}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-2"
          >
            تخطي الجولة
          </button>

          <div className="flex items-center gap-2.5">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-sm hover:shadow transition-all flex items-center gap-2"
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
