import React from 'react';
import { STATUS_CONFIG } from './StatusBadge';
import { Calendar, User, Shield, CheckCircle2, Clock } from 'lucide-react';

export default function Timeline({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
        No progress timeline updates recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {updates.map((entry, index) => {
        const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.Submitted;
        const Icon = config.icon;
        const formattedDate = new Date(entry.timestamp).toLocaleString('en-US', {
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
            {/* Timeline Dot with Icon */}
            <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
              isLatest ? `${config.dot} ring-4 ring-sky-100` : 'bg-slate-400'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>

            {/* Timeline Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              isLatest 
                ? 'bg-white border-slate-300 shadow-sm' 
                : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
            }`}>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.bg}`}>
                    {entry.status}
                  </span>
                  {entry.officer && (
                    <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-slate-400" />
                      {entry.officer.name}
                      <span className="text-slate-400">({entry.officer.role || entry.officer.department})</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {formattedDate}
                </span>
              </div>

              {/* Message */}
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {entry.message}
              </p>

              {/* Media Attachments */}
              {entry.media && entry.media.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.media.map((item, mIdx) => (
                    <a
                      key={mIdx}
                      href={`http://localhost:5001${item}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group/img relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:ring-2 hover:ring-railway-500 transition-all"
                    >
                      <img
                        src={`http://localhost:5001${item}`}
                        alt="Progress attachment"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&q=80'; }}
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
