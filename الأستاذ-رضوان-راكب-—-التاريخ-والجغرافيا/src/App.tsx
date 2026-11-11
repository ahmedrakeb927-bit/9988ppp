import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { Header } from './components/navigation/Header';
import { Footer } from './components/navigation/Footer';
import { SubjectPage } from './pages/SubjectPages';
import {
  ExaminationsLibraryPage,
  ExamPdfViewerPage,
  SubjectExaminationArchivePage,
} from './pages/ResourcesAndExamsPages';
import {
  AnnouncementDetailPage,
  AnnouncementsPage,
} from './pages/AnnouncementsPages';
import { AuthPages } from './pages/AuthPages';
import {
  StudentPortalPage,
  StudentProfilePage,
} from './pages/StudentPortalPage';
import {
  AdminAnnouncementFormPage,
  AdminAnnouncementsLandingPage,
  AdminExamFormPage,
  AdminExamsLandingPage,
  AdminLessonFormPage,
  AdminLessonsLandingPage,
  AdminOverviewPage,
  AdminPublishedAnnouncementsPage,
  AdminPublishedExamsPage,
  AdminPublishedLessonsPage,
  AdminStudentsDirectoryPage,
} from './pages/AdminDashboardPages';
import { preloadCriticalImages } from './components/ui/OptimizedImage';

// Pre-warm critical images in browser cache for instant 0ms rendering across pages
preloadCriticalImages([
  '/assets/images/world_map_parchment_bg_1794311142150.jpg',
  '/assets/images/student_welcome_library_globe_1794311133271.jpg',
  '/assets/aistudio/auth-bg-scene.jpg',
  '/assets/aistudio/auth-medallion.png',
  '/assets/aistudio/history-hero.png',
  '/assets/aistudio/geography-hero.jpg',
  '/assets/aistudio/history-book.png',
  '/assets/aistudio/geography-book.png',
]);

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function WorldMapPaperBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-[#F3EDE1]"
    >
      {/* Real Cartographic World Map Watermark blended softly into the Warm Ivory Parchment */}
      <img
        src="/assets/images/world_map_parchment_bg_1794311142150.jpg"
        alt=""
        loading="eager"
        fetchPriority="high"
        decoding="async"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center scale-[1.06] opacity-[0.68] mix-blend-multiply"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Soft warm paper wash so the map remains clear yet gentle and harmonious */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 38%, rgba(244, 238, 226, 0.18) 0%, rgba(241, 234, 220, 0.34) 100%)',
        }}
      />
    </div>
  );
}

function AdminStudentPreviewBanner() {
  const { isAuthenticated, role } = useAuth();
  const { pathname } = useLocation();

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password';

  if (!isAuthenticated || role !== 'admin' || isAuthPage) {
    return null;
  }

  return (
    <div
      dir="rtl"
      data-testid="admin-preview-mode-bar"
      className="sticky top-0 z-50 w-full bg-gradient-to-l from-[#0B1624] via-[#13243B] to-[#0B1624] border-b border-[#C6A064]/70 px-3 sm:px-6 py-2 shadow-md flex items-center justify-between gap-2 text-[#F5EFE2]"
    >
      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#E5C18A]">
        <span className="w-2 h-2 rounded-full bg-[#E5C18A] animate-pulse shrink-0" />
        <span>وضع معاينة واجهة التلميذ</span>
      </div>

      <Link
        to="/admin"
        data-testid="return-to-admin-from-preview-btn"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#C6A064] via-[#E5C18A] to-[#C6A064] text-[#0B1624] font-bold text-xs hover:brightness-105 transition-all shadow-xs shrink-0"
      >
        <span>العودة إلى لوحة التحكم</span>
      </Link>
    </div>
  );
}

