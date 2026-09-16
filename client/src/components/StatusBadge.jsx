import React from 'react';
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  PlayCircle, 
  AlertTriangle, 
  Flame, 
  CheckCheck,
  FileText
} from 'lucide-react';

export const STATUS_CONFIG = {
  Submitted: {
    label: 'Submitted',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    icon: FileText
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: Search
  },
  Accepted: {
    label: 'Accepted',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    icon: CheckCircle2
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-sky-50 text-sky-700 border-sky-300',
    dot: 'bg-sky-500 animate-pulse',
    icon: PlayCircle
  },
  Resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    dot: 'bg-emerald-500',
    icon: CheckCheck
  },
  Disputed: {
    label: 'Disputed',
    bg: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold',
    dot: 'bg-rose-500 animate-ping',
    icon: AlertTriangle
  },
  Escalated: {
    label: 'Escalated',
    bg: 'bg-purple-50 text-purple-700 border-purple-300 font-semibold',
    dot: 'bg-purple-600',
    icon: Flame
  },
  Closed: {
    label: 'Closed',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
    icon: CheckCheck
  }
};

export default function StatusBadge({ status = 'Submitted', size = 'md', showIcon = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Submitted;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-medium'
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${config.bg} ${sizeClasses}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}
