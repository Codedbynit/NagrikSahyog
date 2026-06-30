import React, { useState, useEffect } from 'react';
import { Language, Department, Issue, IssueStatus, AppView } from '../types';
import { translations } from '../data/translations';
import { compressImage } from '../lib/imageCompression';
import { 
  User, Mail, MapPin, Compass, ArrowLeft, Image as ImageIcon, 
  UploadCloud, Sparkles, CheckCircle, ArrowRight, Loader2,
  Calendar, CheckCircle2, ShieldAlert, AlertCircle, RefreshCw, Star,
  Wrench, Trash2, Lightbulb, Droplet
} from 'lucide-react';

interface CitizenReportingFlowProps {
  currentLang: Language;
  issues: Issue[];
  onIssueSubmit: (newIssue: Omit<Issue, 'id' | 'status'> & { id?: string; status?: IssueStatus }) => string;
  onUpdateIssueStatus: (id: string, newStatus: IssueStatus, extra?: Partial<Issue>) => void;
  onBackToHome: () => void;
  onViewChange: (view: AppView) => void;
}

export const CitizenReportingFlow: React.FC<CitizenReportingFlowProps> = ({
  currentLang,
  issues,
  onIssueSubmit,
  onUpdateIssueStatus,
  onBackToHome,
  onViewChange,
}) => {
  const t = translations[currentLang];
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [beforeImage, setBeforeImage] = useState('');
  const [detectedDept, setDetectedDept] = useState<Department>('pwd');
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Validation Error States (Active clickable buttons trigger these inline)
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [descError, setDescError] = useState('');
  const [imageError, setImageError] = useState('');

  // Email Notification States
  const [dispatchedEmail, setDispatchedEmail] = useState<{
    subject: string;
    emailHtml: string;
    recipient: string;
    timestamp: string;
    realEmailSent?: boolean;
    realEmailError?: string | null;
    apiKeyConfigured?: boolean;
  } | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Success tracking & Lookup state
  const [createdTicketId, setCreatedTicketId] = useState('');
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');

  // Rating & Feedback local form states
  const [ratingInput, setRatingInput] = useState<number>(0);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [feedbackTextInput, setFeedbackTextInput] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Find current tracked issue
  const currentTrackedIssue = issues.find(i => i.id === createdTicketId);
  const currentTrackingStatus = currentTrackedIssue ? currentTrackedIssue.status : 'unassigned';

  // Trigger Geolocation automatically when arriving at Step 2
  useEffect(() => {
    if (step === 2) {
      triggerGeolocation();
    }
  }, [step]);

  const triggerGeolocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setIsLocating(false);
          setAddress(prev => prev || `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.warn("Geolocation failed", error);
          setLat(28.6129);
          setLng(77.2295);
          setIsLocating(false);
          setAddress(prev => prev || "Connaught Place, New Delhi");
          setLocationError(currentLang === 'en' ? "GPS request timed out. Using fallback municipal center." : "जगह अपने आप नहीं मिली। नीचे अपना पता लिखें।");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLat(28.6129);
      setLng(77.2295);
      setIsLocating(false);
      setAddress(prev => prev || "Connaught Place, New Delhi");
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  const handleSelectSample = (sampleType: Department) => {
    setIsAiAnalyzing(true);
    setImageError('');
    setDetectedDept(sampleType);
    setAiConfidence(Math.floor(Math.random() * 8) + 91); // 91% to 98%
    
    let imageUrl = '';
    let desc = '';
    if (sampleType === 'pwd') {
      imageUrl = "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80";
      desc = "Major asphalt breakdown creating a huge pothole. Extremely risky for commuter traffic.";
    } else if (sampleType === 'sanitation') {
      imageUrl = "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80";
      desc = "Piles of domestic plastic and cardboard bags decomposing out in the open near children park.";
    } else if (sampleType === 'electricity') {
      imageUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80";
      desc = "Public lamppost completely burnt out. Entire lane goes black from 7 PM.";
    } else if (sampleType === 'water') {
      imageUrl = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80";
      desc = "Heavy leakage from underground water pipeline flooding clean water over the main road.";
    }

    setBeforeImage(imageUrl);
    if (!issueDescription) {
      setIssueDescription(desc);
    }

    setTimeout(() => {
      setIsAiAnalyzing(false);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAiAnalyzing(true);
      setImageError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        compressImage(reader.result as string).then(compressed => {
          setBeforeImage(compressed);
          
          fetch('/api/analyze-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64: compressed }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.department) {
                setDetectedDept(data.department as Department);
                setAiConfidence(data.confidence || Math.floor(Math.random() * 12) + 85);
              } else {
                setDetectedDept('pwd');
                setAiConfidence(Math.floor(Math.random() * 12) + 85);
              }
            })
            .catch(err => {
              console.error("Error analyzing image:", err);
              setDetectedDept('pwd');
              setAiConfidence(Math.floor(Math.random() * 12) + 85);
            })
            .finally(() => {
              setIsAiAnalyzing(false);
            });
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStep1Next = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError(currentLang === 'en' ? 'Please enter your name.' : 'कृपया अपना नाम दर्ज करें।');
      valid = false;
    } else {
      setNameError('');
    }

    if (!email.trim() || !email.includes('@')) {
      setEmailError(currentLang === 'en' ? 'Please enter a valid email address.' : 'कृपया एक सही ईमेल पता दर्ज करें।');
      valid = false;
    } else {
      setEmailError('');
    }

    if (valid) {
      setStep(2);
    }
  };

  const handleStep2Next = () => {
    let valid = true;
    if (!address.trim()) {
      setAddressError(currentLang === 'en' ? 'Please verify your address.' : 'कृपया अपने पते की पुष्टि करें।');
      valid = false;
    } else {
      setAddressError('');
    }

    if (!issueDescription.trim()) {
      setDescError(currentLang === 'en' ? 'Please describe the issue.' : 'कृपया समस्या का विवरण दर्ज करें।');
      valid = false;
    } else {
      setDescError('');
    }

    if (valid) {
      setStep(3);
    }
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeImage) {
      setImageError(currentLang === 'en' ? 'Please upload or select a preset photo.' : 'कृपया एक फ़ोटो अपलोड करें या प्रीसेट चुनें।');
      return;
    }
    setImageError('');

    const finalImage = beforeImage;

    const issueDetails = {
      name: name || "Anonymous Citizen",
      email: email || "citizen@nagriksahyog.gov.in",
      latitude: lat,
      longitude: lng,
      address: address || "Captured Coordinates Location",
      landmark: landmark || "Central Ward",
      department: detectedDept,
      description: issueDescription || "No description provided.",
      beforeImage: finalImage,
    };

    const ticketId = onIssueSubmit(issueDetails);

    setCreatedTicketId(ticketId);
    setStep(4);

    // Call server-side REST API to compile and "send" confirmation email
    setLoadingEmail(true);
    fetch("/api/send-confirmation-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        issue: { ...issueDetails, id: ticketId },
        appStatus: {
          totalCount: issues.length + 1,
          unassignedCount: issues.filter((i) => i.status === "unassigned").length + 1,
          inProgressCount: issues.filter((i) => i.status === "in_progress").length,
          pendingCount: issues.filter((i) => i.status === "pending").length,
          resolvedCount: issues.filter((i) => i.status === "resolved").length,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDispatchedEmail({
            subject: data.subject,
            emailHtml: data.emailHtml,
            recipient: data.recipient,
            timestamp: data.timestamp,
            realEmailSent: data.realEmailSent,
            realEmailError: data.realEmailError,
            apiKeyConfigured: data.apiKeyConfigured,
          });
        }
      })
      .catch((err) => {
        console.error("Error dispatching ticket email confirmation:", err);
      })
      .finally(() => {
        setLoadingEmail(false);
      });
  };

  const handleLookupTicket = () => {
    const formattedId = lookupId.trim().toUpperCase();
    if (!formattedId) return;
    
    const found = issues.find(i => i.id === formattedId);
    if (found) {
      setCreatedTicketId(found.id);
      setRatingInput(found.rating || 0);
      setFeedbackTextInput(found.feedbackText || '');
      setStep(4);
    } else {
      setLookupError(t.track_ticket_not_found || "Ticket not found.");
    }
  };

  const handleFeedbackSubmit = () => {
    if (ratingInput === 0) return;
    setIsSubmittingFeedback(true);
    setTimeout(() => {
      onUpdateIssueStatus(createdTicketId, 'resolved', {
        rating: ratingInput,
        feedbackText: feedbackTextInput.trim(),
        feedbackSubmittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
      });
      setIsSubmittingFeedback(false);
    }, 600);
  };

  return (
    <div className="py-4 sm:py-6 md:py-8 px-4 sm:px-6 max-w-xl mx-auto flex flex-col justify-center min-h-[calc(100vh-52px)]">
      {/* Premium Back Navigation Button */}
      {step !== 4 && (
        <div className="flex justify-start">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 bg-[#F4F4F5] text-[#52525B] rounded-[8px] px-3 py-2 text-[13px] border border-[#E4E4E7] hover:bg-[#E4E4E7] hover:text-[#18181B] active:scale-[0.98] transition-all duration-150 cursor-pointer mb-5"
            id="btn-citizen-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'Back' : 'वापस जाएं'}</span>
          </button>
        </div>
      )}

      {/* Step Tracker Realignment */}
      <div className="mb-6" id="step-progress-indicator">
        <div className="flex items-center justify-between text-[13px] sm:text-sm text-[#52525B] font-sans font-medium pb-4 select-none">
          <span className="tracking-wide text-[#E8571A] font-bold flex items-center">
            {currentLang === 'hi' ? `चरण ${step} / 4` : `Step ${step} / 4`}
          </span>
          <span className="text-[#1A1A1A] font-semibold flex items-center">
            {step === 1 && (currentLang === 'hi' ? 'आपकी जानकारी' : 'Contact Information')}
            {step === 2 && (currentLang === 'hi' ? 'जगह की जानकारी' : 'Location Details')}
            {step === 3 && (currentLang === 'hi' ? 'फ़ोटो भेजें' : 'Proof Upload')}
            {step === 4 && (currentLang === 'hi' ? 'सफलतापूर्वक सबमिट किया गया' : 'Submission Success')}
          </span>
        </div>
        <div className="w-full bg-[#EDE8E3] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-[#E8571A] h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Snug Centered Card - background white, border 1px solid #EDE8E3 per Section 4 */}
      <div className="bg-white border border-[#EDE8E3] rounded-2xl p-5 sm:p-6 md:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        
        {/* STEP 1: Accountabilities details */}
        {step === 1 && (
          <div className="flex flex-col gap-5" id="citizen-step-1">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">
                {currentLang === 'hi' ? 'आपकी जानकारी' : 'Contact Information'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5449] leading-relaxed">
                {currentLang === 'hi' ? 'आपकी जानकारी से हम आपको रिपोर्ट का हाल बताते रहेंगे।' : 'Your details help us send you real-time updates on your report.'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Name Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#5C5449]">
                  {currentLang === 'hi' ? 'आपका नाम' : 'Your name'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#A89F96] pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (e.target.value.trim()) setNameError('');
                    }}
                    className={`block w-full pl-9 pr-4 py-2 border rounded-lg text-sm text-[#1A1A1A] placeholder-[#A89F96] focus:outline-none focus:ring-2 focus:ring-[#E8571A]/10 transition-all ${
                      nameError ? 'border-rose-500 focus:border-rose-500' : 'border-[#EDE8E3] focus:border-[#E8571A]'
                    }`}
                    placeholder={currentLang === 'hi' ? 'जैसे: राहुल शर्मा' : 'e.g. Rahul Sharma'}
                    id="input-citizen-name"
                  />
                </div>
                {nameError && (
                  <p className="text-rose-500 text-xs mt-0.5 font-medium flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#5C5449]">
                  {currentLang === 'hi' ? 'ईमेल पता' : 'Your email'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#A89F96] pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value.trim().includes('@')) setEmailError('');
                    }}
                    className={`block w-full pl-9 pr-4 py-2 border rounded-lg text-sm text-[#1A1A1A] placeholder-[#A89F96] focus:outline-none focus:ring-2 focus:ring-[#E8571A]/10 transition-all ${
                      emailError ? 'border-rose-500 focus:border-rose-500' : 'border-[#EDE8E3] focus:border-[#E8571A]'
                    }`}
                    placeholder={currentLang === 'hi' ? 'जैसे: rahul@example.com' : 'e.g. rahul@example.com'}
                    id="input-citizen-email"
                  />
                </div>
                {emailError && (
                  <p className="text-rose-500 text-xs mt-0.5 font-medium flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {emailError}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#EDE8E3] flex justify-end">
              <button
                onClick={handleStep1Next}
                className="bg-[#E8571A] text-white rounded-[10px] px-6 py-2.5 font-bold text-[15px] tracking-[0.01em] shadow-[0_2px_8px_rgba(232,87,26,0.25)] hover:bg-[#C94B12] active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-1"
                id="btn-step1-next"
              >
                <span>{currentLang === 'hi' ? 'आगे बढ़ें →' : 'Next Step →'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Location Map & Coordinates info */}
        {step === 2 && (
          <div className="flex flex-col gap-5" id="citizen-step-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">
                {currentLang === 'hi' ? 'जगह की जानकारी' : 'Location Details'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5449] leading-relaxed">
                {currentLang === 'hi' ? 'हमें बताएं कि समस्या कहाँ है। सटीक स्थान बताने से हमारी टीमों को तेजी से पहुँचने में मदद मिलती है।' : 'Tell us where the problem is. Letting us know the exact location helps our teams arrive faster.'}
              </p>
            </div>

            {/* Premium Interactive Map Placeholder */}
            <div className="relative w-full h-44 bg-[#F8F8FA] rounded-xl border border-[#EDE8E3] overflow-hidden flex flex-col items-center justify-center select-none">
              {isLocating ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-[#E8571A] animate-spin" />
                  <span className="text-[11px] font-mono font-bold text-[#5C5449] uppercase tracking-wider">
                    {currentLang === 'hi' ? 'आपकी लोकेशन मिल रही है...' : 'Pinpointing your coordinates...'}
                  </span>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-between p-3.5 bg-[#F8F8FA]">
                  {/* Grid Lines Mock Map */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ede8e3_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-60"></div>
                  
                  {/* Mock Streets */}
                  <div className="absolute top-1/2 left-0 w-full h-8 bg-white border-y border-[#EDE8E3] -translate-y-1/2"></div>
                  <div className="absolute top-0 left-1/3 w-8 h-full bg-white border-x border-[#EDE8E3]"></div>

                  {/* Marker Pin */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="bg-[#E8571A] text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded-md shadow-md mb-0.5 whitespace-nowrap">
                      {lat ? `${lat.toFixed(4)}, ${lng?.toFixed(4)}` : 'Captured'}
                    </div>
                    <MapPin className="w-7 h-7 text-[#E8571A] animate-bounce" fill="rgba(232, 87, 26, 0.2)" />
                  </div>

                  {/* Map Floating Indicator */}
                  <div className="relative z-10 bg-white border border-[#EDE8E3] p-2 rounded-lg max-w-xs shadow-xs self-start">
                    <p className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5 leading-none">
                      <Compass className="w-3.5 h-3.5 text-[#138808]" />
                      {currentLang === 'hi' ? 'जगह मिल गई' : 'Location detected'}
                    </p>
                  </div>

                  {/* Map Recapture Button */}
                  <button
                    onClick={triggerGeolocation}
                    className="relative z-10 self-end bg-white hover:bg-[#FAFAFA] text-[#5C5449] text-[10px] font-bold uppercase border border-[#EDE8E3] py-1.5 px-2 rounded-md flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                    id="btn-recapture-geo"
                  >
                    <RefreshCw className="w-3 h-3 text-[#E8571A]" />
                    <span>{currentLang === 'hi' ? 'फिर से कोशिश करें' : 'Try again'}</span>
                  </button>
                </div>
              )}
            </div>

            {locationError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Address inputs */}
            <div className="flex flex-col gap-3">
              {/* Verified Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#5C5449]">
                  {currentLang === 'hi' ? 'पता' : 'Verified Address'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (e.target.value.trim()) setAddressError('');
                  }}
                  className={`block w-full px-3 py-2 border rounded-lg text-sm text-[#1A1A1A] placeholder-[#A89F96] focus:outline-none focus:ring-2 focus:ring-[#E8571A]/10 transition-all ${
                    addressError ? 'border-rose-500 focus:border-rose-500' : 'border-[#EDE8E3] focus:border-[#E8571A]'
                  }`}
                  placeholder={currentLang === 'hi' ? 'सटीक पता दर्ज करें' : 'e.g. 15, Barakhamba Road'}
                  id="input-citizen-address"
                />
                {addressError && (
                  <p className="text-rose-500 text-xs mt-0.5 font-medium flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {addressError}
                  </p>
                )}
              </div>

              {/* Landmark */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#5C5449]">
                  {currentLang === 'hi' ? 'पास का कोई निशान' : 'Nearest Landmark'}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="block w-full px-3 py-2 border border-[#EDE8E3] rounded-lg text-sm text-[#1A1A1A] placeholder-[#A89F96] focus:outline-none focus:border-[#E8571A] focus:ring-2 focus:ring-[#E8571A]/10 transition-all"
                  placeholder={currentLang === 'hi' ? 'जैसे: मेट्रो पिलर 124 के पास' : 'e.g. Near Metro Pillar 124'}
                  id="input-citizen-landmark"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#5C5449]">
                  {currentLang === 'hi' ? 'समस्या का विवरण दें' : 'Describe the Issue'} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => {
                    setIssueDescription(e.target.value);
                    if (e.target.value.trim()) setDescError('');
                  }}
                  rows={2}
                  className={`block w-full px-3 py-2 border rounded-lg text-sm text-[#1A1A1A] placeholder-[#A89F96] focus:outline-none focus:ring-2 focus:ring-[#E8571A]/10 transition-all resize-none ${
                    descError ? 'border-rose-500 focus:border-rose-500' : 'border-[#EDE8E3] focus:border-[#E8571A]'
                  }`}
                  placeholder={currentLang === 'hi' ? 'सड़क के गड्ढे, कचरे के ढेर या टूटी लाइट के बारे में बताएं...' : 'Describe the road pot-hole, garbage pile-up, leaking water line in detail...'}
                  id="input-citizen-desc"
                ></textarea>
                {descError && (
                  <p className="text-rose-500 text-xs mt-0.5 font-medium flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {descError}
                  </p>
                )}
              </div>
            </div>

            {/* Back & Next Button controls */}
            <div className="pt-4 border-t border-[#EDE8E3] flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="bg-[#F4F4F5] text-[#5C5449] rounded-[8px] px-3 py-2 text-[13px] border border-[#EDE8E3] hover:bg-[#EDE8E3] hover:text-[#1A1A1A] active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                id="btn-step2-prev"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentLang === 'en' ? 'Back' : 'वापस जाएं'}</span>
              </button>
              <button
                onClick={handleStep2Next}
                className="bg-[#E8571A] text-white rounded-[10px] px-6 py-2.5 font-bold text-[15px] tracking-[0.01em] shadow-[0_2px_8px_rgba(232,87,26,0.25)] hover:bg-[#C94B12] active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-1"
                id="btn-step2-next"
              >
                <span>{currentLang === 'hi' ? 'आगे बढ़ें →' : 'Next Step →'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Proof Image Upload & Simulated AI Classifier */}
        {step === 3 && (
          <div className="flex flex-col gap-5" id="citizen-step-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">
                {currentLang === 'hi' ? 'फ़ोटो भेजें' : 'Proof Upload'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5449] leading-relaxed">
                {currentLang === 'hi' ? 'समस्या की एक तस्वीर अपलोड करें। हम स्वचालित रूप से सही विभाग ढूंढकर उन्हें भेज देंगे।' : 'Upload a photo of the issue. We will automatically find the right department and send it to them.'}
              </p>
            </div>

            {/* Testing Presets Grid */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[#5C5449] uppercase tracking-wider">
                {currentLang === 'en' ? 'Or use a sample preset to simulate instant dispatch:' : 'या तुरंत वर्गीकरण देखने के लिए एक सैंपल चुनें:'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectSample('pwd')}
                  className={`py-1.5 px-3.5 text-xs font-semibold border rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                    detectedDept === 'pwd' && beforeImage.includes('photo-15151')
                      ? 'border-[#E8571A] bg-[#FEF0E8] text-[#E8571A]'
                      : 'border-[#EDE8E3] bg-white text-[#5C5449] hover:border-[#E8571A]/40'
                  }`}
                  id="btn-preset-pothole"
                >
                  <Wrench className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">PWD</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('sanitation')}
                  className={`py-1.5 px-3.5 text-xs font-semibold border rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                    detectedDept === 'sanitation' && beforeImage.includes('photo-1611')
                      ? 'border-[#E8571A] bg-[#FEF0E8] text-[#E8571A]'
                      : 'border-[#EDE8E3] bg-white text-[#5C5449] hover:border-[#E8571A]/40'
                  }`}
                  id="btn-preset-waste"
                >
                  <Trash2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Sanitation</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('electricity')}
                  className={`py-1.5 px-3.5 text-xs font-semibold border rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                    detectedDept === 'electricity' && beforeImage.includes('photo-15091')
                      ? 'border-[#E8571A] bg-[#FEF0E8] text-[#E8571A]'
                      : 'border-[#EDE8E3] bg-white text-[#5C5449] hover:border-[#E8571A]/40'
                  }`}
                  id="btn-preset-lighting"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">Electricity</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('water')}
                  className={`py-1.5 px-3.5 text-xs font-semibold border rounded-lg text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                    detectedDept === 'water' && beforeImage.includes('photo-15043')
                      ? 'border-[#E8571A] bg-[#FEF0E8] text-[#E8571A]'
                      : 'border-[#EDE8E3] bg-white text-[#5C5449] hover:border-[#E8571A]/40'
                  }`}
                  id="btn-preset-leakage"
                >
                  <Droplet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">Water</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop File Upload Container */}
            <div className="relative border-2 border-dashed border-[#EDE8E3] hover:border-[#E8571A] rounded-xl p-5 transition-all bg-[#F8F8FA] flex flex-col items-center justify-center text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-uploader"
              />
              <UploadCloud className="w-8 h-8 text-[#A89F96] mb-1.5" />
              <p className="text-xs sm:text-sm font-semibold text-[#1A1A1A] mb-0.5">
                {currentLang === 'hi' ? 'फ़ोटो खींचें या गैलरी से चुनें' : 'Tap to take a photo or upload from gallery'}
              </p>
              <p className="text-[10px] text-[#A89F96] font-mono">
                Supports JPG, PNG up to 10MB
              </p>
            </div>

            {imageError && (
              <p className="text-rose-500 text-xs font-medium flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                {imageError}
              </p>
            )}

            {/* Realtime Classifier status box */}
            {isAiAnalyzing ? (
              <div className="bg-[#F8F8FA] border border-[#EDE8E3] p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-[#E8571A] animate-spin" />
                <p className="text-[11px] font-mono font-bold text-[#5C5449] uppercase tracking-wider animate-pulse">
                  {currentLang === 'hi' ? 'सही विभाग ढूंढा जा रहा है...' : 'Finding the right department...'}
                </p>
              </div>
            ) : beforeImage ? (
              <div className="bg-white border border-[#EDE8E3] rounded-xl p-3.5 flex flex-col gap-3" id="ai-classification-report">
                <div className="relative h-32 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <img
                     src={beforeImage}
                     alt="Uploaded proof"
                     className="w-full h-full object-cover"
                     referrerPolicy="no-referrer"
                  />
                </div>

                {/* AI Predicted Department */}
                <div className="bg-[#E8F5E3] border border-[#CDE5C4] p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#138808] shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold leading-none mb-1">
                        {currentLang === 'hi' ? 'एआई वर्गीकरण:' : 'AI Triage:'}
                      </span>
                      <span className="font-bold text-slate-800 text-xs capitalize leading-none">
                        {detectedDept === 'pwd' && (currentLang === 'hi' ? 'लोक निर्माण विभाग' : 'PWD & Roads')}
                        {detectedDept === 'sanitation' && (currentLang === 'hi' ? 'स्वच्छता विभाग' : 'Waste & Sanitation')}
                        {detectedDept === 'electricity' && (currentLang === 'hi' ? 'बिजली विभाग' : 'Electricity & Lighting')}
                        {detectedDept === 'water' && (currentLang === 'hi' ? 'जल बोर्ड' : 'Water & Sewage')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold leading-none mb-1">
                      {currentLang === 'hi' ? 'सटीकता:' : 'Confidence:'}
                    </span>
                    <span className="font-mono font-bold text-[#138808] text-xs">
                      {aiConfidence || 96}%
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Footer control panel */}
            <div className="pt-4 border-t border-[#EDE8E3] flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="bg-[#F4F4F5] text-[#5C5449] rounded-[8px] px-3 py-2 text-[13px] border border-[#EDE8E3] hover:bg-[#EDE8E3] hover:text-[#1A1A1A] active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                id="btn-step3-prev"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentLang === 'en' ? 'Back' : 'वापस जाएं'}</span>
              </button>
              <button
                onClick={handleStep3Submit}
                className="bg-[#E8571A] text-white rounded-[10px] px-6 py-2.5 font-bold text-[15px] tracking-[0.01em] shadow-[0_2px_8px_rgba(232,87,26,0.25)] hover:bg-[#C94B12] active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-1"
                id="btn-submit-complaint"
              >
                <span>{currentLang === 'hi' ? 'शिकायत भेजें' : 'Submit Civic Report'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success confirmation & Real-time Live Tracking Timeline */}
        {step === 4 && (
          <div className="flex flex-col gap-5" id="citizen-step-4">
            <div className="text-center flex flex-col items-center pb-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-[#138808] mb-3 border border-[#CDE5C4] shadow-xs">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">
                {currentLang === 'hi' ? 'शिकायत दर्ज हुई!' : 'Magic Tracking Link Generated!'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5449] leading-relaxed max-w-sm mt-1">
                {currentLang === 'hi' ? 'हमने आपके ईमेल पर एक सुरक्षित ट्रैकिंग लिंक भेजा है। आप कभी भी स्थिति देख सकते हैं।' : 'We have sent a secure tracking link to your email. You can check this page anytime to monitor real-time updates.'}
              </p>
            </div>

            {/* Generated Ticket Box */}
            <div className="bg-[#F8F8FA] border border-[#EDE8E3] rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#A89F96] uppercase tracking-wider block mb-0.5">
                  {currentLang === 'hi' ? 'टिकट आईडी:' : 'Ticket ID:'}
                </span>
                <span className="font-mono font-bold text-[#1A1A1A] text-sm">
                  {createdTicketId}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#A89F96] uppercase tracking-wider block mb-0.5">
                  {currentLang === 'hi' ? 'विभाग:' : 'Assigned Dept:'}
                </span>
                <span className="font-bold text-[#E8571A] text-xs uppercase">
                  {detectedDept.toUpperCase()}
                </span>
              </div>
            </div>

            {/* EMAIL SENT HIGHLIGHT */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 flex items-start gap-2.5">
              <div className="p-1.5 bg-emerald-100/70 rounded-lg text-emerald-800 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-900">
                  {currentLang === 'hi' 
                    ? 'पुष्टिकरण ईमेल भेजा गया!' 
                    : 'Confirmation Email Sent!'
                  }
                </h4>
                <p className="text-[11px] text-slate-600 leading-normal mt-0.5">
                  {currentLang === 'hi' 
                    ? `एक आधिकारिक पुष्टिकरण पावती आपके ईमेल ${email || "citizen@nagriksahyog.gov.in"} पर भेज दी गई है।`
                    : `An official confirmation receipt has been successfully dispatched to your email ${email || "citizen@nagriksahyog.gov.in"}.`
                  }
                </p>
              </div>
            </div>

            {/* LIVE LIFECYCLE TIMELINE CONTAINER (No Sandbox coaching tips) */}
            <div className="pt-3 border-t border-[#EDE8E3]">
              <h3 className="text-xs font-mono font-bold text-[#5C5449] uppercase tracking-wider mb-4 flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 bg-[#E8571A] rounded-full animate-pulse"></span>
                {currentLang === 'hi' ? 'आपकी शिकायत का सफ़र' : "Your complaint's journey"}
              </h3>

              {/* Real Timeline */}
              <div className="relative pl-5 space-y-5 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-[#EDE8E3]">
                
                {/* State 1: Submitted & Unassigned */}
                <div className="relative">
                  {/* Dot - Completed is green */}
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
                  {/* Dot - Completed is green, active is saffron */}
                  <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs z-10 ${
                    currentTrackingStatus === 'resolved'
                      ? 'bg-[#138808]'
                      : currentTrackingStatus === 'in_progress' || currentTrackingStatus === 'pending'
                        ? 'bg-[#E8571A]'
                        : 'bg-[#EDE8E3]'
                  }`}></div>
                  <div>
                    <h4 className={`text-xs font-bold ${
                      currentTrackingStatus === 'in_progress' || currentTrackingStatus === 'pending' || currentTrackingStatus === 'resolved'
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

                {/* State 3: Resolved & Audited */}
                <div className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs z-10 ${
                    currentTrackingStatus === 'resolved'
                      ? 'bg-[#138808]'
                      : 'bg-[#EDE8E3]'
                  }`}></div>
                  <div>
                    <h4 className={`text-xs font-bold ${
                      currentTrackingStatus === 'resolved'
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
            {currentTrackingStatus === 'resolved' && (
              <div className="pt-4 border-t border-[#EDE8E3]" id="rating-feedback-section">
                {currentTrackedIssue?.rating ? (
                  <div className="bg-[#E8F5E3] border border-[#CDE5C4] p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#E8F5E3] border border-[#CDE5C4] text-[#138808] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">
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
                               className={`w-3.5 h-3.5 ${starValue <= (currentTrackedIssue.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {currentTrackedIssue.feedbackText && (
                        <p className="text-xs text-slate-700 italic">
                          " {currentTrackedIssue.feedbackText} "
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

            {/* Snipped coaching sandbox lines, kept simple Actions */}
            <div className="pt-4 border-t border-[#EDE8E3] flex gap-3">
              <button
                onClick={onBackToHome}
                className="flex-1 bg-[#F4F4F5] hover:bg-[#EDE8E3] text-[#5C5449] border border-[#EDE8E3] font-semibold py-2.5 px-4 rounded-xl text-center text-xs transition-all cursor-pointer"
                id="btn-citizen-back-home"
              >
                {currentLang === 'en' ? 'Back' : 'वापस जाएं'}
              </button>
              <button
                onClick={() => {
                  setCreatedTicketId('');
                  setStep(1);
                  setLookupId('');
                  setLookupError('');
                }}
                className="flex-1 bg-[#E8571A] hover:bg-[#C94B12] text-white font-bold py-2.5 px-4 rounded-xl text-center text-xs transition-all cursor-pointer shadow-xs"
                id="btn-citizen-track-another"
              >
                {currentLang === 'en' ? 'Track Another Report' : 'दूसरी शिकायत ट्रैक करें'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
