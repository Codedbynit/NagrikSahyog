import React from 'react';
import { Language, AppView } from '../types';
import { translations } from '../data/translations';
import { Home, Bell, LogOut, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onLanguageToggle: () => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  unreadNotifCount?: number;
  isNotifDrawerOpen?: boolean;
  onToggleNotifDrawer?: () => void;
  user?: any;
  onSignOut?: () => void;
}

export const AshokaChakra: React.FC<{ className?: string; color?: string }> = ({
  className = "w-4 h-4",
  color = "currentColor",
}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21h18" />
    <path d="M5 21V10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11" />
    <path d="M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
    <path d="M7 12h2" />
    <path d="M15 12h2" />
    <path d="M12 3v3" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageToggle,
  currentView,
  onViewChange,
  unreadNotifCount = 0,
  isNotifDrawerOpen = false,
  onToggleNotifDrawer,
  user,
  onSignOut,
}) => {
  const t = translations[currentLang];

  return (
    <div className="w-full flex flex-col shrink-0">
      {/* Skip to Main Content (Accessibility Link) */}
      <a 
        href="#main-content" 
        className="absolute top-[-200px] left-0 bg-[#1A3057] text-white px-4 py-2 z-[9999] focus:top-0 transition-all font-sans text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* TIER 2: Main Navbar */}
      <header className="sticky top-0 z-50 w-full h-[56px] bg-white border-b-3 border-b-[#E8571A] shadow-[0_1px_2px_rgba(0,0,0,0.015)]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Brand Logo & Bilingual Name */}
          <button
            onClick={() => onViewChange('landing')}
            className="flex items-center gap-3 group hover:opacity-95 transition-all text-left cursor-pointer"
            id="btn-brand-home"
          >
            {/* Logo Mark - White bg with high-fidelity community pinwheel logo */}
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.06)] border border-gray-100/90 group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="select-none">
                {/* 1. Red Figure (Top) rotated 0 deg */}
                <g transform="rotate(0, 50, 50)">
                  {/* Rose/Pink secondary leaf/swoosh */}
                  <path d="M 50 48 C 45 40, 41 32, 39 26 C 41 25, 43 27, 44 30 C 46 36, 48 43, 50 48 Z" fill="#FDA4AF" />
                  {/* Symmetrical human figure */}
                  <path d="M 50 48 C 45 40, 36 29, 31 23 C 40 21, 46 29, 49 32 C 49 28, 50 21, 50 21 C 51 21, 51 28, 51 32 C 54 29, 60 21, 69 23 C 64 29, 55 40, 50 48 Z" fill="#EF4444" />
                  {/* Floating head */}
                  <circle cx="50" cy="14" r="5.5" fill="#EF4444" />
                </g>

                {/* 2. Blue Figure (Right) rotated 90 deg */}
                <g transform="rotate(90, 50, 50)">
                  {/* Sky blue secondary leaf/swoosh */}
                  <path d="M 50 48 C 45 40, 41 32, 39 26 C 41 25, 43 27, 44 30 C 46 36, 48 43, 50 48 Z" fill="#7DD3FC" />
                  {/* Symmetrical human figure */}
                  <path d="M 50 48 C 45 40, 36 29, 31 23 C 40 21, 46 29, 49 32 C 49 28, 50 21, 50 21 C 51 21, 51 28, 51 32 C 54 29, 60 21, 69 23 C 64 29, 55 40, 50 48 Z" fill="#2563EB" />
                  {/* Floating head */}
                  <circle cx="50" cy="14" r="5.5" fill="#2563EB" />
                </g>

                {/* 3. Green Figure (Bottom) rotated 180 deg */}
                <g transform="rotate(180, 50, 50)">
                  {/* Yellow-green/lime secondary leaf/swoosh */}
                  <path d="M 50 48 C 45 40, 41 32, 39 26 C 41 25, 43 27, 44 30 C 46 36, 48 43, 50 48 Z" fill="#BEF264" />
                  {/* Symmetrical human figure */}
                  <path d="M 50 48 C 45 40, 36 29, 31 23 C 40 21, 46 29, 49 32 C 49 28, 50 21, 50 21 C 51 21, 51 28, 51 32 C 54 29, 60 21, 69 23 C 64 29, 55 40, 50 48 Z" fill="#84CC16" />
                  {/* Floating head */}
                  <circle cx="50" cy="14" r="5.5" fill="#84CC16" />
                </g>

                {/* 4. Purple Figure (Left) rotated 270 deg */}
                <g transform="rotate(270, 50, 50)">
                  {/* Orange/Peach secondary leaf/swoosh */}
                  <path d="M 50 48 C 45 40, 41 32, 39 26 C 41 25, 43 27, 44 30 C 46 36, 48 43, 50 48 Z" fill="#FDBA74" />
                  {/* Symmetrical human figure */}
                  <path d="M 50 48 C 45 40, 36 29, 31 23 C 40 21, 46 29, 49 32 C 49 28, 50 21, 50 21 C 51 21, 51 28, 51 32 C 54 29, 60 21, 69 23 C 64 29, 55 40, 50 48 Z" fill="#9333EA" />
                  {/* Floating head */}
                  <circle cx="50" cy="14" r="5.5" fill="#9333EA" />
                </g>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-extrabold text-[15px] tracking-tight text-[#1A3057] block leading-none">
                {t.brand}
              </span>
            </div>
          </button>

          {/* Quick Navigation Items */}
          <div className="flex items-center gap-3 sm:gap-4">

            {currentView !== 'landing' && (
              <button
                onClick={() => onViewChange('landing')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#5C5449] hover:text-[#E8571A] hover:bg-[#FEF0E8] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-sans"
                id="btn-nav-home"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentLang === 'en' ? 'Home' : 'होम'}</span>
              </button>
            )}

            {/* Notification Bell */}
            {currentView === 'admin' && (
              <div className="relative">
                <button
                  onClick={onToggleNotifDrawer}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border text-[#5C5449] transition-all cursor-pointer relative ${
                    unreadNotifCount > 0 
                      ? 'bg-[#FEF0E8] border-[#F4C4A8] text-[#E8571A] hover:bg-[#FCDDC9]' 
                      : 'bg-white border-[#EDE8E3] hover:bg-slate-50'
                  }`}
                  id="btn-header-notif-drawer"
                  title="Real-time Alerts"
                >
                  <Bell className={`w-4 h-4 ${unreadNotifCount > 0 ? 'animate-bounce text-[#E8571A]' : ''}`} />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#E8571A] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white flex items-center justify-center leading-none min-w-[18px]">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {user && (
              <div className="flex items-center gap-2 border-r border-[#EDE8E3] pr-3 sm:pr-4" id="user-header-auth-section">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#1A3057] truncate max-w-[120px]">
                    {user.displayName?.split('|')[0]?.trim() || user.email}
                  </span>
                  <span className="text-[9px] font-mono text-[#E8571A] font-bold leading-none">
                    {user.displayName?.split('|')[1]?.trim() || 'Official'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FEF0E8] border border-[#F4C4A8] flex items-center justify-center text-[#E8571A]" title={user.displayName || user.email}>
                  <UserCheck className="w-4 h-4" />
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-2 text-[#5C5449] hover:text-[#EF4444] hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title={currentLang === 'en' ? 'Sign Out' : 'साइन आउट'}
                    id="btn-header-signout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Language Switcher Pill - Restyled per Section 2 */}
            <div className="bg-[#F5F5F5] p-0.5 border border-[#EDE8E3] rounded-md flex items-center relative shrink-0">
              <button
                onClick={() => currentLang !== 'en' && onLanguageToggle()}
                className={`px-3 py-1 text-[11px] font-bold rounded-[4px] transition-all cursor-pointer text-center ${
                  currentLang === 'en' 
                    ? 'bg-[#1A3057] text-white shadow-xs' 
                    : 'text-[#5C5449] hover:text-[#1A1A1A]'
                }`}
                id="btn-lang-en"
              >
                EN
              </button>
              <button
                onClick={() => currentLang !== 'hi' && onLanguageToggle()}
                className={`px-3 py-1 text-[11px] font-bold rounded-[4px] transition-all cursor-pointer text-center ${
                  currentLang === 'hi' 
                    ? 'bg-[#1A3057] text-white shadow-xs' 
                    : 'text-[#5C5449] hover:text-[#1A1A1A]'
                }`}
                id="btn-lang-hi"
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

