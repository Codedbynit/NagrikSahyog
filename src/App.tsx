import { useState, useEffect } from 'react';
import { Language, AppView, Issue, IssueStatus } from './types';
import { translations } from './data/translations';
import { Header, AshokaChakra } from './components/Header';
import { LandingView } from './components/LandingView';
import { CitizenReportingFlow } from './components/CitizenReportingFlow';
import { CitizenTrackFlow } from './components/CitizenTrackFlow';
import { AdminCommandCenter } from './components/AdminCommandCenter';
import { MunicipalAuthPortal } from './components/MunicipalAuthPortal';
import { ContractorPortal } from './components/ContractorPortal';
import { Sparkles, Heart } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, cleanUndefined, isFirebaseConfigured } from './lib/firebase';
import { motion } from 'motion/react';

const DEFAULT_ISSUES: Issue[] = [
  {
    id: "NS-8436",
    name: "Priya Sharma",
    email: "priya.sharma@yahoo.com",
    latitude: 28.62688964395901,
    longitude: 77.22922281881877,
    address: "Ward 3, Sector 4",
    landmark: "Metro Pillar 74",
    department: "electricity",
    description: "Power distribution box left unlocked and fully exposed to rain water.",
    beforeImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
    status: "unassigned"
  },
  {
    id: "NS-2413",
    name: "Rohan Verma",
    email: "rohan.verma@service.co",
    latitude: 28.606274078382658,
    longitude: 77.21946066456672,
    address: "Ward 1, Sector 6",
    landmark: "Metro Pillar 41",
    department: "electricity",
    description: "High-voltage electrical wire hanging dangerously low near residential entry gate.",
    beforeImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    status: "unassigned"
  }
];

