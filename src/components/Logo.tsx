import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'emerald' | 'white' | 'dark';
}

export function Logo({
  className = 'text-emerald-600 h-10 w-auto',
  size,
  variant = 'emerald'
}: LogoProps) {
  // Size presets if specified
  const sizeClasses = size === 'sm'
    ? 'h-8 w-auto'
    : size === 'lg'
    ? 'h-12 sm:h-14 w-auto'
    : size === 'md'
    ? 'h-10 sm:h-11 w-auto'
    : '';

  const colorClass = variant === 'white'
    ? 'text-white'
    : variant === 'dark'
    ? 'text-slate-900'
    : 'text-emerald-600';

  return (
    <div className={`inline-flex items-center select-none ${colorClass} ${sizeClasses} ${className}`}>
      <svg
        viewBox="0 0 185 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto max-w-full overflow-visible"
        aria-label="شعار خلصلى"
      >
        {/* Dynamic Speed-Check Emblem (Anchor symbol) */}
        <g className="logo-emblem">
          {/* Outer Rounded Container with subtle fill */}
          <rect
            x="4"
            y="4"
            width="38"
            height="38"
            rx="12"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* Intertwined Speed Lines */}
          <path
            d="M8 17 H12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
          <path
            d="M6 23 H11"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
          {/* Main Swift Checkmark */}
          <path
            d="M15 23 L22 30 L33 15"
            stroke="currentColor"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Dynamic Speed Swoosh under the typography */}
        <path
          d="M48 37 C 80 43, 125 43, 175 36"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.25"
        />

        {/* Bold Typographic Wordmark "خلصلى" */}
        <text
          x="180"
          y="32"
          textAnchor="end"
          fill="currentColor"
          fontFamily="'Cairo', sans-serif"
          fontWeight="900"
          fontSize="30"
          letterSpacing="-0.5"
        >
          خلصلى
        </text>

        {/* Intertwined Checkmark replacing/enhancing the "خ" dot */}
        <path
          d="M163 12 L166 15 L172 7"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default Logo;
