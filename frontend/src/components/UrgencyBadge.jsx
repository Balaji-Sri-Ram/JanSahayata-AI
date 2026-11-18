import React from 'react';
import { AlertCircle, AlertTriangle, Info, Flame } from 'lucide-react';

export const URGENCY_CONFIG = {
  Critical: {
    label: 'Critical',
    bg: 'bg-red-50 text-red-800 border-red-200',
    icon: Flame
  },
  High: {
    label: 'High Priority',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertTriangle
  },
  Medium: {
    label: 'Medium',
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: AlertCircle
  },
  Low: {
    label: 'Low',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Info
  }
};

export default function UrgencyBadge({ urgency = 'Medium', size = 'md' }) {
  const config = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.Medium;
  const Icon = config.icon;

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 font-medium whitespace-nowrap rounded-md border ${config.bg} ${sizeClass}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
