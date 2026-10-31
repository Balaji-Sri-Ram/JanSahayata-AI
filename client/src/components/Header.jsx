import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import EmblemLogo from './EmblemLogo';
import LanguageDropdown from './LanguageDropdown';
import ChangePasswordModal from './ChangePasswordModal';
import OfficerEmailChangeModal from './OfficerEmailChangeModal';
import CitizenEmailChangeModal from './CitizenEmailChangeModal';
import IndianFlag from './IndianFlag';
import { 
  PlusCircle, 
  Search, 
  ListFilter, 
  User, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  LayoutDashboard,
  Building2,
  ChevronDown,
  Phone,
  Lock,
  Globe,
  Activity,
  UserPlus,
  Inbox,
  KeyRound,
  Mail,
  Home,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isSuperAdmin, isEmployee, logout } = useAuth();
  const { currentLang, t, languages } = useLanguage();

  const displayName = isSuperAdmin
    ? (!user?.name || user?.name === 'Dr. Alok Verma, IAS' ? 'Phaniswar' : user.name)
    : (user?.name || 'User');

  const displayRole = isSuperAdmin
    ? 'Super Admin'
    : isEmployee
    ? 'Officer'
    : 'Citizen';

  const homeLink = isSuperAdmin ? '/admin/dashboard' : isEmployee ? '/staff/dashboard' : '/';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [showCitizenEmailModal, setShowCitizenEmailModal] = useState(false);
  const isLandingPage = location.pathname === '/';
  const [fontSize, setFontSize] = useState('normal'); // 'small' | 'normal' | 'large'
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(!isLandingPage);

  // Smooth scroll tracking
  // Fixed Title Bar: JanSahayata brand & top utility bar stay fixed at the top.
  // Dark Blue Navbar:
  // - At starting landing page: hidden/disabled.
  // - Immediately after crossing the orange "File a Complaint" button: smoothly slides down below the title bar.
  // - Scrolling back above the orange button: smoothly hides.
  // - Other pages: always visible.
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      
      setScrollProgress(progress);
      setIsScrolled(scrollTop > 15);

      if (location.pathname === '/') {
        // Track the orange "File a Complaint" button in the hero box
        const fileBtn = document.getElementById('hero-file-complaint-btn');
        if (fileBtn) {
          const rect = fileBtn.getBoundingClientRect();
          // Immediately when user scrolls to/past the orange "File a Complaint" button:
          setNavbarVisible(rect.top <= 140 || rect.bottom <= 180 || scrollTop > 180);
        } else {
          setNavbarVisible(scrollTop > 180);
        }
      } else {
        setNavbarVisible(true);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  // Text resizing handler for accessibility
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    if (size === 'small') {
      root.style.fontSize = '14px';
    } else if (size === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const adminNavLinks = [
    { name: t('adminNavOverview'), path: '/admin/dashboard' },
    { name: t('adminNavComplaints'), path: '/admin/dashboard?tab=complaints' },
    { name: 'Registered Citizens', path: '/admin/dashboard?tab=citizens' },
    { name: t('adminNavEmployees'), path: '/admin/dashboard?tab=employees' },
    { name: t('adminNavEmailRequests'), path: '/admin/dashboard?tab=email-requests' },
    { name: t('adminNavAudit'), path: '/admin/dashboard?tab=activity' },
  ];

  const staffNavLinks = [
    { name: t('staffNavWorkspace'), path: '/staff/dashboard' },
    { name: t('staffNavDeptComplaints'), path: '/staff/complaints' },
    { name: t('staffNavEscalated'), path: '/staff/complaints?status=Escalated' },
  ];

  const citizenNavLinks = [
    { name: t('home'), path: '/' },
    { name: t('fileComplaint'), path: '/report' },
    { name: t('trackStatus'), path: '/track' },
    { name: t('myComplaints'), path: '/my-complaints' },
    { name: t('citizenCharter'), path: '/help' },
  ];

  const navLinks = isSuperAdmin ? adminNavLinks : isEmployee ? staffNavLinks : citizenNavLinks;

  return (
    <header 
      className="sticky top-0 z-50 bg-[#0b2545] shadow-md border-b border-slate-300 m-0 p-0 w-full"
      style={{ position: 'sticky', top: 0, zIndex: 50 }}
    >
      
      {/* 1. Smooth Overlay Tricolor Scroll Animation (Does not increase header height or create a new line) */}
      <div 
        className={`absolute top-0 left-0 right-0 h-[3.5px] z-50 overflow-hidden pointer-events-none transition-opacity duration-300 ease-out ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <div className="h-full w-full bg-transparent relative">
          {/* Three colors of India smoothly moving to the right side on scroll down */}
          <div 
            className="h-full transition-all duration-150 ease-out"
            style={{
              width: `${Math.min(100, Math.max(4, scrollProgress))}%`,
              background: 'linear-gradient(90deg, #e86100 0%, #ff9933 30%, #ffffff 50%, #138808 70%, #138808 100%)',
              boxShadow: '0 1px 8px rgba(232, 97, 0, 0.8), 0 0 4px rgba(19, 136, 8, 0.8)'
            }}
          />
        </div>
      </div>

      {/* 2. Official National Accessibility & Utility Bar */}
      <div className="bg-[#0b2545] text-slate-200 text-xs py-1.5 px-3 sm:px-6 border-b border-[#163b6b]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Government of India Authority Line (Official Hindi and English from CPGRAMS masthead) */}
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-white tracking-wide">भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span className="text-amber-300 font-semibold truncate hidden sm:inline">कार्मिक, लोक शिकायत और पेंशन मंत्रालय</span>
            <span className="text-slate-400 hidden lg:inline">•</span>
            <span className="text-slate-200 truncate hidden lg:inline">Government of India</span>
            <span className="text-slate-400 hidden xl:inline">|</span>
            <span className="text-slate-300 truncate hidden xl:inline">Ministry of Personnel, Public Grievances & Pensions</span>
          </div>

          {/* Accessibility, Bhashini Language Selector & Official Quick Links */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-[11px]">
            
            {/* Font Resizing Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-[#07172b] px-2 py-0.5 rounded border border-[#1e4f8b]">
              <span key={`textResize-${currentLang}`} className="text-slate-400 mr-1 text-[10px]">{t('textResize')}:</span>
              <div className="notranslate flex items-center gap-1" translate="no">
                <button
                  type="button"
                  onClick={() => handleFontSizeChange('small')}
                  title="Decrease font size"
                  className={`px-1 py-0.5 rounded font-mono font-bold ${fontSize === 'small' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:text-white'}`}
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange('normal')}
                  title="Default font size"
                  className={`px-1 py-0.5 rounded font-mono font-bold ${fontSize === 'normal' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:text-white'}`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange('large')}
                  title="Increase font size"
                  className={`px-1 py-0.5 rounded font-mono font-bold ${fontSize === 'large' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:text-white'}`}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Smooth Language Dropdown */}
            <div className="notranslate inline-block" translate="no">
              <LanguageDropdown />
            </div>

            {/* Toll-Free Help */}
            <a 
              href="tel:1800114000" 
              className="hidden lg:flex items-center gap-1 text-slate-200 hover:text-amber-300 font-medium transition-colors"
              title="Toll Free National Helpline"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span key={`tollFree-${currentLang}`}>
                {t('tollFree')}: <span className="notranslate font-semibold" translate="no">1800-11-4000</span>
              </span>
            </a>

            {/* Portal Role Link (Shown only for authenticated Staff/Admin) */}
            {isSuperAdmin ? (
              <>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <Link to="/admin/dashboard" className="text-amber-400 font-semibold hover:underline flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 
                  <span>{t('adminPortal')}</span>
                </Link>
              </>
            ) : isEmployee ? (
              <>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <Link to="/staff/dashboard" className="text-sky-300 font-semibold hover:underline flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> 
                  <span>{t('officialPortal')}</span>
                </Link>
              </>
            ) : null}

          </div>

        </div>
      </div>

      {/* 3. Main Header (Authentic Lion Emblem + Clean Simple Brand) */}
      <div className="bg-white py-2.5 sm:py-3 px-3 sm:px-6 lg:px-8 border-b border-slate-200 max-w-full relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Official Three-Lion State Emblem of India + Department Brand */}
          <Link to={homeLink} className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 overflow-hidden">
            
            {/* Authentic Lion Capital of Ashoka Emblem (Image provided by user) */}
            <div className="group-hover:scale-105 transition-transform shrink-0">
              <EmblemLogo size="sm" className="sm:hidden" />
              <EmblemLogo size="lg" className="hidden sm:block" />
            </div>

            {/* Clean Simple Masthead Titles with Official Hindi Line from CPGRAMS */}
            <div className="border-l border-slate-300 pl-2 sm:pl-3 min-w-0 truncate">
              {/* Hindi Department Authority Line */}
              <div className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight truncate hidden xs:block">
                प्रशासनिक सुधार और लोक शिकायत विभाग
              </div>
              <div className="text-[9px] sm:text-[11px] font-bold text-[#b91c1c] uppercase tracking-wide leading-tight mt-0.5 truncate hidden sm:block">
                Department of Administrative Reforms & Public Grievances
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2 truncate">
                <span className="text-lg sm:text-2xl font-black text-[#0b2545] tracking-tight">
                  JanSahayata
                </span>
                <span className="text-xs sm:text-base font-bold text-slate-800 tracking-normal font-['Noto_Sans_Devanagari']">
                  जनसहायता
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 hidden md:inline-block">
                  Gov Portal
                </span>
              </div>
            </div>

          </Link>

          {/* Right Authority Seals, CPGRAMS Badge & Citizen Access */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Official CPGRAMS Badge (From user attachment) */}
            <div className="hidden xl:flex flex-col items-end text-right border-r border-slate-200 pr-3.5">
              <span className="px-2.5 py-0.5 rounded bg-[#0b2545] text-white font-black text-xs tracking-widest font-mono shadow-sm">
                CPGRAMS
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 max-w-[200px] leading-tight text-right">
                Centralized Public Grievance Redress And Monitoring System
              </span>
            </div>

            {/* National Initiative Badge (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded border border-slate-200 bg-slate-50">
              <div className="w-7 h-7 rounded-full bg-[#0b2545] text-amber-400 flex items-center justify-center font-bold text-[10px]">
                GOV
              </div>
              <div className="text-left text-[11px] leading-tight">
                <span className="font-bold text-[#0b2545] block">Digital India</span>
                <span className="text-slate-500 text-[10px]">24x7 Citizen Service</span>
              </div>
            </div>

            {/* Authenticated User Menu OR Citizen Login */}
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-all cursor-pointer select-none"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-[#0b2545] text-amber-400 flex items-center justify-center font-bold text-xs shadow-sm">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-semibold text-slate-900 leading-tight max-w-[130px] truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{displayRole}</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-slate-200 py-1 z-[100] animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      {user?.department?.name && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-[#0b2545] text-[10px] font-semibold mt-1">
                          {user.department.name}
                        </span>
                      )}
                    </div>

                    {isSuperAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#0b2545]" /> {t('adminPortal')}
                      </Link>
                    ) : isEmployee ? (
                      <Link
                        to="/staff/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#0b2545]" /> {t('officialPortal')}
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/citizen/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#0b2545]" /> {t('citizenDashboard')}
                        </Link>
                        <Link
                          to="/my-complaints"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100"
                        >
                          <ListFilter className="w-4 h-4 text-[#0b2545]" /> {t('myComplaints')}
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setShowChangePasswordModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 text-left font-medium"
                    >
                      <KeyRound className="w-4 h-4 text-[#0b2545]" /> {t('changePassword')}
                    </button>

                    {isEmployee && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setShowEmailChangeModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 text-left font-medium"
                      >
                        <Mail className="w-4 h-4 text-[#0b2545]" /> {t('requestEmailChange')}
                      </button>
                    )}

                    {!isEmployee && !isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setShowCitizenEmailModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 text-left font-medium"
                      >
                        <Mail className="w-4 h-4 text-[#0b2545]" /> Change Email Address (OTP)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" /> {t('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="gov-btn-primary text-xs py-2 px-4 shadow-sm font-semibold flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('citizenLogin')}</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button (Three Colored Lines -> Morphs into Indian Flag when clicked) */}
            <div className="flex md:hidden items-center shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-center focus:outline-none select-none active:scale-95 ${
                  mobileMenuOpen
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
                    : 'bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs'
                }`}
                aria-label="Toggle official portal menu"
                title={mobileMenuOpen ? "Close Menu" : "Click three colored lines to open menu"}
              >
                {mobileMenuOpen ? (
                  /* When open/clicked: Morphs into the Indian Flag with close indicator */
                  <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-150">
                    <IndianFlag className="w-6 h-4" />
                    <span className="text-[11px] font-bold text-[#0b2545]">✕</span>
                  </div>
                ) : (
                  /* Default state: Three Colored Lines (Saffron, White, Green) matching user's reference image */
                  <div className="flex flex-col justify-center items-center gap-1 w-5 h-4.5 py-0.5 animate-in fade-in duration-150" title="Tiranga Menu">
                    <span className="w-5 h-[3px] rounded-full bg-[#FF671F] block shadow-2xs" />
                    <span className="w-5 h-[3px] rounded-full bg-white border border-slate-300 block shadow-2xs" />
                    <span className="w-5 h-[3px] rounded-full bg-[#046A38] block shadow-2xs" />
                  </div>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 4. Primary Horizontal Navigation Bar (Desktop) - Hidden at start of landing page, smoothly slides down below title after crossing orange button */}
      <nav 
        className={`hidden md:block bg-[#0b2545] text-white transition-all duration-300 ease-out overflow-hidden ${
          isLandingPage && !navbarVisible
            ? 'max-h-0 opacity-0 border-t-0 pointer-events-none'
            : 'max-h-12 opacity-100 border-t border-[#163b6b]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            
            {/* Main Links */}
            <div className="flex items-center space-x-1">
              {navLinks.map((item) => {
                const currentFullUrl = location.pathname + location.search;
                const isActive = item.path.includes('?')
                  ? currentFullUrl === item.path
                  : (location.pathname === item.path && (!location.search || location.search === '?tab=overview')) ||
                    (item.path === '/report' && location.pathname === '/report-problem') ||
                    (item.path === '/track' && location.pathname.startsWith('/complaint/'));
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-t-sm transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#163b6b] text-amber-300 border-b-2 border-amber-400 font-bold'
                        : 'text-slate-100 hover:bg-[#163b6b] hover:text-amber-200'
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              {isSuperAdmin ? null : isEmployee ? (
                <>
                  <Link
                    to="/staff/complaints"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-1 rounded flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>{t('grievanceQueue')}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/report"
                    className="bg-[#e86100] hover:bg-[#c2410c] text-white text-xs font-bold px-3.5 py-1 rounded flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('fileComplaintBtn')}</span>
                  </Link>
                  <Link 
                    to="/track"
                    className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white bg-[#07172b] px-3.5 py-1 rounded border border-[#1e4f8b] hover:border-amber-400 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('trackStatus')}</span>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* 5. Mobile Navigation Drawer (Toggled by Indian Flag Button) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-amber-400 bg-white px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          
          {/* Top Tiranga Header Inside Drawer */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <IndianFlag className="w-6 h-4" />
              <div className="text-[11px] font-bold text-[#0b2545] uppercase tracking-wider">
                Government of India • JanSahayata
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Card (if authenticated) */}
          {isAuthenticated && (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0b2545] text-amber-300 font-bold flex items-center justify-center text-xs shadow-xs">
                  {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0b2545] text-white">
                {displayRole}
              </span>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pb-1 border-b border-slate-200">
            {isSuperAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gov-btn-primary py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                <Link
                  to="/admin/dashboard?tab=employees&action=new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gov-btn-saffron py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Officer</span>
                </Link>
              </>
            ) : isEmployee ? (
              <>
                <Link
                  to="/staff/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gov-btn-primary py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Workspace</span>
                </Link>
                <Link
                  to="/staff/complaints"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gov-btn-secondary py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Inbox className="w-4 h-4" />
                  <span>Queue</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gov-btn-saffron py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('fileComplaint')}</span>
                </Link>
                <Link
                  to="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gov-btn-primary py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('trackStatus')}</span>
                </Link>
              </>
            )}
          </div>

          {/* Primary Navigation Links */}
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Portal Services
            </span>
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-[#0b2545] border-l-4 border-[#0b2545] font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Language Selector in Mobile Drawer */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Bhashini Multilingual Support
            </span>
            <LanguageDropdown />
          </div>

          {/* Helplines (Tap to Call) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0b2545] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#e86100]" />
                <span>National Helplines (24x7)</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <a
                href="tel:1800114000"
                className="p-1.5 bg-white rounded border border-slate-200 text-center font-bold text-blue-900 hover:border-blue-400 block"
              >
                1800-11-4000
                <span className="block text-[9px] text-slate-500 font-sans font-normal">Toll-Free CPGRAMS</span>
              </a>
              <a
                href="tel:139"
                className="p-1.5 bg-white rounded border border-slate-200 text-center font-bold text-blue-900 hover:border-blue-400 block"
              >
                139
                <span className="block text-[9px] text-slate-500 font-sans font-normal">Railway Help</span>
              </a>
            </div>
          </div>

          {/* Helpline & Auth */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowChangePasswordModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 gov-btn-secondary text-slate-800 text-xs py-2 font-semibold"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#0b2545]" /> Change Password (OTP)
                </button>
                {isEmployee && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowEmailChangeModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 gov-btn-secondary text-slate-800 text-xs py-2 font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0b2545]" /> Request Email Change
                  </button>
                )}
                {!isEmployee && !isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowCitizenEmailModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 gov-btn-secondary text-slate-800 text-xs py-2 font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0b2545]" /> Change Email Address (OTP)
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full gov-btn-secondary text-red-600 border-red-200 text-xs py-2 text-center font-semibold"
                >
                  {t('signOut')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gov-btn-primary text-xs py-2 text-center font-semibold"
                >
                  {t('citizenLogin')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gov-btn-secondary text-xs py-2 text-center font-semibold"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Universal OTP Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Officer Official Email Change Request Modal */}
      <OfficerEmailChangeModal
        isOpen={showEmailChangeModal}
        onClose={() => setShowEmailChangeModal(false)}
      />

      {/* Citizen Dual OTP & Lost Email Change Modal */}
      <CitizenEmailChangeModal
        isOpen={showCitizenEmailModal}
        onClose={() => setShowCitizenEmailModal(false)}
      />

    </header>
  );
}
