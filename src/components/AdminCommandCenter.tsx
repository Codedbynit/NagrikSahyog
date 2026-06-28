import React, { useState, useEffect, useRef } from 'react';
import { Language, Department, Issue, IssueStatus } from '../types';
import { translations } from '../data/translations';
import { 
  Briefcase, CheckCircle2, AlertCircle, Calendar, RefreshCw, 
  ChevronRight, Sparkles, MapPin, ExternalLink, Image as ImageIcon,
  Check, X, Trash2, ArrowLeft, ShieldCheck, Clock, Star, Bell, BellOff,
  Filter, ArrowUpDown, ChevronDown, ChevronUp, Eye, Wrench, Lightbulb, Droplet,
  Mail, AlertTriangle
} from 'lucide-react';
import { PhotoLightbox } from './PhotoLightbox';

interface AdminCommandCenterProps {
  currentLang: Language;
  issues: Issue[];
  onUpdateIssueStatus: (id: string, newStatus: IssueStatus, extra?: Partial<Issue>) => void;
  onDeleteIssue?: (id: string) => void;
  onBackToHome: () => void;
  onIssueSubmit: (newIssue: Omit<Issue, 'id' | 'status'> & { id?: string; status?: IssueStatus }) => string;
  isNotifDrawerOpen: boolean;
  setIsNotifDrawerOpen: (isOpen: boolean) => void;
  onUnreadCountChange: (count: number) => void;
}

// Mock Citizens for simulation
const mockCitizens = [
  { name: "Aarav Mehta", email: "aarav.mehta@gmail.com" },
  { name: "Priya Sharma", email: "priya.sharma@yahoo.com" },
  { name: "Amit Patel", email: "amit.patel@outlook.com" },
  { name: "Neha Gupta", email: "neha.gupta@nagrik.in" },
  { name: "Vikram Singh", email: "vikram.singh@civic.org" },
  { name: "Rohan Verma", email: "rohan.verma@service.co" }
];

// Mock Descriptions for simulation
const mockDescriptions: Record<Department, string[]> = {
  pwd: [
    "Huge pothole causing vehicles to swerve dangerously near main crossing.",
    "Road divider paint completely faded, leading to heavy traffic confusion at night.",
    "Broken concrete pavement causing sidewalk blockages for physically disabled citizens.",
    "Speed breaker lacks yellow reflective paint, extremely hard to notice at night."
  ],
  sanitation: [
    "Large domestic garbage pile neglected near the sector public school entrance.",
    "Industrial cardboard and plastic bags dumped illegally along the highway bypass.",
    "Public park trash bins completely overflowing and spreading a foul stench.",
    "Severe community waste accumulation blocking the stormwater drainage duct."
  ],
  electricity: [
    "Main street lamppost flickering continuously, creating dark blindspots on the road.",
    "High-voltage electrical wire hanging dangerously low near residential entry gate.",
    "Power distribution box left unlocked and fully exposed to rain water.",
    "Local block transformer failure causing complete blackout after 7 PM."
  ],
  water: [
    "Clean municipal drinking water spraying violently from fractured main pipe joint.",
    "Hazardous sewer water backflowing onto the local vegetable market lane.",
    "Silt-contaminated tap water supplied across Sector 4 residential flats.",
    "Clogged sewer drainage causing knee-deep waterlogging inside the bus terminal."
  ]
};

// Mock Before Images
const mockImagesBefore: Record<Department, string[]> = {
  pwd: [
    "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1599740831114-171d1f148b88?auto=format&fit=crop&w=600&q=80"
  ],
  sanitation: [
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80"
  ],
  electricity: [
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80"
  ],
  water: [
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80"
  ]
};

const DEPARTMENT_CONTRACTORS: Record<Department, string[]> = {
  pwd: ["Standard Roads Co.", "Vikas Highway Corp", "Urban Infra Partners"],
  sanitation: ["Shine Sanitation Group", "Green India Waste Management", "Eco-Clean Solutions"],
  electricity: ["Apex Power Services", "Bharat Lighting Ltd", "GridCare Electricals"],
  water: ["Pure Stream Plumbing", "Delhi Waterworks Contractors", "AquaFlow Engineering"]
};

const AFTER_PRESETS: Record<Department, string> = {
  pwd: "https://images.unsplash.com/photo-1594818378822-41f345b0edd9?auto=format&fit=crop&w=600&q=80",
  sanitation: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
  electricity: "https://images.unsplash.com/photo-1473116763269-255415c4ff6a?auto=format&fit=crop&w=600&q=80",
  water: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
};

const DEPT_INFO: Record<Department, { label: string; labelHi: string; icon: React.ReactNode; border: string; bg: string; text: string }> = {
  pwd: {
    label: "PWD & Roads",
    labelHi: "लोक निर्माण",
    icon: <Wrench className="w-4 h-4 shrink-0" />,
    border: "border-amber-600",
    bg: "bg-amber-50/50",
    text: "text-amber-800"
  },
  sanitation: {
    label: "Public Waste & Sanitation",
    labelHi: "अपशिष्ट व स्वच्छता",
    icon: <Trash2 className="w-4 h-4 shrink-0" />,
    border: "border-emerald-600",
    bg: "bg-emerald-50/50",
    text: "text-emerald-800"
  },
  electricity: {
    label: "Electricity & Lighting",
    labelHi: "बिजली और प्रकाश",
    icon: <Lightbulb className="w-4 h-4 shrink-0" />,
    border: "border-amber-700",
    bg: "bg-amber-50/40",
    text: "text-amber-900"
  },
  water: {
    label: "Water & Sewage",
    labelHi: "जल और सीवेज",
    icon: <Droplet className="w-4 h-4 shrink-0" />,
    border: "border-sky-600",
    bg: "bg-sky-50/50",
    text: "text-sky-800"
  }
};

interface NotificationItem {
  id: string;
  ticketId: string;
  citizenName: string;
  description: string;
  department: Department;
  reportedAt: Date;
  read: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
}

