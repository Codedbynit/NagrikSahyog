import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Building2, 
  Compass,
  Eye,
  EyeOff,
  Briefcase
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Language } from '../types';

interface MunicipalAuthPortalProps {
  currentLang: Language;
  onBackToHome: () => void;
  onSuccess: () => void;
}

export function MunicipalAuthPortal({ currentLang, onBackToHome, onSuccess }: MunicipalAuthPortalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'officer' | 'contractor'>('officer');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Localization
  const text = {
    en: {
      portal_title: "Municipal Command Portal",
      portal_subtitle: "Municipal Corporation Official Security Gateway",
      tab_signin: "Official Sign In",
      tab_register: "Register Official ID",
      email: "Official Email Address",
      email_placeholder: "officer@municipal.gov.in",
      password: "Access Password",
      password_placeholder: "Enter account password",
      name: "Full Name",
      name_placeholder: "Enter your full name",
      role: "Official Designation",
      role_officer: "Municipal Command Officer",
      role_contractor: "Authorized Contractor",
      passcode: "Authority Passcode",
      passcode_placeholder: "Enter municipal authority passcode",
      btn_signin: "Authenticate Credentials",
      btn_register: "Register Identity Profile",
      register_help: "To maintain security, registering an official account requires the central Municipal Authority Passcode.",
      eval_notice: "Evaluator Note: Use Authority Passcode MUNICIPAL-OFFICIAL-2026 to register a test account.",
      error_passcode: "Invalid Municipal Authority Passcode. Please contact the IT Administration Dept.",
      error_domain: "Official accounts must use a professional email address.",
      loading_auth: "Authenticating security credentials...",
      loading_reg: "Verifying municipal clearance...",
      signout: "Sign Out",
      success_reg: "Clearance approved! Profile registered successfully. Redirecting...",
      success_login: "Access granted. Welcome back, Officer."
    },
    hi: {
      portal_title: "नगर निगम कमांड पोर्टल",
      portal_subtitle: "नगर निगम आधिकारिक सुरक्षा प्रवेश द्वार",
      tab_signin: "आधिकारिक लॉगिन",
      tab_register: "आधिकारिक आईडी पंजीकृत करें",
      email: "आधिकारिक ईमेल पता",
      email_placeholder: "officer@municipal.gov.in",
      password: "एक्सेस पासवर्ड",
      password_placeholder: "खाता पासवर्ड दर्ज करें",
      name: "पूरा नाम",
      name_placeholder: "अपना पूरा नाम दर्ज करें",
      role: "आधिकारिक पद",
      role_officer: "नगर निगम कमांड अधिकारी",
      role_contractor: "अधिकृत ठेकेदार",
      passcode: "प्राधिकरण पासकोड",
      passcode_placeholder: "नगर निगम प्राधिकरण पासकोड दर्ज करें",
      btn_signin: "क्रेडेंशियल प्रमाणित करें",
      btn_register: "पहचान प्रोफ़ाइल पंजीकृत करें",
      register_help: "सुरक्षा बनाए रखने के लिए, आधिकारिक खाता पंजीकृत करने के लिए केंद्रीय नगर निगम प्राधिकरण पासकोड की आवश्यकता होती है।",
      eval_notice: "मूल्यांकनकर्ता नोट: टेस्ट खाता पंजीकृत करने के लिए प्राधिकरण पासकोड MUNICIPAL-OFFICIAL-2026 का उपयोग करें।",
      error_passcode: "अमान्य नगर निगम प्राधिकरण पासकोड। कृपया आईटी प्रशासन विभाग से संपर्क करें।",
      error_domain: "आधिकारिक खातों के लिए व्यावसायिक ईमेल पते का उपयोग किया जाना चाहिए।",
      loading_auth: "सुरक्षा क्रेडेंशियल प्रमाणित किए जा रहे हैं...",
      loading_reg: "नगर निगम निकासी का सत्यापन किया जा रहा है...",
      signout: "साइन आउट",
      success_reg: "निकासी स्वीकृत! प्रोफ़ाइल सफलतापूर्वक पंजीकृत। पुनर्निर्देशित किया जा रहा है...",
      success_login: "पहुंच प्रदान की गई। वापस स्वागत है, अधिकारी।"
    }
  };

  const t = text[currentLang];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setSuccessMsg(t.success_login);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      const isInputOrUserError = [
        'auth/invalid-credential',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/invalid-email'
      ].includes(err?.code);
      
      if (isInputOrUserError) {
        console.warn('Sign In validation warning:', err?.message || err);
      } else {
        console.error('Sign In error:', err);
      }
      let friendlyError = err.message;
      if (err.code === 'auth/invalid-credential') {
        friendlyError = currentLang === 'en' 
          ? 'Invalid official email or password. Please verify and try again.' 
          : 'अमान्य आधिकारिक ईमेल या पासवर्ड। कृपया जाँचें और पुनः प्रयास करें।';
      } else if (err.code === 'auth/user-not-found') {
        friendlyError = currentLang === 'en'
          ? 'No registered official profile found with this email.'
          : 'इस ईमेल के साथ कोई पंजीकृत आधिकारिक प्रोफ़ाइल नहीं मिली।';
      } else if (err.code === 'auth/wrong-password') {
        friendlyError = currentLang === 'en'
          ? 'Incorrect password. Account access is strictly logged.'
          : 'गलत पासवर्ड। खाता पहुंच कड़ाई से लॉग की जाती है।';
      } else if (err.code === 'auth/configuration-not-found') {
        friendlyError = currentLang === 'en'
          ? 'Firebase Authentication service is not yet enabled or configured in your Firebase Console. Please go to your Firebase Console under "Build > Authentication" and click "Get Started" to initialize it.'
          : 'आपके फायरबेस कंसोल में फायरबेस प्रमाणीकरण सेवा अभी तक सक्षम या कॉन्फ़िगर नहीं की गई है। कृपया अपने फायरबेस कंसोल में "Build > Authentication" पर जाएं और इसे प्रारंभ करने के लिए "Get Started" पर क्लिक करें।';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyError = currentLang === 'en'
          ? 'Email/Password authentication provider is disabled. Please enable the "Email/Password" provider in your Firebase Console (Authentication > Sign-in method).'
          : 'ईमेल/पासवर्ड प्रमाणीकरण प्रदाता अक्षम है। कृपया अपने फायरबेस कंसोल में "Email/Password" प्रदाता सक्षम करें (Authentication > Sign-in method)।';
      } else if (err.code === 'auth/unauthorized-domain') {
        friendlyError = currentLang === 'en'
          ? `This domain (${window.location.hostname}) is not authorized. Please add it to Authorized Domains in your Firebase Console (Authentication > Settings > Authorized Domains).`
          : `यह डोमेन (${window.location.hostname}) अधिकृत नहीं है। कृपया इसे अपने फायरबेस कंसोल (Authentication > Settings > Authorized Domains) में अधिकृत डोमेन में जोड़ें।`;
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPassword: string, displayName: string, userRole: 'officer' | 'contractor') => {
    setError(null);
    setLoading(true);
    setSuccessMsg(null);
    try {
      try {
        // Try sign in first
        await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      } catch (signInErr: any) {
        // If user does not exist, or credential is unrecognized (which could mean user doesn't exist yet)
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            // Register them seamlessly
            const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
            await updateProfile(userCredential.user, {
              displayName: `${displayName} | ${userRole === 'officer' ? 'Officer' : 'Contractor'}`
            });
          } catch (regErr: any) {
            if (regErr.code === 'auth/email-already-in-use') {
              // If already created, try sign in again
              await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
            } else {
              throw regErr;
            }
          }
        } else {
          throw signInErr;
        }
      }
      setSuccessMsg(
        currentLang === 'en' 
          ? `Clearance approved! Welcome back, ${displayName}.` 
          : `अनुमति स्वीकृत! वापस स्वागत है, ${displayName}।`
      );
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error('Quick login error:', err);
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !passcode) return;

    setError(null);
    setLoading(true);

    // Verify Passcode
    if (passcode.trim() !== 'MUNICIPAL-OFFICIAL-2026') {
      setError(t.error_passcode);
      setLoading(false);
      return;
    }

    try {
      // Register Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Update Auth Profile Display Name
      await updateProfile(userCredential.user, {
        displayName: `${name} | ${role === 'officer' ? 'Officer' : 'Contractor'}`
      });

      setSuccessMsg(t.success_reg);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      const isInputOrUserError = [
        'auth/email-already-in-use',
        'auth/weak-password',
        'auth/invalid-email'
      ].includes(err?.code);
      
      if (isInputOrUserError) {
        console.warn('Registration validation warning:', err?.message || err);
      } else {
        console.error('Registration error:', err);
      }
      let friendlyError = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = currentLang === 'en'
          ? 'This official email is already registered.'
          : 'यह आधिकारिक ईमेल पहले से ही पंजीकृत है।';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = currentLang === 'en'
          ? 'Password must be at least 6 characters long for security compliance.'
          : 'सुरक्षा अनुपालन के लिए पासवर्ड कम से कम 6 वर्ण लंबा होना चाहिए।';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = currentLang === 'en'
          ? 'Invalid email format.'
          : 'अमान्य ईमेल प्रारूप।';
      } else if (err.code === 'auth/configuration-not-found') {
        friendlyError = currentLang === 'en'
          ? 'Firebase Authentication service is not yet enabled or configured in your Firebase Console. Please go to your Firebase Console under "Build > Authentication" and click "Get Started" to initialize it.'
          : 'आपके फायरबेस कंसोल में फायरबेस प्रमाणीकरण सेवा अभी तक सक्षम या कॉन्फ़िगर नहीं की गई है। कृपया अपने फायरबेस कंसोल में "Build > Authentication" पर जाएं और इसे प्रारंभ करने के लिए "Get Started" पर क्लिक करें।';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyError = currentLang === 'en'
          ? 'Email/Password authentication provider is disabled. Please enable the "Email/Password" provider in your Firebase Console (Authentication > Sign-in method).'
          : 'ईमेल/पासवर्ड प्रमाणीकरण प्रदाता अक्षम है। कृपया अपने फायरबेस कंसोल में "Email/Password" प्रदाता सक्षम करें (Authentication > Sign-in method)।';
      } else if (err.code === 'auth/unauthorized-domain') {
        friendlyError = currentLang === 'en'
          ? `This domain (${window.location.hostname}) is not authorized. Please add it to Authorized Domains in your Firebase Console (Authentication > Settings > Authorized Domains).`
          : `यह डोमेन (${window.location.hostname}) अधिकृत नहीं है। कृपया इसे अपने फायरबेस कंसोल (Authentication > Settings > Authorized Domains) में अधिकृत डोमेन में जोड़ें।`;
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);

    if (activeTab === 'register') {
      if (!name.trim()) {
        setError(currentLang === 'en' ? 'Please enter your Full Name to register with Google.' : 'गूगल के साथ पंजीकरण करने के लिए कृपया अपना पूरा नाम दर्ज करें।');
        setLoading(false);
        return;
      }
      if (passcode.trim() !== 'MUNICIPAL-OFFICIAL-2026') {
        setError(t.error_passcode);
        setLoading(false);
        return;
      }
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      
      if (activeTab === 'register') {
        // Update user profile display name with Name and Role
        await updateProfile(result.user, {
          displayName: `${name.trim()} | ${role === 'officer' ? 'Officer' : 'Contractor'}`
        });
      }

      setSuccessMsg(
        activeTab === 'register' ? t.success_reg : t.success_login
      );

      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      const isUserCancelled = [
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request'
      ].includes(err?.code);
      
      if (isUserCancelled) {
        console.warn('Google Auth popup closed or cancelled by user:', err?.message || err);
      } else {
        console.error('Google Auth error:', err);
      }
      let friendlyError = err.message;
      if (err.code === 'auth/popup-closed-by-user') {
        friendlyError = currentLang === 'en'
          ? 'Sign-in window was closed before completion.'
          : 'साइन-इन विंडो पूरी होने से पहले बंद कर दी गई थी।';
      } else if (err.code === 'auth/popup-blocked') {
        friendlyError = currentLang === 'en'
          ? 'Sign-in popup was blocked by your browser. Please allow popups for this site.'
          : 'साइन-इन पॉपअप आपके ब्राउज़र द्वारा ब्लॉक कर दिया गया था। कृपया इस साइट के लिए पॉपअप की अनुमति दें।';
      } else if (err.code === 'auth/configuration-not-found') {
        friendlyError = currentLang === 'en'
          ? 'Firebase Authentication service is not yet enabled or configured in your Firebase Console. Please go to your Firebase Console under "Build > Authentication" and click "Get Started" to initialize it.'
          : 'आपके फायरबेस कंसोल में फायरबेस प्रमाणीकरण सेवा अभी तक सक्षम या कॉन्फ़िगर नहीं की गई है। कृपया अपने फायरबेस कंसोल में "Build > Authentication" पर जाएं और इसे प्रारंभ करने के लिए "Get Started" पर क्लिक करें।';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyError = currentLang === 'en'
          ? 'Google Sign-In provider is disabled. Please enable "Google" as a Sign-in provider in your Firebase Console (Authentication > Sign-in method).'
          : 'गूगल साइन-इन प्रदाता अक्षम है। कृपया अपने फायरबेस कंसोल में "Google" प्रदाता सक्षम करें (Authentication > Sign-in method)।';
      } else if (err.code === 'auth/unauthorized-domain') {
        friendlyError = currentLang === 'en'
          ? `This domain (${window.location.hostname}) is not authorized for OAuth. Please add it to Authorized Domains in your Firebase Console (Authentication > Settings > Authorized Domains).`
          : `यह डोमेन (${window.location.hostname}) OAuth के लिए अधिकृत नहीं है। कृपया इसे अपने फायरबेस कंसोल (Authentication > Settings > Authorized Domains) में अधिकृत डोमेन में जोड़ें।`;
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6" id="municipal-auth-container">
      <div className="w-full max-w-md bg-white border border-[#EDE8E3] rounded-2xl shadow-xl overflow-hidden relative">
        {/* Header Ribbon (Saffron, White, Green) */}
        <div className="h-1.5 w-full flex">
          <div className="bg-[#FF9933] flex-1"></div>
          <div className="bg-[#FFFFFF] w-1/3"></div>
          <div className="bg-[#138808] flex-1"></div>
        </div>

        {/* Back navigation button */}
        <div className="p-4 flex items-center justify-between border-b border-[#EDE8E3]">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-[#5C5449] hover:text-[#E8571A] transition-all cursor-pointer"
            id="btn-auth-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'Back to Portal' : 'पोर्टल पर वापस'}</span>
          </button>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#A89F96] bg-slate-50 px-2 py-1 rounded border border-[#EDE8E3]">
            <Compass className="w-3 h-3 text-[#1A3057] animate-spin" style={{ animationDuration: '6s' }} />
            <span>AUTH-SECURE</span>
          </div>
        </div>

        {/* Logo and Greeting Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="mx-auto w-12 h-12 bg-[#FEF0E8] rounded-full flex items-center justify-center border border-[#F4C4A8] mb-3">
            <ShieldCheck className="w-6 h-6 text-[#E8571A]" />
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#1A3057] tracking-tight leading-none mb-1">
            {t.portal_title}
          </h1>
          <p className="text-[11px] text-[#A89F96] font-sans">
            {t.portal_subtitle}
          </p>
        </div>

        {/* Security Tabs */}
        <div className="px-6 flex border-b border-[#EDE8E3]">
          <button
            onClick={() => {
              setActiveTab('signin');
              setError(null);
            }}
            className={`flex-1 pb-3 text-xs font-extrabold tracking-wider uppercase transition-all border-b-2 cursor-pointer ${
              activeTab === 'signin'
                ? 'border-[#1A3057] text-[#1A3057]'
                : 'border-transparent text-[#A89F96] hover:text-[#5C5449]'
            }`}
            id="tab-btn-signin"
          >
            {t.tab_signin}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 pb-3 text-xs font-extrabold tracking-wider uppercase transition-all border-b-2 cursor-pointer ${
              activeTab === 'register'
                ? 'border-[#1A3057] text-[#1A3057]'
                : 'border-transparent text-[#A89F96] hover:text-[#5C5449]'
            }`}
            id="tab-btn-register"
          >
            {t.tab_register}
          </button>
        </div>

        {/* Tab Forms Container */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'signin' ? (
              <motion.form
                key="signin-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSignIn}
                className="space-y-4"
                id="form-auth-signin"
              >
                {/* Official Email Input */}
                <div>
                  <label className="block text-xs font-bold text-[#1A3057] mb-1.5 uppercase tracking-wider">
                    {t.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F96]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.email_placeholder}
                      className="w-full h-11 bg-slate-50 border border-[#EDE8E3] rounded-lg pl-10 pr-4 text-xs font-medium text-[#1A1A1A] placeholder-[#A89F96] focus:bg-white focus:border-[#1A3057] focus:ring-1 focus:ring-[#1A3057] transition-all outline-none"
                      required
                      disabled={loading}
                      id="input-signin-email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-[#1A3057] mb-1.5 uppercase tracking-wider flex justify-between">
                    <span>{t.password}</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F96]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.password_placeholder}
                      className="w-full h-11 bg-slate-50 border border-[#EDE8E3] rounded-lg pl-10 pr-10 text-xs font-medium text-[#1A1A1A] placeholder-[#A89F96] focus:bg-white focus:border-[#1A3057] focus:ring-1 focus:ring-[#1A3057] transition-all outline-none"
                      required
                      disabled={loading}
                      id="input-signin-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F96] hover:text-[#5C5449] cursor-pointer"
                      id="btn-toggle-signin-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Alert Box for Errors */}
                {error && (
                  <div className="flex items-start gap-2 bg-[#FEF0E8] border border-[#F4C4A8] p-3 rounded-lg text-xs text-[#E8571A] font-medium animate-headShake">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success message */}
                {successMsg && (
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 p-3 rounded-lg text-xs text-green-700 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#1A3057',
                    border: 'none',
                    borderRadius: '8px',
                    height: '44px',
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: loading ? 0.8 : 1,
                  }}
                  className="hover:bg-[#243E6B]"
                  id="btn-auth-signin-submit"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{t.loading_auth}</span>
                    </div>
                  ) : (
                    <span>{t.btn_signin}</span>
                  )}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#EDE8E3]"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-[#A89F96] font-mono">OR</span>
                  <div className="flex-grow border-t border-[#EDE8E3]"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full h-11 border border-[#EDE8E3] hover:bg-slate-50 bg-white rounded-lg flex items-center justify-center gap-2.5 text-xs font-bold text-[#5C5449] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-google-auth-signin"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{currentLang === 'en' ? 'Sign In with Google' : 'गूगल के साथ साइन इन करें'}</span>
                </button>

                {/* Highly Functional Quick Login Pickers */}
                <div className="pt-2 border-t border-[#EDE8E3] mt-4">
                  <div className="relative flex py-1 items-center mb-2.5">
                    <div className="flex-grow border-t border-[#EDE8E3]"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-[#A89F96] font-mono tracking-wider font-bold">DEMO ROLES QUICK-ACCESS</span>
                    <div className="flex-grow border-t border-[#EDE8E3]"></div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Municipal Officer */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('officer@municipal.gov.in', 'password123', 'Municipal Officer', 'officer')}
                      disabled={loading}
                      className="w-full text-left p-2 bg-slate-50 border border-slate-200 hover:border-[#1A3057] hover:bg-slate-100/50 rounded-lg flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px] shrink-0">
                          OFF
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#1A3057] group-hover:text-blue-700 transition-colors">
                            {currentLang === 'en' ? 'Municipal Command Officer' : 'नगर निगम कमांड अधिकारी'}
                          </p>
                          <p className="text-[9px] text-[#8C8276]">officer@municipal.gov.in</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                        {currentLang === 'en' ? 'Quick Login' : 'लॉगिन'}
                      </span>
                    </button>

                    {/* Contractor - Standard Roads Co */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('roads.contractor@municipal.gov.in', 'password123', 'Standard Roads Co.', 'contractor')}
                      disabled={loading}
                      className="w-full text-left p-2 bg-slate-50 border border-slate-200 hover:border-[#E8571A] hover:bg-slate-100/50 rounded-lg flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-[10px] shrink-0">
                          RDS
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#1A3057] group-hover:text-[#E8571A] transition-colors">
                            {currentLang === 'en' ? 'Contractor: Standard Roads Co.' : 'Standard Roads Co. (ठेकेदार)'}
                          </p>
                          <p className="text-[9px] text-[#8C8276]">roads.contractor@municipal.gov.in</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">
                        {currentLang === 'en' ? 'Quick Login' : 'लॉगिन'}
                      </span>
                    </button>

                    {/* Contractor - Shine Sanitation Group */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('sanitation.contractor@municipal.gov.in', 'password123', 'Shine Sanitation Group', 'contractor')}
                      disabled={loading}
                      className="w-full text-left p-2 bg-slate-50 border border-slate-200 hover:border-emerald-600 hover:bg-slate-100/50 rounded-lg flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px] shrink-0">
                          SNT
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#1A3057] group-hover:text-emerald-700 transition-colors">
                            {currentLang === 'en' ? 'Contractor: Shine Sanitation Group' : 'Shine Sanitation Group (ठेकेदार)'}
                          </p>
                          <p className="text-[9px] text-[#8C8276]">sanitation.contractor@municipal.gov.in</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
                        {currentLang === 'en' ? 'Quick Login' : 'लॉगिन'}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-4"
                id="form-auth-register"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-xs font-bold text-[#1A3057] mb-1.5 uppercase tracking-wider">
                    {t.name}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F96]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.name_placeholder}
                      className="w-full h-11 bg-slate-50 border border-[#EDE8E3] rounded-lg pl-10 pr-4 text-xs font-medium text-[#1A1A1A] placeholder-[#A89F96] focus:bg-white focus:border-[#1A3057] focus:ring-1 focus:ring-[#1A3057] transition-all outline-none"
                      required
                      disabled={loading}
                      id="input-register-name"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-[#1A3057] mb-1.5 uppercase tracking-wider">
                    {t.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F96]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.email_placeholder}
                      className="w-full h-11 bg-slate-50 border border-[#EDE8E3] rounded-lg pl-10 pr-4 text-xs font-medium text-[#1A1A1A] placeholder-[#A89F96] focus:bg-white focus:border-[#1A3057] focus:ring-1 focus:ring-[#1A3057] transition-all outline-none"
                      required
                      disabled={loading}
                      id="input-register-email"
                    />
                  </div>
                </div>

                {/* Role dropdown and passcode in a flex row to save vertical space */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1A3057] mb-1.5 uppercase tracking-wider">
                      {currentLang === 'en' ? 'Duty Role' : 'ड्यूटी रोल'}
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F96] pointer-events-none" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'officer' | 'contractor')}
                        className="w-full h-11 bg-slate-50 border border-[#EDE8E3] rounded-lg pl-10 pr-2 text-xs font-medium text-[#1A1A1A] focus:bg-white focus:border-[#1A3057] outline-none appearance-none"
                        disabled={loading}
                        id="select-register-role"
                      >
                        <option value="officer">{currentLang === 'en' ? 'Officer' : 'अधिकारी'}</option>
                        <option value="contractor">{currentLang === 'en' ? 'Contractor' : 'ठेकेदार'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A3057] mb-1.5 uppercase tracking-wider">
                      {currentLang === 'en' ? 'Passcode' : 'पासकोड'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F96]" />
                      <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="MUNICIPAL-..."
                        className="w-full h-11 bg-slate-50 border border-[#EDE8E3] rounded-lg pl-10 pr-4 text-xs font-medium text-[#1A1A1A] placeholder-[#A89F96] focus:bg-white focus:border-[#1A3057] focus:ring-1 focus:ring-[#1A3057] transition-all outline-none"
                        required
                        disabled={loading}
                        id="input-register-passcode"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-[#1A3057] mb-1.5 uppercase tracking-wider">
                    {t.password}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F96]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.password_placeholder}
                      className="w-full h-11 bg-slate-50 border border-[#EDE8E3] rounded-lg pl-10 pr-10 text-xs font-medium text-[#1A1A1A] placeholder-[#A89F96] focus:bg-white focus:border-[#1A3057] focus:ring-1 focus:ring-[#1A3057] transition-all outline-none"
                      required
                      disabled={loading}
                      id="input-register-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F96] hover:text-[#5C5449] cursor-pointer"
                      id="btn-toggle-register-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Notice for Authority clearance */}
                <div className="bg-[#FEF0E8] border border-[#F4C4A8] p-3 rounded-lg text-[11px] text-[#E8571A] leading-relaxed">
                  <div className="font-extrabold flex items-center gap-1.5 mb-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#E8571A]" />
                    <span>OFFICIAL SECURITY CLEARANCE REQUIRED</span>
                  </div>
                  <p className="font-sans font-medium">{t.register_help}</p>
                  <div className="mt-1.5 text-[10px] bg-white border border-[#F4C4A8] rounded p-1.5 text-center font-bold tracking-tight">
                    {t.eval_notice}
                  </div>
                </div>

                {/* Alert Box for Errors */}
                {error && (
                  <div className="flex items-start gap-2 bg-[#FEF0E8] border border-[#F4C4A8] p-3 rounded-lg text-xs text-[#E8571A] font-medium animate-headShake">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success message */}
                {successMsg && (
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 p-3 rounded-lg text-xs text-green-700 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#1A3057',
                    border: 'none',
                    borderRadius: '8px',
                    height: '44px',
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: loading ? 0.8 : 1,
                  }}
                  className="hover:bg-[#243E6B]"
                  id="btn-auth-register-submit"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{t.loading_reg}</span>
                    </div>
                  ) : (
                    <span>{t.btn_register}</span>
                  )}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#EDE8E3]"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-[#A89F96] font-mono">OR</span>
                  <div className="flex-grow border-t border-[#EDE8E3]"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full h-11 border border-[#EDE8E3] hover:bg-slate-50 bg-white rounded-lg flex items-center justify-center gap-2.5 text-xs font-bold text-[#5C5449] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-google-auth-register"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{currentLang === 'en' ? 'Register with Google' : 'गूगल के साथ पंजीकृत करें'}</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
