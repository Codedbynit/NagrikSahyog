import React, { useState } from 'react';
import { Language, Issue, IssueStatus, AppView, Department } from '../types';
import { translations } from '../data/translations';
import { 
  ArrowLeft, Search, AlertCircle, CheckCircle, Star, Sparkles, Loader2 
} from 'lucide-react';

interface CitizenTrackFlowProps {
  currentLang: Language;
  issues: Issue[];
  onUpdateIssueStatus: (id: string, newStatus: IssueStatus, extra?: Partial<Issue>) => void;
  onBackToHome: () => void;
  onViewChange: (view: AppView) => void;
}

export const CitizenTrackFlow: React.FC<CitizenTrackFlowProps> = ({
  currentLang,
  issues,
  onUpdateIssueStatus,
  onBackToHome,
  onViewChange,
}) => {
  const t = translations[currentLang];
  
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Rating & Feedback local form states
  const [ratingInput, setRatingInput] = useState<number>(0);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [feedbackTextInput, setFeedbackTextInput] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const formattedId = lookupId.trim().toUpperCase();
    if (!formattedId) return;

    const found = issues.find(i => i.id === formattedId);
    if (found) {
      setActiveIssue(found);
      setRatingInput(found.rating || 0);
      setFeedbackTextInput(found.feedbackText || '');
      setLookupError('');
    } else {
      setActiveIssue(null);
      setLookupError(t.track_ticket_not_found || "Ticket not found. Please double-check the ID.");
    }
  };

  const handleFeedbackSubmit = () => {
    if (!activeIssue || ratingInput === 0) return;
    setIsSubmittingFeedback(true);
    
    // Simulate minor network delay for premium feel
    setTimeout(() => {
      onUpdateIssueStatus(activeIssue.id, 'resolved', {
        rating: ratingInput,
        feedbackText: feedbackTextInput.trim(),
        feedbackSubmittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
      });

      // Update local view state to reflect the submitted feedback
      setActiveIssue(prev => prev ? {
        ...prev,
        rating: ratingInput,
        feedbackText: feedbackTextInput.trim()
      } : null);

      setIsSubmittingFeedback(false);
    }, 600);
  };

  const resetTracker = () => {
    setActiveIssue(null);
    setLookupId('');
    setLookupError('');
    setRatingInput(0);
    setFeedbackTextInput('');
  };

  const getDeptName = (dept: Department) => {
    switch (dept) {
      case 'pwd': return currentLang === 'en' ? 'PWD & Roads' : 'लोक निर्माण और सड़कें';
      case 'sanitation': return currentLang === 'en' ? 'Public Waste & Sanitation' : 'सार्वजनिक अपशिष्ट व स्वच्छता';
      case 'electricity': return currentLang === 'en' ? 'Electricity & Lighting' : 'बिजली और प्रकाश व्यवस्था';
      case 'water': return currentLang === 'en' ? 'Water & Sewage' : 'जल और सीवेज';
      default: return dept;
    }
  };

  return (
    <div className="py-6 sm:py-8 md:py-10 px-4 sm:px-6 max-w-xl mx-auto flex flex-col justify-center min-h-[calc(100vh-52px)]">
      {/* Premium Back Navigation Button */}
      <div className="flex justify-start">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 bg-[#F4F4F5] text-[#5C5449] rounded-lg px-3 py-1.5 text-xs border border-[#EDE8E3] hover:bg-[#EDE8E3] hover:text-[#1A1A1A] active:scale-[0.98] transition-all duration-150 cursor-pointer mb-5"
          id="btn-track-back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{currentLang === 'en' ? 'Back to Home' : 'मुख्य पृष्ठ पर जाएं'}</span>
        </button>
      </div>

      <div className="bg-white border border-[#EDE8E3] rounded-2xl p-5 sm:p-6 md:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        {!activeIssue ? (
          /* LOOKUP FORM VIEW */
          <div className="flex flex-col gap-5" id="track-form-container">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">
                {currentLang === 'hi' ? 'अपनी शिकायत को ट्रैक करें' : 'Track Your Complaint'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5449] leading-relaxed">
                {currentLang === 'hi' 
                  ? 'अपनी शिकायत के समाधान की रीयल-टाइम स्थिति जानने के लिए नीचे टिकट आईडी दर्ज करें।' 
                  : 'Enter your unique Ticket ID below to see real-time updates and dispatch details of your reported issue.'
                }
              </p>
            </div>

            <form onSubmit={handleLookup} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 font-sans" htmlFor="track-ticket-id-input">
                  {currentLang === 'hi' ? 'टिकट आईडी' : 'Ticket ID'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="track-ticket-id-input"
                    value={lookupId}
                    onChange={(e) => {
                      setLookupId(e.target.value);
                      setLookupError('');
                    }}
                    placeholder={currentLang === 'hi' ? 'उदा. NS-2034' : 'e.g. NS-2034'}
                    className="block w-full px-3.5 py-2.5 border border-[#EDE8E3] rounded-xl text-sm text-[#1A1A1A] placeholder-[#A89F96] focus:outline-none focus:border-[#E8571A] focus:ring-2 focus:ring-[#E8571A]/10 transition-all uppercase font-mono font-bold"
                  />
                </div>
                {lookupError && (
                  <p className="text-rose-500 text-xs mt-0.5 font-medium flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {lookupError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!lookupId.trim()}
                className={`w-full font-bold text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center ${
                  lookupId.trim()
                    ? 'bg-[#E8571A] hover:bg-[#C94B12] text-white shadow-[0_2px_8px_rgba(232,87,26,0.25)]'
                    : 'bg-slate-100 text-[#A89F96] cursor-not-allowed'
                }`}
                id="btn-track-submit-real"
              >
                {currentLang === 'hi' ? 'स्थिति की जाँच करें' : 'Track Status'}
              </button>
            </form>
          </div>
        ) : (
          /* TRACKING DETAILS VIEW */
          <div className="flex flex-col gap-5 animate-fade-in" id="track-details-container">
            <div className="text-center flex flex-col items-center pb-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-[#138808] mb-3 border border-[#CDE5C4] shadow-xs">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">
                {currentLang === 'hi' ? 'शिकायत की स्थिति' : 'Complaint Status'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5449] leading-relaxed max-w-sm mt-1">
                {currentLang === 'hi' 
                  ? 'नीचे दिए गए टाइमलाइन में अपनी शिकायत की वर्तमान प्रगति देखें।' 
                  : 'Monitor the live dispatch status and resolution progress below.'
                }
              </p>
            </div>

            {/* Generated Ticket Box */}
            <div className="bg-[#F8F8FA] border border-[#EDE8E3] rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#A89F96] uppercase tracking-wider block mb-0.5">
                  {currentLang === 'hi' ? 'टिकट आईडी:' : 'Ticket ID:'}
                </span>
                <span className="font-mono font-bold text-[#1A1A1A] text-sm">
                  {activeIssue.id}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#A89F96] uppercase tracking-wider block mb-0.5">
                  {currentLang === 'hi' ? 'विभाग:' : 'Assigned Dept:'}
                </span>
                <span className="font-bold text-[#E8571A] text-xs uppercase">
                  {getDeptName(activeIssue.department)}
                </span>
              </div>
            </div>

            {/* Live Progress Timeline */}
            <div className="pt-3 border-t border-[#EDE8E3]">
              <h3 className="text-xs font-mono font-bold text-[#5C5449] uppercase tracking-wider mb-4 flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 bg-[#E8571A] rounded-full animate-pulse"></span>
                {currentLang === 'hi' ? 'आपकी शिकायत का सफ़र' : "Your complaint's journey"}
              </h3>

              <div className="relative pl-5 space-y-5 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-[#EDE8E3]">
                
                {/* State 1: Submitted */}
                <div className="relative">
                  <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 border-white bg-[#138808] shadow-xs z-10"></div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A] flex items-center gap-2">
                      <span>{currentLang === 'hi' ? 'शिकायत दर्ज हुई' : 'Report received'}</span>
                      <span className="px-1.5 py-0.5 bg-[#E8F5E3] border border-[#CDE5C4] text-[#138808] text-[9px] font-mono font-bold rounded uppercase">
                        {currentLang === 'en' ? 'Unassigned' : 'अनावंटित'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#5C5449] mt-0.5 leading-relaxed">
                      {currentLang === 'hi' ? 'टिकट सफलतापूर्वक पंजीकृत हो गया है और समीक्षा के अधीन है।' : 'Ticket registered and routed to appropriate municipal engineers.'}
                    </p>
                  </div>
                </div>

                {/* State 2: Contractor Assigned */}
                <div className="relative">
                  <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs z-10 ${
                    activeIssue.status === 'resolved'
                      ? 'bg-[#138808]'
                      : activeIssue.status === 'in_progress' || activeIssue.status === 'pending'
                        ? 'bg-[#E8571A]'
                        : 'bg-[#EDE8E3]'
                  }`}></div>
                  <div>
                    <h4 className={`text-xs font-bold ${
                      activeIssue.status === 'in_progress' || activeIssue.status === 'pending' || activeIssue.status === 'resolved'
                        ? 'text-[#1A1A1A]'
                        : 'text-[#A89F96]'
                    }`}>
                      {currentLang === 'hi' ? 'कार्यकर्ता भेजा गया' : 'Contractor dispatched'}
                    </h4>
                    <p className="text-[11px] text-[#5C5449] mt-0.5 leading-relaxed">
                      {currentLang === 'hi' ? 'शिकायत समाधान के लिए स्थानीय ठेकेदार को आवंटित कर दी गई है।' : 'Operational contractor has been allocated to solve the local ticket.'}
                    </p>
                  </div>
                </div>

                {/* State 3: Resolved */}
                <div className="relative">
                  <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs z-10 ${
                    activeIssue.status === 'resolved'
                      ? 'bg-[#138808]'
                      : 'bg-[#EDE8E3]'
                  }`}></div>
                  <div>
                    <h4 className={`text-xs font-bold ${
                      activeIssue.status === 'resolved'
                        ? 'text-[#1A1A1A]'
                        : 'text-[#A89F96]'
                    }`}>
                      {currentLang === 'hi' ? 'समस्या सुलझाई गई' : 'Resolved & closed'}
                    </h4>
                    <p className="text-[11px] text-[#5C5449] mt-0.5 leading-relaxed">
                      {currentLang === 'hi' ? 'नगर निगम निरीक्षक द्वारा शिकायत का दृश्य प्रमाण सत्यापित किया गया।' : 'Resolution proof visual audit completed by municipal inspector.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RATING & FEEDBACK SYSTEM */}
            {activeIssue.status === 'resolved' && (
              <div className="pt-4 border-t border-[#EDE8E3]" id="rating-feedback-section">
                {activeIssue.rating ? (
                  <div className="bg-[#E8F5E3] border border-[#CDE5C4] p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#E8F5E3] border border-[#CDE5C4] text-[#138808] flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#138808]">
                          {currentLang === 'hi' ? 'आपकी प्रतिक्रिया के लिए धन्यवाद!' : 'Thank you for your feedback!'}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-[#CDE5C4] p-2.5 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-bold mr-1">{currentLang === 'hi' ? 'आपकी रेटिंग:' : 'Rating:'}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((starValue) => (
                            <Star
                              key={starValue}
                              className={`w-3.5 h-3.5 ${starValue <= (activeIssue.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {activeIssue.feedbackText && (
                        <p className="text-xs text-slate-700 italic">
                          " {activeIssue.feedbackText} "
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F8F8FA] border border-[#EDE8E3] p-4 rounded-xl flex flex-col gap-3 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-[#E8571A]" />
                        <span>{currentLang === 'hi' ? 'आपका अनुभव कैसा रहा?' : 'How was your experience?'}</span>
                      </h4>
                      <p className="text-[11px] text-[#5C5449] mt-0.5">
                        {currentLang === 'hi' ? 'आपकी रेटिंग सीधे ठेकेदार के प्रदर्शन मूल्यांकन को प्रभावित करती है।' : 'Your rating directly impacts contractor performance metrics.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <button
                            key={starValue}
                            type="button"
                            onMouseEnter={() => setRatingHover(starValue)}
                            onMouseLeave={() => setRatingHover(0)}
                            onClick={() => setRatingInput(starValue)}
                            className="p-0.5 cursor-pointer"
                            id={`star-btn-${starValue}`}
                          >
                            <Star
                              className={`w-5.5 h-5.5 transition-colors ${
                                starValue <= (ratingHover || ratingInput)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <textarea
                        value={feedbackTextInput}
                        onChange={(e) => setFeedbackTextInput(e.target.value)}
                        placeholder={currentLang === 'hi' ? 'अपना अनुभव साझा करें (वैकल्पिक)...' : 'Share your experience with this resolution...'}
                        rows={1}
                        className="block w-full px-3 py-1.5 border border-[#EDE8E3] rounded-lg text-xs text-[#1A1A1A] placeholder-[#A89F96] focus:outline-none focus:border-[#E8571A] focus:ring-2 focus:ring-[#E8571A]/10 transition-all resize-none"
                        id="feedback-text-area"
                      />
                    </div>

                    <button
                      disabled={ratingInput === 0 || isSubmittingFeedback}
                      onClick={handleFeedbackSubmit}
                      className={`w-full inline-flex items-center justify-center gap-1.5 font-semibold text-xs py-2 px-4 rounded-lg transition-all cursor-pointer ${
                        ratingInput > 0 && !isSubmittingFeedback
                          ? 'bg-[#E8571A] hover:bg-[#C94B12] text-white shadow-xs'
                          : 'bg-slate-200 text-[#A89F96] cursor-not-allowed'
                      }`}
                      id="btn-submit-feedback"
                    >
                      {isSubmittingFeedback ? (
                        <Loader2 className="w-3 animate-spin" />
                      ) : (
                        <span>{currentLang === 'hi' ? 'रेटिंग और फीडबैक सबमिट करें' : 'Submit Feedback & Rating'}</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-[#EDE8E3] flex gap-3">
              <button
                onClick={onBackToHome}
                className="flex-1 bg-[#F4F4F5] hover:bg-[#EDE8E3] text-[#5C5449] border border-[#EDE8E3] font-semibold py-2.5 px-4 rounded-xl text-center text-xs transition-all cursor-pointer"
                id="btn-track-back-home"
              >
                {currentLang === 'en' ? 'Back' : 'वापस जाएं'}
              </button>
              <button
                onClick={resetTracker}
                className="flex-1 bg-[#E8571A] hover:bg-[#C94B12] text-white font-bold py-2.5 px-4 rounded-xl text-center text-xs transition-all cursor-pointer shadow-xs"
                id="btn-track-another-ticket"
              >
                {currentLang === 'en' ? 'Track Another' : 'दूसरी शिकायत ट्रैक करें'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
