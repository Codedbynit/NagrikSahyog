import React from 'react';
import { Language, AppView } from '../types';
import { translations } from '../data/translations';
import { Check, Shield, Clock, Lock, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface LandingViewProps {
  currentLang: Language;
  onViewChange: (view: AppView) => void;
  unassignedCount: number;
  resolvedCount: number;
}

export const LandingView: React.FC<LandingViewProps> = ({
  currentLang,
  onViewChange,
}) => {
  const t = translations[currentLang];

  const [currentBadgeIndex, setCurrentBadgeIndex] = React.useState(0);

  const badges = React.useMemo(() => [
    {
      icon: <Shield className="w-4 h-4 text-[#E8571A] shrink-0" />,
      text: currentLang === 'hi' ? 'आधिकारिक नागरिक मंच' : 'Official municipal platform',
    },
    {
      icon: <Clock className="w-4 h-4 text-[#E8571A] shrink-0" />,
      text: currentLang === 'hi' ? 'औसत समाधान: 48 घंटे' : 'Average resolution: 48 hours',
    },
    {
      icon: <Lock className="w-4 h-4 text-[#E8571A] shrink-0" />,
      text: currentLang === 'hi' ? 'पंजीकरण की आवश्यकता नहीं' : 'No registration required',
    },
  ], [currentLang]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBadgeIndex((prev) => (prev + 1) % badges.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [badges.length]);

  return (
    <div className="py-6 md:py-8 px-6 max-w-[1100px] mx-auto flex flex-col gap-6 md:gap-8 justify-start w-full relative z-10" id="landing-view-container">
      
      {/* Hero Section Layout */}
      <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-center w-full">
        {/* Left Column (Heading + Subtext + Trust Badges) */}
        <div className="md:col-span-7 flex flex-col items-start text-left gap-5">
          {/* Tricolor Strip (Section 6, Item 3) */}
          <div 
            className="h-[3px] w-12 rounded-[2px]" 
            style={{
              background: 'linear-gradient(to right, #FF9933 33.3%, #FFFFFF 33.3% 66.6%, #138808 66.6%)'
            }}
          />

          <h1 
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
            className="font-sans font-extrabold tracking-tight text-[#1A1A1A] leading-[1.2]"
            id="hero-title"
          >
            {currentLang === 'hi' ? (
              <>बेहतर शहर,<br />एक फ़ोटो से।</>
            ) : (
              <>Report civic issues.<br />Fast resolution.</>
            )}
          </h1>
          <p 
            className="text-[15px] text-[#5C5449] leading-[1.7] max-w-[480px] font-sans font-normal"
            id="hero-subtitle"
          >
            {currentLang === 'hi' 
              ? 'गड्ढे, टूटी लाइट, या कचरे का ढेर — बस फ़ोटो खींचें। हम सही विभाग तक खुद पहुँचा देंगे।' 
              : 'Snap a photo of a pothole, broken streetlight, or garbage pile. We route it to the right municipal department automatically — no account needed.'
            }
          </p>

          {/* Trust Badge Carousel - Animating text like before */}
          <div className="mt-2 h-7 overflow-hidden relative flex items-center w-full" id="trust-badge-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBadgeIndex}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex items-center gap-2 text-[13.5px] font-medium text-[#374151]"
              >
                {badges[currentBadgeIndex].icon}
                <span>{badges[currentBadgeIndex].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>


        </div>

        {/* Right Column (Visual Proof Element) */}
        <div className="md:col-span-5 w-full flex justify-center md:justify-end self-stretch">
          <div className="bg-white border border-[#EDE8E3] border-l-3 border-l-[#E8571A] rounded-[14px] p-[18px] pr-5 pl-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-3 w-full max-w-[320px] h-full">
            {/* Header */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#E8571A] animate-pulse-custom"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#E8571A]"></span>
              </span>
              <span className="text-[12px] font-bold text-[#E8571A]">
                {currentLang === 'hi' ? 'हाल ही में समाधान' : 'Recently resolved'}
              </span>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
              {/* Item 1 */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A1A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] inline-block shrink-0"></span>
                  <span>
                    {currentLang === 'hi' ? 'सड़क के गड्ढे भरे गए · सिविल लाइंस' : 'Pothole filled · Civil Lines'}
                  </span>
                </div>
                <div className="text-[11px] text-[#A89F96] pl-3">
                  {currentLang === 'hi' ? '18 घंटे में समाधान' : 'Resolved in 18 hours'}
                </div>
              </div>

              <div className="border-t border-[#EDE8E3]" />

              {/* Item 2 */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A1A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8571A] inline-block shrink-0"></span>
                  <span>
                    {currentLang === 'hi' ? 'कचरा साफ किया गया · हजीरा' : 'Garbage cleared · Hazira'}
                  </span>
                </div>
                <div className="text-[11px] text-[#A89F96] pl-3">
                  {currentLang === 'hi' ? '6 घंटे में समाधान' : 'Resolved in 6 hours'}
                </div>
              </div>

              <div className="border-t border-[#EDE8E3]" />

              {/* Item 3 */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A1A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0"></span>
                  <span>
                    {currentLang === 'hi' ? 'स्ट्रीटलाइट ठीक की गई · लश्कर' : 'Streetlight fixed · Lashkar'}
                  </span>
                </div>
                <div className="text-[11px] text-[#A89F96] pl-3">
                  {currentLang === 'hi' ? '31 घंटे में समाधान' : 'Resolved in 31 hours'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-1.5 pt-2.5 mt-auto border-t border-[#EDE8E3]">
              <div className="text-center text-[12px] text-[#E8571A] font-semibold">
                {currentLang === 'hi' ? 'इस महीने 247 समस्याओं का समाधान' : '247 issues resolved this month'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Cards Section */}
      <div className="grid md:grid-cols-2 gap-6 w-full mt-0" id="portal-cards">
        {/* Citizen Card */}
        <div 
          className="bg-white border border-[#EDE8E3] border-l-4 border-l-[#E8571A] rounded-[14px] p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(26,48,87,0.04)] transition-all duration-300 shadow-xs"
          id="citizen-card"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A3057] mb-2 tracking-tight">
              {currentLang === 'en' ? 'Citizen Portal' : 'नागरिक पोर्टल'}
            </h2>
            <p className="text-[#5C5449] text-xs sm:text-sm leading-relaxed mb-4 font-sans font-normal">
              {currentLang === 'en' 
                ? 'Report problems like potholes, broken streetlights, or garbage piles in under 30 seconds. Track the live repair progress right from your inbox.'
                : 'सड़क के गड्ढे, टूटी स्ट्रीट लाइट या कचरे के ढेर जैसी समस्याओं की रिपोर्ट 30 सेकंड से कम समय में करें। सीधे अपने इनबॉक्स से मरम्मत की लाइव प्रगति को ट्रैक करें।'
              }
            </p>

            {/* Micro-Workflow Summary */}
            <ul className="space-y-2 mb-5 text-sm text-[#5C5449] pt-2">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FEF0E8] flex items-center justify-center text-[#E8571A] shrink-0">
                  <Check className="w-3 h-3 text-[#E8571A]" />
                </div>
                <span>{currentLang === 'en' ? 'No password needed — just your name & email' : 'पासवर्ड की ज़रूरत नहीं — बस अपना नाम और ईमेल दर्ज करें'}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FEF0E8] flex items-center justify-center text-[#E8571A] shrink-0">
                  <Check className="w-3 h-3 text-[#E8571A]" />
                </div>
                <span>{currentLang === 'en' ? 'Pinpoints the location automatically using your mobile phone' : 'जगह अपने आप पता चल जाती है'}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FEF0E8] flex items-center justify-center text-[#E8571A] shrink-0">
                  <Check className="w-3 h-3 text-[#E8571A]" />
                </div>
                <span>{currentLang === 'en' ? 'Just upload a photo — we handle the rest of the paperwork' : 'बस एक फ़ोटो भेजें — बाकी काम हम संभाल लेंगे'}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 mt-auto w-full">
            <button
              onClick={() => onViewChange('citizen')}
              className="w-full h-12 bg-[#E8571A] text-white rounded-[10px] px-5 font-bold text-[15px] tracking-[0.01em] border-none shadow-[0_2px_8px_rgba(232,87,26,0.3)] hover:bg-[#C94B12] active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-between"
              id="btn-report-issue"
            >
              <span>{currentLang === 'en' ? 'Report an Issue' : 'समस्या दर्ज करें'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={() => onViewChange('track')}
              className="w-full h-11 bg-[#FEF0E8] hover:bg-[#FCDDC9] text-[#E8571A] border border-[#E8D5CC] rounded-[10px] px-5 font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
              id="btn-track-issue-landing"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" className="shrink-0">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>{currentLang === 'en' ? 'Track your complaint' : 'शिकायत ट्रैक करें'}</span>
            </button>
          </div>
        </div>

        {/* Municipal Official Card */}
        <div 
          className="bg-[#F8FAFD] border border-[#EDE8E3] border-l-4 border-l-[#1A3057] rounded-[14px] p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(26,48,87,0.04)] transition-all duration-300 shadow-xs"
          id="admin-card"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A3057] mb-2 tracking-tight">
              {currentLang === 'en' ? 'Municipal Command Center' : 'नगर निगम कमांड सेंटर'}
            </h2>
            <p className="text-[#5C5449] text-xs sm:text-sm leading-relaxed mb-4 font-sans font-normal">
              {currentLang === 'en' 
                ? 'Access administrative dispatch, contractor pipeline management, before/after resolution checks, and live metrics.'
                : 'प्रशासनिक प्रेषण, ठेकेदार पाइपलाइन प्रबंधन, समाधान से पहले/बाद की जांच और लाइव मेट्रिक्स तक पहुंचें।'
              }
            </p>

            {/* Micro-Workflow Summary */}
            <ul className="space-y-2 mb-5 text-sm text-[#5C5449] pt-2">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#1A3057] shrink-0">
                  <Check className="w-3 h-3 text-[#1A3057]" />
                </div>
                <span>{currentLang === 'en' ? 'Real-time administrative pipeline workspace' : 'वास्तविक समय प्रशासनिक पाइपलाइन कार्यक्षेत्र'}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#1A3057] shrink-0">
                  <Check className="w-3 h-3 text-[#1A3057]" />
                </div>
                <span>{currentLang === 'en' ? 'Contractor assignment with timestamp logging' : 'समय-लॉगिंग के साथ ठेकेदार आवंटन'}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#1A3057] shrink-0">
                  <Check className="w-3 h-3 text-[#1A3057]" />
                </div>
                <span>{currentLang === 'en' ? 'Visual Audit of "Before" and "After" proof side-by-side' : '"पहले" और "बाद में" दृश्य प्रमाणों का साथ-साथ ऑडिट'}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onViewChange('admin')}
            style={{
              background: '#1A3057',
              border: 'none',
              borderRadius: '10px',
              height: '44px',
              width: '100%',
              fontSize: '14px',
              fontWeight: 700,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            className="hover:bg-[#243E6B] active:scale-[0.98]"
            id="btn-admin-entry"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
              strokeLinejoin="round" className="shrink-0 text-white">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>{currentLang === 'en' ? 'Admin Login' : 'प्रशासनिक लॉगिन'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
