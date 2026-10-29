import React from 'react';
import { STATUS_CONFIG } from './StatusBadge';
import { Clock, ShieldCheck, User, Building2, CheckCircle2 } from 'lucide-react';

export default function Timeline({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
        No progress updates recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {updates.map((entry, index) => {
        const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.Submitted;
        const Icon = config.icon;
        const formattedDate = new Date(entry.timestamp).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        const isLatest = index === updates.length - 1;

        return (
          <div key={entry._id || index} className="relative group">
            {/* Timeline Dot */}
            <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
              isLatest ? `${config.dot} ring-3 ring-blue-100` : 'bg-slate-400'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>

            {/* Timeline Entry Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              isLatest 
                ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100' 
                : 'bg-white border-slate-200/90 text-slate-700 shadow-sm'
            }`}>
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${config.bg}`}>
                    {entry.status}
                  </span>
                  {entry.officer && (
                    <span className="text-xs font-medium text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                      {entry.officer.name}
                      <span className="text-slate-500 font-normal">
                        ({entry.officer.role || entry.officer.department || 'Officer'})
                      </span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {formattedDate}
                </span>
              </div>

              {/* Message */}
              <p className="text-xs text-slate-800 leading-relaxed">
                {entry.message}
              </p>

              {/* Media Attachments */}
              {entry.media && entry.media.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.media.map((item, mIdx) => (
                    <a
                      key={mIdx}
                      href={item.startsWith('http') ? item : `http://localhost:5001${item}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group/img relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:ring-2 hover:ring-blue-600 transition-all"
                    >
                      <img
                        src={item.startsWith('http') ? item : `http://localhost:5001${item}`}
                        alt="Progress update proof"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80'; }}
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
