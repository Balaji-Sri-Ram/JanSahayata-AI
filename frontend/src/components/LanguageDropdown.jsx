import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';

export default function LanguageDropdown() {
  const { currentLang, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguageObj = languages.find((l) => l.code === currentLang) || languages[0];

  const filteredLanguages = languages.filter((l) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      l.label.toLowerCase().includes(q) ||
      l.native.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative inline-block text-left notranslate" translate="no" ref={dropdownRef}>
      {/* Language Trigger Button */}
      <button
        type="button"
        translate="no"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
        }}
        className="notranslate flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#07172b] border border-[#1e4f8b] font-medium text-amber-300 hover:text-white hover:border-amber-400 transition-colors shadow-xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="notranslate font-semibold text-xs leading-none" translate="no">
          {currentLanguageObj.label}
          {currentLanguageObj.script ? ` (${currentLanguageObj.native})` : ''}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Dropdown Box */}
      {isOpen && (
        <div 
          className="notranslate absolute right-0 mt-1.5 w-64 bg-white rounded-lg shadow-2xl border border-slate-300 py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 text-slate-900"
          translate="no"
        >
          {/* Quick search input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 notranslate" translate="no">
            <div className="relative notranslate" translate="no">
              <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                translate="no"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search language..."
                className="notranslate w-full pl-7 pr-2.5 py-1 text-xs rounded border border-slate-300 bg-white focus:border-[#0b2545] focus:outline-none focus:ring-1 focus:ring-[#0b2545]"
                autoFocus
              />
            </div>
          </div>

          {/* Smooth Scrollable Languages List */}
          <div className="notranslate max-h-64 overflow-y-auto divide-y divide-slate-100 py-0.5 scroll-smooth" translate="no">
            {filteredLanguages.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-400 notranslate" translate="no">
                No language found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    translate="no"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`notranslate w-full px-3.5 py-2 text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 text-[#0b2545] font-bold border-l-3 border-[#0b2545]'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate notranslate" translate="no">
                      <span className="notranslate font-medium text-slate-900" translate="no">{lang.label}</span>
                      {lang.script && (
                        <span className="notranslate text-[11px] text-slate-500 font-normal" translate="no">
                          ({lang.native})
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#0b2545] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

        </div>
      )}
    </div>
  );
}

