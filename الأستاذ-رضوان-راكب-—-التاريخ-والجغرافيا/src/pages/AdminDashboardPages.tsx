import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowUpLeft,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CloudUpload,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Send,
  Settings,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { FirestoreUserProfile } from '../utils/authSecurityRules';
import {
  buildExamAudienceConfigFromSelection,
  ExamSubjectSlug,
  ExamTargetLevelOption,
  formatExamLevelFullAr,
  formatFileSizeLabel,
  subjectSlugToId,
  validateStrictPdfExamUpload,
} from '../utils/examModuleRules';
import { TeacherExamPublishWorkspace } from '../components/cms/TeacherExamPublishWorkspace';
import { LessonReaderModal } from '../components/cms/LessonReaderModal';
import { preloadCriticalImages } from '../components/ui/OptimizedImage';

const ALL_GROUPS: ('G1' | 'G2' | 'G3' | 'G4')[] = ['G1', 'G2', 'G3', 'G4'];

const GROUP_LABELS_AR: Record<'G1' | 'G2' | 'G3' | 'G4', string> = {
  G1: 'الفوج الأول (G1)',
  G2: 'الفوج الثاني (G2)',
  G3: 'الفوج الثالث (G3)',
  G4: 'الفوج الرابع (G4)',
};

const CANONICAL_UNITS_OPTIONS = [
  { number: 1, code: 'unit_1', labelAr: 'الوحدة 01', labelFr: 'Unité 01' },
  { number: 2, code: 'unit_2', labelAr: 'الوحدة 02', labelFr: 'Unité 02' },
  { number: 3, code: 'unit_3', labelAr: 'الوحدة 03', labelFr: 'Unité 03' },
  { number: 4, code: 'unit_4', labelAr: 'الوحدة 04', labelFr: 'Unité 04' },
];

// ============================================================================
// GOLDEN ACADEMIC LAUREL CREST SVG
// ============================================================================
function AcademicLaurelCrest({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldCrestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0D59C" />
          <stop offset="50%" stopColor="#C6A064" />
          <stop offset="100%" stopColor="#9A7438" />
        </linearGradient>
      </defs>
      {/* Outer Subtle Ring */}
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke="url(#goldCrestGrad)"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.65"
      />
      {/* Left & Right Laurel Branches */}
      <path
        d="M35 88C24 76 20 58 26 40C30 28 38 20 46 16"
        stroke="url(#goldCrestGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M85 88C96 76 100 58 94 40C90 28 82 20 74 16"
        stroke="url(#goldCrestGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Laurel Leaves Left */}
      <ellipse cx="26" cy="68" rx="6" ry="3" transform="rotate(-35 26 68)" fill="url(#goldCrestGrad)" />
      <ellipse cx="23" cy="54" rx="6" ry="3" transform="rotate(-15 23 54)" fill="url(#goldCrestGrad)" />
      <ellipse cx="27" cy="40" rx="6" ry="3" transform="rotate(10 27 40)" fill="url(#goldCrestGrad)" />
      <ellipse cx="35" cy="27" rx="6" ry="3" transform="rotate(30 35 27)" fill="url(#goldCrestGrad)" />
      {/* Laurel Leaves Right */}
      <ellipse cx="94" cy="68" rx="6" ry="3" transform="rotate(35 94 68)" fill="url(#goldCrestGrad)" />
      <ellipse cx="97" cy="54" rx="6" ry="3" transform="rotate(15 97 54)" fill="url(#goldCrestGrad)" />
      <ellipse cx="93" cy="40" rx="6" ry="3" transform="rotate(-10 93 40)" fill="url(#goldCrestGrad)" />
      <ellipse cx="85" cy="27" rx="6" ry="3" transform="rotate(-30 85 27)" fill="url(#goldCrestGrad)" />
      {/* Ribbon Base */}
      <path
        d="M42 90C52 84 68 84 78 90"
        stroke="url(#goldCrestGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Graduation Cap Center */}
      <polygon
        points="60,34 84,45 60,56 36,45"
        fill="url(#goldCrestGrad)"
      />
      <path
        d="M45 50V63C45 68 52 72 60 72C68 72 75 68 75 63V50"
        stroke="url(#goldCrestGrad)"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M81 47V64"
        stroke="url(#goldCrestGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="81" cy="66" r="2.2" fill="url(#goldCrestGrad)" />
    </svg>
  );
}

// ============================================================================
// REAL-TIME FIRESTORE STUDENT DIRECTORY HOOK
// ============================================================================
export const REGISTERED_STUDENTS_MIRROR_KEY = 'radwan_registered_students_mirror_v1';

function readMirroredStudents(): FirestoreUserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(REGISTERED_STUDENTS_MIRROR_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FirestoreUserProfile[]) : [];
  } catch {
    return [];
  }
}

function useRegisteredStudentsDirectory() {
  const { isAuthenticated, role, firebaseUser, allStudentProfiles } = useAuth();
  const [firestoreStudents, setFirestoreStudents] = useState<FirestoreUserProfile[]>([]);
  const [mirroredStudents, setMirroredStudents] = useState<FirestoreUserProfile[]>(() =>
    readMirroredStudents()
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = () => setMirroredStudents(readMirroredStudents());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin' || !firebaseUser) {
      setFirestoreStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const rows: FirestoreUserProfile[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as FirestoreUserProfile;
          if (data.role === 'student') {
            rows.push(data);
          }
        });
        setFirestoreStudents(rows);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'users');
      }
    );

    return () => unsub();
  }, [isAuthenticated, role, firebaseUser]);

  const students = useMemo(() => {
    const map = new Map<string, FirestoreUserProfile>();
    for (const s of mirroredStudents) {
      if (s && s.role === 'student' && (s.uid || s.email)) {
        map.set(s.uid || s.email, s);
      }
    }
    for (const s of allStudentProfiles) {
      if (s && s.role === 'student' && (s.uid || s.email)) {
        map.set(s.uid || s.email, s);
      }
    }
    for (const s of firestoreStudents) {
      if (s && s.role === 'student' && (s.uid || s.email)) {
        map.set(s.uid || s.email, s);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      (a.fullName || '').localeCompare(b.fullName || '', 'ar')
    );
  }, [mirroredStudents, allStudentProfiles, firestoreStudents]);

  return { students, loading };
}

// Preload the new admin dashboard portrait & welcome books/cap artwork
preloadCriticalImages([
  '/assets/images/admin_welcome_books_cap_1794411115056.jpg',
  '/assets/images/admin_profile_avatar_1794411115556.jpg',
]);

// ============================================================================
// UNIFIED TEACHER ACADEMIC SHELL (Mobile-First Luxury Navy, Champagne Gold & Warm Ivory)
// ============================================================================
interface AdminWorkspaceShellProps {
  headerTitle: string;
  headerIcon?: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
  headerRightAction?: React.ReactNode;
  showSidebarOnDesktop?: boolean;
  darkCanvas?: boolean;
  children: React.ReactNode;
}

