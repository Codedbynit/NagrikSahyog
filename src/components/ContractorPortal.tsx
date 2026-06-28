import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, CheckCircle2, AlertCircle, Clock, ArrowLeft, LogOut,
  MapPin, Upload, Image as ImageIcon, Sparkles, Check, X,
  ExternalLink, Camera, TrendingUp, ThumbsUp, AlertTriangle, ChevronRight, HelpCircle, RefreshCw
} from 'lucide-react';
import { Language, Department, Issue, IssueStatus } from '../types';
import { PhotoLightbox } from './PhotoLightbox';
import { translations } from '../data/translations';

interface ContractorPortalProps {
  currentLang: Language;
  contractorName: string;
  issues: Issue[];
  onUpdateIssueStatus: (id: string, newStatus: IssueStatus, extra?: Partial<Issue>) => void;
  onBackToHome: () => void;
  onSignOut: () => void;
}

const AFTER_PRESETS: Record<Department, string> = {
  pwd: "https://images.unsplash.com/photo-1594818378822-41f345b0edd9?auto=format&fit=crop&w=600&q=80",
  sanitation: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
  electricity: "https://images.unsplash.com/photo-1473116763269-255415c4ff6a?auto=format&fit=crop&w=600&q=80",
  water: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
};

const DEPT_INFO: Record<Department, { label: string; labelHi: string; bg: string; text: string; border: string }> = {
  pwd: {
    label: "PWD & Roads",
    labelHi: "लोक निर्माण",
    bg: "bg-[#FFF6F0]",
    text: "text-[#E8571A]",
    border: "border-[#FFDCD0]"
  },
  sanitation: {
    label: "Sanitation",
    labelHi: "सफाई एवं स्वच्छता",
    bg: "bg-[#F0FDF4]",
    text: "text-[#16A34A]",
    border: "border-[#DCFCE7]"
  },
  electricity: {
    label: "Electricity",
    labelHi: "विद्युत विभाग",
    bg: "bg-[#FEFCE8]",
    text: "text-[#CA8A04]",
    border: "border-[#FEF9C3]"
  },
  water: {
    label: "Water & Sewage",
    labelHi: "जल एवं सीवेज",
    bg: "bg-[#F0F9FF]",
    text: "text-[#0284C7]",
    border: "border-[#E0F2FE]"
  }
};

