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
import { db, auth, handleFirestoreError, OperationType, cleanUndefined } from './lib/firebase';

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

    // Save directly to Firestore
    setDoc(doc(db, 'issues', newId), cleanUndefined(newIssue))
      .catch((err) => handleFirestoreError(err, OperationType.CREATE, `issues/${newId}`));

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

    // Save directly to Firestore
    updateDoc(doc(db, 'issues', id), cleanUndefined(updatedIssue))
      .catch((err) => handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`));
  };

  // Delete issue (useful for admin housekeeping)
  const handleDeleteIssue = (id: string) => {
    deleteDoc(doc(db, 'issues', id))
      .catch((err) => handleFirestoreError(err, OperationType.DELETE, `issues/${id}`));
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

      {/* Minimal Aesthetic Footer */}
      <footer className="w-full bg-white border-t border-[#EDE8E3] py-6 text-center text-xs text-[#A89F96] font-sans relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <AshokaChakra className="w-3.5 h-3.5 text-[#E8571A]" />
            <p>
              &copy; 2026 {translations[currentLang].brand} &middot; {currentLang === 'en' ? 'Municipal Corporation Portal' : 'नगर निगम पोर्टल'}
            </p>
          </div>
          <p className="flex items-center justify-center gap-1">
            <span>{currentLang === 'en' ? 'Crafted for civic empowerment with' : 'नागरिक सशक्तिकरण के लिए निर्मित'}</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
          </p>
        </div>
      </footer>
    </div>
  );
}
