import React from 'react';
import { Train, ShieldAlert, Cpu, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Train className="w-4 h-4 text-railway-400" />
              <span>RailSewa AI Grievance Mediation Platform</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A transparent civic redressal ecosystem connecting passengers with Indian Railways operations, powered by automated computer vision and natural language triaging.
            </p>
          </div>
          
          <div>
            <span className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] block mb-2">
              MVP Information
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Public Demo Mode Active
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                Mock Citizen: CITIZEN-DEMO-001
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Officer: Station Superintendent
              </li>
            </ul>
          </div>

          <div>
            <span className="text-slate-200 font-semibold uppercase tracking-wider text-[11px] block mb-2">
              AI Microservices Pipeline
            </span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Prepared for Python FastAPI integration: YOLOv8 Object Detection, Whisper STT, LLM Grievance Formulation, and Multi-department Classifier.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <p>© 2026 RailSewa AI Platform. Civic Technology Redressal Initiative.</p>
          <p className="flex items-center gap-1">
            Built with modern React, Express & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}