export function ContractorPortal({
  currentLang,
  contractorName,
  issues,
  onUpdateIssueStatus,
  onBackToHome,
  onSignOut
}: ContractorPortalProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'resolved' | 'available'>('active');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    beforePhoto: string;
    afterPhoto: string | null;
    ticketId: string;
    citizenName: string;
    contractorName: string | null;
  }>({
    isOpen: false,
    beforePhoto: '',
    afterPhoto: null,
    ticketId: '',
    citizenName: '',
    contractorName: null
  });

  // Local AI Auditing simulation since AdminCenter won't be rendered
  useEffect(() => {
    const auditingIssues = issues.filter(issue => 
      issue.contractorName === contractorName && 
      issue.status === 'pending' && 
      issue.aiAuditing
    );
    if (auditingIssues.length === 0) return;

    auditingIssues.forEach(issue => {
      const timer = setTimeout(() => {
        // Generate a random confidence score
        const confidence = Math.floor(Math.random() * 69) + 30;
        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + now.toLocaleDateString([], { month: 'short', day: 'numeric' });

        if (confidence >= 75) {
          // AUTO-APPROVED -> Resolved
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
          if (selectedIssue && selectedIssue.id === issue.id) {
            setSelectedIssue(prev => prev ? { 
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
          const reasoning = "The AI detected that the after-photo may show incomplete work or lighting variation. Manual review is recommended.";

          onUpdateIssueStatus(issue.id, 'pending', {
            aiAuditing: false,
            aiAuditCompleted: true,
            aiConfidence: confidence,
            aiFlagged: true,
            aiAutoRejected: false,
            aiFindings: findings,
            aiReasoning: reasoning,
          });
          if (selectedIssue && selectedIssue.id === issue.id) {
            setSelectedIssue(prev => prev ? { 
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
          // AUTO-REJECTED -> moves back to in_progress
          const findings = ['Before and after appear identical', 'Issue area not visible in photo'];
          onUpdateIssueStatus(issue.id, 'in_progress', {
            aiAuditing: false,
            aiAuditCompleted: true,
            aiConfidence: confidence,
            aiFlagged: false,
            aiAutoRejected: true,
            aiFindings: findings,
            aiRejectionReason: 'The AI detected that the after-photo appears virtually identical to the before-photo, indicating the issue may not be resolved.',
          });
          if (selectedIssue && selectedIssue.id === issue.id) {
            setSelectedIssue(prev => prev ? { 
              ...prev, 
              status: 'in_progress', 
              aiAuditing: false, 
              aiAuditCompleted: true, 
              aiConfidence: confidence, 
              aiFlagged: false,
              aiAutoRejected: true,
              aiFindings: findings,
              aiRejectionReason: 'The AI detected that the after-photo appears virtually identical to the before-photo, indicating the issue may not be resolved.',
            } : null);
          }
        }
      }, 2500);

      return () => clearTimeout(timer);
    });
  }, [issues, selectedIssue, contractorName]);

  // Filter issues based on tabs
  const myIssues = issues.filter(i => i.contractorName === contractorName);
  const activeIssues = myIssues.filter(i => i.status === 'in_progress');
  const pendingIssues = myIssues.filter(i => i.status === 'pending');
  const resolvedIssues = myIssues.filter(i => i.status === 'resolved');

  // Available unassigned issues matching ANY department (contractor can claim any unassigned ticket)
  const availableIssues = issues.filter(i => i.status === 'unassigned');

  const currentTabIssues = {
    active: activeIssues,
    pending: pendingIssues,
    resolved: resolvedIssues,
    available: availableIssues
  }[activeTab];

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClaimIssue = (issueId: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    onUpdateIssueStatus(issueId, 'in_progress', {
      contractorName: contractorName,
      assignedAt: timestamp
    });
  };

  const handleSubmitResolution = (issue: Issue, usePreset: boolean) => {
    setIsSubmitting(true);
    const photoToSubmit = usePreset ? AFTER_PRESETS[issue.department] : (customPhoto || AFTER_PRESETS[issue.department]);

    setTimeout(() => {
      onUpdateIssueStatus(issue.id, 'pending', {
        afterImage: photoToSubmit,
        aiAuditing: true,
        aiAuditCompleted: false,
        aiConfidence: undefined,
        aiAuditError: undefined,
        aiAutoRejected: false, // Reset rejection upon re-submission
        aiRejectionReason: undefined
      });

      // Synchronize state
      setSelectedIssue(prev => prev ? {
        ...prev,
        status: 'pending',
        afterImage: photoToSubmit,
        aiAuditing: true,
        aiAuditCompleted: false,
        aiAutoRejected: false,
        aiRejectionReason: undefined
      } : null);

      setCustomPhoto(null);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6" id="contractor-portal-main">
      
      {/* Upper Navigation & Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EDE8E3] rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#1A3057]/10 text-[#1A3057] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              {currentLang === 'hi' ? 'अधिकृत ठेकेदार पोर्टल' : 'Authorized Contractor Portal'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1A3057] tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 shrink-0 text-[#E8571A]" />
            <span>{contractorName}</span>
          </h1>
          <p className="text-xs text-[#5C5449]">
            {currentLang === 'hi' 
              ? 'नगर निगम स्थानीय कार्य आदेश और वास्तविक समय गुणवत्ता सत्यापन।' 
              : 'Municipal work order resolution & real-time visual auditing gateway.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onBackToHome}
            className="h-10 px-4 border border-[#EDE8E3] hover:bg-slate-50 text-xs font-bold text-[#5C5449] rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            id="contractor-btn-home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentLang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
          </button>
          <button 
            onClick={onSignOut}
            className="h-10 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            id="contractor-btn-signout"
          >
            <LogOut className="w-4 h-4" />
            <span>{currentLang === 'hi' ? 'लॉग आउट' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Stats Pipeline Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="contractor-stats-row">
        <div className="bg-white border border-[#EDE8E3] rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#CA8A04] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block">
              {currentLang === 'hi' ? 'सक्रिय कार्य' : 'Active Jobs'}
            </span>
            <span className="text-xl font-black text-[#1A3057]">{activeIssues.length}</span>
          </div>
        </div>

        <div className="bg-white border border-[#EDE8E3] rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block">
              {currentLang === 'hi' ? 'सत्यापन लंबित' : 'Under Audit'}
            </span>
            <span className="text-xl font-black text-[#1A3057]">{pendingIssues.length}</span>
          </div>
        </div>

        <div className="bg-white border border-[#EDE8E3] rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block">
              {currentLang === 'hi' ? 'पूर्ण कार्य' : 'Completed'}
            </span>
            <span className="text-xl font-black text-[#1A3057]">{resolvedIssues.length}</span>
          </div>
        </div>

        <div className="bg-white border border-[#EDE8E3] rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#FFF6F0] text-[#E8571A] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block">
              {currentLang === 'hi' ? 'उपलब्ध कार्य' : 'Work Pool'}
            </span>
            <span className="text-xl font-black text-[#1A3057]">{availableIssues.length}</span>
          </div>
        </div>
      </div>

      {/* Main Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="contractor-workspace-grid">
        
        {/* Left Column: Pipeline Toggles & Tickets List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Tabs Control */}
          <div className="bg-white border border-[#EDE8E3] rounded-xl p-1.5 flex gap-1 shadow-sm" id="contractor-tab-container">
            <button
              onClick={() => { setActiveTab('active'); setSelectedIssue(null); }}
              className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'active' ? 'bg-[#1A3057] text-white' : 'text-[#5C5449] hover:bg-slate-50'}`}
              id="tab-contractor-active"
            >
              {currentLang === 'hi' ? 'सक्रिय कार्य' : 'Active'} ({activeIssues.length})
            </button>
            <button
              onClick={() => { setActiveTab('pending'); setSelectedIssue(null); }}
              className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'pending' ? 'bg-[#1A3057] text-white' : 'text-[#5C5449] hover:bg-slate-50'}`}
              id="tab-contractor-pending"
            >
              {currentLang === 'hi' ? 'ऑडिट' : 'Auditing'} ({pendingIssues.length})
            </button>
            <button
              onClick={() => { setActiveTab('resolved'); setSelectedIssue(null); }}
              className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'resolved' ? 'bg-[#1A3057] text-white' : 'text-[#5C5449] hover:bg-slate-50'}`}
              id="tab-contractor-resolved"
            >
              {currentLang === 'hi' ? 'पूर्ण' : 'Resolved'} ({resolvedIssues.length})
            </button>
            <button
              onClick={() => { setActiveTab('available'); setSelectedIssue(null); }}
              className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all cursor-pointer relative ${activeTab === 'available' ? 'bg-[#E8571A] text-white' : 'text-[#5C5449] hover:bg-slate-50'}`}
              id="tab-contractor-available"
            >
              <span>{currentLang === 'hi' ? 'उपलब्ध' : 'Work Pool'}</span>
              {availableIssues.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce">
                  {availableIssues.length}
                </span>
              )}
            </button>
          </div>

          {/* Ticket Listing Pane */}
          <div className="bg-white border border-[#EDE8E3] rounded-xl p-4 shadow-sm flex-1 min-h-[400px] max-h-[600px] overflow-y-auto space-y-3" id="contractor-ticket-list">
            <h3 className="text-xs font-bold text-[#1A3057] border-b border-[#EDE8E3] pb-2 uppercase tracking-wider font-mono">
              {activeTab === 'active' && (currentLang === 'hi' ? 'सक्रिय आवंटित शिकायतें' : 'Active Assigned Complaints')}
              {activeTab === 'pending' && (currentLang === 'hi' ? 'सत्यापन के अंतर्गत' : 'Tickets Awaiting Audit / Review')}
              {activeTab === 'resolved' && (currentLang === 'hi' ? 'समाधान किए गए कार्य' : 'Successfully Resolved Tickets')}
              {activeTab === 'available' && (currentLang === 'hi' ? 'दावा करने योग्य शिकायतें' : 'Claimable Municipal Issues')}
            </h3>

            {currentTabIssues.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#5C5449]">
                    {currentLang === 'hi' ? 'कोई शिकायत नहीं मिली।' : 'No tickets in this section.'}
                  </p>
                  <p className="text-[10px] text-[#A89F96] max-w-xs mx-auto">
                    {activeTab === 'active' && (currentLang === 'hi' ? 'आप "उपलब्ध" टैब से नए कार्य स्वीकार कर सकते हैं।' : 'You can claim new work from the "Work Pool" tab.')}
                    {activeTab === 'available' && (currentLang === 'hi' ? 'वर्तमान में कोई भी खुली शिकायत उपलब्ध नहीं है।' : 'All complaints are currently assigned to official contractors.')}
                    {activeTab === 'pending' && (currentLang === 'hi' ? 'आपके द्वारा जमा किया गया कोई भी कार्य अभी सत्यापन प्रक्रिया में नहीं है।' : 'None of your submitted works are currently in verification.')}
                  </p>
                </div>
              </div>
            ) : (
              currentTabIssues.map((issue) => {
                const dept = DEPT_INFO[issue.department];
                const isRejected = issue.status === 'in_progress' && issue.aiAutoRejected;
                
                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`p-3.5 border rounded-xl transition-all cursor-pointer text-left space-y-2.5 ${selectedIssue?.id === issue.id ? 'border-[#1A3057] bg-[#1A3057]/5 shadow-sm' : 'border-[#EDE8E3] hover:border-slate-300 hover:bg-slate-50 bg-white'}`}
                  >
                    {/* Badge Line */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold font-mono text-[#5C5449]">
                        {issue.id}
                      </span>
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${dept.bg} ${dept.text} border ${dept.border}`}>
                        {currentLang === 'hi' ? dept.labelHi : dept.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#5C5449] font-medium line-clamp-2">
                      {issue.description}
                    </p>

                    {/* Metadata & Warning Indicators */}
                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#A89F96]">
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span className="truncate max-w-[140px]">{issue.address}</span>
                      </span>

                      {isRejected && (
                        <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-black uppercase text-[8.5px] tracking-wider animate-pulse">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{currentLang === 'hi' ? 'अस्वीकृत' : 'Rejected'}</span>
                        </span>
                      )}

                      {issue.status === 'pending' && (
                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold uppercase text-[8.5px] tracking-wider">
                          <RefreshCw className="w-3 h-3 shrink-0 animate-spin" />
                          <span>{issue.aiAuditing ? (currentLang === 'hi' ? 'ऑडिट जारी' : 'Auditing') : (currentLang === 'hi' ? 'लंबित' : 'Pending')}</span>
                        </span>
                      )}

                      {issue.status === 'resolved' && (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold uppercase text-[8.5px] tracking-wider">
                          <Check className="w-3 h-3 shrink-0" />
                          <span>{currentLang === 'hi' ? 'पूर्ण' : 'Resolved'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Workspace Panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedIssue ? (
              <motion.div
                key={selectedIssue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-[#EDE8E3] rounded-xl p-6 shadow-sm space-y-6 text-left"
                id="contractor-workspace-detail"
              >
                {/* Header Title block */}
                <div className="border-b border-[#EDE8E3] pb-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#1A3057] font-mono tracking-wider bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      TICKET {selectedIssue.id}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${DEPT_INFO[selectedIssue.department].bg} ${DEPT_INFO[selectedIssue.department].text} border ${DEPT_INFO[selectedIssue.department].border}`}>
                      {currentLang === 'hi' ? DEPT_INFO[selectedIssue.department].labelHi : DEPT_INFO[selectedIssue.department].label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-1 text-xs text-[#A89F96] font-mono">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{selectedIssue.address} (Landmark: {selectedIssue.landmark || 'None'})</span>
                  </div>
                </div>

                {/* Warning / Rejected Notice */}
                {selectedIssue.status === 'in_progress' && selectedIssue.aiAutoRejected && (
                  <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        {currentLang === 'hi' ? 'काम अस्वीकृत - सुधार आवश्यक है' : 'Resolution Rejected - Correction Required'}
                      </h4>
                    </div>
                    <p className="text-xs text-[#5C5449] font-medium leading-relaxed italic">
                      "{selectedIssue.aiRejectionReason || 'The submitted proof did not clear the visual audit checklist.'}"
                    </p>
                    <p className="text-[10px] text-rose-600 font-bold">
                      {currentLang === 'hi' 
                        ? 'कृपया स्थल पर कार्य को ठीक करें और समाधान की एक नई स्पष्ट तस्वीर अपलोड करें।' 
                        : 'Please rectify the physical site issues and upload a fresh, clear resolution photo.'}
                    </p>
                  </div>
                )}

                {/* Primary Detail content */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider font-mono">
                    {currentLang === 'hi' ? 'नागरिक विवरण और शिकायत' : 'Citizen Incident Details'}
                  </h4>
                  <p className="text-xs text-[#5C5449] leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                    "{selectedIssue.description}"
                  </p>
                </div>

                {/* Available Work Option to Claim */}
                {selectedIssue.status === 'unassigned' && (
                  <div className="bg-amber-50/30 border border-amber-200 rounded-xl p-5 text-center space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-900">
                        {currentLang === 'hi' ? 'क्या आप इस कार्य आदेश को स्वीकार करना चाहते हैं?' : 'Accept & Claim Work Order'}
                      </h4>
                      <p className="text-xs text-[#5C5449] max-w-md mx-auto">
                        {currentLang === 'hi' 
                          ? 'दावा करने पर, यह टिकट आपके सक्रिय कार्य कतार में चला जाएगा और नागरिक को आपकी प्रगति दिखाई देगी।' 
                          : 'Upon claiming, this issue will move to your active work queue. The reporting citizen will see that work has started.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleClaimIssue(selectedIssue.id)}
                      className="px-6 h-11 bg-[#E8571A] hover:bg-[#d04914] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 mx-auto justify-center"
                      id="btn-claim-work-order"
                    >
                      <Check className="w-4 h-4" />
                      <span>{currentLang === 'hi' ? 'कार्य स्वीकार करें' : 'Accept Work Order'}</span>
                    </button>
                  </div>
                )}

                {/* Resolution Workspace for Assigned Work */}
                {selectedIssue.status === 'in_progress' && (
                  <div className="space-y-5 border-t border-[#EDE8E3] pt-5">
                    <h3 className="text-xs font-bold text-[#1A3057] uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#E8571A]" />
                      <span>{currentLang === 'hi' ? 'समाधान अपलोड और प्रमाण पत्र' : 'Resolution Proof & Reporting'}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Before Photo */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block">
                          {currentLang === 'hi' ? 'पहल की फोटो (नागरिक द्वारा भेजी गई)' : 'Before Photo (Reported)'}
                        </span>
                        <div 
                          className="aspect-video rounded-xl overflow-hidden border border-[#EDE8E3] relative cursor-zoom-in"
                          onClick={() => setLightboxState({
                            isOpen: true,
                            beforePhoto: selectedIssue.beforeImage,
                            afterPhoto: selectedIssue.afterImage || null,
                            ticketId: selectedIssue.id,
                            citizenName: selectedIssue.name,
                            contractorName: selectedIssue.contractorName || null
                          })}
                        >
                          <img 
                            src={selectedIssue.beforeImage} 
                            alt="Before" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="bg-black/60 text-white font-mono text-[9px] px-2 py-1 rounded font-bold">
                              {currentLang === 'hi' ? 'बड़ा करें' : 'Zoom Before'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropzone for After Image */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block">
                          {currentLang === 'hi' ? 'समाधान की फोटो (कार्य समाप्ति के बाद)' : 'After Photo (Your Resolution)'}
                        </span>

                        {customPhoto ? (
                          <div className="aspect-video rounded-xl overflow-hidden border border-emerald-300 relative">
                            <img src={customPhoto} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setCustomPhoto(null)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                              id="btn-remove-custom-photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`aspect-video rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center transition-all relative ${dragActive ? 'border-[#E8571A] bg-[#FFF6F0]' : 'border-slate-300 bg-slate-50/50'}`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileInput}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              id="contractor-file-upload-input"
                            />
                            <Upload className="w-6 h-6 text-[#A89F96] mb-1 animate-bounce" />
                            <p className="text-[10.5px] font-bold text-[#5C5449]">
                              {currentLang === 'hi' ? 'तस्वीर खींचें या अपलोड करें' : 'Drag & Drop or Click to Upload'}
                            </p>
                            <p className="text-[9px] text-[#A89F96] mt-0.5">
                              JPEG, PNG up to 5MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        onClick={() => handleSubmitResolution(selectedIssue, false)}
                        disabled={!customPhoto || isSubmitting}
                        className="w-full sm:flex-1 h-11 bg-[#1A3057] hover:bg-[#122240] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        id="btn-submit-contractor-photo"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isSubmitting ? (currentLang === 'hi' ? 'जमा किया जा रहा है...' : 'Uploading...') : (currentLang === 'hi' ? 'तस्वीर के साथ काम पूरा करें' : 'Submit Uploaded Photo')}</span>
                      </button>

                      <button
                        onClick={() => handleSubmitResolution(selectedIssue, true)}
                        disabled={isSubmitting}
                        className="w-full sm:flex-1 h-11 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                        id="btn-submit-contractor-preset"
                      >
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>{currentLang === 'hi' ? 'उच्च गुणवत्ता सुधार सिम्युलेट करें' : 'Simulate HQ Resolution'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Audit Loader & Live Telemetry for Pending Tab */}
                {selectedIssue.status === 'pending' && (
                  <div className="border border-[#EDE8E3] rounded-xl p-5 space-y-4">
                    {selectedIssue.aiAuditing ? (
                      <div className="text-center py-6 space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-full animate-pulse">
                          <RefreshCw className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-[#1A3057] animate-pulse">
                            {currentLang === 'hi' ? 'सक्रिय एआई ऑडिट चल रहा है...' : 'ACTIVE AI RESOLUTION AUDIT UNDERWAY...'}
                          </h4>
                          <p className="text-xs text-[#5C5449] max-w-sm mx-auto leading-relaxed">
                            {currentLang === 'hi' 
                              ? 'सत्यापन एल्गोरिदम स्थल संरेखण, मरम्मत घनत्व और भौतिक बाधाओं का मिलान कर रहा है।' 
                              : 'AI Vision Engine is analyzing site alignment, restoration density, and physical barriers comparison.'}
                          </p>
                        </div>
                        {/* Fake Progress Bar */}
                        <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                          <div className="h-full bg-blue-600 animate-[shimmer_1.5s_infinite]" style={{ width: '60%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Audit Completed Result block */}
                        <div className="flex items-center gap-2 pb-2 border-b border-[#EDE8E3]">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <h4 className="text-xs font-bold text-[#1A3057] uppercase tracking-wider font-mono">
                            {currentLang === 'hi' ? 'ऑडिट परिणाम और स्थिति' : 'Audit Telemetry & Performance Logs'}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Panel */}
                          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[9px] font-bold text-[#A89F96] uppercase tracking-wider block">
                                {currentLang === 'hi' ? 'एआई आत्मविश्वास रेटिंग' : 'AI Confidence Rating'}
                              </span>
                              <div className="flex items-baseline gap-1.5 pt-0.5">
                                <span className={`text-2xl font-black ${selectedIssue.aiConfidence && selectedIssue.aiConfidence >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {selectedIssue.aiConfidence}%
                                </span>
                                <span className="text-[10px] text-[#A89F96]">
                                  {selectedIssue.aiConfidence && selectedIssue.aiConfidence >= 75 ? '(Auto-Approved Threshold Met)' : '(Manual Review Required)'}
                                </span>
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] font-bold text-[#A89F96] uppercase tracking-wider block">
                                {currentLang === 'hi' ? 'दिशानिर्देश परिणाम' : 'Checklist Metrics'}
                              </span>
                              <div className="space-y-1 mt-1">
                                {(selectedIssue.aiFindings || ['Material matching', 'Lighting checks completed']).map((finding, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-xs text-[#5C5449] font-medium">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{finding}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Panel Photos Preview */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block">
                              {currentLang === 'hi' ? 'प्रमाणित तस्वीरें' : 'Submitted Proofs'}
                            </span>
                            <div 
                              className="aspect-video rounded-xl border border-slate-200 overflow-hidden relative cursor-zoom-in"
                              onClick={() => setLightboxState({
                                isOpen: true,
                                beforePhoto: selectedIssue.beforeImage,
                                afterPhoto: selectedIssue.afterImage || null,
                                ticketId: selectedIssue.id,
                                citizenName: selectedIssue.name,
                                contractorName: selectedIssue.contractorName || null
                              })}
                            >
                              <img src={selectedIssue.afterImage} alt="After" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 hover:bg-black/20 flex items-center justify-center transition-all">
                                <span className="text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded">
                                  {currentLang === 'hi' ? 'दोनों तस्वीरें देखें' : 'Compare Photos'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedIssue.aiFlagged && (
                          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 leading-relaxed font-medium">
                            <div className="flex items-center gap-1.5 mb-1 text-amber-950 font-bold">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                              <span>{currentLang === 'hi' ? 'अधिकारी समीक्षा का इंतज़ार है' : 'Officer Manual Review Recommended'}</span>
                            </div>
                            {selectedIssue.aiReasoning || 'The AI detected subtle angle differences. The ticket will be reviewed manually by a Municipal Command Officer.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Completed resolved view */}
                {selectedIssue.status === 'resolved' && (
                  <div className="border border-emerald-100 bg-emerald-50/20 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2.5 text-emerald-800 border-b border-emerald-100 pb-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                      <h4 className="text-sm font-black uppercase tracking-wider">
                        {currentLang === 'hi' ? 'शिकायत का सफलतापूर्वक समाधान हो गया!' : 'Incident Successfully Resolved'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block font-mono">
                            {currentLang === 'hi' ? 'समाधान की तारीख' : 'Resolved On'}
                          </span>
                          <span className="font-bold text-[#1A3057] mt-0.5 block">{selectedIssue.resolvedAt || 'Today'}</span>
                        </div>

                        {selectedIssue.rating && (
                          <div>
                            <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block font-mono">
                              {currentLang === 'hi' ? 'नागरिक रेटिंग' : 'Citizen Rating'}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-[#CA8A04] font-bold">
                              <span>{selectedIssue.rating} / 5</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-sm ${i < (selectedIssue.rating || 0) ? 'text-[#CA8A04]' : 'text-slate-200'}`}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedIssue.feedbackText && (
                          <div>
                            <span className="text-[10px] font-bold text-[#A89F96] uppercase tracking-wider block font-mono">
                              {currentLang === 'hi' ? 'नागरिक प्रतिक्रिया' : 'Citizen Feedback'}
                            </span>
                            <p className="italic text-[#5C5449] font-medium leading-relaxed mt-1">
                              "{selectedIssue.feedbackText}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div 
                        className="aspect-video border border-[#EDE8E3] rounded-xl overflow-hidden relative cursor-zoom-in"
                        onClick={() => setLightboxState({
                          isOpen: true,
                          beforePhoto: selectedIssue.beforeImage,
                          afterPhoto: selectedIssue.afterImage || null,
                          ticketId: selectedIssue.id,
                          citizenName: selectedIssue.name,
                          contractorName: selectedIssue.contractorName || null
                        })}
                      >
                        <img src={selectedIssue.afterImage} alt="Resolved Resolution" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-all flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded">
                            {currentLang === 'hi' ? 'बड़ा करके देखें' : 'View High Resolution'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-white border border-[#EDE8E3] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[480px] shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-[#EDE8E3] text-[#A89F96] flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-[#E8571A]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1A3057] uppercase tracking-wider font-mono">
                    {currentLang === 'hi' ? 'काम शुरू करने के लिए टिकट चुनें' : 'Resolution Desk & Workspace'}
                  </h3>
                  <p className="text-xs text-[#5C5449] max-w-sm mx-auto leading-relaxed">
                    {currentLang === 'hi' 
                      ? 'अपनी असाइन की गई शिकायतों का प्रबंधन करने, स्थल की तुलना करने, फ़ाइलें अपलोड करने और वास्तविक समय का एआई ऑडिट प्राप्त करने के लिए बाईं ओर से एक टिकट चुनें।' 
                      : 'Select a ticket from the left panel to manage your active work orders, view live location coordinates, upload repair photographs, and run real-time AI compliance verification.'}
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reusable Photo Lightbox Overlay */}
      {lightboxState.isOpen && (
        <PhotoLightbox
          isOpen={lightboxState.isOpen}
          onClose={() => setLightboxState(prev => ({ ...prev, isOpen: false }))}
          beforePhoto={lightboxState.beforePhoto}
          afterPhoto={lightboxState.afterPhoto}
          ticketId={lightboxState.ticketId}
          citizenName={lightboxState.citizenName}
          contractorName={lightboxState.contractorName}
        />
      )}
    </div>
  );
}
