import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Trash2,
  Sparkles,
  UploadCloud,
  Loader2,
  FileCheck
} from 'lucide-react';
import { UserAvatar } from './UserAvatar.js';
import { api } from '../lib/api.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialName: string;
  initialPhone: string;
  initialAddress: string;
  initialAvatarUrl?: string;
  onSave: (data: {
    name: string;
    phone: string;
    address: string;
    avatarUrl: string;
  }) => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  userId,
  initialName,
  initialPhone,
  initialAddress,
  initialAvatarUrl = '',
  onSave
}: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [compressingAndUploading, setCompressingAndUploading] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalKB: number;
    compressedKB: number;
    savedPercentage: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName || '');
      setPhone(initialPhone || '');
      setAddress(initialAddress || '');
      // Clean legacy placeholder URL if present
      const cleanUrl =
        initialAvatarUrl &&
        (initialAvatarUrl.includes('photo-1544005313-94ddf0286df2') ||
         initialAvatarUrl.includes('photo-1534528741775-53994a69daeb'))
          ? ''
          : initialAvatarUrl || '';
      setAvatarUrl(cleanUrl);
      setError(null);
      setSuccess(false);
      setCompressionStats(null);
      setCompressingAndUploading(false);
    }
  }, [isOpen, initialName, initialPhone, initialAddress, initialAvatarUrl]);

  if (!isOpen) return null;

  // Handle client-side compressed upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    setError(null);
    setCompressingAndUploading(true);
    setCompressionStats(null);

    try {
      // Compresses with browser-image-compression (maxSizeMB: 0.2, maxWidthOrHeight: 800)
      // and passes compressed file to Supabase storage
      const result = await api.uploadUserAvatar(userId, file);
      setAvatarUrl(result.url);
      setCompressionStats({
        originalKB: result.originalSizeKB,
        compressedKB: result.compressedSizeKB,
        savedPercentage: result.savedPercentage
      });
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'حدث خطأ أثناء ضغط ورفع الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setCompressingAndUploading(false);
      // Reset input value to allow re-selecting same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (compressingAndUploading) return;

    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('يرجى إدخال اسم العميل بالكامل');
      return;
    }
    if (!cleanPhone) {
      setError('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: cleanName,
        phone: cleanPhone,
        address: address.trim(),
        avatarUrl: avatarUrl.trim()
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 leading-tight">
                تعديل بيانات الحساب
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديث الاسم ورقم الهاتف والعنوان ورابط الصورة الشخصية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تم حفظ التعديلات بنجاح!</span>
            </div>
          )}

          {/* Avatar Section with Compressed File Upload */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">الصورة الشخصية (Avatar)</label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ضغط تلقائي حتى 200KB و 800x800
              </span>
            </div>

            <div className="flex items-start gap-4">
              {/* Avatar Preview */}
              <div className="relative shrink-0">
                <UserAvatar
                  src={avatarUrl}
                  name={name}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-white shadow-sm"
                  iconClassName="w-8 h-8 text-slate-400"
                />
                {compressingAndUploading && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload & Compression Controls */}
              <div className="flex-1 space-y-2 min-w-0">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />

                {/* Upload Trigger Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={compressingAndUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {compressingAndUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>جارٍ ضغط ورفع الصورة...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-emerald-600" />
                        <span>رفع صورة من جهازك</span>
                      </>
                    )}
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      disabled={compressingAndUploading}
                      onClick={() => {
                        setAvatarUrl('');
                        setCompressionStats(null);
                      }}
                      className="px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="حذف واستخدام الرمز المحايد"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>إزالة</span>
                    </button>
                  )}
                </div>

                {/* Loading state indicator */}
                {compressingAndUploading && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
                    <span>جارٍ ضغط ورفع الصورة... (تخفيض الحجم لأقل من 200KB وتسريع التحميل)</span>
                  </div>
                )}

                {/* Compression stats success pill */}
                {compressionStats && !compressingAndUploading && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      تم الضغط بنجاح: الحجم {compressionStats.compressedKB}KB (وفرت {compressionStats.savedPercentage}% من المساحة)
                    </span>
                  </div>
                )}

                {/* Manual URL Input Option */}
                <div className="relative pt-1">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={e => {
                      setAvatarUrl(e.target.value);
                      setCompressionStats(null);
                    }}
                    placeholder="أو ضع رابط صورة مباشر (https://...)"
                    className="w-full h-9 px-3 pr-8 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 text-xs font-medium outline-none text-right"
                  />
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
                </div>

                {!avatarUrl && !compressingAndUploading && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    يتم عرض أيقونة مستخدم محايدة وأنيقة افتراضياً في حال عدم اختيار صورة.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالكامل</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثال: علاء بهاء الشناوي"
                className="w-full h-11 px-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف للتواصل</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01012345678"
                dir="ltr"
                className="w-full h-11 px-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Detailed Address Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">العنوان التفصيلي / مكان الإقامة</label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="مثال: 28 شارع المحطة، الزهراء، مصر القديمة، القاهرة"
                className="w-full h-11 px-3 pr-10 rounded-2xl bg-slate-100/80 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold transition-all outline-none text-right"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">يساعد الفنيين في معرفة النطاق الجغرافي عند تلقي طلبات الصيانة</p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving || compressingAndUploading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
