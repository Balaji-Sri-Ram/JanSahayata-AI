import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Clock, FileText, Phone, Mail, Building2, AlertTriangle } from 'lucide-react';

const FAQS = [
  {
    q: 'What is JanSahayata?',
    a: 'JanSahayata is the Centralized Public Grievance Redress and Monitoring System (CPGRAMS) operated under administrative reform guidelines. It provides a single-window interface for citizens to lodge grievances against public authorities, track progress, and inspect completion evidence prior to official closure.'
  },
  {
    q: 'How does automated grievance triaging and routing work?',
    a: 'When you submit a grievance, the system validates the attached details, audio note, and photographic evidence, categorizes the incident under the correct departmental code, and immediately routes the case to the designated jurisdictional Nodal Grievance Officer for field inspection.'
  },
  {
    q: 'What happens after I submit a complaint?',
    a: 'Your complaint receives a unique tracking ID (e.g., JNS-2026-000001) and is routed to the designated nodal officer of the concerned department. You can track progress across stages: Submitted → Under Review → Accepted → In Progress → Resolved → Closed.'
  },
  {
    q: 'Can a department close my complaint without my agreement?',
    a: 'No. Under the JanSahayata citizen-verification mandate, when an officer marks an issue as Resolved, they must upload proof. The complaint moves to "Awaiting Citizen Verification". You have the right to either confirm resolution or dispute the outcome if work is incomplete.'
  },
  {
    q: 'What should I do if a resolution is unsatisfactory?',
    a: 'Open your complaint details and click "Dispute Resolution". Enter the reasons why the problem persists and optionally attach photos. The grievance will be reopened and escalated to senior supervisory authorities.'
  },
  {
    q: 'How do government officials and staff access the platform?',
    a: 'Department officials have secure, role-restricted credentials created by the Super Administrator and log in via the Official Staff Portal (/staff/login).'
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 pb-16">
      
      {/* Header */}
      <div className="gov-card p-6 sm:p-8 text-center space-y-2 border-t-4 border-t-[#0b2545]">
        <div className="w-12 h-12 bg-blue-50 text-[#0b2545] rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-200">
          <HelpCircle className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-bold text-[#e86100] uppercase tracking-wider block">
          Citizen Help Center
        </span>
        <h1 className="text-2xl font-bold text-[#0b2545]">
          Citizen Support & Service Guide
        </h1>
        <p className="text-xs text-slate-600 max-w-lg mx-auto">
          Clear answers on filing complaints, response times, dispute rules, and how to verify completed repairs.
        </p>
      </div>

      {/* Citizen Charter & SLA Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gov-card p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Standard Service SLAs</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Critical issues are attended within 4–12 hours. High-priority grievances are actioned within 24 hours.
          </p>
        </div>

        <div className="gov-card p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Verified Resolution</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Officers must provide photographic proof. Citizen sign-off is required before final closure.
          </p>
        </div>

        <div className="gov-card p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Two-Tier Escalation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Disputed or delayed grievances automatically escalate to Divisional Directors and Super Admins.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="gov-card p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 bg-slate-50/50 hover:bg-slate-100/60"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-4 py-3 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