export function AdminWorkspaceShell({
  headerTitle,
  breadcrumbs,
  headerRightAction,
  darkCanvas = false,
  children,
}: AdminWorkspaceShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser, profile, firebaseUser } = useAuth();
  const userEmail = profile?.email || firebaseUser?.email || '';
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const handleAdminLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const isOverviewActive = location.pathname === '/admin' && !settingsOpen;

  return (
    <div
      dir="rtl"
      className={`min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#C6A064]/30 pb-20 ${
        darkCanvas
          ? 'bg-[#08111E] text-[#F7F3EA]'
          : 'bg-[#F6F1E6] text-[#101C2B]'
      }`}
    >
      {/* =====================================================================
          TOP BAR (الشريط العلوي):
          - Deep midnight navy background
          - Name: «رضوان راكب» + Role: «مدير المنصة» (without profile image, menu button, or preview/logout buttons)
         ===================================================================== */}
      <header
        data-testid="admin-top-bar"
        className="sticky top-0 z-40 h-16 sm:h-18 bg-gradient-to-l from-[#091322] via-[#0E1C30] to-[#091322] border-b border-[#C8A46B]/45 px-4 sm:px-8 flex items-center justify-between shadow-[0_8px_24px_rgba(9,19,34,0.28)]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin"
            data-testid="teacher-header-home-link"
            aria-label={headerTitle || 'رضوان راكب - مدير المنصة'}
            className="flex items-center gap-3 min-w-0 group"
          >
            <span
              aria-hidden="true"
              className="w-[2.5px] h-8 rounded-full bg-gradient-to-b from-[#E5C894] via-[#C8A46B] to-[#8F6C36] shrink-0"
            />
            <div className="min-w-0 text-right leading-tight">
              <span
                data-testid="admin-header-owner-name"
                className="block text-sm sm:text-base font-display font-bold text-[#F7F3EA] group-hover:text-[#E5C894] transition-colors truncate"
              >
                رضوان راكب
              </span>
              <span
                data-testid="admin-header-owner-role"
                className="block text-[11px] sm:text-xs font-medium text-[#D2B27C] truncate mt-0.5"
              >
                مدير المنصة
              </span>
            </div>
          </Link>
        </div>

        {headerRightAction && (
          <div className="flex items-center gap-2 shrink-0">
            {headerRightAction}
          </div>
        )}
      </header>

      {/* Settings Modal / Sheet triggered from Bottom Navigation Bar */}
      {settingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="إعدادات الحساب والمنصة"
          data-testid="admin-settings-modal"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#070E18]/70 backdrop-blur-xs"
        >
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#0B1626] border-t sm:border border-[#C8A46B]/60 p-6 text-[#F7F3EA] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#C8A46B]/25">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-[#D2B27C]" />
                <h2 className="text-base sm:text-lg font-display font-bold text-[#F7F3EA]">
                  الإعدادات
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="إغلاق الإعدادات"
                className="w-9 h-9 rounded-xl bg-[#14253D] border border-[#C8A46B]/35 flex items-center justify-center text-[#E5C894] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Identity inside Settings (Without Profile Picture) */}
            <div className="rounded-2xl bg-[#112036] border border-[#C8A46B]/35 p-4 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="w-[3px] h-10 rounded-full bg-gradient-to-b from-[#E5C894] via-[#C8A46B] to-[#8F6C36] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-display font-bold text-[#F7F3EA]">
                  رضوان راكب
                </p>
                <p className="text-xs text-[#D2B27C] font-medium">
                  مدير المنصة
                </p>
                {userEmail && (
                  <p
                    dir="ltr"
                    className="text-[11px] font-mono-tabular text-[#F7F3EA]/70 truncate mt-1 text-right"
                  >
                    {userEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {/* أيقونة إدارة الإعلانات في الإعدادات */}
              <Link
                to="/admin/announcements"
                data-testid="settings-announcements-link"
                onClick={() => setSettingsOpen(false)}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#13243A] hover:bg-[#192E4A] border border-[#C8A46B]/50 flex items-center justify-between text-sm font-bold text-[#F7F3EA] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#182D49] border border-[#C8A46B]/45 flex items-center justify-center text-[#D6B47C] shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span>إدارة الإعلانات</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-[#D2B27C]" />
              </Link>

              <Link
                to="/admin/students"
                data-testid="settings-students-link"
                onClick={() => setSettingsOpen(false)}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#13243A] hover:bg-[#192E4A] border border-[#C8A46B]/40 flex items-center justify-between text-sm font-bold text-[#F7F3EA] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#182D49] border border-[#C8A46B]/45 flex items-center justify-center text-[#D6B47C] shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>إدارة الطلاب</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-[#D2B27C]" />
              </Link>

              <Link
                to="/student"
                data-testid="settings-preview-link"
                onClick={() => setSettingsOpen(false)}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#13243A] hover:bg-[#192E4A] border border-[#C8A46B]/40 flex items-center justify-between text-sm font-bold text-[#E5C894] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#182D49] border border-[#C8A46B]/45 flex items-center justify-center text-[#D6B47C] shrink-0">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span>معاينة المنصة (واجهة التلميذ)</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-[#D2B27C]" />
              </Link>

              <button
                type="button"
                data-testid="settings-logout-btn"
                onClick={() => {
                  setSettingsOpen(false);
                  void handleAdminLogout();
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-red-950/70 hover:bg-red-900/80 border border-red-400/45 flex items-center justify-center gap-2 text-sm font-bold text-red-100 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area (Unified Warm Ivory Canvas or Dark Publishing Canvas) */}
      <div className="flex-1 flex relative z-10">
        <main
          className={`flex-1 relative overflow-x-hidden ${
            darkCanvas
              ? 'bg-gradient-to-b from-[#0C192C] via-[#091423] to-[#08111E]'
              : 'bg-[#F6F1E6]'
          }`}
        >
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-7 py-4 sm:py-7">
            {/* Optional Breadcrumb Bar on Sub-Pages */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav
                aria-label="مسار التنقل"
                className="flex items-center gap-2 text-xs sm:text-sm font-bold mb-5"
              >
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={`${crumb.label}-${idx}`}>
                      {crumb.to && !isLast ? (
                        <Link
                          to={crumb.to}
                          className={
                            darkCanvas
                              ? 'text-[#C8A46B] hover:text-[#E6CFA6] transition-colors'
                              : 'text-[#8F6C36] hover:text-[#101C2B] transition-colors'
                          }
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span
                          className={
                            darkCanvas ? 'text-[#F7F3EA]/90' : 'text-[#101C2B]'
                          }
                        >
                          {crumb.label}
                        </span>
                      )}
                      {!isLast && (
                        <ChevronLeft
                          className={`w-3.5 h-3.5 ${
                            darkCanvas ? 'text-[#C8A46B]/70' : 'text-[#8F6C36]'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            )}

            {children}
          </div>
        </main>
      </div>

      {/* =====================================================================
          FIXED BOTTOM NAVIGATION BAR (شريط التنقل السفلي):
          - Deep midnight navy background
          - Contains الرئيسية, الدروس, الامتحانات, الإعدادات
          - Active item highlighted with a calm golden frame
         ===================================================================== */}
      <nav
        data-testid="admin-bottom-nav"
        aria-label="شريط التنقل السفلي"
        className="fixed bottom-0 inset-x-0 z-40 h-16 bg-gradient-to-l from-[#091322] via-[#0D1B2E] to-[#091322] border-t border-[#C8A46B]/45 px-3 sm:px-6 flex items-center justify-around shadow-[0_-8px_24px_rgba(9,19,34,0.28)]"
      >
        <Link
          to="/admin"
          onClick={() => setSettingsOpen(false)}
          data-testid="bottom-nav-home"
          className={`min-w-[88px] sm:min-w-[110px] h-11 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all ${
            isOverviewActive
              ? 'bg-[#C8A46B]/18 border border-[#C8A46B] text-[#F7F3EA] shadow-xs'
              : 'border border-transparent text-[#D2B27C]/85 hover:text-[#F7F3EA]'
          }`}
        >
          <Home className="w-4 h-4 text-[#D2B27C] shrink-0" />
          <span>الرئيسية</span>
        </Link>

        <Link
          to="/admin/lessons"
          onClick={() => setSettingsOpen(false)}
          data-testid="bottom-nav-lessons"
          className={`min-w-[76px] sm:min-w-[105px] h-11 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold transition-all ${
            location.pathname.startsWith('/admin/lessons') && !settingsOpen
              ? 'bg-[#C8A46B]/18 border border-[#C8A46B] text-[#F7F3EA] shadow-xs'
              : 'border border-transparent text-[#D2B27C]/85 hover:text-[#F7F3EA]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#D2B27C] shrink-0" />
          <span>الدروس</span>
        </Link>

        <Link
          to="/admin/exams"
          onClick={() => setSettingsOpen(false)}
          data-testid="bottom-nav-exams"
          className={`min-w-[76px] sm:min-w-[105px] h-11 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold transition-all ${
            location.pathname.startsWith('/admin/exams') && !settingsOpen
              ? 'bg-[#C8A46B]/18 border border-[#C8A46B] text-[#F7F3EA] shadow-xs'
              : 'border border-transparent text-[#D2B27C]/85 hover:text-[#F7F3EA]'
          }`}
        >
          <FileCheck className="w-4 h-4 text-[#D2B27C] shrink-0" />
          <span>الامتحانات</span>
        </Link>

        <button
          type="button"
          onClick={() => setSettingsOpen((prev) => !prev)}
          data-testid="bottom-nav-settings"
          className={`min-w-[88px] sm:min-w-[110px] h-11 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            settingsOpen
              ? 'bg-[#C8A46B]/18 border border-[#C8A46B] text-[#F7F3EA] shadow-xs'
              : 'border border-transparent text-[#D2B27C]/85 hover:text-[#F7F3EA]'
          }`}
        >
          <Settings className="w-4 h-4 text-[#D2B27C] shrink-0" />
          <span>الإعدادات</span>
        </button>
      </nav>
    </div>
  );
}

// ============================================================================
// 1. MAIN ADMIN CONTROL PANEL (/admin) — MOBILE-FIRST LUXURY EDITION
// Contains strictly:
// - Hero Welcome Card (books & academic cap blended into deep navy background)
// - 4 Real-Time Database Statistics Cards (Exams, Lessons, Announcements, Students)
// ============================================================================
export function AdminOverviewPage() {
  const { lessons, examinations, announcements } = useContent();
  const { students } = useRegisteredStudentsDirectory();
  const navigate = useNavigate();

  // Real-time counts strictly from database records
  const publishedExamsCount = examinations.filter(
    (e) => e.status === 'published' && e.effectiveStatus === 'published'
  ).length;
  const publishedLessonsCount = lessons.filter(
    (l) => l.status === 'published' && l.effectiveStatus === 'published'
  ).length;
  const publishedAnnouncementsCount = announcements.filter(
    (a) => a.status === 'published' && a.effectiveStatus === 'published'
  ).length;
  const registeredStudentsCount = students.length;

  const statCards = [
    {
      id: 'exams',
      label: 'إجمالي الامتحانات',
      value: publishedExamsCount,
      icon: FileCheck,
      to: '/admin/exams',
      cardTestId: 'stat-card-published-exams',
      valueTestId: 'stat-value-published-exams',
    },
    {
      id: 'lessons',
      label: 'إجمالي الدروس',
      value: publishedLessonsCount,
      icon: BookOpen,
      to: '/admin/lessons',
      cardTestId: 'stat-card-published-lessons',
      valueTestId: 'stat-value-published-lessons',
    },
    {
      id: 'announcements',
      label: 'إجمالي الإعلانات',
      value: publishedAnnouncementsCount,
      icon: Bell,
      to: '/admin/announcements',
      cardTestId: 'stat-card-published-announcements',
      valueTestId: 'stat-value-published-announcements',
    },
    {
      id: 'students',
      label: 'إجمالي الطلاب',
      value: registeredStudentsCount,
      icon: Users,
      to: '/admin/students',
      cardTestId: 'stat-card-registered-students',
      valueTestId: 'stat-value-registered-students',
    },
  ];

  return (
    <AdminWorkspaceShell headerTitle="رضوان راكب">
      <div className="space-y-6 sm:space-y-8">
        {/* ===================================================================
            MAIN HERO WELCOME CARD (القسم الترحيبي الرئيسي)
            - Large luxury deep-navy card with seamless educational books & cap artwork
            - Heading: مرحباً بك في لوحة التحكم
            - Subtitle: إدارة منصتك التعليمية بكل سهولة واحترافية.
            - CTA Button: ابدأ إدارة المحتوى
           =================================================================== */}
        <section
          data-testid="admin-welcome-hero-card"
          className="relative rounded-3xl bg-[#0A1524] border border-[#C8A46B]/55 shadow-[0_18px_42px_rgba(10,21,36,0.22)] overflow-hidden min-h-[215px] sm:min-h-[250px] flex items-center"
        >
          {/* Left-Side Educational Artwork (Books & Academic Cap) Blended Seamlessly into Deep Navy */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[64%] sm:w-[58%] pointer-events-none select-none overflow-hidden"
          >
            <img
              src="/assets/images/admin_welcome_books_cap_1794411115056.jpg"
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/assets/aistudio/welcome-globe-artwork.png';
              }}
              className="w-full h-full object-cover object-center scale-105 opacity-90"
            />
            {/* Seamless multi-stop gradient blend into the #0A1524 card background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(10,21,36,0.08) 0%, rgba(10,21,36,0.68) 62%, #0A1524 96%), linear-gradient(180deg, rgba(10,21,36,0.2) 0%, rgba(10,21,36,0) 40%, rgba(10,21,36,0.45) 100%)',
              }}
            />
          </div>

          {/* Right-Side Welcome Copy & CTA */}
          <div className="relative z-10 w-full sm:max-w-[64%] p-5 sm:p-8 space-y-3.5 text-right">
            <h1 className="text-xl sm:text-3xl font-display font-extrabold text-[#F7F3EA] leading-snug tracking-tight">
              مرحباً بك في لوحة التحكم
            </h1>
            <p className="text-xs sm:text-base font-medium text-[#E5DEC9]/90 leading-relaxed max-w-md">
              إدارة منصتك التعليمية بكل سهولة واحترافية.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate('/admin/lessons')}
                data-testid="admin-welcome-start-btn"
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-2xl bg-gradient-to-l from-[#D4B277] via-[#C6A064] to-[#B0894C] hover:brightness-105 active:scale-[0.98] text-[#0A1524] font-display font-extrabold text-xs sm:text-sm shadow-[0_8px_22px_rgba(198,160,100,0.3)] transition-all cursor-pointer whitespace-nowrap"
              >
                <span>ابدأ إدارة المحتوى</span>
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================
            FOUR REAL-TIME STATISTICS CARDS (بطاقات الإحصائيات)
            1. إجمالي الامتحانات
            2. إجمالي الدروس
            3. إجمالي الإعلانات
            4. إجمالي الطلاب
           =================================================================== */}
        <section aria-label="إحصائيات المنصة">
          <div
            data-testid="teacher-dashboard-stats-grid"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5"
          >
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.id}
                  to={stat.to}
                  data-testid={stat.cardTestId}
                  className="rounded-2xl bg-gradient-to-b from-[#0F1E33] to-[#0A1524] border border-[#C8A46B]/50 hover:border-[#E5C894] p-4 sm:p-5 shadow-[0_12px_28px_rgba(10,21,36,0.16)] flex flex-col justify-between gap-3 relative overflow-hidden transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#162842] border border-[#C8A46B]/45 flex items-center justify-center text-[#D6B47C] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      data-testid={stat.valueTestId}
                      className="text-2xl sm:text-3xl font-display font-extrabold font-mono-tabular text-[#F7F3EA]"
                    >
                      {stat.value}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-display font-bold text-[#E6CFA6] truncate">
                    {stat.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AdminWorkspaceShell>
  );
}

// ============================================================================
// 2. REGISTERED STUDENTS PAGE (/admin/students)
// Reference: WhatsApp_Image_2026-11-10_at_14.15.06__2__c2b29b86.jpeg
// Displays ONLY Student Name, Student Email, Search Field, and Pagination.
// ============================================================================
export function AdminStudentsDirectoryPage() {
  const { students, loading } = useRegisteredStudentsDirectory();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((st) => {
      const nameMatch = (st.fullName || '').toLowerCase().includes(q);
      const emailMatch = (st.email || '').toLowerCase().includes(q);
      return nameMatch || emailMatch;
    });
  }, [students, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <AdminWorkspaceShell
      headerTitle="التلاميذ المسجلون"
      headerIcon={<Users className="w-6 h-6 text-[#C6A064] shrink-0" />}
    >
      <div className="space-y-5">
        {/* Top Row: Breadcrumb on Right + Search Bar on Left (Matching Reference 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <Link
              to="/admin"
              className="text-[#9E7C44] hover:text-[#101C2B] transition-colors"
            >
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-[#9E7C44]" />
            <span className="text-[#101C2B]">التلاميذ المسجلون</span>
          </div>

          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="w-4 h-4 text-[#8C7A5B] pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              data-testid="students-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم أو بريد إلكتروني..."
              aria-label="ابحث عن اسم أو بريد إلكتروني"
              className="w-full rounded-xl bg-[#FAF6EE] border border-[#D5C4A1] pr-10 pl-4 py-2.5 text-xs sm:text-sm text-[#101C2B] placeholder:text-[#8C7A5B] focus:outline-none focus:border-[#C6A064] shadow-2xs"
            />
          </div>
        </div>

        {/* Registered Students Table (Strictly 2 Columns: الاسم & البريد الإلكتروني) */}
        <div className="rounded-2xl overflow-hidden bg-[#FAF6EE] border border-[#D5C4A1] shadow-[0_12px_32px_rgba(16,28,43,0.08)]">
          <div className="overflow-x-auto">
            <table
              data-testid="registered-students-table"
              className="w-full border-collapse text-right"
            >
              <thead>
                <tr className="bg-[#0B1624] text-[#F5EFE2] text-xs sm:text-sm font-display font-bold">
                  <th className="py-3.5 px-5 sm:px-8 w-1/2">الاسم</th>
                  <th className="py-3.5 px-5 sm:px-8 w-1/2 text-left sm:text-center">
                    البريد الإلكتروني
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DAC3] text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-12 px-6 text-center text-[#5C5346] font-semibold"
                    >
                      جاري تحميل قائمة التلاميذ المسجلين...
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      data-testid="registered-students-empty"
                      className="py-12 px-6 text-center text-[#5C5346] font-semibold"
                    >
                      {searchQuery.trim()
                        ? 'لا توجد نتائج مطابقة لبحثك.'
                        : 'لا يوجد تلاميذ مسجلون في قاعدة البيانات حالياً.'}
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.uid || student.email}
                      data-testid={`student-row-${student.uid || student.email}`}
                      className="hover:bg-[#F1E8D6]/65 transition-colors"
                    >
                      <td className="py-3.5 px-5 sm:px-8 font-bold text-[#101C2B]">
                        {student.fullName || 'تلميذ مسجل'}
                      </td>
                      <td
                        dir="ltr"
                        className="py-3.5 px-5 sm:px-8 font-mono-tabular text-[#334155] text-left sm:text-center"
                      >
                        {student.email}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar Matching Reference 2 */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-5 py-2 rounded-xl bg-[#FAF6EE] border border-[#D5C4A1] text-xs sm:text-sm font-bold text-[#101C2B] hover:border-[#C6A064] disabled:opacity-45 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            السابق
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-lg text-xs sm:text-sm font-mono-tabular font-bold transition-colors cursor-pointer ${
                  pageNum === safePage
                    ? 'bg-[#0B1624] text-[#F5EFE2] shadow-xs'
                    : 'bg-[#FAF6EE] border border-[#D5C4A1] text-[#101C2B] hover:border-[#C6A064]'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-5 py-2 rounded-xl bg-[#FAF6EE] border border-[#D5C4A1] text-xs sm:text-sm font-bold text-[#101C2B] hover:border-[#C6A064] disabled:opacity-45 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}

// ============================================================================
// REUSABLE TWO-CARD MANAGEMENT LANDING COMPONENT
// Exact replication of Reference Images 3 & 4 (/admin/lessons, /admin/announcements, /admin/exams)
// ============================================================================
interface TwoCardManagementLandingProps {
  addTitle: string;
  addSubtitle: string;
  addTo: string;
  addTestId: string;
  publishedTitle: string;
  publishedSubtitle: string;
  publishedTo: string;
  publishedTestId: string;
  publishedIcon: React.ReactNode;
}

function TwoCardManagementLanding({
  addTitle,
  addSubtitle,
  addTo,
  addTestId,
  publishedTitle,
  publishedSubtitle,
  publishedTo,
  publishedTestId,
  publishedIcon,
}: TwoCardManagementLandingProps) {
  return (
    <div className="py-6 sm:py-12 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Card 1 (Right in RTL): Add New Item */}
        <Link
          to={addTo}
          data-testid={addTestId}
          className="group rounded-2xl bg-[#FAF6EE]/95 border border-[#D9C8A9] hover:border-[#C6A064] p-7 sm:p-9 shadow-[0_12px_32px_rgba(16,28,43,0.07)] hover:shadow-[0_16px_40px_rgba(198,160,100,0.2)] transition-all flex items-center gap-5 relative overflow-hidden"
        >
          <span className="absolute bottom-0 right-4 left-4 h-1 rounded-t-full bg-gradient-to-l from-[#C6A064] via-[#E5C18A] to-[#C6A064]" />

          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#F3ECE0] border border-[#DFC9A3] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-10 h-10 rounded-full border-2 border-[#C6A064] flex items-center justify-center text-[#9E7C44]">
              <Plus className="w-6 h-6 stroke-[2.4]" />
            </div>
          </div>

          <div className="space-y-1.5 text-right">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#101C2B] group-hover:text-[#8A6832] transition-colors">
              {addTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5346] font-medium leading-relaxed">
              {addSubtitle}
            </p>
          </div>
        </Link>

        {/* Card 2 (Left in RTL): View Published Items */}
        <Link
          to={publishedTo}
          data-testid={publishedTestId}
          className="group rounded-2xl bg-[#FAF6EE]/95 border border-[#D9C8A9] hover:border-[#C6A064] p-7 sm:p-9 shadow-[0_12px_32px_rgba(16,28,43,0.07)] hover:shadow-[0_16px_40px_rgba(198,160,100,0.2)] transition-all flex items-center gap-5 relative overflow-hidden"
        >
          <span className="absolute bottom-0 right-4 left-4 h-1 rounded-t-full bg-gradient-to-l from-[#C6A064]/50 via-[#E5C18A]/50 to-[#C6A064]/50 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#F3ECE0] border border-[#DFC9A3] flex items-center justify-center text-[#9E7C44] shrink-0 group-hover:scale-105 transition-transform">
            {publishedIcon}
          </div>

          <div className="space-y-1.5 text-right">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#101C2B] group-hover:text-[#8A6832] transition-colors">
              {publishedTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5346] font-medium leading-relaxed">
              {publishedSubtitle}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// 3. LESSON MANAGEMENT PAGES
// - /admin/lessons (Landing with ONLY 2 cards)
// - /admin/lessons/new & /admin/lessons/edit/:lessonId (Independent Add/Edit Lesson Page)
// - /admin/lessons/published (Independent Published Lessons Page)
// ============================================================================
export function AdminLessonsLandingPage() {
  return (
    <AdminWorkspaceShell headerTitle="إدارة الدروس">
      <TwoCardManagementLanding
        addTitle="إضافة درس"
        addSubtitle="رفع درس جديد وتحديد المستهدفين"
        addTo="/admin/lessons/new"
        addTestId="lessons-action-add"
        publishedTitle="الدروس المنشورة"
        publishedSubtitle="عرض وإدارة الدروس التي قمت بنشرها"
        publishedTo="/admin/lessons/published"
        publishedTestId="lessons-action-published"
        publishedIcon={<BookOpen className="w-8 h-8 stroke-[1.8]" />}
      />
    </AdminWorkspaceShell>
  );
}

export function AdminLessonFormPage() {
  const { lessonId } = useParams<{ lessonId?: string }>();
  const navigate = useNavigate();
  const {
    units,
    lessons,
    resources,
    cmsNotice,
    cmsError,
    clearCmsMessages,
    saveUnit,
    saveLesson,
    uploadAndSaveResource,
  } = useContent();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const existingLesson = lessonId
    ? lessons.find((l) => l.id === lessonId)
    : undefined;

  const [subjectSlug, setSubjectSlug] = useState<ExamSubjectSlug>('history');
  const [unitNumber, setUnitNumber] = useState<number>(1);
  const [titleAr, setTitleAr] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [contentAr, setContentAr] = useState<string>('');
  const [targetLevel, setTargetLevel] = useState<ExamTargetLevelOption>('1bac');
  const [allGroupsSelected, setAllGroupsSelected] = useState<boolean>(true);
  const [selectedGroups, setSelectedGroups] = useState<('G1' | 'G2' | 'G3' | 'G4')[]>([
    'G1',
    'G2',
    'G3',
    'G4',
  ]);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [existingAttachmentId, setExistingAttachmentId] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!existingLesson) return;
    setSubjectSlug(
      existingLesson.subjectId === 'subject_geography' ? 'geography' : 'history'
    );
    setTitleAr(existingLesson.titleAr);
    setDescriptionAr(existingLesson.descriptionAr || '');
    setContentAr(existingLesson.contentAr || '');
    setExistingAttachmentId(existingLesson.attachmentIds?.[0] || '');

    const parentUnit = units.find((u) => u.id === existingLesson.unitId);
    if (parentUnit) {
      const numMatch =
        parentUnit.titleAr.match(/0?([1-4])/) ||
        String(parentUnit.order).match(/([1-4])/);
      if (numMatch) {
        setUnitNumber(Number(numMatch[1]));
      }
    }

    const gKeys = existingLesson.effectiveGroupKeys || [];
    const has1Bac = gKeys.some((k) => k.startsWith('1bac:'));
    const has2Bac = gKeys.some((k) => k.startsWith('2bac:'));
    setTargetLevel(
      has1Bac && !has2Bac ? '1bac' : !has1Bac && has2Bac ? '2bac' : 'all'
    );

    const extractedGroups = Array.from(
      new Set(
        gKeys
          .map((k) => k.split(':')[2])
          .filter(
            (g): g is 'G1' | 'G2' | 'G3' | 'G4' =>
              g === 'G1' || g === 'G2' || g === 'G3' || g === 'G4'
          )
      )
    );
    if (extractedGroups.length > 0 && extractedGroups.length < 4) {
      setAllGroupsSelected(false);
      setSelectedGroups(extractedGroups);
    } else {
      setAllGroupsSelected(true);
      setSelectedGroups(['G1', 'G2', 'G3', 'G4']);
    }
  }, [existingLesson, units]);

  const toggleGroup = (grp: 'G1' | 'G2' | 'G3' | 'G4') => {
    setAllGroupsSelected(false);
    setSelectedGroups((prev) => {
      if (prev.includes(grp)) {
        const next = prev.filter((g) => g !== grp);
        return next.length === 0 ? [grp] : next;
      }
      const next = [...prev, grp];
      if (next.length === 4) setAllGroupsSelected(true);
      return next;
    });
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearCmsMessages();
    setLocalError(null);

    if (!titleAr.trim()) {
      setLocalError('يرجى إدخال عنوان الدرس.');
      return;
    }

    setIsSubmitting(true);
    try {
      const subjectId = subjectSlugToId(subjectSlug);
      const audienceConfig = buildExamAudienceConfigFromSelection({
        targetLevel,
        allGroupsSelected,
        selectedGroups,
      });

      // Resolve or automatically create the selected canonical unit (Unit 01..04)
      const unitMeta =
        CANONICAL_UNITS_OPTIONS.find((u) => u.number === unitNumber) ||
        CANONICAL_UNITS_OPTIONS[0];
      const deterministicUnitId = `unit_${subjectSlug}_${unitMeta.number}`;
      const existingUnit = units.find(
        (u) =>
          u.id === deterministicUnitId ||
          (u.subjectId === subjectId && u.order === unitMeta.number)
      );

      let resolvedUnitId = existingUnit?.id || null;
      if (!resolvedUnitId) {
        resolvedUnitId = await saveUnit({
          id: deterministicUnitId,
          subjectId,
          parentId: null,
          categoryKind: 'unit',
          titleAr: unitMeta.labelAr,
          titleFr: unitMeta.labelFr,
          descriptionAr: `${unitMeta.labelAr} — ${
            subjectSlug === 'geography' ? 'الجغرافيا' : 'التاريخ'
          }`,
          descriptionFr: unitMeta.labelFr,
          order: unitMeta.number,
          status: 'published',
          audienceMode: 'independent',
          audienceConfig: buildExamAudienceConfigFromSelection({
            targetLevel: 'all',
            allGroupsSelected: true,
            selectedGroups: ['G1', 'G2', 'G3', 'G4'],
          }),
        });
      }

      const attachmentIds: string[] = existingAttachmentId
        ? [existingAttachmentId]
        : [];

      if (selectedPdfFile) {
        const uploadedResId = await uploadAndSaveResource(
          {
            id: existingAttachmentId || undefined,
            titleAr: `${titleAr.trim()} (ملف الدرس PDF)`,
            titleFr: titleAr.trim(),
            descriptionAr: descriptionAr.trim() || titleAr.trim(),
            descriptionFr: titleAr.trim(),
            category: 'summary',
            subjectId,
            unitId: resolvedUnitId,
            lessonId: existingLesson?.id || null,
            status: 'published',
            audienceMode: 'independent',
            audienceConfig,
          },
          selectedPdfFile
        );
        if (uploadedResId) {
          attachmentIds.splice(0, attachmentIds.length, uploadedResId);
        }
      }

      const savedLessonId = await saveLesson({
        id: existingLesson?.id,
        subjectId,
        unitId: resolvedUnitId,
        titleAr: titleAr.trim(),
        titleFr: titleAr.trim(),
        descriptionAr: descriptionAr.trim() || contentAr.trim().slice(0, 180),
        descriptionFr: descriptionAr.trim() || titleAr.trim(),
        contentAr: contentAr.trim() || `ملف الدرس المرفق: ${titleAr.trim()}`,
        contentFr: contentAr.trim() || titleAr.trim(),
        blocks: [],
        attachmentIds,
        status: 'published',
        audienceMode: 'independent',
        audienceConfig,
      });

      if (savedLessonId) {
        if (existingLesson) {
          navigate('/admin/lessons/published');
        } else {
          setTitleAr('');
          setDescriptionAr('');
          setContentAr('');
          setSelectedPdfFile(null);
          setExistingAttachmentId('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingLinkedResource = existingAttachmentId
    ? resources.find((r) => r.id === existingAttachmentId)
    : undefined;

  return (
    <AdminWorkspaceShell
      headerTitle="إدارة الدروس"
      darkCanvas={true}
      breadcrumbs={[
        { label: 'الرئيسية', to: '/admin' },
        { label: 'إدارة الدروس', to: '/admin/lessons' },
        { label: existingLesson ? 'تعديل الدرس' : 'إضافة درس' },
      ]}
    >
      <div className="w-full max-w-2xl mx-auto">
        <div className="py-1 sm:py-3 text-[#F7F3EA] relative">
          <div className="flex items-center justify-center gap-2.5 mb-6 text-center">
            <span className="h-[1px] w-8 sm:w-14 bg-gradient-to-l from-[#C8A46B] to-transparent inline-block" />
            <span className="text-[#C8A46B] text-xs">✦</span>
            <h2 className="text-sm sm:text-base font-bold text-[#E6CFA6]">
              {existingLesson
                ? 'تعديل بيانات الدرس المنشور'
                : 'إضافة درس جديد وتحديد الفوج المستهدف'}
            </h2>
            <span className="text-[#C8A46B] text-xs">✦</span>
            <span className="h-[1px] w-8 sm:w-14 bg-gradient-to-r from-[#C8A46B] to-transparent inline-block" />
          </div>

          {(localError || cmsError) && (
            <div
              role="alert"
              data-testid="lesson-form-error-banner"
              className="mb-5 rounded-xl bg-red-950/80 border border-red-400/50 px-4 py-3 text-xs sm:text-sm text-red-100 flex items-center justify-between gap-3"
            >
              <span>{localError || cmsError?.ar}</span>
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  clearCmsMessages();
                }}
                className="text-red-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {cmsNotice && (
            <div
              role="status"
              data-testid="lesson-form-success-banner"
              className="mb-5 rounded-xl bg-emerald-950/80 border border-[#C8A46B]/60 px-4 py-3.5 text-xs sm:text-sm text-[#F7F3EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D6B47C] shrink-0" />
                <span>{cmsNotice.ar}</span>
              </div>
              <Link
                to="/admin/lessons/published"
                data-testid="view-published-lessons-after-save"
                className="px-3 py-1 rounded-lg bg-[#C8A46B] text-[#091322] font-bold text-xs self-end sm:self-auto"
              >
                عرض الدروس المنشورة
              </Link>
            </div>
          )}

          <form onSubmit={handleLessonSubmit} className="space-y-4">
            {/* Subject & Unit Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="lesson-subject-select"
                  className="block text-xs font-bold text-[#E6CFA6] mb-1.5"
                >
                  المادة الدراسية
                </label>
                <div className="relative">
                  <select
                    id="lesson-subject-select"
                    data-testid="lesson-subject-select"
                    value={subjectSlug}
                    onChange={(e) =>
                      setSubjectSlug(e.target.value as ExamSubjectSlug)
                    }
                    className="w-full appearance-none rounded-xl bg-[#0F1E33] border border-[#C8A46B]/45 px-4 py-2.5 text-sm font-bold text-[#F7F3EA] focus:outline-none focus:border-[#E6C78C] cursor-pointer"
                  >
                    <option value="history" className="bg-[#0C192C] text-[#F7F3EA]">التاريخ</option>
                    <option value="geography" className="bg-[#0C192C] text-[#F7F3EA]">الجغرافيا</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#D6B47C] pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lesson-unit-select"
                  className="block text-xs font-bold text-[#E6CFA6] mb-1.5"
                >
                  الوحدة الدراسية
                </label>
                <div className="relative">
                  <select
                    id="lesson-unit-select"
                    data-testid="lesson-unit-select"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(Number(e.target.value))}
                    className="w-full appearance-none rounded-xl bg-[#0F1E33] border border-[#C8A46B]/45 px-4 py-2.5 text-sm font-bold text-[#F7F3EA] focus:outline-none focus:border-[#E6C78C] cursor-pointer"
                  >
                    {CANONICAL_UNITS_OPTIONS.map((u) => (
                      <option key={u.number} value={u.number} className="bg-[#0C192C] text-[#F7F3EA]">
                        {u.labelAr}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#D6B47C] pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Lesson Title */}
            <div>
              <label
                htmlFor="lesson-title-input"
                className="block text-xs font-bold text-[#E6CFA6] mb-1.5"
              >
                عنوان الدرس
              </label>
              <input
                id="lesson-title-input"
                type="text"
                data-testid="lesson-title-input"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="مثال: التحولات الاقتصادية والمالية والاجتماعية والفكرية في العالم..."
                className="w-full rounded-xl bg-[#0F1E33] border border-[#C8A46B]/45 px-4 py-2.5 text-sm font-bold text-[#F7F3EA] placeholder:text-[#F7F3EA]/40 focus:outline-none focus:border-[#E6C78C]"
              />
            </div>

            {/* PDF Attachment */}
            <div>
              <span className="block text-xs font-bold text-[#E6CFA6] mb-1.5">
                ملف الدرس بصيغة PDF
              </span>
              <div
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="rounded-xl border border-dashed border-[#C8A46B]/55 bg-[#0E1C30]/85 hover:border-[#E6C78C] px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  data-testid="lesson-pdf-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const v = validateStrictPdfExamUpload(f);
                    if (!v.valid) {
                      setLocalError(v.error?.ar || 'يرجى اختيار ملف PDF صالح.');
                      return;
                    }
                    setSelectedPdfFile(f);
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-2.5 min-w-0">
                  <CloudUpload className="w-5 h-5 text-[#D6B47C] shrink-0" />
                  <span className="text-xs font-semibold text-[#F7F3EA] truncate">
                    {selectedPdfFile
                      ? `${selectedPdfFile.name} (${formatFileSizeLabel(selectedPdfFile.size)})`
                      : existingLinkedResource
                        ? `${existingLinkedResource.fileName}`
                        : 'اضغط هنا لإرفاق ملخص أو وثيقة الدرس بصيغة PDF'}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#162842] border border-[#C8A46B]/40 text-[11px] font-bold text-[#E6CFA6] shrink-0">
                  اختر ملف PDF
                </span>
              </div>
            </div>

            {/* Educational Level & Target Groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-2xl bg-[#0F1E33] border border-[#C8A46B]/45 px-3.5 py-2.5">
                <label
                  htmlFor="lesson-target-level"
                  className="block text-[11px] text-[#D6B47C] font-semibold"
                >
                  المستوى الدراسي والشعبة
                </label>
                <select
                  id="lesson-target-level"
                  data-testid="lesson-target-level-select"
                  value={targetLevel}
                  onChange={(e) =>
                    setTargetLevel(e.target.value as ExamTargetLevelOption)
                  }
                  className="w-full bg-transparent text-xs font-bold text-[#F7F3EA] focus:outline-none cursor-pointer mt-1"
                >
                  <option value="1bac" className="bg-[#0C192C]">
                    الأولى باكالوريا علوم
                  </option>
                  <option value="2bac" className="bg-[#0C192C]">
                    الثانية باكالوريا آداب
                  </option>
                  <option value="all" className="bg-[#0C192C]">
                    الأولى باكالوريا علوم والثانية باكالوريا آداب
                  </option>
                </select>
              </div>

              <div className="rounded-2xl bg-[#0F1E33] border border-[#C8A46B]/45 px-3.5 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#D6B47C] font-semibold">
                    الأفواج المستهدفة
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAllGroupsSelected(true);
                      setSelectedGroups(['G1', 'G2', 'G3', 'G4']);
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                      allGroupsSelected
                        ? 'bg-[#C8A46B] text-[#091322]'
                        : 'text-[#E6CFA6] underline'
                    }`}
                  >
                    جميع الأفواج
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_GROUPS.map((grp) => {
                    const active =
                      allGroupsSelected || selectedGroups.includes(grp);
                    return (
                      <button
                        key={grp}
                        type="button"
                        data-testid={`lesson-group-${grp}`}
                        onClick={() => toggleGroup(grp)}
                        className={`py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#C8A46B]/30 border-[#E6C78C] text-[#F7F3EA]'
                            : 'bg-[#091322] border-[#C8A46B]/20 text-[#F7F3EA]/50'
                        }`}
                      >
                        {grp}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="publish-lesson-submit-btn"
                className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-[#C09858] via-[#E5C68E] to-[#C09858] hover:brightness-105 text-[#0A1524] font-display font-extrabold text-base shadow-[0_10px_28px_rgba(198,160,100,0.35)] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <Send className="w-5 h-5 -rotate-12" />
                <span>
                  {isSubmitting
                    ? 'جاري حفظ ونشر الدرس...'
                    : existingLesson
                      ? 'حفظ تعديلات الدرس'
                      : 'نشر الدرس'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}

export function AdminPublishedLessonsPage() {
  const {
    lessons,
    units,
    subjects,
    resources,
    deleteLesson,
    requestProtectedResourceDownload,
    cmsNotice,
    clearCmsMessages,
  } = useContent();
  const [subjectFilter, setSubjectFilter] = useState<'all' | ExamSubjectSlug>(
    'all'
  );
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);

  const publishedLessons = lessons.filter(
    (l) => l.status === 'published' && l.effectiveStatus === 'published'
  );

  const filteredLessons = publishedLessons.filter((l) => {
    if (subjectFilter === 'all') return true;
    const expectedId = subjectSlugToId(subjectFilter);
    return l.subjectId === expectedId;
  });

  const previewedLesson = previewLessonId
    ? publishedLessons.find((l) => l.id === previewLessonId)
    : null;

  return (
    <AdminWorkspaceShell
      headerTitle="إدارة الدروس"
      breadcrumbs={[
        { label: 'الرئيسية', to: '/admin' },
        { label: 'إدارة الدروس', to: '/admin/lessons' },
        { label: 'الدروس المنشورة' },
      ]}
    >
      <div className="space-y-6">
        {cmsNotice && (
          <div
            role="status"
            className="rounded-2xl bg-[#101C2B] border border-[#C6A064] px-5 py-3.5 text-sm text-[#F5EFE2] flex items-center justify-between gap-3"
          >
            <span>{cmsNotice.ar}</span>
            <button
              type="button"
              onClick={clearCmsMessages}
              className="text-[#E5C18A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <section className="bg-[#FAF6EE] border border-[#D9C8A9] rounded-2xl p-5 sm:p-7 space-y-5 shadow-[0_12px_32px_rgba(16,28,43,0.08)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2D5BE]">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-[#101C2B] flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#C6A064]" />
                <span>الدروس المنشورة ({filteredLessons.length})</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5346] mt-1">
                جميع الدروس المنشورة في مادتي التاريخ والجغرافيا مع إمكانية المعاينة أو التعديل أو الحذف.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#EFE6D5] p-1 rounded-xl border border-[#D9C8A9]">
                {(
                  [
                    { id: 'all' as const, label: 'الكل' },
                    { id: 'history' as const, label: 'التاريخ' },
                    { id: 'geography' as const, label: 'الجغرافيا' },
                  ]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubjectFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      subjectFilter === tab.id
                        ? 'bg-[#101C2B] text-[#E5C18A]'
                        : 'text-[#1E293B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Link
                to="/admin/lessons/new"
                data-testid="goto-add-lesson-from-published-btn"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101C2B] text-[#E5C18A] border border-[#C6A064]/50 text-xs sm:text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة درس جديد</span>
              </Link>
            </div>
          </div>

          {filteredLessons.length === 0 ? (
            <div
              data-testid="published-lessons-empty-state"
              className="py-14 px-6 rounded-2xl bg-[#F5EFE2] border border-[#DFD1B8] text-center space-y-3"
            >
              <BookOpen className="w-10 h-10 text-[#9E7C44] mx-auto" />
              <p className="text-base font-display font-bold text-[#101C2B]">
                لا توجد دروس منشورة حالياً
              </p>
              <p className="text-xs sm:text-sm text-[#5C5346]">
                يمكنك نشر درس جديد من صفحة إضافة درس ليظهر فوراً للتلاميذ المستهدفين.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredLessons.map((lesson) => {
                const isGeo = lesson.subjectId === 'subject_geography';
                const unitObj = units.find((u) => u.id === lesson.unitId);
                return (
                  <article
                    key={lesson.id}
                    data-testid={`published-lesson-card-${lesson.id}`}
                    className="rounded-2xl bg-[#F5EFE2] border border-[#D4C2A2] p-5 flex flex-col justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#101C2B] text-[#E5C18A] text-[11px] font-bold">
                          {isGeo ? 'الجغرافيا' : 'التاريخ'}
                        </span>
                        {unitObj && (
                          <span className="px-2.5 py-0.5 rounded-md bg-[#C6A064]/25 border border-[#C6A064]/40 text-[#101C2B] text-[11px] font-bold">
                            {unitObj.titleAr}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-display font-bold text-[#101C2B]">
                        {lesson.titleAr}
                      </h3>

                      <p className="text-xs text-[#4A4338] line-clamp-2 leading-relaxed">
                        {lesson.contentAr || lesson.descriptionAr}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E2D5BE] flex items-center justify-end gap-2">
                      <button
                        type="button"
                        data-testid={`preview-published-lesson-${lesson.id}`}
                        onClick={() => setPreviewLessonId(lesson.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101C2B] text-[#E5C18A] text-xs font-bold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </button>

                      <Link
                        to={`/admin/lessons/edit/${lesson.id}`}
                        data-testid={`edit-published-lesson-${lesson.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#C6A064]/60 text-[#101C2B] text-xs font-bold"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#9E7C44]" />
                        <span>تعديل</span>
                      </Link>

                      <button
                        type="button"
                        data-testid={`delete-published-lesson-${lesson.id}`}
                        onClick={() => void deleteLesson(lesson.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6EE] border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Lesson Preview Modal with Inline PDF Viewer */}
        {previewedLesson && (
          <LessonReaderModal
            lesson={previewedLesson}
            subject={
              subjects.find((s) => s.id === previewedLesson.subjectId) || null
            }
            unitChain={
              units.filter((u) => u.id === previewedLesson.unitId)
            }
            attachedResources={resources.filter((r) =>
              previewedLesson.attachmentIds?.includes(r.id)
            )}
            onClose={() => setPreviewLessonId(null)}
            onDownloadResource={async (res) => {
              const url = await requestProtectedResourceDownload(res);
              if (!url) return;
              const a = document.createElement('a');
              a.href = url;
              a.download = res.fileName || 'lesson.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            isPreviewMode={true}
          />
        )}
      </div>
    </AdminWorkspaceShell>
  );
}

// ============================================================================
// 4. ANNOUNCEMENT MANAGEMENT PAGES
// - /admin/announcements (Landing with ONLY 2 cards)
// - /admin/announcements/new & /admin/announcements/edit/:announcementId
// - /admin/announcements/published
// ============================================================================
export function AdminAnnouncementsLandingPage() {
  return (
    <AdminWorkspaceShell headerTitle="إدارة الإعلانات">
      <TwoCardManagementLanding
        addTitle="إضافة إعلان"
        addSubtitle="نشر إعلان تربوي جديد وتحديد المستهدفين"
        addTo="/admin/announcements/new"
        addTestId="announcements-action-add"
        publishedTitle="الإعلانات المنشورة"
        publishedSubtitle="عرض وإدارة الإعلانات التي قمت بنشرها"
        publishedTo="/admin/announcements/published"
        publishedTestId="announcements-action-published"
        publishedIcon={<Bell className="w-8 h-8 stroke-[1.8]" />}
      />
    </AdminWorkspaceShell>
  );
}

export function AdminAnnouncementFormPage() {
  const { announcementId } = useParams<{ announcementId?: string }>();
  const navigate = useNavigate();
  const {
    announcements,
    saveAnnouncement,
    cmsNotice,
    cmsError,
    clearCmsMessages,
  } = useContent();

  const existingAnn = announcementId
    ? announcements.find((a) => a.id === announcementId)
    : undefined;

  const [titleAr, setTitleAr] = useState<string>('');
  const [contentAr, setContentAr] = useState<string>('');
  const [targetLevel, setTargetLevel] = useState<ExamTargetLevelOption>('all');
  const [allGroupsSelected, setAllGroupsSelected] = useState<boolean>(true);
  const [selectedGroups, setSelectedGroups] = useState<('G1' | 'G2' | 'G3' | 'G4')[]>([
    'G1',
    'G2',
    'G3',
    'G4',
  ]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!existingAnn) return;
    setTitleAr(existingAnn.titleAr);
    setContentAr(existingAnn.contentAr);
    setTargetLevel(existingAnn.targetLevel);
    setAllGroupsSelected(existingAnn.allGroupsSelected);
    setSelectedGroups(existingAnn.targetGroups);
  }, [existingAnn]);

  const toggleGroup = (grp: 'G1' | 'G2' | 'G3' | 'G4') => {
    setAllGroupsSelected(false);
    setSelectedGroups((prev) => {
      if (prev.includes(grp)) {
        const next = prev.filter((g) => g !== grp);
        return next.length === 0 ? [grp] : next;
      }
      const next = [...prev, grp];
      if (next.length === 4) setAllGroupsSelected(true);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearCmsMessages();
    setLocalError(null);

    if (!titleAr.trim() || !contentAr.trim()) {
      setLocalError('يرجى إدخال عنوان الإعلان ومحتواه التربوي قبل النشر.');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedId = await saveAnnouncement({
        id: existingAnn?.id,
        titleAr: titleAr.trim(),
        contentAr: contentAr.trim(),
        targetLevel,
        allGroupsSelected,
        targetGroups: allGroupsSelected ? ['G1', 'G2', 'G3', 'G4'] : selectedGroups,
        status: 'published',
      });

      if (savedId) {
        if (existingAnn) {
          navigate('/admin/announcements/published');
        } else {
          setTitleAr('');
          setContentAr('');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminWorkspaceShell
      headerTitle="إدارة الإعلانات"
      darkCanvas={true}
      breadcrumbs={[
        { label: 'الرئيسية', to: '/admin' },
        { label: 'إدارة الإعلانات', to: '/admin/announcements' },
        { label: existingAnn ? 'تعديل الإعلان' : 'إضافة إعلان' },
      ]}
    >
      <div className="w-full max-w-2xl mx-auto">
        <div className="py-1 sm:py-3 text-[#F7F3EA] relative">
          <div className="flex items-center justify-center gap-2.5 mb-6 text-center">
            <span className="h-[1px] w-8 sm:w-14 bg-gradient-to-l from-[#C8A46B] to-transparent inline-block" />
            <span className="text-[#C8A46B] text-xs">✦</span>
            <h3 className="text-sm sm:text-base font-bold text-[#E6CFA6]">
              {existingAnn
                ? 'تعديل بيانات الإعلان التربوي'
                : 'نشر إعلان تربوي جديد وتحديد الفوج المستهدف'}
            </h3>
            <span className="text-[#C8A46B] text-xs">✦</span>
            <span className="h-[1px] w-8 sm:w-14 bg-gradient-to-r from-[#C8A46B] to-transparent inline-block" />
          </div>

          {(localError || cmsError) && (
            <div
              role="alert"
              data-testid="announcement-form-error-banner"
              className="mb-5 rounded-xl bg-red-950/80 border border-red-400/50 px-4 py-3 text-xs sm:text-sm text-red-100 flex items-center justify-between gap-3"
            >
              <span>{localError || cmsError?.ar}</span>
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  clearCmsMessages();
                }}
                className="text-red-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {cmsNotice && (
            <div
              role="status"
              data-testid="announcement-form-success-banner"
              className="mb-5 rounded-xl bg-emerald-950/80 border border-[#C8A46B]/60 px-4 py-3.5 text-xs sm:text-sm text-[#F7F3EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D6B47C] shrink-0" />
                <span>{cmsNotice.ar}</span>
              </div>
              <Link
                to="/admin/announcements/published"
                data-testid="view-published-announcements-after-save"
                className="px-3 py-1 rounded-lg bg-[#C8A46B] text-[#091322] font-bold text-xs self-end sm:self-auto"
              >
                عرض الإعلانات المنشورة
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="announcement-title-input"
                className="block text-xs font-bold text-[#E6CFA6] mb-1.5"
              >
                عنوان الإعلان
              </label>
              <input
                id="announcement-title-input"
                type="text"
                data-testid="announcement-title-input"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="مثال: موعد الفرض المحروس الأول في مادة التاريخ والجغرافيا..."
                className="w-full rounded-xl bg-[#0F1E33] border border-[#C8A46B]/45 px-4 py-2.5 text-sm font-bold text-[#F7F3EA] placeholder:text-[#F7F3EA]/40 focus:outline-none focus:border-[#E6C78C]"
              />
            </div>

            <div>
              <label
                htmlFor="announcement-content-textarea"
                className="block text-xs font-bold text-[#E6CFA6] mb-1.5"
              >
                نص الإعلان وتفاصيله
              </label>
              <textarea
                id="announcement-content-textarea"
                rows={5}
                data-testid="announcement-content-textarea"
                value={contentAr}
                onChange={(e) => setContentAr(e.target.value)}
                placeholder="اكتب نص الإعلان الموجه للتلاميذ..."
                className="w-full rounded-xl bg-[#0F1E33] border border-[#C8A46B]/45 px-4 py-3 text-sm text-[#F7F3EA] placeholder:text-[#F7F3EA]/40 focus:outline-none focus:border-[#E6C78C] leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-2xl bg-[#0F1E33] border border-[#C8A46B]/45 px-3.5 py-2.5">
                <label
                  htmlFor="announcement-target-level"
                  className="block text-[11px] text-[#D6B47C] font-semibold"
                >
                  المستوى الدراسي والشعبة
                </label>
                <select
                  id="announcement-target-level"
                  data-testid="announcement-target-level-select"
                  value={targetLevel}
                  onChange={(e) =>
                    setTargetLevel(e.target.value as ExamTargetLevelOption)
                  }
                  className="w-full bg-transparent text-xs font-bold text-[#F7F3EA] focus:outline-none cursor-pointer mt-1"
                >
                  <option value="all" className="bg-[#0C192C]">
                    الأولى باكالوريا علوم والثانية باكالوريا آداب
                  </option>
                  <option value="1bac" className="bg-[#0C192C]">
                    الأولى باكالوريا علوم
                  </option>
                  <option value="2bac" className="bg-[#0C192C]">
                    الثانية باكالوريا آداب
                  </option>
                </select>
              </div>

              <div className="rounded-2xl bg-[#0F1E33] border border-[#C8A46B]/45 px-3.5 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#D6B47C] font-semibold">
                    الأفواج المستهدفة
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAllGroupsSelected(true);
                      setSelectedGroups(['G1', 'G2', 'G3', 'G4']);
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                      allGroupsSelected
                        ? 'bg-[#C8A46B] text-[#091322]'
                        : 'text-[#E6CFA6] underline'
                    }`}
                  >
                    جميع الأفواج
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_GROUPS.map((grp) => {
                    const active =
                      allGroupsSelected || selectedGroups.includes(grp);
                    return (
                      <button
                        key={grp}
                        type="button"
                        data-testid={`announcement-group-${grp}`}
                        onClick={() => toggleGroup(grp)}
                        className={`py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#C8A46B]/30 border-[#E6C78C] text-[#F7F3EA]'
                            : 'bg-[#091322] border-[#C8A46B]/20 text-[#F7F3EA]/50'
                        }`}
                      >
                        {grp}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="publish-announcement-submit-btn"
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#C09858] via-[#E5C68E] to-[#C09858] hover:brightness-105 text-[#0A1524] font-display font-extrabold text-base shadow-[0_10px_28px_rgba(198,160,100,0.35)] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <Send className="w-5 h-5 -rotate-12" />
                <span>
                  {isSubmitting
                    ? 'جاري نشر الإعلان...'
                    : existingAnn
                      ? 'حفظ تعديلات الإعلان'
                      : 'نشر الإعلان'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}

export function AdminPublishedAnnouncementsPage() {
  const {
    announcements,
    deleteAnnouncement,
    cmsNotice,
    clearCmsMessages,
  } = useContent();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const publishedList = announcements.filter(
    (a) => a.status === 'published' && a.effectiveStatus === 'published'
  );

  const previewedAnn = previewId
    ? publishedList.find((a) => a.id === previewId)
    : null;

  return (
    <AdminWorkspaceShell
      headerTitle="إدارة الإعلانات"
      breadcrumbs={[
        { label: 'الرئيسية', to: '/admin' },
        { label: 'إدارة الإعلانات', to: '/admin/announcements' },
        { label: 'الإعلانات المنشورة' },
      ]}
    >
      <div className="space-y-6">
        {cmsNotice && (
          <div
            role="status"
            className="rounded-2xl bg-[#101C2B] border border-[#C6A064] px-5 py-3.5 text-sm text-[#F5EFE2] flex items-center justify-between gap-3"
          >
            <span>{cmsNotice.ar}</span>
            <button
              type="button"
              onClick={clearCmsMessages}
              className="text-[#E5C18A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <section className="bg-[#FAF6EE] border border-[#D9C8A9] rounded-2xl p-5 sm:p-7 space-y-5 shadow-[0_12px_32px_rgba(16,28,43,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2D5BE]">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-[#101C2B] flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-[#C6A064]" />
                <span>الإعلانات المنشورة ({publishedList.length})</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5346] mt-1">
                جميع الإعلانات والبلاغات التربوية المنشورة للتلاميذ حسب المستوى والفوج.
              </p>
            </div>

            <Link
              to="/admin/announcements/new"
              data-testid="goto-add-announcement-from-published-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101C2B] text-[#E5C18A] border border-[#C6A064]/50 text-xs sm:text-sm font-bold self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة إعلان جديد</span>
            </Link>
          </div>

          {publishedList.length === 0 ? (
            <div
              data-testid="published-announcements-empty-state"
              className="py-14 px-6 rounded-2xl bg-[#F5EFE2] border border-[#DFD1B8] text-center space-y-3"
            >
              <Bell className="w-10 h-10 text-[#9E7C44] mx-auto" />
              <p className="text-base font-display font-bold text-[#101C2B]">
                لا توجد إعلانات منشورة حالياً
              </p>
              <p className="text-xs sm:text-sm text-[#5C5346]">
                اضغط على زر إضافة إعلان لنشر بلاغ تربوي جديد للتلاميذ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {publishedList.map((ann) => (
                <article
                  key={ann.id}
                  data-testid={`published-announcement-card-${ann.id}`}
                  className="rounded-2xl bg-[#F5EFE2] border border-[#D4C2A2] p-5 flex flex-col justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#101C2B] text-[#E5C18A] text-[11px] font-bold">
                        {formatExamLevelFullAr(ann.targetLevel)}
                      </span>
                      <span className="text-[11px] font-mono-tabular text-[#5C5346]">
                        {ann.publishedAtAr}
                      </span>
                    </div>

                    <h3 className="text-base font-display font-bold text-[#101C2B]">
                      {ann.titleAr}
                    </h3>

                    <p className="text-xs text-[#4A4338] line-clamp-2 leading-relaxed">
                      {ann.contentAr}
                    </p>

                    <p className="text-[11px] text-[#7A6A53] font-semibold">
                      الأفواج:{' '}
                      {ann.allGroupsSelected || ann.targetGroups.length === 4
                        ? 'جميع الأفواج الأربعة (G1 - G4)'
                        : ann.targetGroups.join(' ، ')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E2D5BE] flex items-center justify-end gap-2">
                    <button
                      type="button"
                      data-testid={`preview-published-announcement-${ann.id}`}
                      onClick={() => setPreviewId(ann.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101C2B] text-[#E5C18A] text-xs font-bold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة</span>
                    </button>

                    <Link
                      to={`/admin/announcements/edit/${ann.id}`}
                      data-testid={`edit-published-announcement-${ann.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#C6A064]/60 text-[#101C2B] text-xs font-bold"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#9E7C44]" />
                      <span>تعديل</span>
                    </Link>

                    <button
                      type="button"
                      data-testid={`delete-published-announcement-${ann.id}`}
                      onClick={() => void deleteAnnouncement(ann.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6EE] border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {previewedAnn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070E18]/75 backdrop-blur-xs">
            <div
              data-testid="announcement-preview-modal"
              className="w-full max-w-xl rounded-2xl bg-[#FAF6EE] border-2 border-[#C6A064] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D9C8A9]">
                <h3 className="text-lg font-display font-bold text-[#101C2B]">
                  {previewedAnn.titleAr}
                </h3>
                <button
                  type="button"
                  onClick={() => setPreviewId(null)}
                  className="p-1.5 rounded-lg bg-[#EFE6D5] text-[#101C2B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-semibold text-[#7A6A53]">
                تاريخ النشر: {previewedAnn.publishedAtAr} ·{' '}
                {formatExamLevelFullAr(previewedAnn.targetLevel)}
              </p>
              <div className="text-sm text-[#1E293B] whitespace-pre-line leading-relaxed">
                {previewedAnn.contentAr}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminWorkspaceShell>
  );
}

// ============================================================================
// 5. EXAMINATION MANAGEMENT PAGES
// Reference 4: WhatsApp_Image_2026-11-10_at_14.15.06__1__85f338ad.jpeg
// - /admin/exams (Landing with ONLY 2 cards: إضافة امتحان & الامتحانات المنشورة)
// - /admin/exams/new & /admin/exams/edit/:examId (Independent Add/Edit Examination Page)
// - /admin/exams/published (Independent Published Examinations Page)
// ============================================================================
export function AdminExamsLandingPage() {
  return (
    <AdminWorkspaceShell headerTitle="إدارة الامتحانات">
      <TwoCardManagementLanding
        addTitle="إضافة امتحان"
        addSubtitle="رفع ملف امتحان جديد وتحديد المستهدفين"
        addTo="/admin/exams/new"
        addTestId="exams-action-add"
        publishedTitle="الامتحانات المنشورة"
        publishedSubtitle="عرض وإدارة الامتحانات التي قمت بنشرها"
        publishedTo="/admin/exams/published"
        publishedTestId="exams-action-published"
        publishedIcon={<FileText className="w-8 h-8 stroke-[1.8]" />}
      />
    </AdminWorkspaceShell>
  );
}

export function AdminExamFormPage() {
  const { examId } = useParams<{ examId?: string }>();
  const isEditing = Boolean(examId);

  return (
    <AdminWorkspaceShell
      headerTitle="إدارة الامتحانات"
      darkCanvas={true}
      breadcrumbs={[
        { label: 'الرئيسية', to: '/admin' },
        { label: 'إدارة الامتحانات', to: '/admin/exams' },
        { label: isEditing ? 'تعديل الامتحان' : 'إضافة امتحان' },
      ]}
    >
      <TeacherExamPublishWorkspace
        mode={isEditing ? 'edit' : 'add'}
        editExamId={examId}
      />
    </AdminWorkspaceShell>
  );
}

export function AdminPublishedExamsPage() {
  return (
    <AdminWorkspaceShell
      headerTitle="إدارة الامتحانات"
      breadcrumbs={[
        { label: 'الرئيسية', to: '/admin' },
        { label: 'إدارة الامتحانات', to: '/admin/exams' },
        { label: 'الامتحانات المنشورة' },
      ]}
    >
      <TeacherExamPublishWorkspace mode="published" />
    </AdminWorkspaceShell>
  );
}

// Legacy alias exports kept for route compatibility
export function AdminCurriculumManagerPage() {
  return <AdminLessonsLandingPage />;
}

export function AdminResourcesManagerPage() {
  return <AdminLessonsLandingPage />;
}

export function AdminAssessmentsManagerPage() {
  return <AdminExamsLandingPage />;
}

export function AdminSettingsSecurityPage() {
  return <AdminOverviewPage />;
}
