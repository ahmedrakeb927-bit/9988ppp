import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AcademicGroupId } from '../types/academic';
import { ACADEMIC_STREAMS } from '../utils/academicRules';
import {
  EducationalLevelCode,
  getAutomaticBranchForLevel,
  levelToStreamId,
} from '../utils/authSecurityRules';

interface AuthPagesProps {
  mode: 'login' | 'register' | 'forgot-password';
}

export function AuthPages({ mode }: AuthPagesProps) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    role,
    authError,
    authNotice,
    pendingMagicLinkCompletion,
    clearMessages,
    registerStudent,
    loginStudent,
    sendAdminMagicLink,
    completeAdminMagicLink,
    sendPasswordRecovery,
  } = useAuth();

  // Redirect already-authenticated users to their respective dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  // Login mode state ('student' | 'admin')
  const [loginRoleTab, setLoginRoleTab] = useState<'student' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('admin')) {
      return 'admin';
    }
    return 'student';
  });

  useEffect(() => {
    if (pendingMagicLinkCompletion || location.search.includes('admin')) {
      setLoginRoleTab('admin');
    }
  }, [pendingMagicLinkCompletion, location.search]);

  // Student Login state
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Administrator Login state (Direct login by authorized Administrator Gmail)
  const [adminEmail, setAdminEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Student Registration state (Dynamic Level -> Automatic Branch -> 4 Groups)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<EducationalLevelCode>('1bac');
  const [selectedGroup, setSelectedGroup] = useState<AcademicGroupId>('G1');

  // Password Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState('');

  // Dynamic automatic branch derived strictly from selected educational level
  const automaticBranch = getAutomaticBranchForLevel(selectedLevel);
  const activeStreamId = levelToStreamId(selectedLevel);
  const activeStreamDef = ACADEMIC_STREAMS[activeStreamId];

  const handleSwitchMode = (nextMode: 'login' | 'register' | 'forgot-password') => {
    clearMessages();
    if (nextMode === 'login') navigate('/login');
    else if (nextMode === 'register') navigate('/register');
    else navigate('/forgot-password');
  };

  const handleSelectLevel = (nextLevel: EducationalLevelCode) => {
    setSelectedLevel(nextLevel);
    if (!['G1', 'G2', 'G3', 'G4'].includes(selectedGroup)) {
      setSelectedGroup('G1');
    }
  };

  const handleStudentLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ok = await loginStudent(studentEmail, studentPassword);
      if (ok) navigate('/student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (pendingMagicLinkCompletion) {
        const ok = await completeAdminMagicLink(adminEmail);
        if (ok) navigate('/admin');
      } else {
        const ok = await sendAdminMagicLink(adminEmail);
        if (ok) navigate('/admin');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ok = await registerStudent({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        passwordConfirmation: regPasswordConfirm,
        educationalLevel: selectedLevel,
        branch: automaticBranch,
        group: selectedGroup,
        preferredLanguage: lang,
      });
      if (ok) {
        navigate('/student');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendPasswordRecovery(recoveryEmail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex-1 w-full min-h-[calc(100vh-58px)] flex items-center justify-center px-4 pt-12 pb-16 sm:pt-14 sm:pb-20 overflow-hidden">
      {/* Exact Reference Background Scene (Antique Globe, Stacked Books, Pen Holder, Classical Building, World Map & Sweeping Navy/Gold Waves) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden bg-[#F5EBDC]"
      >
        <img
          src="/assets/aistudio/auth-bg-scene.jpg"
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Main Authentication Card Container */}
      <div
        className={`relative z-10 w-full ${
          mode === 'register' ? 'max-w-[660px]' : 'max-w-[630px]'
        } mt-2 sm:mt-1`}
      >
        {/* Top Overlapping Medallion Emblem & Horizontal Gold Accent Lines */}
        <div
          aria-hidden="true"
          className="relative z-20 flex items-center justify-center -mb-12 sm:-mb-14 pointer-events-none select-none"
        >
          <div className="flex items-center justify-center w-full max-w-[340px]">
            <span className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#B89758] to-[#9E7D43]" />
            <div className="relative mx-1 w-[94px] h-[94px] sm:w-[110px] sm:h-[110px] rounded-full shadow-[0_10px_24px_rgba(12,24,42,0.28)] flex items-center justify-center">
              <img
                src="/assets/aistudio/auth-medallion.png"
                alt=""
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <span className="flex-1 h-[2px] bg-gradient-to-l from-transparent via-[#B89758] to-[#9E7D43]" />
          </div>
        </div>

        {/* Refined Warm Ivory Card matching the Reference Image */}
        <div className="relative z-10 bg-[#FAF4E8]/98 backdrop-blur-[2px] border border-[#DFD2BC] rounded-[28px] px-5 sm:px-10 pt-15 sm:pt-18 pb-7 sm:pb-10 shadow-[0_22px_50px_rgba(15,28,46,0.16)] space-y-5">
          {/* Status / Error Feedback Banner */}
          {authError && (
            <div
              role="alert"
              data-testid="auth-error-banner"
              className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-xs sm:text-sm text-[#101D2D] flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{t(authError)}</p>
            </div>
          )}

          {authNotice && (
            <div
              role="status"
              data-testid="auth-notice-banner"
              className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs sm:text-sm text-[#101D2D] flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{t(authNotice)}</p>
            </div>
          )}

          {/* MODE 1: LOGIN PAGE (Student & Administrator Modes) */}
          {mode === 'login' && (
            <div className="space-y-5">
              {/* Heading & Subtitle */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-[32px] font-display font-bold text-[#0F1E33] tracking-tight leading-snug">
                  {loginRoleTab === 'admin'
                    ? lang === 'ar'
                      ? 'دخول الأستاذ المشرف'
                      : 'Connexion Administrateur'
                    : lang === 'ar'
                      ? 'تسجيل دخول التلميذ'
                      : 'Connexion Élève'}
                </h1>
                <p className="text-sm sm:text-[15px] font-medium text-[#3B4758]">
                  {loginRoleTab === 'admin'
                    ? lang === 'ar'
                      ? 'المصادقة الآمنة عبر البريد الإلكتروني المهني'
                      : 'Authentification sécurisée par e-mail professionnel'
                    : lang === 'ar'
                      ? 'الولوج إلى الفضاء التربوي الشخصي'
                      : 'Accédez à votre espace pédagogique'}
                </p>
              </div>

              {/* Segmented Mode Switcher matching Reference Image */}
              <div
                role="tablist"
                aria-label={lang === 'ar' ? 'نوع الحساب' : 'Mode de connexion'}
                className="grid grid-cols-2 bg-[#EFE6D5] border border-[#D5C7B0] rounded-2xl p-1.5 gap-1.5 shadow-inner"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginRoleTab === 'student'}
                  data-testid="auth-tab-student"
                  onClick={() => {
                    clearMessages();
                    setLoginRoleTab('student');
                  }}
                  className={`py-3 px-3 text-sm sm:text-base font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                    loginRoleTab === 'student'
                      ? 'bg-[#0E1E32] text-[#FAF4E8] shadow-[0_4px_12px_rgba(14,30,50,0.25)]'
                      : 'text-[#122238] hover:bg-[#E6DAC5]/60'
                  }`}
                >
                  <User className="w-5 h-5 text-[#C6A464] shrink-0" />
                  <span>{lang === 'ar' ? 'فضاء التلميذ' : 'Espace Élève'}</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={loginRoleTab === 'admin'}
                  data-testid="auth-tab-admin"
                  onClick={() => {
                    clearMessages();
                    setLoginRoleTab('admin');
                  }}
                  className={`py-3 px-3 text-sm sm:text-base font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                    loginRoleTab === 'admin'
                      ? 'bg-[#0E1E32] text-[#FAF4E8] shadow-[0_4px_12px_rgba(14,30,50,0.25)]'
                      : 'text-[#122238] hover:bg-[#E6DAC5]/60'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-[#C6A464] shrink-0" />
                  <span>{lang === 'ar' ? 'فضاء الإدارة' : 'Administrateur'}</span>
                </button>
              </div>

              {/* A. STUDENT LOGIN FORM */}
              {loginRoleTab === 'student' && (
                <form onSubmit={handleStudentLoginSubmit} className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <label
                      htmlFor="login-identifier"
                      className="block text-sm font-bold text-[#101E33]"
                    >
                      {lang === 'ar' ? 'البريد الإلكتروني للتلميذ' : 'Adresse e-mail de l’élève'}
                    </label>
                    <div className="relative">
                      <input
                        id="login-identifier"
                        data-testid="login-email-input"
                        type="email"
                        required
                        autoComplete="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder={
                          lang === 'ar'
                            ? 'أدخل بريدك الإلكتروني'
                            : 'Saisissez votre adresse e-mail'
                        }
                        className={`w-full h-13 rounded-2xl bg-[#FBF8F1] border border-[#CFC3AE] text-[#101E33] placeholder-[#6B7280] text-sm sm:text-base focus:outline-none focus:border-[#0E1E32] focus:ring-2 focus:ring-[#C6A464]/30 transition-all ${
                          lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'
                        }`}
                      />
                      <span
                        aria-hidden="true"
                        className={`
                          pointer-events-none absolute inset-y-0 flex items-center text-[#5A6575]
                          ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'}
                        `}
                      >
                        <Mail className="w-5 h-5" />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="block text-sm font-bold text-[#101E33]"
                      >
                        {lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                      </label>
                      <button
                        type="button"
                        data-testid="forgot-password-link"
                        onClick={() => handleSwitchMode('forgot-password')}
                        className="text-xs sm:text-sm font-semibold text-[#9E7D43] hover:text-[#0E1E32] hover:underline cursor-pointer"
                      >
                        {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="login-password"
                        data-testid="login-password-input"
                        type={showStudentPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full h-13 rounded-2xl bg-[#FBF8F1] border border-[#CFC3AE] text-[#101E33] placeholder-[#6B7280] text-sm sm:text-base focus:outline-none focus:border-[#0E1E32] focus:ring-2 focus:ring-[#C6A464]/30 transition-all ${
                          lang === 'ar' ? 'pr-11 pl-11' : 'pl-11 pr-11'
                        }`}
                      />
                      <span
                        aria-hidden="true"
                        className={`
                          pointer-events-none absolute inset-y-0 flex items-center text-[#5A6575]
                          ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'}
                        `}
                      >
                        <Lock className="w-5 h-5" />
                      </span>
                      <button
                        type="button"
                        data-testid="toggle-password-visibility"
                        onClick={() => setShowStudentPassword((prev) => !prev)}
                        aria-label={
                          showStudentPassword
                            ? lang === 'ar'
                              ? 'إخفاء كلمة المرور'
                              : 'Masquer le mot de passe'
                            : lang === 'ar'
                              ? 'إظهار كلمة المرور'
                              : 'Afficher le mot de passe'
                        }
                        className={`absolute inset-y-0 ${
                          lang === 'ar' ? 'left-0 pl-4' : 'right-0 pr-4'
                        } flex items-center text-[#5A6575] hover:text-[#101E33] cursor-pointer`}
                      >
                        {showStudentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      data-testid="login-submit-btn"
                      disabled={submitting}
                      className="w-full p-[3px] rounded-2xl bg-gradient-to-r from-[#B89655] via-[#DFC38B] to-[#B89655] shadow-[0_8px_20px_rgba(14,30,50,0.24)] hover:shadow-[0_10px_25px_rgba(14,30,50,0.32)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span className="w-full h-12 sm:h-13 rounded-[13px] bg-[#0E1E32] hover:bg-[#152942] text-[#FAF4E8] font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-colors">
                        <span>
                          {submitting
                            ? lang === 'ar'
                              ? 'جاري التحقق...'
                              : 'Vérification...'
                            : lang === 'ar'
                              ? 'تسجيل الدخول'
                              : 'Se connecter'}
                        </span>
                      </span>
                    </button>
                  </div>

                  <div className="pt-3.5 border-t border-[#E2D6C1] flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#3B4758] font-medium">
                      {lang === 'ar' ? 'ليس لديك حساب تلميذ؟' : 'Pas encore de compte élève ?'}
                    </span>
                    <button
                      type="button"
                      data-testid="goto-register-btn"
                      onClick={() => handleSwitchMode('register')}
                      className="font-bold text-[#0E1E32] hover:text-[#9E7D43] underline underline-offset-4 cursor-pointer"
                    >
                      {lang === 'ar' ? 'إنشاء حساب جديد' : 'Créer un compte'}
                    </button>
                  </div>
                </form>
              )}

              {/* B. ADMINISTRATOR LOGIN FORM (Direct Login via Administrator Gmail ONLY — No Password, No Link Waiting) */}
              {loginRoleTab === 'admin' && (
                <form onSubmit={handleAdminLoginSubmit} className="space-y-5 pt-1">
                  <div className="space-y-2.5">
                    <label
                      htmlFor="admin-email-input"
                      className="block text-sm sm:text-[15px] font-bold text-[#101E33]"
                    >
                      {lang === 'ar'
                        ? 'البريد الإلكتروني للأستاذ المشرف'
                        : 'Adresse e-mail de l’administrateur'}
                    </label>
                    <div className="relative">
                      <input
                        id="admin-email-input"
                        data-testid="admin-email-input"
                        type="email"
                        required
                        autoComplete="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder={
                          lang === 'ar'
                            ? 'أدخل البريد الإلكتروني المهني'
                            : 'Saisissez l’adresse e-mail professionnelle'
                        }
                        className={`w-full h-13 sm:h-14 rounded-2xl bg-[#FBF8F1] border border-[#CFC3AE] text-[#101E33] placeholder-[#6B7280] text-sm sm:text-base focus:outline-none focus:border-[#0E1E32] focus:ring-2 focus:ring-[#C6A464]/30 transition-all ${
                          lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'
                        }`}
                      />
                      <span
                        aria-hidden="true"
                        className={`
                          pointer-events-none absolute inset-y-0 flex items-center text-[#5A6575]
                          ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'}
                        `}
                      >
                        <Mail className="w-5 h-5" />
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      data-testid="admin-magic-link-btn"
                      disabled={submitting}
                      className="w-full p-[3px] rounded-2xl bg-gradient-to-r from-[#B89655] via-[#DFC38B] to-[#B89655] shadow-[0_8px_20px_rgba(14,30,50,0.24)] hover:shadow-[0_10px_25px_rgba(14,30,50,0.32)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span className="w-full h-12 sm:h-13 rounded-[13px] bg-[#0E1E32] hover:bg-[#152942] text-[#FAF4E8] font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-colors">
                        <span>
                          {submitting
                            ? lang === 'ar'
                              ? 'جاري تسجيل الدخول...'
                              : 'Connexion en cours...'
                            : lang === 'ar'
                              ? 'تسجيل الدخول'
                              : 'Se connecter'}
                        </span>
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* MODE 2: STUDENT REGISTRATION PAGE */}
          {mode === 'register' && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-[#E2D6C1] text-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#9E7D43] font-bold mb-1">
                  <UserPlus className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تسجيل تلميذ جديد' : 'Inscription Élève'}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-[#0F1E33]">
                  {lang === 'ar' ? 'إنشاء حساب تلميذ' : 'Créer votre Compte Élève'}
                </h1>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reg-fullname"
                      className="block text-xs sm:text-sm font-bold text-[#101E33]"
                    >
                      {lang === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
                    </label>
                    <input
                      id="reg-fullname"
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder={lang === 'ar' ? 'الاسم الشخصي والعائلي' : 'Nom et Prénom'}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FBF8F1] border border-[#CFC3AE] text-[#101E33] placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#0E1E32]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="reg-email"
                      className="block text-xs sm:text-sm font-bold text-[#101E33]"
                    >
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder={
                        lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Saisissez votre adresse e-mail'
                      }
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FBF8F1] border border-[#CFC3AE] text-[#101E33] placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#0E1E32]"
                    />
                  </div>
                </div>

                {/* Educational Level Selection */}
                <div className="space-y-1.5">
                  <span className="block text-xs sm:text-sm font-bold text-[#101E33]">
                    {lang === 'ar' ? 'المستوى الدراسي والمسلك:' : 'Niveau d’études et branche :'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(
                      [
                        {
                          level: '1bac' as EducationalLevelCode,
                          streamKey: '1bac-sci' as const,
                        },
                        {
                          level: '2bac' as EducationalLevelCode,
                          streamKey: '2bac-arts' as const,
                        },
                      ]
                    ).map((item) => {
                      const def = ACADEMIC_STREAMS[item.streamKey];
                      const active = selectedLevel === item.level;
                      return (
                        <button
                          key={item.level}
                          type="button"
                          data-testid={`reg-stream-${def.code}`}
                          onClick={() => handleSelectLevel(item.level)}
                          className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            active
                              ? 'bg-[#0E1E32] text-[#FAF4E8] border-[#C6A464]'
                              : 'bg-[#FBF8F1] text-[#101E33] border-[#CFC3AE] hover:border-[#C6A464]'
                          }`}
                        >
                          <span className="block text-xs font-mono-tabular text-[#C6A464] font-semibold">
                            {def.code}
                          </span>
                          <span className="block text-xs font-bold mt-0.5">
                            {t(def.levelLabel)}
                          </span>
                          <span className="block text-[11px] opacity-80 mt-0.5">
                            {t(def.branchLabel)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Four Corresponding Groups Selector (G1 - G4) */}
                <div className="space-y-1.5">
                  <span className="block text-xs sm:text-sm font-bold text-[#101E33]">
                    {lang === 'ar' ? 'الفوج الدراسي:' : 'Groupe :'}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {activeStreamDef.groups.map((grp) => {
                      const active = selectedGroup === grp.id;
                      return (
                        <button
                          key={grp.id}
                          type="button"
                          data-testid={`reg-group-${grp.id}`}
                          onClick={() => setSelectedGroup(grp.id)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            active
                              ? 'bg-[#0E1E32] text-[#FAF4E8] border-[#C6A464] font-semibold'
                              : 'bg-[#FBF8F1] text-[#101E33] border-[#CFC3AE] hover:border-[#C6A464]'
                          }`}
                        >
                          <span className="block text-xs font-mono-tabular text-[#C6A464]">
                            {grp.id}
                          </span>
                          <span className="block text-[10px] opacity-85 mt-0.5">
                            {t(grp.label)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Password & Confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reg-password"
                      className="block text-xs sm:text-sm font-bold text-[#101E33]"
                    >
                      {lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full h-11 px-3.5 rounded-xl bg-[#FBF8F1] border border-[#CFC3AE] text-[#101E33] placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#0E1E32] ${
                          lang === 'ar' ? 'pl-9' : 'pr-9'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        aria-label={
                          showRegPassword
                            ? lang === 'ar'
                              ? 'إخفاء كلمة المرور'
                              : 'Masquer le mot de passe'
                            : lang === 'ar'
                              ? 'إظهار كلمة المرور'
                              : 'Afficher le mot de passe'
                        }
                        className={`absolute inset-y-0 ${
                          lang === 'ar' ? 'left-0 pl-2.5' : 'right-0 pr-2.5'
                        } flex items-center text-[#5A6575] hover:text-[#101E33] cursor-pointer`}
                      >
                        {showRegPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reg-password-confirm"
                      className="block text-xs sm:text-sm font-bold text-[#101E33]"
                    >
                      {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer'}
                    </label>
                    <input
                      id="reg-password-confirm"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FBF8F1] border border-[#CFC3AE] text-[#101E33] placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#0E1E32]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full p-[3px] rounded-2xl bg-gradient-to-r from-[#B89655] via-[#DFC38B] to-[#B89655] shadow-[0_8px_20px_rgba(14,30,50,0.24)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="w-full h-12 rounded-[13px] bg-[#0E1E32] hover:bg-[#152942] text-[#FAF4E8] font-bold text-base flex items-center justify-center">
                      {submitting
                        ? lang === 'ar'
                          ? 'جاري الإنشاء...'
                          : 'Création...'
                        : lang === 'ar'
                          ? 'إنشاء الحساب'
                          : 'Créer mon compte'}
                    </span>
                  </button>
                </div>

                <div className="pt-3 border-t border-[#E2D6C1] flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[#3B4758] font-medium">
                    {lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Déjà inscrit ?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="font-bold text-[#0E1E32] hover:text-[#9E7D43] underline underline-offset-4 cursor-pointer"
                  >
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODE 3: PASSWORD RECOVERY PAGE */}
          {mode === 'forgot-password' && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-[#E2D6C1] text-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#9E7D43] font-bold mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'استرجاع كلمة المرور' : 'Récupération'}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-[#0F1E33]">
                  {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Réinitialiser le mot de passe'}
                </h1>
                <p className="text-xs sm:text-sm text-[#3B4758] mt-1">
                  {lang === 'ar'
                    ? 'أدخل بريدك الإلكتروني المسجل لتلقي رابط إعادة تعيين كلمة المرور.'
                    : 'Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.'}
                </p>
              </div>

              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="rec-email"
                    className="block text-sm font-bold text-[#101E33]"
                  >
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                  </label>
                  <div className="relative">
                    <input
                      id="rec-email"
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder={
                        lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Saisissez votre adresse e-mail'
                      }
                      className={`w-full h-13 rounded-2xl bg-[#FBF8F1] border border-[#CFC3AE] text-[#101E33] placeholder-[#6B7280] text-sm sm:text-base focus:outline-none focus:border-[#0E1E32] ${
                        lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'
                      }`}
                    />
                    <span
                      aria-hidden="true"
                      className={`
                        pointer-events-none absolute inset-y-0 flex items-center text-[#5A6575]
                        ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'}
                      `}
                    >
                      <Mail className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full p-[3px] rounded-2xl bg-gradient-to-r from-[#B89655] via-[#DFC38B] to-[#B89655] shadow-[0_8px_20px_rgba(14,30,50,0.24)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="w-full h-12 rounded-[13px] bg-[#0E1E32] hover:bg-[#152942] text-[#FAF4E8] font-bold text-base flex items-center justify-center">
                      {submitting
                        ? lang === 'ar'
                          ? 'جاري الإرسال...'
                          : 'Envoi...'
                        : lang === 'ar'
                          ? 'إرسال رابط الاسترجاع'
                          : 'Envoyer le lien'}
                    </span>
                  </button>
                </div>

                <div className="pt-3 border-t border-[#E2D6C1] text-center">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-xs sm:text-sm font-bold text-[#0E1E32] hover:text-[#9E7D43] underline underline-offset-4 cursor-pointer"
                  >
                    {lang === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Retour à la connexion'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
