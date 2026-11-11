import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Home,
  KeyRound,
  LogOut,
  Settings,
  User,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AcademicGroupId, Language } from '../types/academic';
import {
  ACADEMIC_STREAMS,
  formatStudentWelcomeIdentity,
} from '../utils/academicRules';
import {
  EducationalLevelCode,
  getAutomaticBranchForLevel,
  levelToStreamId,
} from '../utils/authSecurityRules';

const UNIFIED_NAV_ICON_CLASS =
  'w-5 h-5 min-[390px]:w-[22px] min-[390px]:h-[22px] sm:w-7 sm:h-7 text-[#C7A972] shrink-0';

function HistoryMonumentIcon() {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={UNIFIED_NAV_ICON_CLASS}
    >
      {/* Classical Pediment Roof */}
      <path
        d="M4 10.5L14 4.5L24 10.5H4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Architrave */}
      <path
        d="M5.5 10.5H22.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Classical Columns */}
      <path
        d="M8.5 11V20.5M14 11V20.5M19.5 11V20.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* Stepped Base */}
      <path
        d="M5 20.5H23M3.5 23.2H24.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GeographyGlobeIcon() {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={UNIFIED_NAV_ICON_CLASS}
    >
      <circle cx="14" cy="14" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="14" cy="14" rx="4.6" ry="9.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 11H23M5 17H23"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 4.5V23.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AnnouncementsBellIcon() {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={UNIFIED_NAV_ICON_CLASS}
    >
      <path
        d="M14 5C10.4 5 7.5 7.9 7.5 11.5V16.2L5.5 19.2V20.2H22.5V19.2L20.5 16.2V11.5C20.5 7.9 17.6 5 14 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M11.6 20.5C11.9 22 12.8 23 14 23C15.2 23 16.1 22 16.4 20.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExaminationsCapIcon() {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={UNIFIED_NAV_ICON_CLASS}
    >
      <path
        d="M3.5 11.5L14 6.5L24.5 11.5L14 16.5L3.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 13.8V19.2C7.5 20.9 10.4 22.4 14 22.4C17.6 22.4 20.5 20.9 20.5 19.2V13.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 12V18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 1. STUDENT HOMEPAGE (/student)
 * Reproduces the reference visual design with 100% dynamic student data from Firestore (`useAuth().profile`)
 * and the 4 main navigation sections in a 2-column × 2-row grid.
 */
export function StudentPortalPage() {
  const { lang, dir, t } = useLanguage();
  const { profile, firebaseUser } = useAuth();

  // Dynamic formatting strictly from authenticated student's Firestore record (no hardcoded names/cohorts)
  const welcomeIdentity = formatStudentWelcomeIdentity(
    profile
      ? {
          fullName: profile.fullName || firebaseUser?.displayName || null,
          educationalLevel: profile.educationalLevel,
          branch: profile.branch,
          group: profile.group,
        }
      : firebaseUser?.displayName
        ? { fullName: firebaseUser.displayName }
        : null,
    lang
  );

  const navigationCards = [
    {
      to: '/student/history',
      testId: 'nav-card-history',
      icon: <HistoryMonumentIcon />,
      label: { ar: 'التاريخ', fr: 'Histoire' },
    },
    {
      to: '/student/geography',
      testId: 'nav-card-geography',
      icon: <GeographyGlobeIcon />,
      label: { ar: 'الجغرافيا', fr: 'Géographie' },
    },
    {
      to: '/student/announcements',
      testId: 'nav-card-announcements',
      icon: <AnnouncementsBellIcon />,
      label: { ar: 'الإعلانات', fr: 'Annonces' },
    },
    {
      to: '/student/exams',
      testId: 'nav-card-exams',
      icon: <ExaminationsCapIcon />,
      label: { ar: 'الامتحانات', fr: 'Examens' },
    },
  ] as const;

  return (
    <div className="w-full max-w-3xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-7 pb-4 sm:pb-6 space-y-5 sm:space-y-7 overflow-x-hidden">
      {/* A. Personalized Welcome Card */}
      <section
        data-testid="student-welcome-card"
        className="relative overflow-hidden rounded-[26px] sm:rounded-[30px] bg-[#0E1B2B] text-[#F7F6F0] border border-[#C7A972]/50 shadow-[0_16px_36px_rgba(15,28,44,0.22)] min-h-[235px] sm:min-h-[280px] flex items-center"
      >
        {/* High-Resolution Classical Library, Antique Globe & Historical Books Banner */}
        <div
          aria-hidden="true"
          className={`absolute inset-y-0 ${
            dir === 'rtl' ? 'left-0' : 'right-0'
          } w-[70%] sm:w-[68%] pointer-events-none select-none overflow-hidden`}
        >
          <img
            src="/assets/images/student_welcome_library_globe_1794311133271.jpg"
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-left ${
              dir === 'ltr' ? '-scale-x-100' : ''
            }`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                '/assets/aistudio/welcome-globe-artwork.png';
            }}
          />
          {/* Smooth Progressive Blend into Deep Navy on the Text Side */}
          <div
            className={`absolute inset-0 ${
              dir === 'rtl'
                ? 'bg-gradient-to-r from-transparent via-[#0E1B2B]/72 to-[#0E1B2B]'
                : 'bg-gradient-to-l from-transparent via-[#0E1B2B]/72 to-[#0E1B2B]'
            }`}
          />
        </div>

        {/* Subtle Bottom Curved Gold Accent Trim */}
        <svg
          aria-hidden="true"
          viewBox="0 0 800 18"
          fill="none"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 w-full h-3 pointer-events-none"
        >
          <path
            d="M0,14 C180,14 290,3 420,9 C550,15 670,16 800,14 L800,18 L0,18 Z"
            fill="#C7A972"
            fillOpacity="0.72"
          />
        </svg>

        {/* Dynamic Student Content Foreground */}
        <div className="relative z-10 w-full p-5 sm:p-8 flex flex-col items-start space-y-3 sm:space-y-4">
          {/* Circular User Profile Icon in Golden Frame + Subtle Vertical Hairline */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-[#0E1B2B]/85 border-[1.5px] border-[#C7A972] flex items-center justify-center shrink-0 shadow-xs">
              <User className="w-6 h-6 sm:w-7.5 sm:h-7.5 text-[#C7A972]" strokeWidth={1.75} />
            </div>
            <span
              aria-hidden="true"
              className="h-5 w-px bg-[#C7A972]/40 rounded-full"
            />
          </div>

          {/* Personalized Greeting + Dynamic Educational Level, Stream, and Group */}
          <div className="space-y-1 max-w-full">
            <h1
              data-testid="student-welcome-name"
              className="text-xl min-[390px]:text-2xl sm:text-3xl font-display font-bold text-[#FFFFFF] leading-snug tracking-tight drop-shadow-xs break-words"
            >
              {welcomeIdentity.greeting}
            </h1>

            {welcomeIdentity.cohortLine && (
              <p
                data-testid="student-welcome-cohort"
                className="text-[11px] min-[390px]:text-xs sm:text-sm text-[#F7F6F0]/95 font-medium leading-relaxed break-words drop-shadow-xs"
              >
                {welcomeIdentity.cohortLine}
              </p>
            )}
          </div>

          {/* Profile Link Button with Golden Settings Icon */}
          <div className="pt-1">
            <Link
              to="/student/profile"
              data-testid="welcome-profile-btn"
              className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2 text-xs sm:text-sm font-display font-semibold rounded-full bg-[#122236]/90 text-[#F7F6F0] border border-[#C7A972]/80 hover:bg-[#C7A972] hover:text-[#101D2D] transition-all shadow-xs"
            >
              <Settings className="w-4 h-4 text-[#C7A972] group-hover:text-[#101D2D] transition-colors shrink-0" />
              <span>{lang === 'ar' ? 'الملف الشخصي' : 'Mon Profil'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* B. Four Main Navigation Cards (2 Columns × 2 Rows on Mobile & Desktop) */}
      <section
        aria-label={lang === 'ar' ? 'الأقسام التعليمية' : 'Sections pédagogiques'}
        data-testid="student-nav-cards-grid"
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {navigationCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              data-testid={card.testId}
              className="group h-[74px] min-[390px]:h-[80px] sm:h-[96px] w-full bg-[#EFECE3]/95 hover:bg-[#EAE4D6] border border-[#E2DAC8] hover:border-[#C7A972] rounded-[22px] sm:rounded-[26px] px-2.5 min-[390px]:px-3.5 sm:px-5 flex items-center justify-between gap-1.5 sm:gap-3 shadow-[0_8px_22px_rgba(16,29,45,0.06)] transition-all overflow-hidden"
            >
              <div className="flex items-center gap-2 min-[390px]:gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 min-[390px]:w-11 min-[390px]:h-11 sm:w-14 sm:h-14 rounded-full bg-[#101D2D] border border-[#C7A972]/65 flex items-center justify-center shrink-0 shadow-xs">
                  {card.icon}
                </div>
                <span className="text-[13.5px] min-[390px]:text-[15px] sm:text-xl font-display font-bold text-[#101D2D] leading-tight whitespace-nowrap">
                  {t(card.label)}
                </span>
              </div>

              <div className="flex items-center gap-1 min-[390px]:gap-1.5 sm:gap-2.5 shrink-0 ps-1">
                {dir === 'rtl' ? (
                  <ChevronLeft
                    className="w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 sm:w-4.5 sm:h-4.5 text-[#8E6F3E] group-hover:text-[#101D2D] transition-colors shrink-0"
                    strokeWidth={2.2}
                  />
                ) : (
                  <ChevronRight
                    className="w-3.5 h-3.5 min-[390px]:w-4 min-[390px]:h-4 sm:w-4.5 sm:h-4.5 text-[#8E6F3E] group-hover:text-[#101D2D] transition-colors shrink-0"
                    strokeWidth={2.2}
                  />
                )}
                <span
                  aria-hidden="true"
                  className="w-[2px] h-5 min-[390px]:h-6 sm:h-7 rounded-full bg-gradient-to-b from-[#C7A972]/35 via-[#C7A972] to-[#C7A972]/35 shrink-0"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * 2. DEDICATED STUDENT PROFILE PAGE (/student/profile)
 * Dedicated page for viewing and updating student identity, academic group, and password.
 */
export function StudentProfilePage() {
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const {
    profile,
    emailVerified,
    authError,
    authNotice,
    clearMessages,
    updateStudentProfile,
    changeUserPassword,
    resendVerificationEmail,
    logoutUser,
  } = useAuth();

  const [editFullName, setEditFullName] = useState('');
  const [editLevel, setEditLevel] = useState<EducationalLevelCode>('1bac');
  const [editGroup, setEditGroup] = useState<AcademicGroupId>('G1');
  const [editPreferredLang, setEditPreferredLang] = useState<Language>('ar');
  const [editNotifications, setEditNotifications] = useState({
    announcements: true,
    examinations: true,
    resources: true,
  });
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditFullName(profile.fullName);
      setEditLevel(profile.educationalLevel === '2bac' ? '2bac' : '1bac');
      setEditGroup(
        (['G1', 'G2', 'G3', 'G4'] as AcademicGroupId[]).includes(
          profile.group as AcademicGroupId
        )
          ? (profile.group as AcademicGroupId)
          : 'G1'
      );
      setEditPreferredLang(profile.preferredLanguage || 'ar');
      if (profile.notificationPreferences) {
        setEditNotifications(profile.notificationPreferences);
      }
    }
  }, [profile]);

  const editStreamId = levelToStreamId(editLevel);
  const editStreamDef = ACADEMIC_STREAMS[editStreamId];
  const editAutoBranch = getAutomaticBranchForLevel(editLevel);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const ok = await updateStudentProfile({
        fullName: editFullName,
        educationalLevel: editLevel,
        branch: editAutoBranch,
        group: editGroup,
        preferredLanguage: editPreferredLang,
        notificationPreferences: editNotifications,
      });
      if (ok) {
        setLang(editPreferredLang);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const ok = await changeUserPassword(newPasswordInput);
      if (ok) {
        setNewPasswordInput('');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {authError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#101C2C] flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{t(authError)}</span>
          </div>
          <button
            type="button"
            onClick={clearMessages}
            className="text-xs font-medium text-[#252B33] hover:text-[#101C2C] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {authNotice && (
        <div
          role="status"
          className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#101C2C] flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>{t(authNotice)}</span>
          </div>
          <button
            type="button"
            onClick={clearMessages}
            className="text-xs font-medium text-[#252B33] hover:text-[#101C2C] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <section className="bg-[#101D2D] text-[#F7F6F0] border border-[#B99B68]/30 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#B99B68] block">
            {lang === 'ar' ? 'البيانات الشخصية والأكاديمية' : 'Profil & Identité Scolaire'}
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F7F6F0]">
            {lang === 'ar' ? 'الملف الشخصي للتلميذ' : 'Profil Personnel de l’Élève'}
          </h1>
          <p className="text-xs text-[#F7F6F0]/80 font-mono-tabular">
            {profile?.email} ·{' '}
            {emailVerified
              ? lang === 'ar'
                ? 'حساب مؤكد'
                : 'E-mail vérifié'
              : lang === 'ar'
                ? 'بانتظار تأكيد البريد'
                : 'E-mail non vérifié'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!emailVerified && (
            <button
              type="button"
              onClick={() => void resendVerificationEmail()}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#B99B68] text-[#101D2D] hover:bg-[#cbb07a] transition-colors cursor-pointer shrink-0"
            >
              {lang === 'ar' ? 'تأكيد البريد الإلكتروني' : 'Vérifier mon e-mail'}
            </button>
          )}

          <Link
            to="/student"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#16273C] border border-[#B99B68]/50 text-[#F7F6F0] hover:border-[#B99B68] transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#B99B68]" />
            <span>{lang === 'ar' ? 'الرئيسية' : 'Accueil'}</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await logoutUser();
              navigate('/login');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-950/70 border border-red-400/40 text-red-100 hover:bg-red-900/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</span>
          </button>
        </div>
      </section>

      {/* Profile Update Form */}
      <section className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="edit-fullname" className="block text-xs font-semibold text-[#101C2C]">
                {lang === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
              </label>
              <input
                id="edit-fullname"
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="ui-input"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-lang" className="block text-xs font-semibold text-[#101C2C]">
                {lang === 'ar' ? 'اللغة المفضلة' : 'Langue préférée'}
              </label>
              <select
                id="edit-lang"
                value={editPreferredLang}
                onChange={(e) => setEditPreferredLang(e.target.value as Language)}
                className="ui-input"
              >
                <option value="ar">العربية (RTL)</option>
                <option value="fr">Français (LTR)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#101C2C]">
              {lang === 'ar' ? 'المستوى الدراسي والمسلك:' : 'Niveau et branche :'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { level: '1bac' as EducationalLevelCode, streamKey: '1bac-sci' as const },
                  { level: '2bac' as EducationalLevelCode, streamKey: '2bac-arts' as const },
                ]
              ).map((item) => {
                const def = ACADEMIC_STREAMS[item.streamKey];
                const active = editLevel === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setEditLevel(item.level)}
                    className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                      active
                        ? 'bg-[#101D2D] text-[#F7F6F0] border-[#B99B68]'
                        : 'bg-[#F7F6F0] text-[#101D2D] border-[#E5E0D4] hover:border-[#B99B68]'
                    }`}
                  >
                    <span className="block text-xs font-mono-tabular text-[#B99B68] font-semibold">
                      {def.code}
                    </span>
                    <span className="block text-sm font-semibold mt-0.5">{t(def.levelLabel)}</span>
                    <span className="block text-xs opacity-80 mt-0.5">{t(def.branchLabel)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#101C2C]">
              {lang === 'ar' ? 'الفوج الدراسي:' : 'Groupe :'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {editStreamDef.groups.map((grp) => {
                const active = editGroup === grp.id;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setEditGroup(grp.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-[#101D2D] text-[#F7F6F0] border-[#B99B68] font-semibold'
                        : 'bg-[#F7F6F0] text-[#101D2D] border-[#E5E0D4] hover:border-[#B99B68]'
                    }`}
                  >
                    <span className="block text-xs font-mono-tabular text-[#B99B68]">{grp.id}</span>
                    <span className="block text-[11px] opacity-85 mt-0.5">{t(grp.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={savingProfile}
              className="ui-btn-primary disabled:opacity-50"
            >
              {savingProfile
                ? lang === 'ar'
                  ? 'جاري الحفظ...'
                  : 'Enregistrement...'
                : lang === 'ar'
                  ? 'حفظ التعديلات'
                  : 'Enregistrer'}
            </button>
          </div>
        </form>

        <form
          onSubmit={handlePasswordUpdate}
          className="pt-5 border-t border-[#E5E0D4] flex flex-col sm:flex-row sm:items-end gap-3"
        >
          <div className="flex-1 space-y-1.5">
            <label
              htmlFor="change-password-input"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#101C2C]"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#B99B68]" />
              <span>
                {lang === 'ar' ? 'كلمة مرور جديدة (8 أحرف على الأقل)' : 'Nouveau mot de passe'}
              </span>
            </label>
            <input
              id="change-password-input"
              type="password"
              minLength={8}
              required
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className="ui-input"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="ui-btn-secondary text-xs shrink-0"
          >
            {lang === 'ar' ? 'تحديث كلمة المرور' : 'Mettre à jour'}
          </button>
        </form>
      </section>
    </div>
  );
}
