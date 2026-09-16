import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Train, 
  UserCheck, 
  ShieldCheck, 
  PlusCircle, 
  ListFilter, 
  LayoutDashboard, 
  Inbox, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const isRailwaySide = location.pathname.startsWith('/railway');

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to={isRailwaySide ? "/railway-dashboard" : "/"} className="flex items-center gap-2.5 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md ${
                isRailwaySide 
                  ? 'bg-gradient-to-tr from-slate-900 to-slate-700 text-amber-400' 
                  : 'bg-gradient-to-tr from-railway-700 to-sky-500 text-white'
              }`}>
                <Train className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 font-['Outfit']">
                    Rail<span className="text-railway-600">Sewa</span> AI
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" /> MVP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium -mt-1">
                  Citizen–Government Grievance Mediation
                </p>
              </div>
            </Link>

            {/* Sub-label badge for portal mode */}
            <div className="hidden md:flex ml-3 pl-3 border-l border-slate-200">
              {isRailwaySide ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 text-amber-400 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" /> Railway Officer Portal
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-railway-50 text-railway-700 border border-railway-200">
                  <UserCheck className="w-3.5 h-3.5" /> Public Citizen Portal
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {!isRailwaySide ? (
              // Citizen Navigation
              <>
                <Link
                  to="/report-problem"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === '/report-problem'
                      ? 'bg-railway-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report Problem</span>
                </Link>

                <Link
                  to="/my-complaints"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === '/my-complaints'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span>My Complaints</span>
                </Link>
              </>
            ) : (
              // Railway Department Navigation
              <>
                <Link
                  to="/railway-dashboard"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === '/railway-dashboard'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </Link>

                <Link
                  to="/railway-dashboard/complaints"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname.startsWith('/railway-dashboard/complaints')
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>Department Inbox</span>
                </Link>
              </>
            )}

            {/* Portal Switcher Pill */}
            <div className="ml-2 pl-2 border-l border-slate-200">
              {isRailwaySide ? (
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-railway-700 border border-sky-200 hover:bg-sky-100 transition-colors shadow-2xs"
                  title="Switch to Citizen View"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Switch to</span> Citizen Portal
                </Link>
              ) : (
                <Link
                  to="/railway-dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-amber-300 hover:bg-slate-800 transition-colors shadow-2xs"
                  title="Switch to Railway Officer View"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Switch to</span> Railway Dashboard
                </Link>
              )}
            </div>
          </nav>

        </div>
      </div>
    </header>
  );
}
