import React from 'react';
import {
  Wrench,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Tv,
  Sparkles,
  Truck,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  UserCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Props {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = 'w-5 h-5' }: Props) {
  switch (name?.toLowerCase()) {
    case 'wrench':
    case 'plumbing':
      return <Wrench className={className} />;
    case 'zap':
    case 'electricity':
      return <Zap className={className} />;
    case 'wind':
    case 'hvac':
      return <Wind className={className} />;
    case 'hammer':
    case 'carpentry':
      return <Hammer className={className} />;
    case 'paintbrush':
    case 'painting':
      return <Paintbrush className={className} />;
    case 'tv':
    case 'appliances':
      return <Tv className={className} />;
    case 'sparkles':
    case 'cleaning':
      return <Sparkles className={className} />;
    case 'truck':
    case 'moving':
      return <Truck className={className} />;
    default:
      return <Wrench className={className} />;
  }
}
