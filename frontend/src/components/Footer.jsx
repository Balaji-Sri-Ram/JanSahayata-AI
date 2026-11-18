import React from 'react';
import { Link } from 'react-router-dom';
import EmblemLogo from './EmblemLogo';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentDate = '29-10-2026';

  return (
    <footer className="bg-[#040c17] text-slate-300 text-xs border-t-4 border-[#e86100] mt-auto">
      
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand & Authority Column */}
          <div className="md:col-span-2 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="text-amber-400 bg-white/5 p-2 rounded border border-white/10 shrink-0">
                <EmblemLogo size="sm" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-amber-400 block leading-tight">
                  Government of India
                </span>
                <span className="text-base font-bold text-white tracking-tight">
                  JanSahayata <span className="text-[#e86100]">Portal</span>
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Centralized Public Grievance Redress & Monitoring System (CPGRAMS)
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Official single-window portal by the Department of Administrative Reforms and Public Grievances (DARPG) for lodging, triaging, and time-bound monitoring of public grievances across government ministries and public service departments.
            </p>

          </div>

          {/* Citizen Services */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3.5 pb-1 border-b border-slate-700/60">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/report" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>Lodge Public Grievance</span>
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>Track Grievance Status</span>
                </Link>
              </li>
              <li>
                <Link to="/my-complaints" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>My Grievances Hub</span>
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>Citizen Charter & SLAs</span>
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>Resolution Verification Rights</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Government Authorities Directory */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3.5 pb-1 border-b border-slate-700/60">
              Participating Authorities
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/report?dept=railway" className="hover:text-amber-300 transition-colors">Ministry of Railways</Link>
              </li>
              <li>
                <Link to="/report?dept=municipality" className="hover:text-amber-300 transition-colors">Municipal Corporations</Link>
              </li>
              <li>
                <Link to="/report?dept=water_supply" className="hover:text-amber-300 transition-colors">Water Supply & Sewerage Board</Link>
              </li>
              <li>
                <Link to="/report?dept=roads_infra" className="hover:text-amber-300 transition-colors">Public Works Department (PWD)</Link>
              </li>
              <li>
                <Link to="/report?dept=electricity" className="hover:text-amber-300 transition-colors">State Electricity Boards (DISCOM)</Link>
              </li>
              <li>
                <Link to="/report?dept=health_sanitation" className="hover:text-amber-300 transition-colors">Public Health & Sanitation</Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Official Access */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3.5 pb-1 border-b border-slate-700/60">
              Helplines & Access
            </h4>
            <div className="space-y-2 text-slate-400 mb-4">
              <div className="p-2.5 rounded bg-[#020712] border border-slate-800/70">
                <span className="text-[10px] text-slate-400 block">National Grievance Toll-Free:</span>
                <span className="text-sm font-bold text-amber-400 font-mono">1800-11-4000</span>
              </div>
              <div className="p-2.5 rounded bg-[#020712] border border-slate-800/70">
                <span className="text-[10px] text-slate-400 block">Rail Madad / Emergency:</span>
                <span className="text-sm font-bold text-amber-400 font-mono">139 / 112</span>
              </div>
            </div>

            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link to="/staff/login" className="hover:text-sky-300 transition-colors text-sky-400 font-medium">
                  Official / Staff Portal Login
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Escalation Matrix & Rules
                </Link>
              </li>
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Mandatory GIGW Legal & Policy Sub-Bar */}
      <div className="bg-[#02070f] py-4 px-4 sm:px-6 lg:px-8 border-t border-slate-900 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
            <Link to="/help" className="hover:text-white transition-colors">Website Policies</Link>
            <span>|</span>
            <Link to="/help" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <span>|</span>
            <Link to="/help" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link to="/help" className="hover:text-white transition-colors">Hyperlink Policy</Link>
            <span>|</span>
            <Link to="/help" className="hover:text-white transition-colors">Copyright Policy</Link>
            <span>|</span>
            <Link to="/help" className="hover:text-white transition-colors">Citizen Charter</Link>
            <span>|</span>
            <Link to="/help" className="hover:text-white transition-colors">Help</Link>
          </div>

          <div className="text-slate-500 text-[10px]">
            <span>Last Reviewed & Updated on: </span>
            <strong className="text-slate-400 font-mono">{currentDate}</strong>
          </div>

        </div>
      </div>

    </footer>
  );
}