export default function App() {
  // Global States
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [issues, setIssues] = useState<Issue[]>(DEFAULT_ISSUES);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Notification States
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Monitor network online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to auth state on mount
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return () => unsubAuth();
  }, []);

  // Load issues from backend Firestore on mount with a real-time snapshot listener
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setCheckingAuth(false);
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'issues'),
      (snapshot) => {
        const data: Issue[] = [];
        snapshot.forEach((docSnapshot) => {
          data.push(docSnapshot.data() as Issue);
        });
        // Sort issues alphabetically descending by ticket ID to keep the newest issues at the top
        data.sort((a, b) => b.id.localeCompare(a.id));
        setIssues(data.length > 0 ? data : DEFAULT_ISSUES);
        setIsOffline(false);
      },
      (error) => {
        const errMsg = error instanceof Error ? error.message : String(error);
        const errCode = (error as any)?.code;
        // Handle connection/offline error gracefully
        if (errCode === 'unavailable' || errMsg.toLowerCase().includes('unavailable') || errMsg.toLowerCase().includes('could not reach')) {
          console.warn("Firestore is operating in offline mode. Using local/cached issues.");
          setIsOffline(true);
        } else {
          handleFirestoreError(error, OperationType.LIST, 'issues');
        }
      }
    );
    return () => unsub();
  }, []);

  // Switch Language Toggle
  const handleLanguageToggle = () => {
    setCurrentLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  // Add a new issue filed by citizen
  const handleIssueSubmit = (
    newIssueData: Omit<Issue, 'id' | 'status'> & { id?: string; status?: IssueStatus }
  ): string => {
    // Generate a unique Ticket ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `NS-${randomNum}`;

    const newIssue: Issue = {
      ...newIssueData,
      id: newId,
      status: 'unassigned', // Always starts as unassigned
    };

    // Optimistically update local state immediately
    setIssues((prev) => [newIssue, ...prev]);

    // Save directly to Firestore
    if (isFirebaseConfigured) {
      setDoc(doc(db, 'issues', newId), cleanUndefined(newIssue))
        .catch((err) => handleFirestoreError(err, OperationType.CREATE, `issues/${newId}`));
    }

    return newId;
  };

  // Update an issue status (e.g. unassigned -> in_progress -> pending -> resolved)
  const handleUpdateIssueStatus = (
    id: string,
    newStatus: IssueStatus,
    extraFields?: Partial<Issue>
  ) => {
    const targetIssue = issues.find(i => i.id === id);
    if (!targetIssue) return;

    const updatedIssue = {
      ...targetIssue,
      status: newStatus,
      ...extraFields,
    };

    // Optimistically update local state immediately so UI responds instantly
    setIssues((prev) => prev.map((item) => (item.id === id ? updatedIssue : item)));

    // Save directly to Firestore using setDoc (so if it's a memory-only seed issue, it is created automatically)
    const sendStatusEmail = () => {
      // Trigger status email notifications via Resend for dispatched & resolved states
      if (newStatus === 'in_progress' || newStatus === 'resolved') {
        console.log(`[Status Update] Triggering notification dispatch for ticket ${id} [Status: ${newStatus}]`);
        fetch('/api/send-status-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            issue: updatedIssue,
            newStatus: newStatus,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(`[Status Notification Success]:`, data);
          })
          .catch((err) => {
            console.error(`[Status Notification Network/Fetch Error]:`, err);
          });
      }
    };

    if (isFirebaseConfigured) {
      setDoc(doc(db, 'issues', id), cleanUndefined(updatedIssue))
        .then(() => sendStatusEmail())
        .catch((err) => handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`));
    } else {
      sendStatusEmail();
    }
  };

  // Delete issue (useful for admin housekeeping)
  const handleDeleteIssue = (id: string) => {
    // Optimistically update local state
    setIssues((prev) => prev.filter((item) => item.id !== id));

    if (isFirebaseConfigured) {
      deleteDoc(doc(db, 'issues', id))
        .catch((err) => handleFirestoreError(err, OperationType.DELETE, `issues/${id}`));
    }
  };

  const handleSignOut = () => {
    signOut(auth).catch((err) => console.error("Error signing out:", err));
  };

  // Compute live dashboard counts
  const unassignedCount = issues.filter((i) => i.status === 'unassigned').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  return (
    <div className={`min-h-screen bg-[#FAFAF8] text-[#1A1A1A] flex flex-col antialiased select-none overflow-x-hidden w-full relative ${currentLang === 'hi' ? 'lang-hi' : 'lang-en'}`}>
      
      {/* Ambient Backdrop Globs for Glassmorphism Pop */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-[#E8571A]/3 blur-[120px]" />
        <div className="absolute top-[45%] right-[5%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-[#1A3057]/3 blur-[100px]" />
      </div>

      {/* Global Header */}
      <Header
        currentLang={currentLang}
        onLanguageToggle={handleLanguageToggle}
        currentView={currentView}
        onViewChange={setCurrentView}
        unreadNotifCount={unreadNotifCount}
        isNotifDrawerOpen={isNotifDrawerOpen}
        onToggleNotifDrawer={() => setIsNotifDrawerOpen((prev) => !prev)}
        user={user}
        onSignOut={handleSignOut}
      />

      {isOffline && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-xs font-bold font-mono tracking-wide flex items-center justify-center gap-2 z-50 shadow-md relative" id="offline-mode-banner">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>
            {currentLang === 'hi'
              ? 'ऑफ़लाइन मोड: सर्वर उपलब्ध नहीं है। स्थानीय कैश और बीज शिकायतों का उपयोग कर रहे हैं।'
              : 'OFFLINE MODE: Server unavailable. Operating using local cache & default seed complaints.'}
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full relative z-10 focus:outline-none" tabIndex={-1}>
        {currentView === 'landing' && (
          <LandingView
            currentLang={currentLang}
            onViewChange={setCurrentView}
            unassignedCount={unassignedCount}
            resolvedCount={resolvedCount}
            issues={issues}
          />
        )}

        {currentView === 'citizen' && (
          <CitizenReportingFlow
            currentLang={currentLang}
            issues={issues}
            onIssueSubmit={handleIssueSubmit}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            onBackToHome={() => setCurrentView('landing')}
            onViewChange={setCurrentView}
          />
        )}

        {currentView === 'track' && (
          <CitizenTrackFlow
            currentLang={currentLang}
            issues={issues}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            onBackToHome={() => setCurrentView('landing')}
            onViewChange={setCurrentView}
          />
        )}

        {currentView === 'admin' && (
          checkingAuth ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center border border-[#EDE8E3]">
                <AshokaChakra className="w-10 h-10 text-[#1A3057] animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <p className="text-xs font-bold text-[#5C5449] font-mono tracking-wider animate-pulse">
                {currentLang === 'en' ? 'VERIFYING SECURITY CLEARANCE...' : 'सुरक्षा मंजूरी का सत्यापन किया जा रहा है...'}
              </p>
            </div>
          ) : !user ? (
            <MunicipalAuthPortal
              currentLang={currentLang}
              onBackToHome={() => setCurrentView('landing')}
              onSuccess={() => setCurrentView('admin')}
            />
          ) : user.displayName?.toLowerCase().includes('contractor') ? (
            <ContractorPortal
              currentLang={currentLang}
              contractorName={user.displayName.split('|')[0].trim()}
              issues={issues}
              onUpdateIssueStatus={handleUpdateIssueStatus}
              onBackToHome={() => setCurrentView('landing')}
              onSignOut={handleSignOut}
            />
          ) : (
            <AdminCommandCenter
              currentLang={currentLang}
              issues={issues}
              onUpdateIssueStatus={handleUpdateIssueStatus}
              onDeleteIssue={handleDeleteIssue}
              onBackToHome={() => setCurrentView('landing')}
              onIssueSubmit={handleIssueSubmit}
              isNotifDrawerOpen={isNotifDrawerOpen}
              setIsNotifDrawerOpen={setIsNotifDrawerOpen}
              onUnreadCountChange={setUnreadNotifCount}
            />
          )
        )}
      </main>

      {/* High-Fidelity Professional Footer */}
      {!(currentView === 'admin' && user) && (
        <motion.footer 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full bg-white border-t border-[#EDE8E3] pt-12 pb-8 text-xs text-[#5C5449] font-sans relative z-10" 
          id="site-footer"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 pb-10 border-b border-[#F5F5F5]">
              {/* Column 1: Brand & About */}
              <div className="md:col-span-4 flex flex-col items-start gap-4">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity cursor-pointer"
                  id="footer-brand-logo"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 shrink-0 overflow-hidden">
                    <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g transform="rotate(0, 50, 50)">
                        <path d="M 50 48 C 45 40, 41 32, 39 26 C 41 25, 43 27, 44 30 C 46 36, 48 43, 50 48 Z" fill="#FDA4AF" />
                        <path d="M 50 48 C 45 40, 36 29, 31 23 C 40 21, 46 29, 49 32 C 49 28, 50 21, 50 21 C 51 21, 51 28, 51 32 C 54 29, 60 21, 69 23 C 64 29, 55 40, 50 48 Z" fill="#EF4444" />
                        <circle cx="50" cy="14" r="5.5" fill="#EF4444" />
                      </g>
                      <g transform="rotate(90, 50, 50)">
                        <path d="M 50 48 C 45 40, 41 32, 39 26 C 41 25, 43 27, 44 30 C 46 36, 48 43, 50 48 Z" fill="#7DD3FC" />
                        <path d="M 50 48 C 45 40, 36 29, 31 23 C 40 21, 46 29, 49 32 C 49 28, 50 21, 50 21 C 51 21, 51 28, 51 32 C 54 29, 60 21, 69 23 C 64 29, 55 40, 50 48 Z" fill="#2563EB" />
                        <circle cx="50" cy="14" r="5.5" fill="#2563EB" />
                      </g>
                      <g transform="rotate(180, 50, 50)">
                        <path d="M 50 48 C 45 40, 41 32, 39 26 C 41 25, 43 27, 44 30 C 46 36, 48 43, 50 48 Z" fill="#BEF264" />
                        <path d="M 50 48 C 45 40, 36 29, 31 23 C 40 21, 46 29, 49 32 C 49 28, 50 21, 50 21 C 51 21, 51 28, 51 32 C 54 29, 60 21, 69 23 C 64 29, 55 40, 50 48 Z" fill="#84CC16" />
                        <circle cx="50" cy="14" r="5.5" fill="#84CC16" />
                      </g>
                      <g transform="rotate(270, 50, 50)">
                        <path d="M 50 48 C 45 40, 41 32, 39 26 C 41 25, 43 27, 44 30 C 46 36, 48 43, 50 48 Z" fill="#FDBA74" />
                        <path d="M 50 48 C 45 40, 36 29, 31 23 C 40 21, 46 29, 49 32 C 49 28, 50 21, 50 21 C 51 21, 51 28, 51 32 C 54 29, 60 21, 69 23 C 64 29, 55 40, 50 48 Z" fill="#9333EA" />
                        <circle cx="50" cy="14" r="5.5" fill="#9333EA" />
                      </g>
                    </svg>
                  </div>
                  <span className="font-sans font-extrabold text-[15px] tracking-tight text-[#1A3057]">
                    {translations[currentLang].brand}
                  </span>
                </button>
                <p className="text-[12px] text-[#8C8276] leading-[1.6] max-w-sm">
                  {currentLang === 'en' 
                    ? "An advanced, real-time civic grievance routing platform. We leverage secure, zero-password authentication to empower citizens and expedite municipal actions."
                    : "एक उन्नत, वास्तविक समय नागरिक शिकायत रूटिंग प्लेटफॉर्म। हम नागरिकों को सशक्त बनाने और नगर निगम की कार्रवाई में तेजी लाने के लिए पासवर्ड-रहित प्रमाणीकरण का उपयोग करते हैं।"
                  }
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#FEF0E8] text-[#E8571A] font-semibold text-[10px]">
                    {currentLang === 'en' ? "Official Portal" : "आधिकारिक पोर्टल"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E8F5E3] text-[#138808] font-semibold text-[10px]">
                    {currentLang === 'en' ? "SLA 48 Hours" : "समयसीमा: 48 घंटे"}
                  </span>
                </div>
              </div>

              {/* Column 2: Civic Verticals */}
              <div className="md:col-span-3 flex flex-col items-start gap-3">
                <h4 className="text-[11px] font-bold text-[#1A3057] uppercase tracking-wider">
                  {currentLang === 'en' ? "Civic Departments" : "नागरिक विभाग"}
                </h4>
                <ul className="flex flex-col gap-2 text-[#8C8276]">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#D97706]" />
                    <span>{currentLang === 'en' ? "PWD & Road Repairs" : "पीडब्ल्यूडी और सड़क मरम्मत"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#E8571A]" />
                    <span>{currentLang === 'en' ? "Public Waste & Sanitation" : "सार्वजनिक कचरा और स्वच्छता"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                    <span>{currentLang === 'en' ? "Electricity & Lighting" : "बिजली और प्रकाश व्यवस्था"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-teal-500" />
                    <span>{currentLang === 'en' ? "Water & Sewage Lines" : "पानी और सीवेज लाइनें"}</span>
                  </li>
                </ul>
              </div>

              {/* Column 3: Secure Portals */}
              <div className="md:col-span-3 flex flex-col items-start gap-3">
                <h4 className="text-[11px] font-bold text-[#1A3057] uppercase tracking-wider">
                  {currentLang === 'en' ? "Secure Access" : "सुरक्षित पहुंच"}
                </h4>
                <ul className="flex flex-col gap-2">
                  <li>
                    <button 
                      onClick={() => setCurrentView('citizen')}
                      className="text-[#8C8276] hover:text-[#E8571A] hover:underline transition-colors cursor-pointer text-left"
                    >
                      {currentLang === 'en' ? "File Civic Complaint" : "शिकायत दर्ज करें"}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setCurrentView('track')}
                      className="text-[#8C8276] hover:text-[#E8571A] hover:underline transition-colors cursor-pointer text-left"
                    >
                      {currentLang === 'en' ? "Track with Magic Link" : "मैजिक लिंक से ट्रैक करें"}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setCurrentView('admin')}
                      className="text-[#8C8276] hover:text-[#E8571A] hover:underline transition-colors cursor-pointer text-left"
                    >
                      {currentLang === 'en' ? "Municipal Command Center" : "नगर निगम कमांड सेंटर"}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 4: National Emblem Accent */}
              <div className="md:col-span-2 flex flex-col items-start md:items-end gap-3 justify-start text-left md:text-right">
                <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center border border-[#EDE8E3]">
                  <AshokaChakra className="w-6 h-6 text-[#1A3057]" />
                </div>
                <p className="text-[10px] text-[#A89F96] leading-relaxed max-w-[160px]">
                  {currentLang === 'en' 
                    ? "Digital India initiative for fast automated civic grievance resolution." 
                    : "त्वरित नागरिक शिकायत निवारण के लिए डिजिटल इंडिया पहल।"}
                </p>
              </div>
            </div>

            {/* Bottom Copyright & Heart Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A89F96]">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <span>&copy; 2026 {translations[currentLang].brand}</span>
                <span>&middot;</span>
                <span>{currentLang === 'en' ? "Municipal Corporation Gwalior Portal" : "नगर निगम ग्वालियर पोर्टल"}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[#8C8276]">
                <span>{currentLang === 'en' ? 'Crafted for civic empowerment with' : 'नागरिक सशक्तिकरण के लिए निर्मित'}</span>
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
              </div>
            </div>
          </div>
        </motion.footer>
      )}
    </div>
  );
}
