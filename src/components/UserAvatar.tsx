import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  iconClassName?: string;
  alt?: string;
}

export function UserAvatar({
  src,
  name,
  className = 'w-10 h-10 rounded-xl',
  iconClassName,
  alt
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Filter out legacy hardcoded female stock placeholders if present
  const isLegacyPlaceholder =
    src &&
    (src.includes('photo-1544005313-94ddf0286df2') ||
     src.includes('photo-1534528741775-53994a69daeb'));

  const validSrc = !hasError && src && !isLegacyPlaceholder && src.trim().length > 0;

  if (validSrc) {
    return (
      <img
        src={src!}
        alt={alt || name || 'صورة الحساب'}
        onError={() => setHasError(true)}
        className={`${className} object-cover shrink-0`}
      />
    );
  }

  // Neutral avatar fallback
  return (
    <div
      className={`${className} bg-slate-100 border border-slate-200/80 text-slate-400 flex items-center justify-center shrink-0 select-none shadow-xs`}
      title={name || 'المستخدم'}
      aria-label={name || 'صورة محايدة للمستخدم'}
    >
      <User className={iconClassName || 'w-1/2 h-1/2 text-slate-400'} />
    </div>
  );
}