const AIVerificationCard: React.FC<{ currentLang: Language }> = ({ currentLang }) => {
  const [stepStates, setStepStates] = useState<'pending' | 'active' | 'done'[]>(['active', 'pending', 'pending']);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStepStates(['done', 'active', 'pending']);
    }, 800);
    const t2 = setTimeout(() => {
      setStepStates(['done', 'done', 'active']);
    }, 1600);
    const t3 = setTimeout(() => {
      setStepStates(['done', 'done', 'done']);
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="bg-[#F8FAFD] border border-[#C7D7ED] border-l-4 border-l-[#1A3057] rounded-xl p-4 mt-4 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#1A3057] animate-spin" />
          <span className="text-xs font-semibold text-[#1A3057] uppercase tracking-wider font-mono">
            {currentLang === 'hi' ? 'एआई सत्यापन प्रगति पर है' : 'AI Verification in progress'}
          </span>
        </div>
        <span className="text-[10px] bg-[#EEF2F8] text-[#6B85A6] font-bold px-2 py-0.5 rounded-full uppercase">
          Powered by Vision AI
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#EEF2F8] h-[3px] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#E8571A] to-[#1A3057] rounded-full animate-ai-progress" style={{ width: '100%' }} />
      </div>

      {/* Steps list */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 text-xs text-text-secondary">
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            {stepStates[0] === 'done' ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : stepStates[0] === 'active' ? <RefreshCw className="w-3 h-3 text-primary animate-spin" /> : <span className="w-3 h-3 rounded-full border border-slate-300 block"></span>}
          </div>
          <span className={stepStates[0] === 'active' ? 'font-semibold text-navy' : ''}>
            {currentLang === 'hi' ? 'पहले की तस्वीर का विश्लेषण किया जा रहा है...' : 'Analyzing before photo...'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-text-secondary">
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            {stepStates[1] === 'done' ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : stepStates[1] === 'active' ? <RefreshCw className="w-3 h-3 text-primary animate-spin" /> : <span className="w-3 h-3 rounded-full border border-slate-300 block"></span>}
          </div>
          <span className={stepStates[1] === 'active' ? 'font-semibold text-navy' : ''}>
            {currentLang === 'hi' ? 'बाद की तस्वीर का विश्लेषण किया जा रहा है...' : 'Analyzing after photo...'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-text-secondary">
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            {stepStates[2] === 'done' ? <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> : stepStates[2] === 'active' ? <RefreshCw className="w-3 h-3 text-primary animate-spin" /> : <span className="w-3 h-3 rounded-full border border-slate-300 block"></span>}
          </div>
          <span className={stepStates[2] === 'active' ? 'font-semibold text-navy' : ''}>
            {currentLang === 'hi' ? 'समाधान सटीकता स्कोर की गणना की जा रही है...' : 'Computing resolution confidence...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  currentLang,
  issues,
  onUpdateIssueStatus,
  onDeleteIssue,
  onBackToHome,
  onIssueSubmit,
  isNotifDrawerOpen,
  setIsNotifDrawerOpen,
  onUnreadCountChange,
}) => {
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<Department>('pwd');

  // Problem 1: Virtual Scrolling States & Refs
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({
    'pwd-unassigned': 8,
    'pwd-in_progress': 8,
    'pwd-pending': 8,
    'pwd-resolved': 8,
    'pwd-dispatched': 8,
    'pwd-auditing': 8,
    'sanitation-unassigned': 8,
    'sanitation-in_progress': 8,
    'sanitation-pending': 8,
    'sanitation-resolved': 8,
    'sanitation-dispatched': 8,
    'sanitation-auditing': 8,
    'electricity-unassigned': 8,
    'electricity-in_progress': 8,
    'electricity-pending': 8,
    'electricity-resolved': 8,
    'electricity-dispatched': 8,
    'electricity-auditing': 8,
    'water-unassigned': 8,
    'water-in_progress': 8,
    'water-pending': 8,
    'water-resolved': 8,
    'water-dispatched': 8,
    'water-auditing': 8,
    'PWD-unassigned': 8,
    'PWD-dispatched': 8,
    'PWD-auditing': 8,
    'PWD-resolved': 8,
    'SANITATION-unassigned': 8,
    'SANITATION-dispatched': 8,
    'SANITATION-auditing': 8,
    'SANITATION-resolved': 8,
    'ELECTRICITY-unassigned': 8,
    'ELECTRICITY-dispatched': 8,
    'ELECTRICITY-auditing': 8,
    'ELECTRICITY-resolved': 8,
    'WATER-unassigned': 8,
    'WATER-dispatched': 8,
    'WATER-auditing': 8,
    'WATER-resolved': 8,
  });

  const colRefUnassigned = useRef<HTMLDivElement>(null);
  const colRefInProgress = useRef<HTMLDivElement>(null);
  const colRefPending = useRef<HTMLDivElement>(null);
  const colRefResolved = useRef<HTMLDivElement>(null);

  // Problem 2: Paginated Batch View for Unassigned Column
  const [unassignedPages, setUnassignedPages] = useState<Record<Department, number>>({
    pwd: 1,
    sanitation: 1,
    electricity: 1,
    water: 1,
  });

  const UNASSIGNED_PAGE_SIZE = 5;

  // Sync scroll listeners for columns
  useEffect(() => {
    const el = colRefInProgress.current;
    if (!el) return;
    const ticketsCount = issues.filter(i => i.department === activeTab && i.status === 'in_progress').length;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        setVisibleCounts(prev => {
          const currentCount = prev[`${activeTab}-dispatched`] ?? prev[`${activeTab}-in_progress`] ?? 8;
          const nextCount = Math.min(currentCount + 8, ticketsCount);
          return {
            ...prev,
            [`${activeTab}-dispatched`]: nextCount,
            [`${activeTab}-in_progress`]: nextCount,
            [`${activeTab.toUpperCase()}-dispatched`]: nextCount,
          };
        });
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [issues, activeTab]);

  useEffect(() => {
    const el = colRefPending.current;
    if (!el) return;
    const ticketsCount = issues.filter(i => i.department === activeTab && i.status === 'pending').length;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        setVisibleCounts(prev => {
          const currentCount = prev[`${activeTab}-auditing`] ?? prev[`${activeTab}-pending`] ?? 8;
          const nextCount = Math.min(currentCount + 8, ticketsCount);
          return {
            ...prev,
            [`${activeTab}-auditing`]: nextCount,
            [`${activeTab}-pending`]: nextCount,
            [`${activeTab.toUpperCase()}-auditing`]: nextCount,
          };
        });
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [issues, activeTab]);

  useEffect(() => {
    const el = colRefResolved.current;
    if (!el) return;
    const ticketsCount = issues.filter(i => i.department === activeTab && i.status === 'resolved').length;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        setVisibleCounts(prev => {
          const currentCount = prev[`${activeTab}-resolved`] ?? 8;
          const nextCount = Math.min(currentCount + 8, ticketsCount);
          return {
            ...prev,
            [`${activeTab}-resolved`]: nextCount,
            [`${activeTab.toUpperCase()}-resolved`]: nextCount,
          };
        });
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [issues, activeTab]);

  // Reset page when activeTab changes
  useEffect(() => {
    setUnassignedPages(prev => ({ ...prev, [activeTab]: 1 }));
  }, [activeTab]);

  // Multi-View Page Navigation
  const [activePage, setActivePage] = useState<'dashboard' | 'department-detail'>('dashboard');
  const [selectedDept, setSelectedDept] = useState<Department>('pwd');

  // Filtering & Sorting for Department Detail Page
  const [detailFilter, setDetailFilter] = useState<'all' | IssueStatus>('all');
  const [detailSort, setDetailSort] = useState<'newest' | 'oldest' | 'status' | 'priority'>('newest');

  // Ticket Detail Drawer States
  const [detailIssue, setDetailIssue] = useState<Issue | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);
  const [showRejectionForm, setShowRejectionForm] = useState<boolean>(false);
  const [rejectionNotes, setRejectionNotes] = useState<string>('');

  useEffect(() => {
    if (!isDetailDrawerOpen) {
      setShowRejectionForm(false);
      setRejectionNotes('');
    }
  }, [isDetailDrawerOpen, detailIssue?.id]);

  // Notification State Grouped in One State
  const [notificationState, setNotificationState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
  });

  // Collapsible Notification Groups State
  const [collapsedGroups, setCollapsedGroups] = useState<Record<Department, boolean>>({
    pwd: false,
    sanitation: false,
    electricity: false,
    water: false,
  });

  // Live Toast System State
  const [toast, setToast] = useState<{
    message: string;
    dept?: Department;
    ticketId?: string;
    isMulti?: boolean;
    visible: boolean;
  } | null>(null);

  // Lightbox State
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    beforePhoto: string | null;
    afterPhoto: string | null;
    ticketId: string | null;
    citizenName: string | null;
    contractorName: string | null;
  }>({
    isOpen: false,
    beforePhoto: null,
    afterPhoto: null,
    ticketId: null,
    citizenName: null,
    contractorName: null,
  });

  // Keep track of which issue IDs are known so we don't trigger old notifications
  const knownIssueIds = useRef<Set<string>>(new Set());
  const newArrivalsRef = useRef<Issue[]>([]);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize known issue list on mount
  useEffect(() => {
    issues.forEach((issue) => {
      knownIssueIds.current.add(issue.id);
    });
  }, []);

  // Automated AI Audit process for resolving contractor proofs
  useEffect(() => {
    const auditingIssues = issues.filter(issue => issue.status === 'pending' && issue.aiAuditing);
    if (auditingIssues.length === 0) return;

    auditingIssues.forEach(issue => {
      const timer = setTimeout(() => {
        // Generate a confidence score from 30 to 98 to cover all three ranges
        const confidence = Math.floor(Math.random() * 69) + 30;
        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + now.toLocaleDateString([], { month: 'short', day: 'numeric' });

        if (confidence >= 75) {
          // AUTO-APPROVED -> Resolved & Closed
          const findings = ['Area cleared', 'Surface restored', 'Site matches'];
          onUpdateIssueStatus(issue.id, 'resolved', {
            aiAuditing: false,
            aiAuditCompleted: true,
            aiConfidence: confidence,
            aiFlagged: false,
            aiAutoRejected: false,
            aiFindings: findings,
            resolvedAt: timestamp,
          });
          if (detailIssue && detailIssue.id === issue.id) {
            setDetailIssue(prev => prev ? { 
              ...prev, 
              status: 'resolved', 
              aiAuditing: false, 
              aiAuditCompleted: true, 
              aiConfidence: confidence, 
              aiFlagged: false,
              aiAutoRejected: false,
              aiFindings: findings,
              resolvedAt: timestamp 
            } : null);
          }
        } else if (confidence >= 50) {
          // FLAGGED FOR REVIEW -> remains pending, flagged is true
          let findings: string[] = [];
          if (issue.department === 'pwd') {
            findings = ['Partial completion detected', 'Angle mismatch', 'Surface variance'];
          } else if (issue.department === 'sanitation') {
            findings = ['Scattered debris remaining', 'Angle mismatch', 'Scattered waste'];
          } else if (issue.department === 'electricity') {
            findings = ['Lighting difference — unclear', 'Angle mismatch', 'Low illumination'];
          } else {
            findings = ['Minor pooling remains', 'Wet soil footprint', 'Angle mismatch'];
          }
          
          const reasoning = "The AI detected that the after-photo may show incomplete work. The right section of the frame appears unchanged from the before-photo. Manual review recommended.";

          onUpdateIssueStatus(issue.id, 'pending', {
            aiAuditing: false,
            aiAuditCompleted: true,
            aiConfidence: confidence,
            aiFlagged: true,
            aiAutoRejected: false,
            aiFindings: findings,
            aiReasoning: reasoning,
          });
          if (detailIssue && detailIssue.id === issue.id) {
            setDetailIssue(prev => prev ? { 
              ...prev, 
              status: 'pending', 
              aiAuditing: false, 
              aiAuditCompleted: true, 
              aiConfidence: confidence, 
              aiFlagged: true,
              aiAutoRejected: false,
              aiFindings: findings,
              aiReasoning: reasoning,
            } : null);
          }
        } else {
          // AUTO-REJECTED -> moves back to in_progress (Contractor Dispatched)
          const findings = ['Before and after appear identical', 'Issue area not visible in photo'];
          onUpdateIssueStatus(issue.id, 'in_progress', {
            aiAuditing: false,
            aiAuditCompleted: true,
            aiConfidence: confidence,
            aiFlagged: false,
            aiAutoRejected: true,
            aiFindings: findings,
            // Keep afterImage so officer can see what photo was uploaded, but the state is now in_progress
          });
          if (detailIssue && detailIssue.id === issue.id) {
            setDetailIssue(prev => prev ? { 
              ...prev, 
              status: 'in_progress', 
              aiAuditing: false, 
              aiAuditCompleted: true, 
              aiConfidence: confidence, 
              aiFlagged: false,
              aiAutoRejected: true,
              aiFindings: findings,
            } : null);
          }
        }
      }, 2500);

      return () => clearTimeout(timer);
    });
  }, [issues, onUpdateIssueStatus, detailIssue]);

  // Detector of new issue additions to generate notifications and toast batches
  useEffect(() => {
    const newlyAddedIssues = issues.filter(issue => !knownIssueIds.current.has(issue.id));
    if (newlyAddedIssues.length > 0) {
      newlyAddedIssues.forEach(issue => knownIssueIds.current.add(issue.id));

      const freshNotifs: NotificationItem[] = newlyAddedIssues.map(issue => ({
        id: `NOTIF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        ticketId: issue.id,
        citizenName: issue.name,
        description: issue.description,
        department: issue.department,
        reportedAt: new Date(),
        read: false,
      }));

      // Update Notifications State in single batch
      setNotificationState(prev => {
        const mergedList = [...freshNotifs, ...prev.notifications].slice(0, 50);
        const nextUnreadCount = prev.unreadCount + freshNotifs.length;
        return {
          ...prev,
          notifications: mergedList,
          unreadCount: nextUnreadCount,
        };
      });

      // Add to batch toast ref
      newArrivalsRef.current.push(...newlyAddedIssues);

      // Debounce Toast for 3 seconds
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = setTimeout(() => {
        const currentBatch = [...newArrivalsRef.current];
        newArrivalsRef.current = []; // flush queue
        if (currentBatch.length === 0) return;

        let message = '';
        let dept: Department | undefined = undefined;
        let ticketId: string | undefined = undefined;
        let isMulti = false;

        if (currentBatch.length === 1) {
          const single = currentBatch[0];
          dept = single.department;
          ticketId = single.id;
          const deptName = currentLang === 'en' ? DEPT_INFO[dept].label : DEPT_INFO[dept].labelHi;
          message = currentLang === 'en' 
            ? `1 new issue in ${deptName}` 
            : `${deptName} में 1 नया मामला मिला`;
        } else if (currentBatch.length <= 5) {
          const distinctDepts = Array.from(new Set(currentBatch.map(i => i.department)));
          message = currentLang === 'en'
            ? `${currentBatch.length} new issues across ${distinctDepts.length} departments`
            : `${distinctDepts.length} विभागों में ${currentBatch.length} नई शिकायतें`;
          isMulti = true;
        } else {
          message = currentLang === 'en'
            ? 'Multiple new issues — check notifications'
            : 'कई नई शिकायतें — अधिसूचनाएं देखें';
          isMulti = true;
        }

        setToast({
          message,
          dept,
          ticketId,
          isMulti,
          visible: true,
        });
      }, 3000);
    }
  }, [issues, currentLang]);

  // Auto Dismiss Toast after 4 seconds
  useEffect(() => {
    if (toast && toast.visible) {
      const dismissTimer = setTimeout(() => {
        setToast(prev => prev ? { ...prev, visible: false } : null);
      }, 4000);
      return () => clearTimeout(dismissTimer);
    }
  }, [toast]);

  // Sync unread count to parent on update
  useEffect(() => {
    onUnreadCountChange(notificationState.unreadCount);
  }, [notificationState.unreadCount, onUnreadCountChange]);

  // Sync scroll lock for modals
  useEffect(() => {
    const isLockRequired = isNotifDrawerOpen || isDetailDrawerOpen;
    if (isLockRequired) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNotifDrawerOpen, isDetailDrawerOpen]);

  // Relative Time Utility for Notification Lists
  const getRelativeTime = (reportedDate: Date) => {
    const secDiff = Math.floor((new Date().getTime() - reportedDate.getTime()) / 1000);
    if (secDiff < 60) {
      return currentLang === 'en' ? 'Just now' : 'अभी';
    }
    const minDiff = Math.floor(secDiff / 60);
    if (minDiff < 60) {
      return currentLang === 'en' ? `${minDiff}m ago` : `${minDiff} मिनट पहले`;
    }
    const hrDiff = Math.floor(minDiff / 60);
    if (hrDiff < 24) {
      return currentLang === 'en' ? `${hrDiff}h ago` : `${hrDiff} घंटे पहले`;
    }
    return reportedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mark all notifications as read handler
  const handleMarkAllRead = () => {
    setNotificationState(prev => {
      const readNotifs = prev.notifications.map(n => ({ ...n, read: true }));
      return {
        ...prev,
        notifications: readNotifs,
        unreadCount: 0,
      };
    });
  };

  // View Ticket from notification row
  const handleViewTicketFromNotif = (notif: NotificationItem) => {
    // Switch unread state
    setNotificationState(prev => {
      const list = prev.notifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
      const unreadCount = list.filter(n => !n.read).length;
      return {
        ...prev,
        notifications: list,
        unreadCount,
      };
    });

    // Close notification drawer
    setIsNotifDrawerOpen(false);

    // Find the corresponding ticket
    const ticketObj = issues.find(i => i.id === notif.ticketId);
    if (ticketObj) {
      // Trigger details drawer!
      setDetailIssue(ticketObj);
      setIsDetailDrawerOpen(true);
    }

    // Scroll fallback in dashboard context
    setTimeout(() => {
      const cardEl = document.getElementById(`ticket-card-${notif.ticketId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardEl.classList.add('ring-2', 'ring-[#1A3057]', 'ring-offset-2', 'scale-102');
        setTimeout(() => {
          cardEl.classList.remove('ring-2', 'ring-[#1A3057]', 'ring-offset-2', 'scale-102');
        }, 3500);
      }
    }, 300);
  };

  // Filter issues based on active tab
  const filteredIssues = issues.filter(issue => issue.department === activeTab);

  // Determine which issues to use for metrics based on current page/view (overall on dashboard/home screen, department-specific on detail view)
  const metricsIssues = activePage === 'department-detail'
    ? issues.filter(i => i.department === selectedDept)
    : issues;

  // Compute metrics
  const totalResolved = metricsIssues.filter(i => i.status === 'resolved').length;
  const backlogCount = metricsIssues.filter(i => i.status !== 'resolved').length;
  
  const deptOffset: Record<Department, number> = {
    pwd: 4,
    sanitation: 5,
    electricity: 2,
    water: 1
  };
  const totalSolvedLast30Days = activePage === 'department-detail'
    ? totalResolved + deptOffset[selectedDept]
    : issues.filter(i => i.status === 'resolved').length + 12;

  // Calculate feedback metrics
  const ratedIssues = metricsIssues.filter(i => i.status === 'resolved' && i.rating !== undefined);
  const averageRating = ratedIssues.length > 0 
    ? (ratedIssues.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedIssues.length).toFixed(1)
    : null;

  const handleAssignContractor = (id: string, contractorName: string) => {
    if (!contractorName) return;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    onUpdateIssueStatus(id, 'in_progress', {
      contractorName,
      assignedAt: timestamp,
    });
    // Sync active drawer issue
    if (detailIssue && detailIssue.id === id) {
      setDetailIssue(prev => prev ? { ...prev, status: 'in_progress', contractorName, assignedAt: timestamp } : null);
    }
  };

  const handleSimulateContractorFinish = (id: string, dept: Department) => {
    const defaultAfterImage = AFTER_PRESETS[dept];
    onUpdateIssueStatus(id, 'pending', {
      afterImage: defaultAfterImage,
      aiAuditing: true,
      aiAuditCompleted: false,
      aiConfidence: undefined,
      aiAuditError: undefined,
    });
    // Sync drawer
    if (detailIssue && detailIssue.id === id) {
      setDetailIssue(prev => prev ? { 
        ...prev, 
        status: 'pending', 
        afterImage: defaultAfterImage,
        aiAuditing: true,
        aiAuditCompleted: false,
        aiConfidence: undefined,
        aiAuditError: undefined,
      } : null);
    }
  };

  // Sorting & Filtering for Department Detail List
  const getSortedAndFilteredIssues = () => {
    let list = issues.filter(i => i.department === selectedDept);
    
    // Status filter
    if (detailFilter !== 'all') {
      list = list.filter(i => i.status === detailFilter);
    }

    // Sort order
    return [...list].sort((a, b) => {
      if (detailSort === 'newest') {
        return b.id.localeCompare(a.id);
      }
      if (detailSort === 'oldest') {
        return a.id.localeCompare(b.id);
      }
      if (detailSort === 'status') {
        const order: Record<IssueStatus, number> = {
          unassigned: 1,
          in_progress: 2,
          pending: 3,
          resolved: 4,
        };
        return order[a.status] - order[b.status];
      }
      if (detailSort === 'priority') {
        return b.description.length - a.description.length;
      }
      return 0;
    });
  };

  const visibleIssuesDetail = getSortedAndFilteredIssues();

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto min-h-[calc(100vh-52px)] flex flex-col relative">
      
      {/* -------------------- MAIN PAGE HEADER -------------------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-[#E4E4E7]">
        <div>
          <button
            onClick={activePage === 'department-detail' ? () => setActivePage('dashboard') : onBackToHome}
            className="inline-flex items-center gap-1.5 bg-bg text-text-secondary rounded-lg px-3 py-1.5 text-[13px] border border-border hover:bg-navy-light hover:text-navy active:scale-[0.98] transition-all duration-150 cursor-pointer mb-3 w-fit font-semibold"
            id="btn-admin-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'Back' : 'वापस जाएं'}</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight" id="admin-title">
              {activePage === 'department-detail' 
                ? (currentLang === 'en' ? `All Tickets: ${DEPT_INFO[selectedDept].label}` : `सभी शिकायतें: ${DEPT_INFO[selectedDept].labelHi}`)
                : t.admin_title
              }
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {activePage === 'department-detail'
              ? (currentLang === 'en' ? `Full-width listing for department audits · ${visibleIssuesDetail.length} cases found` : `विभाग ऑडिट हेतु पूर्ण-चौड़ाई सूची · ${visibleIssuesDetail.length} मामले उपलब्ध`)
              : t.admin_subtitle
            }
          </p>
        </div>
      </div>

      {/* -------------------- 1. METRICS STRIP (Always visible) -------------------- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" id="admin-metrics-strip">
        <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block mb-1">
              {t.metric_resolved}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-navy">{totalResolved}</span>
              <span className="text-[10px] text-green font-bold font-mono">+{metricsIssues.filter(i => i.status === 'resolved').length || 0} today</span>
            </div>
          </div>
          <div className="w-9 h-9 bg-green-light text-green rounded-lg flex items-center justify-center border border-green/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block mb-1">
              {t.metric_backlog}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">{backlogCount}</span>
              <span className="text-[10px] text-primary-dark font-bold font-mono">active backlog</span>
            </div>
          </div>
          <div className="w-9 h-9 bg-primary-light text-primary rounded-lg flex items-center justify-center border border-primary-muted/20">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block mb-1">
              {t.metric_total_30}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-navy">{totalSolvedLast30Days}</span>
              <span className="text-[10px] text-green font-bold font-mono">98.4% SLA Pass</span>
            </div>
          </div>
          <div className="w-9 h-9 bg-green-light text-green rounded-lg flex items-center justify-center border border-green/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-border border-t-2 border-t-[#E8571A] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block mb-1">
              {currentLang === 'hi' ? 'एआई द्वारा स्वचालित हल' : 'Auto-resolved by AI'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {issues.filter(i => i.status === 'resolved').length > 0 
                  ? `${Math.max(78, Math.min(96, Math.round((issues.filter(i => i.status === 'resolved' && i.aiConfidence !== undefined && i.aiConfidence >= 75).length / issues.filter(i => i.status === 'resolved').length) * 100)) || 84)}%`
                  : '84%'
                }
              </span>
              <span className="text-[9px] bg-[#E8F5E3] text-[#138808] font-bold px-1.5 py-0.5 rounded-sm font-mono flex items-center gap-0.5 whitespace-nowrap">
                ↑ No manual queue
              </span>
            </div>
          </div>
          <div className="w-9 h-9 bg-orange-50 text-[#E8571A] rounded-lg flex items-center justify-center border border-orange-100">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* -------------------- 2. VIEW CONTROLLER (DASHBOARD OR DETAIL) -------------------- */}

      {activePage === 'dashboard' ? (
        /* ======================== VIEW: KANBAN WORKSPACE ======================== */
        <div className="flex flex-col flex-1">
          {/* Tabs row with View All option */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5" id="admin-dept-tabs-row">
            <div className="overflow-x-auto pb-1" id="admin-dept-tabs-scroll">
              <div className="flex bg-navy-light/60 p-1 rounded-xl border border-border w-fit max-w-full gap-1">
                {(['pwd', 'sanitation', 'electricity', 'water'] as Department[]).map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setActiveTab(dept);
                      setSelectedDept(dept);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                      activeTab === dept 
                        ? 'bg-white text-navy shadow-xs font-bold border border-border' 
                        : 'text-text-secondary hover:text-navy'
                    }`}
                    id={`tab-${dept}`}
                  >
                    {dept === 'pwd' && t.tab_pwd}
                    {dept === 'sanitation' && t.tab_sanitation}
                    {dept === 'electricity' && t.tab_electricity}
                    {dept === 'water' && t.tab_water}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedDept(activeTab);
                setActivePage('department-detail');
              }}
              className="text-xs sm:text-[13px] font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer flex items-center gap-1 self-start sm:self-center"
              id="btn-view-all-dept-issues"
            >
              <span>{currentLang === 'hi' ? `सभी ${filteredIssues.length} शिकायतें देखें →` : `View all ${filteredIssues.length} issues →`}</span>
            </button>
          </div>

          {/* Kanban Columns */}
          <div className="grid lg:grid-cols-4 gap-4 items-start flex-1" id="pipeline-workspace">
            
            {/* COLUMN 1: Unassigned */}
            <div 
              ref={colRefUnassigned}
              style={{
                height: 'calc(100vh - 280px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth'
              }}
              className="bg-[#F5F3F0] border border-border rounded-xl p-3 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-border pb-2 sticky top-0 bg-[#F5F3F0] z-10">
                <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 select-none font-sans">
                  <span className="w-2 h-2 rounded-full bg-unassigned shrink-0"></span>
                  {t.lane_unassigned}
                </h3>
                <span className="bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-md">
                  {filteredIssues.filter(i => i.status === 'unassigned').length}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {(() => {
                  const unassignedIssues = filteredIssues.filter(i => i.status === 'unassigned');
                  const totalPages = Math.ceil(unassignedIssues.length / UNASSIGNED_PAGE_SIZE) || 1;
                  const currentPageClamped = Math.min(unassignedPages[activeTab] || 1, totalPages);
                  const displayedUnassigned = unassignedIssues.slice((currentPageClamped - 1) * UNASSIGNED_PAGE_SIZE, currentPageClamped * UNASSIGNED_PAGE_SIZE);

                  if (unassignedIssues.length === 0) {
                     return <p className="text-center text-xs text-text-muted py-10 font-sans italic">{t.no_tickets}</p>;
                  }

                  return (
                    <>
                      {displayedUnassigned.map(issue => (
                        <div 
                          key={issue.id} 
                          id={`ticket-card-${issue.id}`}
                          onClick={() => {
                            setDetailIssue(issue);
                            setIsDetailDrawerOpen(true);
                          }}
                          className="bg-white border border-border hover:border-primary-muted hover:shadow-md rounded-xl p-3.5 flex flex-col gap-2.5 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-bold text-text-muted">{issue.id}</span>
                            <span className="text-[9px] text-primary font-bold bg-primary-light border border-primary-muted/20 px-2 py-0.5 rounded font-mono">NEW</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-navy line-clamp-1">{issue.name}</h4>
                            <p className="text-[11px] text-text-secondary line-clamp-2 mt-1 leading-normal">{issue.description}</p>
                          </div>

                          {issue.address && (
                            <div className="text-[10px] text-text-secondary flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                              <span className="truncate">{issue.landmark || issue.address}</span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                            <label className="block text-[9px] font-mono font-bold text-text-muted uppercase tracking-wide mb-1 select-none">
                              {t.assign_contractor}
                            </label>
                            <select
                               onChange={(e) => handleAssignContractor(issue.id, e.target.value)}
                               defaultValue=""
                               className="block w-full px-2 py-1.5 border border-border rounded-lg text-xs text-text-secondary bg-bg hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer transition-all"
                               id={`select-contractor-${issue.id}`}
                            >
                              <option value="" disabled>{t.select_contractor}</option>
                              {DEPARTMENT_CONTRACTORS[activeTab].map(contractor => (
                                <option key={contractor} value={contractor}>{contractor}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}

                      {/* Pagination UI inside scrollable container at bottom (sticky for best UX) */}
                      <div className="sticky bottom-0 bg-[#F5F3F0] pt-3 pb-1 border-t border-border flex items-center justify-between mt-auto z-10 shadow-xs" id="unassigned-pagination-controls" onClick={(e) => e.stopPropagation()}>
                        <button
                          disabled={currentPageClamped <= 1}
                          onClick={() => {
                            setUnassignedPages(prev => ({ ...prev, [activeTab]: currentPageClamped - 1 }));
                            if (colRefUnassigned.current) colRefUnassigned.current.scrollTop = 0;
                          }}
                          className="px-2 py-1 text-[10px] font-semibold text-text-secondary bg-white border border-border hover:bg-bg rounded-lg disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer font-sans"
                          id="btn-unassigned-prev"
                        >
                          {currentLang === 'hi' ? '← पिछला' : '← Previous'}
                        </button>
                        <span className="text-[10px] text-text-secondary font-bold font-mono">
                          {currentLang === 'hi' ? `पृष्ठ ${currentPageClamped} / ${totalPages}` : `Page ${currentPageClamped} / ${totalPages}`}
                        </span>
                        <button
                          disabled={currentPageClamped >= totalPages}
                          onClick={() => {
                            setUnassignedPages(prev => ({ ...prev, [activeTab]: currentPageClamped + 1 }));
                            if (colRefUnassigned.current) colRefUnassigned.current.scrollTop = 0;
                          }}
                          className="px-2 py-1 text-[10px] font-semibold text-text-secondary bg-white border border-border hover:bg-bg rounded-lg disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer font-sans"
                          id="btn-unassigned-next"
                        >
                          {currentLang === 'hi' ? 'अगला →' : 'Next →'}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* COLUMN 2: Contractor Dispatched */}
            <div 
              ref={colRefInProgress}
              style={{
                height: 'calc(100vh - 280px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth'
              }}
              className="bg-[#F5F3F0] border border-border rounded-xl p-3 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-border pb-2 sticky top-0 bg-[#F5F3F0] z-10">
                <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 select-none font-sans">
                  <span className="w-2 h-2 rounded-full bg-dispatched shrink-0"></span>
                  {currentLang === 'hi' ? 'कार्यकर्ता भेजा गया' : 'Contractor Dispatched'}
                </h3>
                <span className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md">
                  {filteredIssues.filter(i => i.status === 'in_progress').length}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {(() => {
                  const dispatchedIssues = filteredIssues.filter(i => i.status === 'in_progress');
                  const visibleCount = visibleCounts[`${activeTab}-in_progress`] || 8;
                  const displayedDispatched = dispatchedIssues.slice(0, visibleCount);

                  if (dispatchedIssues.length === 0) {
                    return <p className="text-center text-xs text-text-muted py-10 font-sans italic">{t.no_tickets}</p>;
                  }

                  return (
                    <>
                      {displayedDispatched.map(issue => (
                        <div 
                          key={issue.id} 
                          id={`ticket-card-${issue.id}`}
                          onClick={() => {
                            setDetailIssue(issue);
                            setIsDetailDrawerOpen(true);
                          }}
                          className="bg-white border border-border hover:border-primary-muted hover:shadow-md rounded-xl p-3.5 flex flex-col gap-2.5 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-bold text-text-muted">{issue.id}</span>
                            <span className="bg-primary-light border border-primary-muted/20 text-primary-dark text-[9px] font-bold px-2 py-0.5 rounded tracking-wide uppercase font-mono">
                              ACTIVE
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-navy line-clamp-1">{issue.name}</h4>
                            <p className="text-[11px] text-text-secondary line-clamp-2 mt-1 leading-normal">{issue.description}</p>
                          </div>

                          <div className="bg-bg p-2 rounded-lg text-[10px] border border-border">
                            <p className="text-text-secondary"><strong className="text-navy">{t.assigned_to}</strong> {issue.contractorName}</p>
                            <p className="text-text-muted mt-0.5"><strong className="text-text-secondary">{t.assigned_at}</strong> {issue.assignedAt || 'Recently'}</p>
                          </div>

                          <div className="pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSimulateContractorFinish(issue.id, issue.department)}
                              className="w-full inline-flex items-center justify-center gap-1 bg-bg hover:bg-primary-light hover:text-primary text-text-secondary font-semibold text-[10px] py-1.5 px-2 rounded-lg border border-border hover:border-primary-muted/30 transition-colors cursor-pointer uppercase font-sans"
                              id={`btn-simulate-finish-${issue.id}`}
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              Simulate Finish
                            </button>
                          </div>
                        </div>
                      ))}

                      {visibleCount < dispatchedIssues.length && (
                        <div style={{
                          textAlign: 'center',
                          padding: '12px',
                          fontSize: '11px',
                          color: '#A89F96',
                          borderTop: '1px solid #EDE8E3'
                        }} className="font-mono font-bold">
                          Showing {visibleCount} of {dispatchedIssues.length} · Scroll for more
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* COLUMN 3: Verification Pending (Auto-Auditing by AI) */}
            <div 
              ref={colRefPending}
              style={{
                height: 'calc(100vh - 280px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth'
              }}
              className="bg-[#F5F3F0] border border-border rounded-xl p-3 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-border pb-2 sticky top-0 bg-[#F5F3F0] z-10 select-none">
                <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 select-none font-sans">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0 animate-pulse"></span>
                  {currentLang === 'hi' ? 'एआई समीक्षा' : 'AI Reviewing'}
                </h3>
                <div className="flex flex-col items-end">
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md">
                    {filteredIssues.filter(i => i.status === 'pending').length}
                  </span>
                  <span className="text-[10px] text-text-muted mt-0.5 font-sans font-bold">
                    {currentLang === 'hi' ? 'स्वचालित ~3s' : 'Auto-processes in ~3s'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {(() => {
                  const pendingIssues = filteredIssues.filter(i => i.status === 'pending');
                  const visibleCount = visibleCounts[`${activeTab}-pending`] || 8;
                  const displayedPending = pendingIssues.slice(0, visibleCount);

                  if (pendingIssues.length === 0) {
                    return <p className="text-center text-xs text-text-muted py-10 font-sans italic">{t.no_tickets}</p>;
                  }

                  return (
                    <>
                      {displayedPending.map(issue => {
                        const isReviewing = issue.aiAuditing;

                        return (
                          <div 
                            key={issue.id} 
                            id={`ticket-card-${issue.id}`}
                            onClick={() => {
                              setDetailIssue(issue);
                              setIsDetailDrawerOpen(true);
                            }}
                            className="bg-white border border-border hover:border-primary-muted hover:shadow-md rounded-xl p-3.5 flex flex-col gap-2.5 transition-all duration-200 cursor-pointer animate-fade-in"
                          >
                            {isReviewing ? (
                              /* AI Processing state card */
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[9px] font-bold text-text-muted">{issue.id}</span>
                                  <span 
                                    className="text-[10px] font-semibold rounded-full px-2 py-0.5 uppercase tracking-wide font-mono"
                                    style={{
                                      background: 'linear-gradient(135deg, #EEF2F8, #FEF0E8)',
                                      color: '#1A3057'
                                    }}
                                  >
                                    AI PROCESSING
                                  </span>
                                </div>
                                <h4 className="text-xs font-semibold text-navy font-sans mt-1">
                                  {issue.name}
                                </h4>
                                <div 
                                  className="h-3 rounded animate-shimmer mt-2"
                                  style={{
                                    height: '12px',
                                    borderRadius: '4px'
                                  }}
                                />
                                <div className="text-[10px] text-text-muted mt-1 font-mono italic">
                                  {currentLang === 'hi' ? 'एआई सबूत विश्लेषण...' : 'Vision AI analyzing...'}
                                </div>
                              </div>
                            ) : (
                              /* Flagged or audited card */
                              <div className="flex flex-col gap-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[9px] font-bold text-text-muted">{issue.id}</span>
                                  {issue.aiFlagged && (
                                    <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                                      FLAGGED BY AI
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <h4 className="text-xs font-bold text-navy line-clamp-1">{issue.name}</h4>
                                  <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">{issue.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col gap-1">
                                    <span className="block text-[8px] font-mono font-bold text-rose-600 uppercase">Before</span>
                                    <div className="h-14 rounded overflow-hidden border border-border">
                                      <img 
                                        src={issue.beforeImage} 
                                        alt="Before" 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="block text-[8px] font-mono font-bold text-green uppercase font-semibold">After</span>
                                    <div className="h-14 rounded overflow-hidden border border-border">
                                      <img 
                                        src={issue.afterImage || AFTER_PRESETS[issue.department]} 
                                        alt="After" 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {issue.aiFlagged && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-1.5 text-[10px] text-amber-800 font-semibold">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>AI Match Score: {issue.aiConfidence}%</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {visibleCount < pendingIssues.length && (
                        <div style={{
                          textAlign: 'center',
                          padding: '12px',
                          fontSize: '11px',
                          color: '#A89F96',
                          borderTop: '1px solid #EDE8E3'
                        }} className="font-mono font-bold">
                          Showing {visibleCount} of {pendingIssues.length} · Scroll for more
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* COLUMN 4: Resolved & Closed */}
            <div 
              ref={colRefResolved}
              style={{
                height: 'calc(100vh - 280px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth'
              }}
              className="bg-[#F5F3F0] border border-border rounded-xl p-3 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-border pb-2 sticky top-0 bg-[#F5F3F0] z-10">
                <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 select-none font-sans">
                  <span className="w-2 h-2 rounded-full bg-green shrink-0"></span>
                  {currentLang === 'hi' ? 'समस्या सुलझाई गई' : 'Resolved & Closed'}
                </h3>
                <span className="bg-green-light border border-green/20 text-green-dark text-xs font-bold px-2 py-0.5 rounded-md">
                  {filteredIssues.filter(i => i.status === 'resolved').length}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {(() => {
                  const resolvedIssues = filteredIssues.filter(i => i.status === 'resolved');
                  const visibleCount = visibleCounts[`${activeTab}-resolved`] || 8;
                  const displayedResolved = resolvedIssues.slice(0, visibleCount);

                  if (resolvedIssues.length === 0) {
                    return <p className="text-center text-xs text-text-muted py-10 font-sans italic">{t.no_tickets}</p>;
                  }

                  return (
                    <>
                      {displayedResolved.map(issue => (
                        <div 
                          key={issue.id} 
                          id={`ticket-card-${issue.id}`}
                          onClick={() => {
                            setDetailIssue(issue);
                            setIsDetailDrawerOpen(true);
                          }}
                          className="bg-white border border-border hover:border-primary-muted hover:shadow-md rounded-xl p-3.5 flex flex-col gap-2.5 transition-all duration-200 cursor-pointer opacity-90 hover:opacity-100"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-bold text-text-muted">{issue.id}</span>
                            <span className="bg-green-light border border-green/20 text-green-dark text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                              CLOSED
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-navy line-clamp-1">{issue.name}</h4>
                            <p className="text-[10px] text-text-secondary line-clamp-1 mt-0.5">{issue.description}</p>
                          </div>

                          {/* Before/After Photo Thumbnails for Transparency */}
                          <div className="grid grid-cols-2 gap-2" id={`resolved-grid-${issue.id}`}>
                            <div className="flex flex-col gap-1">
                              <span className="block text-[8px] font-mono font-bold text-rose-600 uppercase">{currentLang === 'hi' ? 'पहले' : 'Before'}</span>
                              <div 
                                className="h-14 rounded overflow-hidden border border-border cursor-zoom-in"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxState({
                                    isOpen: true,
                                    beforePhoto: issue.beforeImage,
                                    afterPhoto: issue.afterImage || AFTER_PRESETS[issue.department],
                                    ticketId: issue.id,
                                    citizenName: issue.name,
                                    contractorName: issue.contractorName || null,
                                  });
                                }}
                              >
                                <img 
                                  src={issue.beforeImage} 
                                  alt="Before" 
                                  className="w-full h-full object-cover hover:scale-105 transition-transform" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="block text-[8px] font-mono font-bold text-green uppercase">{currentLang === 'hi' ? 'बाद में' : 'After'}</span>
                              <div 
                                className="h-14 rounded overflow-hidden border border-border cursor-zoom-in"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxState({
                                    isOpen: true,
                                    beforePhoto: issue.beforeImage,
                                    afterPhoto: issue.afterImage || AFTER_PRESETS[issue.department],
                                    ticketId: issue.id,
                                    citizenName: issue.name,
                                    contractorName: issue.contractorName || null,
                                  });
                                }}
                              >
                                <img 
                                  src={issue.afterImage || AFTER_PRESETS[issue.department]} 
                                  alt="After" 
                                  className="w-full h-full object-cover hover:scale-105 transition-transform" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="text-[9px] font-mono bg-bg border border-border p-2 rounded text-text-secondary">
                            <p>Solved by {issue.contractorName}</p>
                            <p className="mt-0.5">Resolved: {issue.resolvedAt || 'Recently'}</p>
                          </div>

                          {/* AI Confidence Match Score Badge */}
                          {issue.aiConfidence !== undefined && (
                            <div className="bg-green-light border border-green/20 rounded-lg py-1.5 px-2.5 flex items-center justify-between text-[10px] font-sans" id={`resolved-ai-badge-${issue.id}`}>
                              <span className="text-green-dark font-bold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-green fill-green" />
                                {currentLang === 'hi' ? `एआई मिलान: ${issue.aiConfidence}%` : `AI Match: ${issue.aiConfidence}%`}
                              </span>
                              <span className="text-green-dark font-semibold font-mono text-[9px]">
                                {currentLang === 'hi' ? 'स्वचालित रूप से हल' : 'Auto Resolved'}
                              </span>
                            </div>
                          )}

                          {issue.rating !== undefined ? (
                            <div className="bg-amber-50/55 border border-amber-100 rounded-lg p-2 flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                  <Star
                                    key={starVal}
                                    className={`w-3 h-3 ${starVal <= (issue.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                                  />
                                ))}
                                <span className="text-[9px] font-bold text-amber-700 ml-1 font-mono">
                                  {issue.rating}/5
                                </span>
                              </div>
                              {issue.feedbackText && (
                                <p className="text-[9.5px] text-text-secondary italic leading-tight">
                                  "{issue.feedbackText}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-[8.5px] text-text-muted bg-bg border border-border rounded-lg py-1 px-2.5 font-mono flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-border-dark/30"></span>
                              {t.not_rated_yet}
                            </div>
                          )}

                          {onDeleteIssue && (
                            <div className="pt-2 border-t border-border flex justify-end" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => onDeleteIssue(issue.id)}
                                className="p-1 hover:bg-bg text-text-muted hover:text-rose-600 rounded transition-colors cursor-pointer"
                                id={`btn-delete-resolved-${issue.id}`}
                                title="Delete Ticket Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {visibleCount < resolvedIssues.length && (
                        <div style={{
                          textAlign: 'center',
                          padding: '12px',
                          fontSize: '11px',
                          color: '#A89F96',
                          borderTop: '1px solid #EDE8E3'
                        }} className="font-mono font-bold">
                          Showing {visibleCount} of {resolvedIssues.length} · Scroll for more
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ======================== VIEW: DEPARTMENT DETAIL PAGE ======================== */
        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex-1 flex flex-col">
          
          {/* Sub Navigation / Filter bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border pb-5 mb-5">
            {/* Filter chips */}
            <div className="flex flex-wrap items-center gap-1.5" id="detail-filter-chips-row">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider mr-2 font-mono">
                {currentLang === 'en' ? 'Filter status:' : 'स्टेटस फ़िल्टर:'}
              </span>
              {[
                { key: 'all', label: currentLang === 'en' ? 'All Tickets' : 'सभी शिकायतें' },
                { key: 'unassigned', label: t.lane_unassigned },
                { key: 'in_progress', label: currentLang === 'hi' ? 'कार्यकर्ता भेजा गया' : 'Contractor Dispatched' },
                { key: 'pending', label: t.lane_pending },
                { key: 'resolved', label: currentLang === 'hi' ? 'समस्या सुलझाई गई' : 'Resolved & Closed' },
              ].map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setDetailFilter(chip.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all duration-150 cursor-pointer ${
                    detailFilter === chip.key 
                      ? 'bg-navy border-navy text-white shadow-xs font-bold' 
                      : 'bg-white border-border text-text-secondary hover:text-navy hover:border-text-muted'
                  }`}
                  id={`filter-chip-${chip.key}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Sorting control dropdown */}
            <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">
                {currentLang === 'en' ? 'Sort:' : 'क्रम:'}
              </span>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-text-muted pointer-events-none">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </span>
                <select
                  value={detailSort}
                  onChange={(e) => setDetailSort(e.target.value as any)}
                  className="pl-8 pr-8 py-1.5 border border-border rounded-lg text-xs font-semibold text-text-secondary bg-white hover:border-text-muted focus:outline-none cursor-pointer transition-all appearance-none"
                  id="select-detail-sorting"
                >
                  <option value="newest">{currentLang === 'en' ? 'Newest First' : 'नवीनतम पहले'}</option>
                  <option value="oldest">{currentLang === 'en' ? 'Oldest First' : 'पुराना पहले'}</option>
                  <option value="status">{currentLang === 'en' ? 'Priority Status' : 'स्थिति अनुसार'}</option>
                  <option value="priority">{currentLang === 'en' ? 'Description Length (Proxy Priority)' : 'विवरण लम्बाई (महत्व)'}</option>
                </select>
                <span className="absolute right-3 text-text-muted pointer-events-none">
                  <ChevronDown className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* Table Area (collapses to cards on mobile) */}
          {visibleIssuesDetail.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-text-muted">
                <Filter className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">
                {currentLang === 'en' ? `No tickets match "${detailFilter}" in this department` : `इस विभाग में "${detailFilter}" से मेल खाती कोई शिकायत नहीं`}
              </p>
              <button 
                onClick={() => setDetailFilter('all')}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                {currentLang === 'en' ? 'Reset status filter' : 'फ़िल्टर रीसेट करें'}
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              
              {/* Desktop Table View */}
              <table className="hidden md:table w-full text-left border-collapse" id="detail-issues-table">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono select-none">
                    <th className="py-3 px-2">Ticket ID</th>
                    <th className="py-3 px-3">Citizen</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Contractor</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {visibleIssuesDetail.map((issue) => (
                    <tr 
                      key={issue.id}
                      onClick={() => {
                        setDetailIssue(issue);
                        setIsDetailDrawerOpen(true);
                      }}
                      className="hover:bg-bg transition-colors group cursor-pointer text-text-secondary text-sm h-[52px]"
                    >
                      {/* Monospace ID */}
                      <td className="py-3 px-2 font-mono text-xs font-bold text-primary group-hover:text-primary-dark transition-colors">
                        {issue.id}
                      </td>

                      {/* Citizen name */}
                      <td className="py-3 px-3 font-semibold text-navy whitespace-nowrap">
                        {issue.name}
                      </td>

                      {/* Description tooltip */}
                      <td className="py-3 px-3 max-w-[200px]" title={issue.description}>
                        <p className="truncate text-xs text-text-secondary">
                          {issue.description}
                        </p>
                      </td>

                      {/* Location pill */}
                      <td className="py-3 px-3 max-w-[140px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg border border-border text-text-secondary rounded-md text-[10px] font-semibold truncate w-full">
                          <MapPin className="w-3 h-3 text-text-muted shrink-0" />
                          <span className="truncate">{issue.landmark || issue.address}</span>
                        </span>
                      </td>

                      {/* Status Badges */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {issue.status === 'unassigned' && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold font-sans">
                            ● {t.lane_unassigned}
                          </span>
                        )}
                        {issue.status === 'in_progress' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold font-sans">
                            ● {currentLang === 'hi' ? 'भेजा गया' : 'Dispatched'}
                          </span>
                        )}
                        {issue.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold font-sans">
                            ● {currentLang === 'hi' ? 'सत्यापन लंबित' : 'Audit Pending'}
                          </span>
                        )}
                        {issue.status === 'resolved' && (
                          <span className="inline-flex items-center gap-1 bg-green-light border border-green/20 text-green-dark px-2 py-0.5 rounded-full text-[10px] font-bold font-sans">
                            ● Solved
                          </span>
                        )}
                      </td>

                      {/* Contractor */}
                      <td className="py-3 px-3 whitespace-nowrap text-xs">
                        {issue.contractorName ? (
                          <span className="font-semibold text-text-secondary">{issue.contractorName}</span>
                        ) : (
                          <span className="text-text-muted font-mono">—</span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {issue.status === 'unassigned' && (
                          <button
                            onClick={() => {
                              setDetailIssue(issue);
                              setIsDetailDrawerOpen(true);
                            }}
                            className="bg-bg border border-border hover:bg-primary-light hover:text-primary hover:border-primary-muted text-text-secondary font-bold text-[11px] px-2.5 py-1 rounded-[6px] transition-all cursor-pointer font-sans"
                          >
                            Assign
                          </button>
                        )}
                        {issue.status === 'pending' && (
                          <button
                            onClick={() => {
                              setLightboxState({
                                isOpen: true,
                                beforePhoto: issue.beforeImage,
                                afterPhoto: issue.afterImage || null,
                                ticketId: issue.id,
                                citizenName: issue.name,
                                contractorName: issue.contractorName || null,
                              });
                            }}
                            className="bg-primary hover:bg-primary-dark text-white font-bold text-[11px] px-2.5 py-1 rounded-[6px] transition-all cursor-pointer shadow-xs font-sans"
                          >
                            Review Photos
                          </button>
                        )}
                        {issue.status === 'resolved' && (
                          <button
                            onClick={() => {
                              setDetailIssue(issue);
                              setIsDetailDrawerOpen(true);
                            }}
                            className="text-text-muted hover:text-navy font-bold text-[11px] px-2 py-1 transition-all cursor-pointer font-sans"
                          >
                            View
                          </button>
                        )}
                        {issue.status === 'in_progress' && (
                          <button
                            onClick={() => handleSimulateContractorFinish(issue.id, issue.department)}
                            className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-[11px] px-2.5 py-1 rounded-[6px] transition-all cursor-pointer font-sans"
                          >
                            Finish
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card List View (collapses elegantly on small viewports) */}
              <div className="grid grid-cols-1 gap-3 md:hidden" id="detail-issues-mobile-cards">
                {visibleIssuesDetail.map((issue) => (
                  <div 
                    key={issue.id}
                    onClick={() => {
                      setDetailIssue(issue);
                      setIsDetailDrawerOpen(true);
                    }}
                    className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-primary-muted transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">{issue.id}</span>
                      
                      {/* Mobile Status badge */}
                      {issue.status === 'unassigned' && (
                        <span className="bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          {t.lane_unassigned}
                        </span>
                      )}
                      {issue.status === 'in_progress' && (
                        <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          {currentLang === 'hi' ? 'भेजा गया' : 'Dispatched'}
                        </span>
                      )}
                      {issue.status === 'pending' && (
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          {currentLang === 'hi' ? 'सत्यापन लंबित' : 'Audit Pending'}
                        </span>
                      )}
                      {issue.status === 'resolved' && (
                        <span className="bg-green-light border border-green/20 text-green-dark px-2 py-0.5 rounded-full text-[9px] font-bold">
                          Closed
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-navy">{issue.name}</h4>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-border flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-text-muted font-mono">
                        {issue.contractorName || 'No contractor'}
                      </span>
                      {issue.status === 'unassigned' && (
                        <button
                          onClick={() => {
                            setDetailIssue(issue);
                            setIsDetailDrawerOpen(true);
                          }}
                          className="bg-bg border border-border text-text-secondary font-bold text-[10px] px-2.5 py-1 rounded-md uppercase"
                        >
                          Assign
                        </button>
                      )}
                      {issue.status === 'pending' && (
                        <button
                          onClick={() => {
                            setLightboxState({
                              isOpen: true,
                              beforePhoto: issue.beforeImage,
                              afterPhoto: issue.afterImage || null,
                              ticketId: issue.id,
                              citizenName: issue.name,
                              contractorName: issue.contractorName || null,
                            });
                          }}
                          className="bg-primary text-white font-bold text-[10px] px-2.5 py-1 rounded-md uppercase shadow-xs hover:bg-primary-dark"
                        >
                          Audit
                        </button>
                      )}
                      {issue.status === 'in_progress' && (
                        <button
                          onClick={() => handleSimulateContractorFinish(issue.id, issue.department)}
                          className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase"
                        >
                          Finish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* -------------------- 3. REALTIME TOAST ALERTS OVERLAY (Crash-safe) -------------------- */}
      {toast && toast.visible && (
        <div className="fixed bottom-6 left-6 z-[9999] animate-slide-up" id="realtime-municipal-toast">
          <div className={`bg-white border border-border rounded-xl p-4 shadow-xl flex items-center justify-between gap-4 max-w-sm w-[340px] border-l-4 ${toast.dept ? DEPT_INFO[toast.dept].border : 'border-primary'}`}>
            <div className="flex-grow min-w-0">
              <p className="text-xs font-semibold text-navy truncate">{toast.message}</p>
              <p className="text-[9px] text-text-secondary font-bold uppercase tracking-wider font-mono mt-0.5">Nagrik Sahyog Live</p>
            </div>
            <button
              onClick={() => {
                if (toast.isMulti) {
                  setNotificationState(prev => ({ ...prev, isDrawerOpen: true }));
                } else if (toast.ticketId && toast.dept) {
                  // Open this issue directly in drawer
                  const match = issues.find(i => i.id === toast.ticketId);
                  if (match) {
                    setDetailIssue(match);
                    setIsDetailDrawerOpen(true);
                  }
                  setActiveTab(toast.dept);
                }
                setToast(prev => prev ? { ...prev, visible: false } : null);
              }}
              className="bg-primary-light hover:bg-primary-muted text-primary-dark px-2.5 py-1 rounded text-xs font-bold transition-all shrink-0 cursor-pointer font-sans"
            >
              View
            </button>
          </div>
        </div>
      )}

      {/* -------------------- 4. REALTIME NOTIFICATION DRAWER -------------------- */}
      {/* Backdrop overlay */}
      <div 
        onClick={() => setIsNotifDrawerOpen(false)}
        className={`fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-300 ${
          isNotifDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        id="notif-drawer-backdrop"
      />

      {/* Drawer slide panel */}
      <div 
        className={`fixed top-0 right-0 h-full bg-[#FAFAF8] z-[9999] shadow-2xl border-l border-border transition-transform duration-300 transform ${
          isNotifDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full sm:w-[360px] flex flex-col font-sans`}
        id="notif-drawer-panel"
      >
        {/* Drawer header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-navy flex items-center gap-1.5 font-sans">
              <Bell className="w-4 h-4 text-primary" />
              <span>{currentLang === 'en' ? 'Notifications' : 'अधिसूचनाएं'}</span>
            </h2>
            <p className="text-[11px] text-text-secondary font-mono mt-0.5">
              {notificationState.unreadCount} unread reports
            </p>
          </div>

          <button
            onClick={() => setIsNotifDrawerOpen(false)}
            className="p-1 hover:bg-bg border border-transparent hover:border-border rounded text-text-secondary cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer mark-all action */}
        {notificationState.unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-border bg-bg flex justify-end shrink-0">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-primary hover:text-primary-dark hover:underline cursor-pointer"
              id="btn-mark-all-read"
            >
              {currentLang === 'en' ? 'Mark all as read' : 'सभी को पढ़ा हुआ चिह्नित करें'}
            </button>
          </div>
        )}

        {/* Drawer scrolling list with windowing max viewport constraint */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-120px)] p-3 space-y-3" id="notif-drawer-scroller">
          {notificationState.notifications.length === 0 ? (
            <div className="text-center py-24 px-4 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-text-muted">
                <BellOff className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy">
                  {currentLang === 'en' ? 'All caught up!' : 'सभी अपडेट पूर्ण हैं!'}
                </p>
                <p className="text-[11px] text-text-secondary mt-1 max-w-xs mx-auto leading-relaxed">
                  {currentLang === 'en' ? 'New public citizen reports will arrive and cluster here in real-time.' : 'नए नागरिक शिकायतें वास्तविक समय में यहां लाइव शामिल होंगी।'}
                </p>
              </div>
            </div>
          ) : (
            // Render Grouped collapsible sections
            (['pwd', 'sanitation', 'electricity', 'water'] as Department[]).map((dept) => {
              const deptNotifs = notificationState.notifications.filter(n => n.department === dept);
              if (deptNotifs.length === 0) return null;
              
              const isCollapsed = collapsedGroups[dept];
              const deptTitle = currentLang === 'en' ? DEPT_INFO[dept].label : DEPT_INFO[dept].labelHi;
              const unreadInGroup = deptNotifs.filter(n => !n.read).length;

              return (
                <div key={dept} className="border border-border rounded-xl overflow-hidden bg-bg">
                  {/* Collapsible header */}
                  <button
                    onClick={() => setCollapsedGroups(prev => ({ ...prev, [dept]: !prev[dept] }))}
                    className="w-full px-3 py-2.5 bg-white border-b border-border flex items-center justify-between hover:bg-bg transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm shrink-0">{DEPT_INFO[dept].icon}</span>
                      <span className="text-xs font-bold text-navy truncate max-w-[180px]">
                        {deptTitle}
                      </span>
                      {unreadInGroup > 0 && (
                        <span className="bg-primary text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {unreadInGroup}
                        </span>
                      )}
                    </div>
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                    )}
                  </button>

                  {/* Group items (Only rendered visible rows) */}
                  {!isCollapsed && (
                    <div className="divide-y divide-border/40 bg-white">
                      {deptNotifs.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`p-3 transition-colors text-xs flex flex-col gap-1.5 ${
                            notif.read ? 'bg-white opacity-85' : 'bg-primary-light/45'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-text-secondary font-bold">
                              {notif.ticketId}
                            </span>
                            <span className="text-[10px] text-text-secondary">
                              {getRelativeTime(notif.reportedAt)}
                            </span>
                          </div>
                          
                          <p className="text-text-secondary leading-normal">
                            <strong className="text-navy font-semibold">{notif.citizenName}</strong> reported: "{notif.description.substring(0, 55)}..."
                          </p>

                          <div className="flex justify-between items-center pt-1">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${notif.read ? 'bg-border' : 'bg-primary'}`} />
                            <button
                              onClick={() => handleViewTicketFromNotif(notif)}
                              className="text-[11px] font-bold text-primary hover:text-primary-dark hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <span>View ticket</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* -------------------- 5. REALTIME TICKET DETAIL DRAWER -------------------- */}
      {/* Backdrop overlay */}
      <div 
        onClick={() => setIsDetailDrawerOpen(false)}
        className={`fixed top-0 left-0 sm:right-[480px] right-0 h-full bg-black/40 z-[9998] transition-opacity duration-300 ${
          isDetailDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        id="detail-drawer-backdrop"
      />

      {/* Detail Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full bg-[#FAFAF8] z-[9999] shadow-2xl border-l border-border transition-transform duration-300 transform ${
          isDetailDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full sm:w-[480px] flex flex-col overflow-hidden font-sans`}
        id="detail-drawer-panel"
      >
        {detailIssue && (
          <div className="flex flex-col flex-1 h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 pr-14 border-b border-border flex items-center justify-between bg-white shrink-0 relative">
              <div>
                <span className="font-mono text-[10px] text-text-secondary uppercase tracking-wider block font-bold">
                  Nagrik Sahyog Ticket Audit
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-base font-bold text-navy font-mono">
                    {detailIssue.id}
                  </h2>
                  {/* Status Badge */}
                  {detailIssue.status === 'unassigned' && (
                    <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Unassigned
                    </span>
                  )}
                  {detailIssue.status === 'in_progress' && (
                    <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Dispatched
                    </span>
                  )}
                  {detailIssue.status === 'pending' && (
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Audit Pending
                    </span>
                  )}
                  {detailIssue.status === 'resolved' && (
                    <span className="bg-green-light border border-green/20 text-green-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Prominent Close button at top right */}
              <button 
                onClick={() => setIsDetailDrawerOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-border bg-white cursor-pointer flex items-center justify-center text-text-secondary hover:bg-bg transition-colors"
                title="Close Drawer"
                style={{
                  transition: 'background 0.15s, border-color 0.15s'
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="p-5 flex-1 overflow-y-auto overflow-x-hidden space-y-6 ticket-drawer-body">
              
              {/* Reporter Section */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-mono">
                  Reporter contact
                </span>
                <div className="bg-white border border-border p-3 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-navy">{detailIssue.name}</h4>
                    <p className="text-xs text-text-secondary font-medium">{detailIssue.email}</p>
                  </div>
                  <span className="text-[10px] bg-bg text-text-muted border border-border px-2 py-0.5 rounded-md font-bold uppercase font-mono">
                    Citizen
                  </span>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-mono">
                  Issue Description
                </span>
                <div className="bg-white border border-border p-3 rounded-xl text-xs text-text-secondary leading-relaxed font-sans">
                  {detailIssue.description}
                </div>
              </div>

              {/* Map Section */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-mono">
                  Location details
                </span>
                
                {/* Mock Map Layout */}
                <div className="relative w-full h-[180px] bg-indigo-950/95 rounded-xl border border-border overflow-hidden flex flex-col items-center justify-center select-none">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
                  
                  {/* Mock Street Grid */}
                  <div className="absolute top-1/2 left-0 w-full h-8 bg-slate-900 border-y border-slate-700/50 -translate-y-1/2"></div>
                  <div className="absolute top-0 left-1/3 w-8 h-full bg-slate-900 border-x border-slate-700/50"></div>

                  {/* Floating Coordinates Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs border border-slate-700 text-[10px] font-mono text-slate-300 font-bold px-2 py-0.5 rounded shadow-sm">
                    {detailIssue.latitude ? `${detailIssue.latitude.toFixed(5)}, ${detailIssue.longitude?.toFixed(5)}` : '28.6129, 77.2295'}
                  </div>

                  {/* Central Pin */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <MapPin className="w-8 h-8 text-rose-500 animate-bounce" fill="rgba(239, 68, 68, 0.2)" />
                  </div>
                </div>

                <div className="p-3 bg-white border border-border rounded-xl space-y-1">
                  <p className="text-xs text-navy leading-relaxed">
                    <strong className="font-semibold text-text-secondary">Address:</strong> {detailIssue.address}
                  </p>
                  {detailIssue.landmark && (
                    <p className="text-xs text-navy leading-relaxed">
                      <strong className="font-semibold text-text-secondary">Landmark:</strong> {detailIssue.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Photo Section (Before/After Layout) */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-mono">
                  Photo verification
                </span>

                {(() => {
                  const hasAfter = !!detailIssue.afterImage;
                  const isAuditing = !!detailIssue.aiAuditing;

                  if (isAuditing) {
                    return (
                      <div className="space-y-3 animate-pulse">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-rose-500 block text-center">Before</span>
                            <div className="aspect-video rounded-lg overflow-hidden border border-border bg-black">
                              <img src={detailIssue.beforeImage} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 block text-center">After</span>
                            <div className="aspect-video rounded-lg overflow-hidden border border-border bg-black">
                              <img src={detailIssue.afterImage} alt="After" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                            </div>
                          </div>
                        </div>
                        <AIVerificationCard currentLang={currentLang} />
                      </div>
                    );
                  }

                  // -------------------- RESULT STATE A: AUTO-APPROVED --------------------
                  if (hasAfter && detailIssue.aiConfidence !== undefined && detailIssue.aiConfidence >= 75) {
                    const isManualOverride = !!detailIssue.aiOfficerLog && detailIssue.aiOfficerLog.includes('Manually approved');
                    return (
                      <div 
                        className="border border-[#EDE8E3] border-l-4 border-l-[#138808] rounded-xl p-4 bg-[#F0FDF4] space-y-4 shadow-sm"
                        id={`result-state-a-${detailIssue.id}`}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#138808] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 font-bold" />
                          </div>
                          <span className="text-sm font-bold text-[#138808]">
                            {isManualOverride 
                              ? (currentLang === 'hi' ? 'अधिकारी द्वारा स्वीकृत' : 'Approved by Officer')
                              : (currentLang === 'hi' ? 'एआई सत्यापित · स्वचालित हल' : 'Verified by AI · Automatically Resolved')
                            }
                          </span>
                        </div>

                        {/* Score display */}
                        <div className="text-center py-2 bg-white/60 rounded-lg border border-[#EDE8E3]/50">
                          <span className="text-[36px] font-extrabold text-[#138808] leading-none block">
                            {detailIssue.aiConfidence}%
                          </span>
                          <span className="text-[11px] text-text-muted font-mono font-bold uppercase tracking-wider block mt-1">
                            Resolution Confidence Score
                          </span>
                        </div>

                        {/* Side by side thumbnails */}
                        <div className="space-y-1">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] text-text-muted block">Before</span>
                              <div className="h-[120px] rounded-lg overflow-hidden border border-[#EDE8E3] relative cursor-pointer"
                                onClick={() => setLightboxState({
                                  isOpen: true,
                                  beforePhoto: detailIssue.beforeImage,
                                  afterPhoto: detailIssue.afterImage || null,
                                  ticketId: detailIssue.id,
                                  citizenName: detailIssue.name,
                                  contractorName: detailIssue.contractorName || null,
                                })}
                              >
                                <img src={detailIssue.beforeImage} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-[#138808] font-semibold block">After</span>
                              <div className="h-[120px] rounded-lg overflow-hidden border border-[#EDE8E3] relative cursor-pointer"
                                onClick={() => setLightboxState({
                                  isOpen: true,
                                  beforePhoto: detailIssue.beforeImage,
                                  afterPhoto: detailIssue.afterImage || null,
                                  ticketId: detailIssue.id,
                                  citizenName: detailIssue.name,
                                  contractorName: detailIssue.contractorName || null,
                                })}
                              >
                                <img src={detailIssue.afterImage} alt="After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute bottom-1 right-1 bg-[#138808] text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  <Check className="w-3 h-3 font-bold" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Findings chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(detailIssue.aiFindings || ['Area cleared', 'Surface restored', 'Site matches']).map((finding, idx) => (
                            <span key={idx} className="bg-[#E8F5E3] text-[#138808] border border-[#138808]/15 rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-sans">
                              ✓ {finding}
                            </span>
                          ))}
                        </div>

                        {/* Logs and note */}
                        <div className="border-t border-[#EDE8E3] pt-3 text-[11px] text-text-muted space-y-1.5">
                          <p className="font-mono">
                            {isManualOverride 
                              ? (detailIssue.aiOfficerLog || `Manually approved by officer · ${detailIssue.resolvedAt || 'Today'}`)
                              : `${currentLang === 'hi' ? 'टिकट स्वचालित रूप से बंद' : 'Ticket automatically closed'} · ${detailIssue.resolvedAt || 'Today'}`
                            }
                          </p>
                          <p className="italic font-sans mt-1">
                            {currentLang === 'hi' 
                              ? '* इस समाधान को फ्लैग करने के लिए, विभाग पर्यवेक्षक से संपर्क करें।' 
                              : '* To flag this resolution, contact the department supervisor.'
                            }
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // -------------------- RESULT STATE B: FLAGGED FOR REVIEW --------------------
                  if (hasAfter && detailIssue.aiConfidence !== undefined && detailIssue.aiFlagged) {
                    return (
                      <div 
                        className="border border-[#FDE68A] border-l-4 border-l-[#D97706] rounded-xl p-4 bg-[#FFFBEB] space-y-4 shadow-sm"
                        id={`result-state-b-${detailIssue.id}`}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />
                          <span className="text-sm font-bold text-[#D97706]">
                            {currentLang === 'hi' ? 'एआई द्वारा फ्लैग - अधिकारी समीक्षा आवश्यक' : 'AI flagged — Officer review needed'}
                          </span>
                        </div>

                        {/* Score display */}
                        <div className="text-center py-2 bg-white/60 rounded-lg border border-[#FDE68A]/50">
                          <span className="text-[36px] font-extrabold text-[#D97706] leading-none block">
                            {detailIssue.aiConfidence}%
                          </span>
                          <span className="text-[11px] text-text-muted font-mono font-bold uppercase tracking-wider block mt-1">
                            Resolution Confidence Score
                          </span>
                          <span className="text-[10px] text-[#D97706] font-semibold block mt-0.5">
                            Below auto-approval threshold (75%)
                          </span>
                        </div>

                        {/* Findings & reasoning */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {(detailIssue.aiFindings || ['Partial completion detected', 'Angle mismatch']).map((finding, idx) => (
                              <span key={idx} className="bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/15 rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-sans">
                                ⚠ {finding}
                              </span>
                            ))}
                          </div>
                          <div className="bg-white/80 border border-[#FDE68A] p-2.5 rounded-lg text-xs text-[#5C5449] leading-relaxed italic font-sans">
                            "{detailIssue.aiReasoning || 'The AI detected that the after-photo may show incomplete work or lighting variation. Manual review recommended.'}"
                          </div>
                        </div>

                        {/* Side by side thumbnails */}
                        <div className="space-y-1">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] text-text-muted block">Before</span>
                              <div className="h-[120px] rounded-lg overflow-hidden border border-[#EDE8E3] relative cursor-pointer"
                                onClick={() => setLightboxState({
                                  isOpen: true,
                                  beforePhoto: detailIssue.beforeImage,
                                  afterPhoto: detailIssue.afterImage || null,
                                  ticketId: detailIssue.id,
                                  citizenName: detailIssue.name,
                                  contractorName: detailIssue.contractorName || null,
                                })}
                              >
                                <img src={detailIssue.beforeImage} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-[#D97706] font-semibold block">After</span>
                              <div className="h-[120px] rounded-lg overflow-hidden border-2 border-[#D97706] relative cursor-pointer"
                                onClick={() => setLightboxState({
                                  isOpen: true,
                                  beforePhoto: detailIssue.beforeImage,
                                  afterPhoto: detailIssue.afterImage || null,
                                  ticketId: detailIssue.id,
                                  citizenName: detailIssue.name,
                                  contractorName: detailIssue.contractorName || null,
                                })}
                              >
                                <img src={detailIssue.afterImage} alt="After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute bottom-1 right-1 bg-[#D97706] text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md font-bold text-xs">
                                  ?
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rejection input and actions */}
                        <div className="space-y-3 pt-2">
                          {!showRejectionForm ? (
                            <div className="grid grid-cols-2 gap-2.5">
                              <button
                                onClick={() => setShowRejectionForm(true)}
                                className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-400 text-rose-700 font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer uppercase transition-all font-sans"
                              >
                                <X className="w-4 h-4" />
                                Re-upload Fix
                              </button>
                              <button
                                onClick={() => {
                                  const now = new Date();
                                  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + now.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                  const officerNote = `Manually approved by officer · ${timestamp} · AI score: ${detailIssue.aiConfidence}%`;
                                  onUpdateIssueStatus(detailIssue.id, 'resolved', {
                                    aiAuditing: false,
                                    aiAuditCompleted: true,
                                    aiConfidence: detailIssue.aiConfidence,
                                    aiFlagged: false,
                                    aiAutoRejected: false,
                                    aiOfficerLog: officerNote,
                                    resolvedAt: timestamp,
                                  });
                                  setDetailIssue(prev => prev ? {
                                    ...prev,
                                    status: 'resolved',
                                    aiFlagged: false,
                                    aiOfficerLog: officerNote,
                                    resolvedAt: timestamp,
                                  } : null);
                                  setToast({
                                    message: "Ticket resolved by officer",
                                    visible: true,
                                    dept: detailIssue.department,
                                  });
                                }}
                                className="inline-flex items-center justify-center gap-1.5 bg-green hover:bg-green-dark text-white font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer uppercase transition-all shadow-md font-sans"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 bg-white/40 border border-[#FEF3C7] p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider block">
                                Rejection Notes
                              </span>
                              <textarea
                                value={rejectionNotes}
                                onChange={(e) => setRejectionNotes(e.target.value)}
                                placeholder={currentLang === 'hi' ? 'ठेकेदार को बताएं कि क्या कमी है...' : "Tell the contractor what's missing..."}
                                className="w-full text-xs border border-border focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] rounded-lg p-2.5 bg-white outline-none min-h-[72px] resize-none leading-relaxed"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => setShowRejectionForm(false)}
                                  className="bg-bg hover:bg-slate-100 text-text-secondary border border-border font-bold text-[11px] py-2 px-3 rounded-lg transition-colors cursor-pointer uppercase font-sans"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateIssueStatus(detailIssue.id, 'in_progress', {
                                      afterImage: undefined,
                                      aiAuditing: false,
                                      aiAuditCompleted: false,
                                      aiConfidence: undefined,
                                      aiFlagged: false,
                                      aiAutoRejected: true,
                                      aiRejectionReason: rejectionNotes || 'Visual verification parameters could not be fully verified.',
                                    });
                                    setDetailIssue(prev => prev ? {
                                      ...prev,
                                      status: 'in_progress',
                                      afterImage: undefined,
                                      aiAuditing: false,
                                      aiConfidence: undefined,
                                      aiFlagged: false,
                                      aiAutoRejected: true,
                                      aiRejectionReason: rejectionNotes || 'Visual verification parameters could not be fully verified.',
                                    } : null);
                                    setToast({
                                      message: "Ticket returned to work queue",
                                      visible: true,
                                      dept: detailIssue.department,
                                    });
                                    setShowRejectionForm(false);
                                  }}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] py-2 px-3 rounded-lg transition-colors cursor-pointer uppercase font-sans"
                                >
                                  Send Rejection
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="text-[10.5px] text-text-muted text-center font-mono">
                            AI confidence: {detailIssue.aiConfidence}% · Flagged today
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // -------------------- RESULT STATE C: AUTO-REJECTED --------------------
                  if (detailIssue.aiAutoRejected) {
                    return (
                      <div 
                        className="border border-[#FCA5A5] border-l-4 border-l-[#EF4444] rounded-xl p-4 bg-[#FEF2F2] space-y-4 shadow-sm"
                        id={`result-state-c-${detailIssue.id}`}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center shrink-0">
                            <X className="w-3.5 h-3.5 font-bold" />
                          </div>
                          <span className="text-sm font-bold text-[#EF4444]">
                            {currentLang === 'hi' ? 'एआई द्वारा अस्वीकृत - अपर्याप्त सबूत' : 'AI rejected — Insufficient proof'}
                          </span>
                        </div>

                        {/* Score display */}
                        <div className="text-center py-2 bg-white/60 rounded-lg border border-[#FCA5A5]/50">
                          <span className="text-[36px] font-extrabold text-[#EF4444] leading-none block">
                            {detailIssue.aiConfidence || 31}%
                          </span>
                          <span className="text-[11px] text-text-muted font-mono font-bold uppercase tracking-wider block mt-1">
                            Resolution Confidence Score
                          </span>
                          <span className="text-[10px] text-[#EF4444] font-semibold block mt-0.5">
                            Work appears incomplete or unverifiable
                          </span>
                        </div>

                        {/* Rejection chips */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {(detailIssue.aiFindings || ['Before and after appear identical', 'Issue area not visible in photo']).map((finding, idx) => (
                              <span key={idx} className="bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]/15 rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-sans">
                                ✗ {finding}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Auto notification note */}
                        <div className="bg-white/80 border border-[#FCA5A5] p-3 rounded-lg space-y-1 text-xs text-[#5C5449] leading-relaxed">
                          <div className="flex items-center gap-1.5 text-rose-800 font-semibold mb-1">
                            <Mail className="w-4 h-4 text-[#EF4444]" />
                            <span>Contractor automatically notified</span>
                          </div>
                          <p>
                            {currentLang === 'hi' 
                              ? `एआई निष्कर्षों के साथ एक अस्वीकृति सूचना ठेकेदार को भेजी गई है। टिकट को सक्रिय कार्य सूची में वापस कर दिया गया है।`
                              : `A rejection notice with AI findings has been sent to ${detailIssue.contractorName || 'the contractor'}. The ticket has been returned to the active work queue.`
                            }
                          </p>
                          {detailIssue.aiRejectionReason && (
                            <p className="mt-1.5 border-t border-rose-100 pt-1.5 font-sans italic text-slate-600">
                              <strong>Note:</strong> "{detailIssue.aiRejectionReason}"
                            </p>
                          )}
                        </div>

                        {/* Exceptional Override Rejection option */}
                        <div className="text-center pt-1 select-none">
                          <span 
                            onClick={() => {
                              const now = new Date();
                              const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + now.toLocaleDateString([], { month: 'short', day: 'numeric' });
                              onUpdateIssueStatus(detailIssue.id, 'resolved', {
                                aiAuditing: false,
                                aiAuditCompleted: true,
                                aiConfidence: 80,
                                aiFlagged: false,
                                aiAutoRejected: false,
                                aiOfficerLog: `Rejection overridden by officer · ${timestamp}`,
                                resolvedAt: timestamp,
                              });
                              setDetailIssue(prev => prev ? {
                                ...prev,
                                status: 'resolved',
                                aiAutoRejected: false,
                                aiConfidence: 80,
                                aiOfficerLog: `Rejection overridden by officer · ${timestamp}`,
                                resolvedAt: timestamp,
                              } : null);
                              setToast({
                                message: "Ticket resolved by officer override",
                                visible: true,
                                dept: detailIssue.department,
                              });
                            }}
                            className="text-[11px] text-text-muted hover:text-[#1A3057] transition-colors cursor-pointer italic font-sans font-semibold underline"
                          >
                            Override rejection (Manual Approve)
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // -------------------- DEFAULT VIEW --------------------
                  return (
                    <div 
                      onClick={() => setLightboxState({
                        isOpen: true,
                        beforePhoto: detailIssue.beforeImage,
                        afterPhoto: detailIssue.afterImage || null,
                        ticketId: detailIssue.id,
                        citizenName: detailIssue.name,
                        contractorName: detailIssue.contractorName || null,
                      })}
                      className="relative w-full aspect-video rounded-xl overflow-hidden border border-border cursor-zoom-in bg-black flex items-center justify-center group"
                    >
                      <img 
                        src={detailIssue.beforeImage} 
                        alt="Citizen report proof" 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-slate-900/85 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-white/15">
                          <Eye className="w-4 h-4" />
                          <span>Inspect Full Proof</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Bottom Actions control panel inside the drawer */}
            <div className="p-4 border-t border-border bg-white shrink-0 select-none">
              
              {/* UNASSIGNED ACTIONS */}
              {detailIssue.status === 'unassigned' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-mono">
                    ASSIGN & DISPATCH
                  </span>
                  <div className="flex flex-col gap-2.5">
                    <div className="relative">
                      <select
                        id="drawer-contractor-select"
                        defaultValue=""
                        className="w-full px-3 py-2.5 border border-border rounded-lg text-xs font-semibold text-text-secondary bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer appearance-none pr-10"
                      >
                        <option value="" disabled>{t.select_contractor}</option>
                        {DEPARTMENT_CONTRACTORS[detailIssue.department].map((contractor) => (
                          <option key={contractor} value={contractor}>{contractor}</option>
                        ))}
                      </select>
                      {/* Down arrow indicator */}
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-muted">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const selectEl = document.getElementById('drawer-contractor-select') as HTMLSelectElement;
                        if (selectEl && selectEl.value) {
                          handleAssignContractor(detailIssue.id, selectEl.value);
                        }
                      }}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs py-3 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-sm uppercase font-sans transition-colors"
                    >
                      <span>Dispatch Contractor &rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DISPATCHED ACTIONS */}
              {detailIssue.status === 'in_progress' && (
                <div className="space-y-2.5">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    Dispatched to <strong className="text-amber-950 font-bold">{detailIssue.contractorName}</strong> on {detailIssue.assignedAt || 'Today'}.
                  </div>
                  <button
                    onClick={() => handleSimulateContractorFinish(detailIssue.id, detailIssue.department)}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer uppercase transition-all shadow-xs font-sans"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Simulate Finish
                  </button>
                </div>
              )}

              {/* RESOLVED ACTIONS */}
              {detailIssue.status === 'resolved' && (
                <div className="bg-green-light border border-green/20 text-green-dark rounded-lg p-3 text-xs flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green shrink-0" />
                  <span className="font-bold">This issue is Closed & Fully Resolved</span>
                </div>
              )}

            </div>

          </div>
        )}
      </div>

      {/* -------------------- 6. FULL SCREEN LIGHTBOX PORTAL -------------------- */}
      <PhotoLightbox
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState(prev => ({ ...prev, isOpen: false }))}
        beforePhoto={lightboxState.beforePhoto}
        afterPhoto={lightboxState.afterPhoto}
        ticketId={lightboxState.ticketId}
        citizenName={lightboxState.citizenName}
        contractorName={lightboxState.contractorName}
        showActions={false}
      />

    </div>
  );
};