function StudentAndPublicLayout() {
  const { dir } = useLanguage();
  const { pathname } = useLocation();
  const isAuthPage =
    pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isSubjectImmersivePage =
    pathname === '/student/history' ||
    pathname === '/student/geography' ||
    pathname.startsWith('/student/exams');

  if (isSubjectImmersivePage) {
    return (
      <div
        dir={dir}
        className="relative min-h-screen flex flex-col bg-[#081322] text-[#FAF6EE] overflow-x-hidden"
      >
        <AdminStudentPreviewBanner />
        <main id="main-content" className="relative z-10 flex-1 flex flex-col justify-start">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div
      dir={dir}
      className="relative min-h-screen flex flex-col bg-[#F3EDE1] text-[#252B33] overflow-x-hidden"
    >
      <WorldMapPaperBackdrop />
      <AdminStudentPreviewBanner />
      <Header />
      <main
        id="main-content"
        className="relative z-10 flex-1 flex flex-col justify-start"
      >
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function RequireStudentOrAdmin() {
  const { isAuthenticated, authLoading } = useAuth();
  const { lang } = useLanguage();

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-2xl p-8 text-center">
          <p className="text-xs font-mono-tabular text-[#B99A62] mb-1">
            {lang === 'ar' ? 'التحقق من الجلسة' : 'Vérification de session'}
          </p>
          <p className="text-sm font-semibold text-[#101C2C]">
            {lang === 'ar' ? 'جاري تحميل الفضاء التربوي...' : 'Chargement de l’espace...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function RequireAdmin() {
  const { isAuthenticated, role, authLoading } = useAuth();
  const { dir, lang } = useLanguage();

  if (authLoading) {
    return (
      <div dir={dir} className="min-h-screen bg-[#F5EFE2] flex items-center justify-center p-6">
        <div className="bg-[#FAF6EE] border border-[#D9C8A9] rounded-2xl p-8 text-center">
          <p className="text-xs font-mono-tabular text-[#C6A064] mb-1">
            {lang === 'ar' ? 'التحقق من الصلاحيات' : 'Vérification des droits'}
          </p>
          <p className="text-sm font-semibold text-[#101C2B]">
            {lang === 'ar' ? 'جاري تحميل لوحة التحكم...' : 'Chargement de la console...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const { isAuthenticated, role, authLoading } = useAuth();
  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'admin' ? '/admin' : '/student'} replace />;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTopOnRouteChange />
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Auth & Student Shell */}
        <Route element={<StudentAndPublicLayout />}>
          {/* Authentication Routes */}
          <Route path="/login" element={<AuthPages mode="login" />} />
          <Route path="/register" element={<AuthPages mode="register" />} />
          <Route path="/forgot-password" element={<AuthPages mode="forgot-password" />} />

          {/* Independent Protected Student Routes */}
          <Route element={<RequireStudentOrAdmin />}>
            <Route path="/student" element={<StudentPortalPage />} />
            <Route path="/student/history" element={<SubjectPage subject="history" />} />
            <Route path="/student/geography" element={<SubjectPage subject="geography" />} />
            <Route path="/student/exams" element={<ExaminationsLibraryPage />} />
            <Route
              path="/student/exams/:subjectSlug"
              element={<SubjectExaminationArchivePage />}
            />
            <Route
              path="/student/exams/:subjectSlug/:examId"
              element={<ExamPdfViewerPage />}
            />
            <Route path="/student/announcements" element={<AnnouncementsPage />} />
            <Route path="/student/announcements/:id" element={<AnnouncementDetailPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
          </Route>
        </Route>

        {/* Independent Protected Teacher / Administrator Routes */}
        <Route element={<RequireAdmin />}>
          {/* 1. Simplified Teacher Dashboard */}
          <Route path="/admin" element={<AdminOverviewPage />} />

          {/* 2. Registered Students Directory */}
          <Route path="/admin/students" element={<AdminStudentsDirectoryPage />} />

          {/* 3. Separated Lesson Management Pages */}
          <Route path="/admin/lessons" element={<AdminLessonsLandingPage />} />
          <Route path="/admin/lessons/new" element={<AdminLessonFormPage />} />
          <Route path="/admin/lessons/edit/:lessonId" element={<AdminLessonFormPage />} />
          <Route path="/admin/lessons/published" element={<AdminPublishedLessonsPage />} />

          {/* 4. Separated Announcement Management Pages */}
          <Route path="/admin/announcements" element={<AdminAnnouncementsLandingPage />} />
          <Route path="/admin/announcements/new" element={<AdminAnnouncementFormPage />} />
          <Route
            path="/admin/announcements/edit/:announcementId"
            element={<AdminAnnouncementFormPage />}
          />
          <Route
            path="/admin/announcements/published"
            element={<AdminPublishedAnnouncementsPage />}
          />

          {/* 5. Separated Examination Management Pages */}
          <Route path="/admin/exams" element={<AdminExamsLandingPage />} />
          <Route path="/admin/exams/new" element={<AdminExamFormPage />} />
          <Route path="/admin/exams/edit/:examId" element={<AdminExamFormPage />} />
          <Route path="/admin/exams/published" element={<AdminPublishedExamsPage />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ContentProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ContentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
