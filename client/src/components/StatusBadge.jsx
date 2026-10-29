import React from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCheck,
  ShieldAlert
} from 'lucide-react';

export const STATUS_CONFIG = {
  Submitted: {
    label: 'Submitted',
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-600',
    icon: FileText
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-600',
    icon: Search
  },
  Accepted: {
    label: 'Accepted',
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-600',
    icon: CheckCircle2
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-sky-50 text-sky-800 border-sky-300',
    dot: 'bg-sky-600',
    icon: Clock
  },
  Resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600',
    icon: CheckCheck
  },
  Disputed: {
    label: 'Disputed',
    bg: 'bg-red-50 text-red-800 border-red-300',
    dot: 'bg-red-600',
    icon: AlertTriangle
  },
  Escalated: {
    label: 'Escalated',
    bg: 'bg-purple-50 text-purple-800 border-purple-300',
    dot: 'bg-purple-700',
    icon: ShieldAlert
  },
  Closed: {
    label: 'Closed',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    icon: CheckCheck
  }
};

export default function StatusBadge({ status = 'Submitted', size = 'md', showIcon = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Submitted;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[11px]' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-semibold'
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium whitespace-nowrap ${config.bg} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}
