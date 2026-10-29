import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import EmblemLogo from '../../components/EmblemLogo';
import { 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Train, 
  Droplets, 
  Building2, 
  Milestone, 
  Zap, 
  HeartPulse, 
  ArrowRight,
  FileCheck,
  Camera,
  FileText,
  Phone,
  AlertTriangle,
  Layers,
  CheckCheck,
  Shield,
  HelpCircle,
  Clock4,
  CheckCircle
} from 'lucide-react';

export default function CitizenHome() {
  const navigate = useNavigate();
  const { t, currentLang } = useLanguage();
  const [trackIdInput, setTrackIdInput] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackIdInput.trim()) {
      navigate(`/complaint/${trackIdInput.trim()}`);
    }
  };

  const departments = [
    {
      id: 'railway',
      code: 'Railways',
      name: t('deptRailway'),
      desc: t('deptRailwayDesc'),
      icon: Train,
      sla: '24–48 Hours',
      tollfree: '139'
    },
    {
      id: 'municipality',
      code: 'Municipal',
      name: t('deptMuni'),
      desc: t('deptMuniDesc'),
      icon: Building2,
      sla: '24–72 Hours',
      tollfree: '1533'
    },
    {
      id: 'water_supply',
      code: 'Water & Sewer',
      name: t('deptWater'),
      desc: t('deptWaterDesc'),
      icon: Droplets,
      sla: '12–36 Hours',
      tollfree: '1916'
    },
    {
      id: 'roads_infra',
      code: 'Roads / PWD',
      name: t('deptRoads'),
      desc: t('deptRoadsDesc'),
      icon: Milestone,
      sla: '24–48 Hours',
      tollfree: '1800-11-0055'
    },
    {
      id: 'electricity',
      code: 'Electricity',
      name: t('deptPower'),
      desc: t('deptPowerDesc'),
      icon: Zap,
      sla: '4–24 Hours',
      tollfree: '1912'
    },
    {
      id: 'health_sanitation',
      code: 'Public Health',
      name: t('deptHealth'),
      desc: t('deptHealthDesc'),
      icon: HeartPulse,
      sla: '12–48 Hours',
      tollfree: '104'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: t('step1Title'),
      desc: t('step1Desc'),
      icon: Camera
    },
    {
      step: '02',
      title: t('step2Title'),
      desc: t('step2Desc'),
      icon: Layers
    },
    {
      step: '03',
      title: t('step3Title'),
      desc: t('step3Desc'),
      icon: Building2
    },
    {
      step: '04',
      title: t('step4Title'),
      desc: t('step4Desc'),
      icon: CheckCheck
    }
  ];

  const emergencyHelplines = [
    { name: t('railHelpline'), number: '139', note: 'Trains, coaches, stations', icon: Train },
    { name: t('cyberHelpline'), number: '1930', note: 'Online fraud & cyber safety', icon: Shield },
    { name: t('consumerHelpline'), number: '1800-11-4000', note: 'Products, bills & consumer rights', icon: Phone },
    { name: t('emergencyHelpline'), number: '112', note: 'Police, fire, ambulance emergency', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      
      {/* 1. Important Live Notice Ribbon (Simple English) */}
      <div className="bg-amber-50 border border-amber-200 rounded text-slate-800 text-xs overflow-hidden flex items-center shadow-sm">
        <div className="bg-[#e86100] text-white px-3 py-2 font-bold shrink-0 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <FileText className="w-3.5 h-3.5" />
          <span>Notice</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap w-full py-1.5 px-3">
          <div className="animate-ticker text-xs font-medium text-slate-700">
            <span>{t('tickerNotice')}</span>
            <span className="mx-6 text-amber-500">•</span>
            <span>All registered complaints are tracked under official service guidelines.</span>
            <span className="mx-6 text-amber-500">•</span>
            <span>You can reopen any complaint if the work is not done to your satisfaction.</span>
          </div>
        </div>
      </div>

      {/* 2. Official Portal Hero Section (Simple English, No generic AI buzzwords, No Hindi in buttons) */}
      <section className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden relative">
        
        {/* Subtle Ashoka Emblem watermark in background */}
        <div className="absolute right-4 top-4 opacity-5 pointer-events-none hidden lg:block">
          <EmblemLogo size="xl" className="w-32 h-36 border-none bg-transparent" />
        </div>

        {/* Top Header Banner Ribbon */}
        <div className="bg-[#0b2545] text-white px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#163b6b]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-900 font-bold text-[10px] uppercase tracking-wider">
              Official Portal
            </span>
            <span className="text-xs text-slate-200 font-medium">
              Government of India • Citizen Redressal Service
            </span>
          </div>
          <div className="text-[11px] text-amber-300 font-medium">
            24x7 Public Assistance
          </div>
        </div>

        {/* Hero Content */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="max-w-3xl">
            
            {/* Simple Clean Title */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold text-[#e86100] uppercase tracking-wider block">
                {t('heroTag')}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0b2545] tracking-tight leading-tight">
                {t('portalTitle')}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6 font-normal">
              {t('heroDescription')}
            </p>

            {/* Clean Action Buttons (Simple English, No Hindi Brackets) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <Link
                to="/report"
                className="gov-btn-saffron px-6 py-3 text-sm shadow-md flex items-center justify-center gap-2 font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('fileComplaintBtn')}</span>
              </Link>

              <Link
                to="/track"
                className="gov-btn-primary px-5 py-3 text-sm flex items-center justify-center gap-2 font-semibold"
              >
                <Search className="w-4 h-4" />
                <span>{t('trackStatusBtn')}</span>
              </Link>

              <Link
                to="/help"
                className="gov-btn-secondary px-4 py-3 text-sm flex items-center justify-center gap-2 font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>{t('citizenCharter')}</span>
              </Link>
            </div>

            {/* Quick Status Lookup Box */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-300 max-w-2xl">
              <form onSubmit={handleTrackSubmit}>
                <label 
                  htmlFor="quickTrack" 
                  className="block text-xs font-bold text-[#0b2545] uppercase tracking-wider mb-2 flex items-center justify-between"
                >
                  <span>{t('quickTrackLabel')}</span>
                  <span className="text-slate-500 font-normal normal-case text-[11px]">{t('formatHint')}</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      key={`quickTrack-${currentLang}`}
                      id="quickTrack"
                      type="text"
                      placeholder={t('quickTrackPlaceholder')}
                      value={trackIdInput}
                      onChange={(e) => setTrackIdInput(e.target.value)}
                      className="gov-input pl-10 text-xs py-2.5 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="gov-btn-primary text-xs py-2.5 px-6 whitespace-nowrap"
                  >
                    {t('checkStatusBtn')}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Core Service Commitments (NO FAKE STATS - Real helpful guarantees) */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-slate-800">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-[#0b2545]">
                <ShieldCheck className="w-5 h-5 text-[#0b2545]" />
                <h3 className="font-bold text-xs uppercase tracking-wider">{t('commit1Title')}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {t('commit1Desc')}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-[#0b2545]">
                <Clock4 className="w-5 h-5 text-[#e86100]" />
                <h3 className="font-bold text-xs uppercase tracking-wider">{t('commit2Title')}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {t('commit2Desc')}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-[#0b2545]">
                <Camera className="w-5 h-5 text-[#138808]" />
                <h3 className="font-bold text-xs uppercase tracking-wider">{t('commit3Title')}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {t('commit3Desc')}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-[#0b2545]">
                <CheckCircle className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-xs uppercase tracking-wider">{t('commit4Title')}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {t('commit4Desc')}
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* 3. Emergency & Grievance Helplines Strip */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#e86100]" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t('helplinesTitle')}
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">Toll-free across India</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {emergencyHelplines.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.name} className="gov-card p-3.5 flex items-center justify-between gap-3 border-l-4 border-l-[#0b2545]">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">{h.name}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{h.note}</p>
                  <p className="text-sm font-black text-[#0b2545] font-mono pt-1">
                    {h.number}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Icon className="w-4 h-4 text-[#0b2545]" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Simple 4-Step Process (No Hindi in English mode, clean UI) */}
      <section className="space-y-4">
        <div className="gov-section-header flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[#0b2545] text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4 text-[#138808]" />
              <span>Easy Process</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t('howItWorksTitle')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 sm:text-right max-w-sm">
            {t('howItWorksDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="gov-card p-5 relative border-t-2 border-t-[#0b2545]">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded bg-[#0b2545] text-amber-400 flex items-center justify-center font-bold text-sm shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono">Step {step.step}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Directory of Departments (Clean English, No Hindi subtitles in English mode) */}
      <section className="space-y-4">
        <div className="gov-section-header flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#0b2545] text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-[#0b2545]" />
              <span>Government Services</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t('departmentsTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('departmentsDesc')}
            </p>
          </div>

          <Link
            to="/report"
            className="gov-btn-saffron text-xs py-2 px-3.5 shrink-0 self-start sm:self-auto font-medium"
          >
            <span>{t('fileComplaintBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <div key={dept.id} className="gov-card p-5 hover:border-slate-400 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                      <Icon className="w-5 h-5 text-[#0b2545]" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0b2545] border border-blue-200 font-mono">
                      {dept.code}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {dept.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">{t('slaLabel')}:</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{dept.sla}</span>
                  </div>
                  <Link
                    to={`/report?dept=${dept.id}`}
                    className="gov-btn-secondary text-xs py-1.5 px-3 text-[#0b2545] font-semibold"
                  >
                    <span>{t('fileHere')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Citizen Guarantee (Simple English) */}
      <section className="bg-[#0b2545] text-white rounded-lg p-6 sm:p-8 border border-slate-700 shadow-md">
        <div className="max-w-3xl space-y-4">
          
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>{t('guaranteeTag')}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('guaranteeTitle')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {t('guaranteeDesc')}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/report"
              className="gov-btn-saffron text-xs py-2.5 px-5 font-semibold"
            >
              {t('guaranteeBtn')}
            </Link>
            <Link
              to="/help"
              className="gov-btn-secondary bg-white/10 text-white border-white/30 hover:bg-white/20 text-xs py-2.5 px-4"
            >
              {t('guaranteeLearnMore')}
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
