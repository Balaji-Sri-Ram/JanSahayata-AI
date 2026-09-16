import React from 'react';
import { AlertCircle, AlertOctagon, Flame, Info } from 'lucide-react';

export const URGENCY_CONFIG = {
  Low: {
    label: 'Low',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Info
  },
  Medium: {
    label: 'Medium',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle
  },
  High: {
    label: 'High',
    bg: 'bg-orange-50 text-orange-700 border-orange-300 font-semibold',
    icon: AlertOctagon
  },
  Critical: {
    label: 'Critical',
    bg: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse',
    icon: Flame
  }
};

export default function UrgencyBadge({ urgency = 'Medium', size = 'md' }) {
  const config = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.Medium;
  const Icon = config.icon;

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : size === 'lg'
    ? 'px-3 py-1.5 text-sm'
    : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border shadow-xs ${config.bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
