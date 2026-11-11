import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  MapPin,
  Maximize2,
  Menu,
  Minimize2,
  RotateCcw,
  ShieldAlert,
  User,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { canUserAccessContentItem } from '../utils/cmsContentRules';
import {
  decodeExamMetadataFromExam,
  ExamSubjectSlug,
  ExamTargetLevelOption,
  filterPublishedSubjectExaminations,
  formatExamLevelFullAr,
  formatExamLevelShortAr,
  formatExamSessionLabelAr,
  formatExamSessionSubtitleAr,
  formatExamTypeBadgeAr,
  formatExamTypeFullAr,
  formatFileSizeLabel,
  isExamMatchingSubject,
  OfficialExamSession,
  OfficialExamType,
} from '../utils/examModuleRules';
import { OptimizedImage, preloadCriticalImages } from '../components/ui/OptimizedImage';
import { AcademicPdfViewer } from '../components/cms/AcademicPdfViewer';
import { generateAcademicPdfBlob } from '../utils/pdfBinaryStore';

// Preload critical exam library artwork for instant rendering
preloadCriticalImages([
  '/assets/aistudio/history-ruins.png',
  '/assets/aistudio/geography-book.png',
  '/assets/aistudio/history-hero.png',
  '/assets/aistudio/geography-hero.jpg',
]);

/**
 * Golden Laurel Wreath & Open Book Emblem SVG matching Screen 1 reference image
 */
function GoldenLaurelBookCrest() {
  return (
    <svg
      viewBox="0 0 140 110"
      className="w-24 h-20 sm:w-28 sm:h-24 mx-auto drop-shadow-[0_6px_18px_rgba(198,160,100,0.35)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="examGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F1D9A7" />
          <stop offset="50%" stopColor="#C8A265" />
          <stop offset="100%" stopColor="#9A7338" />
        </linearGradient>
      </defs>

      {/* Left Laurel Branch */}
      <path
        d="M68 96 C42 92, 22 72, 22 44 C22 28, 30 15, 42 8"
        stroke="url(#examGoldGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Right Laurel Branch */}
      <path
        d="M72 96 C98 92, 118 72, 118 44 C118 28, 110 15, 98 8"
        stroke="url(#examGoldGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Ribbon tie at bottom */}
      <path
        d="M60 94 Q70 100 80 94 M65 96 L56 105 M75 96 L84 105"
        stroke="url(#examGoldGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Left Laurel Leaves */}
      <ellipse cx="23" cy="54" rx="6.5" ry="3.2" transform="rotate(-35 23 54)" fill="url(#examGoldGrad)" />
      <ellipse cx="21" cy="41" rx="6.5" ry="3.2" transform="rotate(-15 21 41)" fill="url(#examGoldGrad)" />
      <ellipse cx="25" cy="28" rx="6.5" ry="3.2" transform="rotate(10 25 28)" fill="url(#examGoldGrad)" />
      <ellipse cx="33" cy="17" rx="6.2" ry="3" transform="rotate(30 33 17)" fill="url(#examGoldGrad)" />
      <ellipse cx="30" cy="67" rx="6.5" ry="3.2" transform="rotate(-50 30 67)" fill="url(#examGoldGrad)" />
      <ellipse cx="42" cy="79" rx="6.5" ry="3.2" transform="rotate(-65 42 79)" fill="url(#examGoldGrad)" />
      <ellipse cx="55" cy="88" rx="6.2" ry="3" transform="rotate(-78 55 88)" fill="url(#examGoldGrad)" />

      {/* Right Laurel Leaves */}
      <ellipse cx="117" cy="54" rx="6.5" ry="3.2" transform="rotate(35 117 54)" fill="url(#examGoldGrad)" />
      <ellipse cx="119" cy="41" rx="6.5" ry="3.2" transform="rotate(15 119 41)" fill="url(#examGoldGrad)" />
      <ellipse cx="115" cy="28" rx="6.5" ry="3.2" transform="rotate(-10 115 28)" fill="url(#examGoldGrad)" />
      <ellipse cx="107" cy="17" rx="6.2" ry="3" transform="rotate(-30 107 17)" fill="url(#examGoldGrad)" />
      <ellipse cx="110" cy="67" rx="6.5" ry="3.2" transform="rotate(50 110 67)" fill="url(#examGoldGrad)" />
      <ellipse cx="98" cy="79" rx="6.5" ry="3.2" transform="rotate(65 98 79)" fill="url(#examGoldGrad)" />
      <ellipse cx="85" cy="88" rx="6.2" ry="3" transform="rotate(78 85 88)" fill="url(#examGoldGrad)" />

      {/* Open Classical Book in Center */}
      <path
        d="M42 28 C52 25, 63 26, 70 31 C77 26, 88 25, 98 28 L98 66 C88 63, 77 64, 70 69 C63 64, 52 63, 42 66 Z"
        fill="url(#examGoldGrad)"
      />
      <path
        d="M70 30 L70 69"
        stroke="#0B1624"
        strokeWidth="2.2"
      />
      {/* Book Lines Left Page */}
      <line x1="48" y1="37" x2="64" y2="38" stroke="#0B1624" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="45" x2="64" y2="46" stroke="#0B1624" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="53" x2="64" y2="54" stroke="#0B1624" strokeWidth="2" strokeLinecap="round" />
      {/* Book Lines Right Page */}
      <line x1="76" y1="38" x2="92" y2="37" stroke="#0B1624" strokeWidth="2" strokeLinecap="round" />
      <line x1="76" y1="46" x2="92" y2="45" stroke="#0B1624" strokeWidth="2" strokeLinecap="round" />
      <line x1="76" y1="54" x2="92" y2="53" stroke="#0B1624" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Red & Cream PDF Document Icon Badge matching Screen 2 examination cards
 */
function ExamCardPdfBadge() {
  return (
    <div
      aria-hidden="true"
      className="w-16 h-18 sm:w-18 sm:h-20 rounded-2xl bg-[#EFE6D4] border border-[#D4C3A3] flex items-center justify-center shrink-0 shadow-inner"
    >
      <div className="relative w-11 h-13 rounded-lg bg-[#FAF5EB] border border-[#C6B293] shadow-2xs flex flex-col justify-between p-1.5">
        {/* Folded top-right corner */}
        <div
          className="absolute -top-[1px] -right-[1px] w-3.5 h-3.5 bg-[#D4C3A3] rounded-bl-md"
          style={{
            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
          }}
        />
        <div className="space-y-1 mt-1 px-0.5">
          <div className="h-[2px] w-5 bg-[#C6B293] rounded-full" />
          <div className="h-[2px] w-7 bg-[#C6B293] rounded-full" />
        </div>
        <div className=" -mx-2.5 mb-0.5 py-0.5 rounded bg-[#B91C1C] text-white text-[11px] font-extrabold tracking-wider text-center shadow-2xs">
          PDF
        </div>
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * SCREEN 1: STUDENT — EXAMINATIONS LIBRARY (/student/exams)
 * Exact visual match to WhatsApp_Image_2026-11-10_at_13.24.56_7307d8cb.jpeg
 * ============================================================================
 */
export function ExaminationsLibraryPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      dir="rtl"
      data-testid="student-examinations-library-screen"
      className="relative min-h-screen w-full bg-[#081322] text-[#F7F3EA] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Classical Library & Antique Globe Atmospheric Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[430px] overflow-hidden z-0"
      >
        <img
          src="/assets/aistudio/welcome-globe-artwork.png"
          alt=""
          className="w-full h-full object-cover object-center opacity-45 scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,19,34,0.35) 0%, rgba(8,19,34,0.72) 62%, #081322 100%)',
          }}
        />
      </div>

      {/* Navigation Drawer Modal */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="القائمة الرئيسية"
          className="fixed inset-0 z-50 bg-[#050C16]/75 backdrop-blur-xs flex justify-start"
        >
          <div className="w-72 max-w-[82vw] bg-[#0B1729] border-l border-[#C8A46B]/40 p-6 flex flex-col justify-between space-y-6 text-[#F7F3EA]">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#C8A46B]/25">
                <span className="text-sm font-display font-bold text-[#E6CFA6]">
                  منصة الأستاذ رضوان راكب
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="إغلاق القائمة"
                  className="w-8 h-8 rounded-full bg-[#13253D] border border-[#C8A46B]/40 flex items-center justify-center text-[#E6CFA6] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-2 text-sm font-bold">
                <Link
                  to="/student"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#112238]/70 hover:bg-[#C8A46B]/20 border border-[#C8A46B]/25 text-[#F7F3EA]"
                >
                  <span>الصفحة الرئيسية</span>
                  <ChevronLeft className="w-4 h-4 text-[#D6B47C]" />
                </Link>
                <Link
                  to="/student/history"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#112238]/70 hover:bg-[#C8A46B]/20 border border-[#C8A46B]/25 text-[#F7F3EA]"
                >
                  <span>مادة التاريخ</span>
                  <ChevronLeft className="w-4 h-4 text-[#D6B47C]" />
                </Link>
                <Link
                  to="/student/geography"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#112238]/70 hover:bg-[#C8A46B]/20 border border-[#C8A46B]/25 text-[#F7F3EA]"
                >
                  <span>مادة الجغرافيا</span>
                  <ChevronLeft className="w-4 h-4 text-[#D6B47C]" />
                </Link>
                <Link
                  to="/student/exams"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#C8A46B] text-[#081322]"
                >
                  <span>مكتبة الامتحانات</span>
                  <ChevronLeft className="w-4 h-4 text-[#081322]" />
                </Link>
                <Link
                  to="/student/announcements"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#112238]/70 hover:bg-[#C8A46B]/20 border border-[#C8A46B]/25 text-[#F7F3EA]"
                >
                  <span>الإعلانات التربوية</span>
                  <ChevronLeft className="w-4 h-4 text-[#D6B47C]" />
                </Link>
                <Link
                  to="/student/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#112238]/70 hover:bg-[#C8A46B]/20 border border-[#C8A46B]/25 text-[#F7F3EA]"
                >
                  <span>الملف الشخصي</span>
                  <User className="w-4 h-4 text-[#D6B47C]" />
                </Link>
                {role === 'admin' && (
                  <Link
                    to="/admin/exams"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#162C46] border border-[#E6CFA6]/60 text-[#E6CFA6]"
                  >
                    <span>لوحة رفع ونشر الامتحانات (الأستاذ)</span>
                    <ChevronLeft className="w-4 h-4 text-[#E6CFA6]" />
                  </Link>
                )}
              </nav>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Responsive Container: Mobile-First on Smartphone, Full Academic Layout on Desktop */}
      <div className="relative z-10 max-w-md md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 sm:px-8 pt-5 pb-10 flex-1 flex flex-col">
        {/* Top Action Bar: Menu Button on Right (RTL start) & Bell Button on Left (RTL end) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="فتح القائمة"
              data-testid="exams-library-menu-btn"
              className="w-11 h-11 rounded-full bg-[#0C192C]/90 border border-[#C8A46B]/55 flex items-center justify-center text-[#E6CFA6] hover:border-[#E6CFA6] shadow-md transition-all cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              to="/student"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0C192C]/90 border border-[#C8A46B]/45 text-xs font-bold text-[#E6CFA6] hover:border-[#E6CFA6] transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>الصفحة الرئيسية</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => navigate('/student/announcements')}
            aria-label="الإعلانات والإشعارات"
            data-testid="exams-library-notifications-btn"
            className="w-11 h-11 rounded-full bg-[#0C192C]/90 border border-[#C8A46B]/55 flex items-center justify-center text-[#E6CFA6] hover:border-[#E6CFA6] shadow-md transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5 fill-[#E6CFA6]/85" />
          </button>
        </div>

        {/* Center Golden Laurel Crest + Title + Subtitle */}
        <div className="mt-2 mb-6 md:mb-10 text-center space-y-2">
          <GoldenLaurelBookCrest />

          <h1
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-transparent bg-clip-text"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #F5DFB2 0%, #D4AF72 55%, #A67E43 100%)',
            }}
          >
            مكتبة
            <span className="block -mt-1">الامتحانات</span>
          </h1>

          {/* Subtitle with ornamental gold lines */}
          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="h-[1px] flex-1 max-w-[44px] md:max-w-[80px] bg-gradient-to-l from-[#C8A46B]/80 to-transparent" />
            <p className="text-xs sm:text-sm md:text-base font-bold text-[#EDE2CE] tracking-wide">
              اختر المادة لاستعراض الامتحانات المنشورة
            </p>
            <span className="h-[1px] flex-1 max-w-[44px] md:max-w-[80px] bg-gradient-to-r from-[#C8A46B]/80 to-transparent" />
          </div>
          <div className="flex items-center justify-center">
            <span className="text-[#C8A46B] text-[10px]">❖</span>
          </div>
        </div>

        {/* Two Large Subject Cards: History & Geography (Stacked on mobile, 2-column grid on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 my-auto">
          {/* =================================================================
              CARD 1: HISTORY EXAMINATIONS (التاريخ)
             ================================================================= */}
          <button
            type="button"
            onClick={() => navigate('/student/exams/history')}
            data-testid="exams-library-card-history"
            className="group relative w-full h-42 sm:h-46 md:h-52 rounded-[24px] p-[3px] bg-gradient-to-b from-[#E5C790] via-[#C29B5C] to-[#8C6630] shadow-[0_16px_38px_rgba(0,0,0,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer overflow-hidden"
          >
            <div
              dir="ltr"
              className="relative w-full h-full rounded-[21px] bg-[#EFE3CE] border border-[#9C7842]/50 overflow-hidden flex items-center justify-between"
            >
              {/* Crisp High-Resolution History Artwork (Classical Temple & Quill) */}
              <div
                aria-hidden="true"
                className="inset-y-0 left-0 w-[55%] h-full overflow-hidden pointer-events-none relative shrink-0"
              >
                <OptimizedImage
                  src="/assets/aistudio/history-ruins.png"
                  fallbackSrc="/assets/aistudio/history-hero.png"
                  alt=""
                  priority={true}
                  className="w-full h-full object-cover object-center pointer-events-none scale-105 group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className="absolute inset-y-0 right-0 w-12"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(239,227,206,0) 0%, #EFE3CE 95%)',
                  }}
                />
              </div>

              {/* Inner ornate gold frame line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-1.5 rounded-[16px] border border-[#B89052]/65 z-20"
              />

              {/* Right Side (in LTR flex: Center-Right Arabic Text + Far-Right Navy Circle Chevron) */}
              <div
                dir="rtl"
                className="relative z-10 flex-1 pr-3 pl-2 flex items-center justify-between gap-1.5"
              >
                {/* Far-right in RTL: Circular Dark-Navy Chevron Button */}
                <div className="w-9 h-9 rounded-full bg-[#0C192C] border border-[#C8A46B]/65 text-[#F5EFE2] flex items-center justify-center shrink-0 shadow-md group-hover:bg-[#162B47] transition-colors">
                  <ChevronRight className="w-5 h-5 stroke-[2.6]" />
                </div>

                {/* Arabic Title and Subtitle */}
                <div className="flex-1 text-center space-y-1">
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0D1A2D] tracking-tight">
                    التاريخ
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-[#253244] leading-snug">
                    امتحانات التاريخ
                    <span className="block font-extrabold text-[#0D1A2D]">
                      بصيغة PDF
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </button>

          {/* =================================================================
              CARD 2: GEOGRAPHY EXAMINATIONS (الجغرافيا)
             ================================================================= */}
          <button
            type="button"
            onClick={() => navigate('/student/exams/geography')}
            data-testid="exams-library-card-geography"
            className="group relative w-full h-42 sm:h-46 md:h-52 rounded-[24px] p-[3px] bg-gradient-to-b from-[#E5C790] via-[#C29B5C] to-[#8C6630] shadow-[0_16px_38px_rgba(0,0,0,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer overflow-hidden"
          >
            <div
              dir="ltr"
              className="relative w-full h-full rounded-[21px] bg-[#EFE3CE] border border-[#9C7842]/50 overflow-hidden flex items-center justify-between"
            >
              {/* Crisp High-Resolution Geography Artwork (Antique Terrestrial Globe & Atlas) */}
              <div
                aria-hidden="true"
                className="inset-y-0 left-0 w-[55%] h-full overflow-hidden pointer-events-none relative shrink-0"
              >
                <OptimizedImage
                  src="/assets/aistudio/geography-book.png"
                  fallbackSrc="/assets/aistudio/geography-hero.jpg"
                  alt=""
                  priority={true}
                  className="w-full h-full object-cover object-center pointer-events-none scale-105 group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className="absolute inset-y-0 right-0 w-12"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(239,227,206,0) 0%, #EFE3CE 95%)',
                  }}
                />
              </div>

              {/* Inner ornate gold frame line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-1.5 rounded-[16px] border border-[#B89052]/65 z-20"
              />

              {/* Right Side (Center-Right Arabic Text + Far-Right Navy Circle Chevron) */}
              <div
                dir="rtl"
                className="relative z-10 flex-1 pr-3 pl-2 flex items-center justify-between gap-1.5"
              >
                {/* Far-right in RTL: Circular Dark-Navy Chevron Button */}
                <div className="w-9 h-9 rounded-full bg-[#0C192C] border border-[#C8A46B]/65 text-[#F5EFE2] flex items-center justify-center shrink-0 shadow-md group-hover:bg-[#162B47] transition-colors">
                  <ChevronRight className="w-5 h-5 stroke-[2.6]" />
                </div>

                {/* Arabic Title and Subtitle */}
                <div className="flex-1 text-center space-y-1">
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0D1A2D] tracking-tight">
                    الجغرافيا
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-[#253244] leading-snug">
                    امتحانات الجغرافيا
                    <span className="block font-extrabold text-[#0D1A2D]">
                      بصيغة PDF
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Classical Architectural Pediment & Sweeping Gold/Navy Waves */}
      <div
        aria-hidden="true"
        className="relative z-0 w-full h-18 overflow-hidden pointer-events-none"
      >
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 w-full h-16"
        >
          <path
            d="M0,15 C320,95 1120,95 1440,15 L1440,120 L0,120 Z"
            fill="#050D18"
          />
          <path
            d="M0,18 C340,92 1100,92 1440,18"
            fill="none"
            stroke="#C8A46B"
            strokeWidth="2.5"
            strokeOpacity="0.65"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * SCREEN 2: STUDENT — SUBJECT-SPECIFIC EXAMINATION ARCHIVE
 * (/student/exams/history and /student/exams/geography)
 * Exact visual match to WhatsApp_Image_2026-11-10_at_13.24.55_8ba91ffe.jpeg
 * Adapted responsively for both Mobile (390px) and Desktop (1440px)
 * ============================================================================
 */
export function SubjectExaminationArchivePage({
  forcedSubject,
}: {
  forcedSubject?: ExamSubjectSlug;
}) {
  const params = useParams<{ subjectSlug?: string }>();
  const navigate = useNavigate();
  const { profile, role } = useAuth();
  const { examinations } = useContent();

  const subjectSlug: ExamSubjectSlug =
    forcedSubject ||
    (params.subjectSlug?.toLowerCase() === 'geography' ? 'geography' : 'history');

  const isGeography = subjectSlug === 'geography';
  const pageHeaderTitle = isGeography
    ? 'الامتحانات - الجغرافيا'
    : 'الامتحانات - التاريخ';
  const bannerPlaqueTitle = isGeography
    ? 'أرشيف امتحانات الجغرافيا'
    : 'أرشيف امتحانات التاريخ';

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<OfficialExamType | 'all'>(
    'all'
  );
  const [selectedLevel, setSelectedLevel] = useState<
    ExamTargetLevelOption | 'all'
  >('all');
  const [selectedSession, setSelectedSession] = useState<
    OfficialExamSession | 'all'
  >('all');

  // Filter strictly published exams for this exact subject AND student cohort
  const {
    items: publishedExams,
    availableYears,
    availableTypes,
    availableLevels,
  } = useMemo(
    () =>
      filterPublishedSubjectExaminations({
        examinations,
        subjectSlug,
        userProfile: profile,
        yearFilter: selectedYear,
        examTypeFilter: selectedType,
        levelFilter: selectedLevel,
        sessionFilter: selectedSession,
      }),
    [
      examinations,
      subjectSlug,
      profile,
      selectedYear,
      selectedType,
      selectedLevel,
      selectedSession,
    ]
  );

  // Reset year filter if selectedYear is no longer in availableYears
  useEffect(() => {
    if (selectedYear !== 'all' && !availableYears.includes(selectedYear)) {
      setSelectedYear('all');
    }
  }, [availableYears, selectedYear]);

  // Display years dynamically from availableYears (or default 2025, 2024, 2023 pills matching the reference layout)
  const yearPillsToDisplay = useMemo(() => {
    if (availableYears.length > 0) {
      const merged = new Set<number>([...availableYears, 2025, 2024, 2023]);
      return Array.from(merged).sort((a, b) => b - a).slice(0, 6);
    }
    return [2025, 2024, 2023];
  }, [availableYears]);

  const hasActiveFilter =
    selectedYear !== 'all' ||
    selectedType !== 'all' ||
    selectedLevel !== 'all' ||
    selectedSession !== 'all';

  return (
    <div
      dir="rtl"
      data-testid={`subject-exam-archive-${subjectSlug}`}
      className="min-h-screen w-full bg-[#081322] text-[#F7F3EA] pb-14"
    >
      <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full">
        {/* Top Navigation Bar matching WhatsApp_Image_2026-11-10_at_13.24.55_8ba91ffe.jpeg */}
        <header className="px-4 sm:px-6 py-3.5 bg-[#081322] border-b border-[#C8A46B]/30 flex items-center justify-between gap-3">
          {/* Right side in RTL: Gold Open Book Emblem */}
          <div className="w-10 h-10 rounded-xl bg-[#0E1E33] border border-[#C8A46B]/45 flex items-center justify-center text-[#E6CFA6]">
            <BookOpen className="w-5 h-5" />
          </div>

          {/* Centered Subject Archive Title */}
          <h1 className="font-display font-extrabold text-lg sm:text-2xl text-[#E6CFA6] tracking-wide text-center">
            {pageHeaderTitle}
          </h1>

          {/* Left side in RTL: Circular Back Button */}
          <button
            type="button"
            onClick={() => navigate('/student/exams')}
            aria-label="العودة إلى مكتبة الامتحانات"
            data-testid="archive-back-to-library-btn"
            className="w-10 h-10 rounded-full bg-[#0E1E33] border border-[#C8A46B]/55 flex items-center justify-center text-[#E6CFA6] hover:border-[#E6CFA6] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </header>

        {/* High-Resolution Photographic Academic Banner with Centered Ornamental Plaque */}
        <div className="relative w-full h-44 sm:h-52 md:h-60 overflow-hidden border-b-2 border-[#C8A46B]/60 bg-[#0A1524]">
          <OptimizedImage
            src={
              isGeography
                ? '/assets/aistudio/geography-hero.jpg'
                : '/assets/aistudio/history-hero.png'
            }
            fallbackSrc="/assets/aistudio/welcome-globe-artwork.png"
            alt=""
            priority={true}
            className="w-full h-full object-cover object-center brightness-95"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(8,19,34,0.28) 0%, rgba(8,19,34,0.48) 60%, rgba(8,19,34,0.84) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-5 flex justify-center px-4">
            <div className="relative px-6 sm:px-8 py-2.5 rounded-xl bg-[#0A1524]/92 border-2 border-[#D4AF72] shadow-[0_10px_28px_rgba(0,0,0,0.65)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-1 rounded-lg border border-[#D4AF72]/45"
              />
              <h2 className="relative z-10 font-display font-extrabold text-base sm:text-xl text-[#F2D9A6] tracking-wide">
                {bannerPlaqueTitle}
              </h2>
            </div>
          </div>
        </div>

        {/* Dynamic Year, Exam Type, Level, and Session Filter Bar */}
        <div className="px-4 sm:px-6 pt-4 pb-2 space-y-3">
          {/* Row 1: Year Filter Pills (الكل | 2025 | 2024 | 2023) */}
          <div
            role="tablist"
            aria-label="تصفية الامتحانات حسب السنة"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
          >
            {/* "الكل" Pill */}
            <button
              type="button"
              role="tab"
              aria-selected={selectedYear === 'all'}
              data-testid="exam-filter-year-all"
              onClick={() => setSelectedYear('all')}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold shrink-0 border transition-all cursor-pointer ${
                selectedYear === 'all'
                  ? 'bg-gradient-to-b from-[#E5C68E] via-[#C8A265] to-[#A67E43] text-[#091423] border-[#F2D9A6] shadow-[0_4px_14px_rgba(200,164,107,0.35)]'
                  : 'bg-[#0D1B2E] text-[#E6CFA6] border-[#C8A46B]/45 hover:border-[#C8A46B]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>الكل</span>
            </button>

            {/* Year Pills */}
            {yearPillsToDisplay.map((yr) => {
              const isActive = selectedYear === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  data-testid={`exam-filter-year-${yr}`}
                  onClick={() => setSelectedYear(yr)}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-mono-tabular font-bold shrink-0 border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-b from-[#E5C68E] via-[#C8A265] to-[#A67E43] text-[#091423] border-[#F2D9A6] shadow-[0_4px_14px_rgba(200,164,107,0.35)]'
                      : 'bg-[#0D1B2E] text-[#E6CFA6] border-[#C8A46B]/45 hover:border-[#C8A46B]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-[#D6B47C]" />
                  <span>{yr}</span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Exam Type (الامتحان الجهوي / الامتحان الوطني), Level, and Session Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Exam Type Pills */}
              {(
                [
                  { id: 'all' as const, label: 'جميع الأنواع' },
                  { id: 'regional' as const, label: 'الامتحان الجهوي' },
                  { id: 'national' as const, label: 'الامتحان الوطني' },
                ]
              )
                .filter(
                  (t) =>
                    t.id === 'all' ||
                    availableTypes.length === 0 ||
                    availableTypes.includes(t.id)
                )
                .map((tp) => (
                  <button
                    key={tp.id}
                    type="button"
                    data-testid={`exam-filter-type-${tp.id}`}
                    onClick={() => setSelectedType(tp.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors cursor-pointer ${
                      selectedType === tp.id
                        ? 'bg-[#C8A46B]/25 text-[#F2D9A6] border-[#C8A46B]/70'
                        : 'bg-[#0C1829] text-[#F7F3EA]/65 border-[#C8A46B]/20 hover:border-[#C8A46B]/45'
                    }`}
                  >
                    {tp.label}
                  </button>
                ))}

              {/* Session Pills */}
              {(
                [
                  { id: 'all' as const, label: 'جميع الدورات' },
                  { id: 'normal' as const, label: 'الدورة العادية' },
                  { id: 'resit' as const, label: 'الدورة الاستدراكية' },
                ]
              ).map((ses) => (
                <button
                  key={ses.id}
                  type="button"
                  data-testid={`exam-filter-session-${ses.id}`}
                  onClick={() => setSelectedSession(ses.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors cursor-pointer ${
                    selectedSession === ses.id
                      ? 'bg-[#C8A46B]/25 text-[#F2D9A6] border-[#C8A46B]/70'
                      : 'bg-[#0C1829] text-[#F7F3EA]/65 border-[#C8A46B]/20 hover:border-[#C8A46B]/45'
                  }`}
                >
                  {ses.label}
                </button>
              ))}

              {/* Educational Level Selector when multiple levels are available */}
              {availableLevels.length > 1 && (
                <select
                  aria-label="تصفية حسب المستوى"
                  data-testid="exam-filter-level-select"
                  value={selectedLevel}
                  onChange={(e) =>
                    setSelectedLevel(
                      e.target.value as ExamTargetLevelOption | 'all'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#0C1829] text-[#F2D9A6] border border-[#C8A46B]/35 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">جميع المستويات</option>
                  <option value="1bac">الأولى باكالوريا علوم</option>
                  <option value="2bac">الثانية باكالوريا آداب</option>
                </select>
              )}
            </div>

            {role === 'admin' && (
              <Link
                to="/admin/exams/new"
                className="text-[#E6CFA6] hover:underline font-bold shrink-0"
              >
                + نشر امتحان جديد
              </Link>
            )}
          </div>
        </div>

        {/* Examination Cards List (Single column on mobile, 2-column grid on desktop) */}
        <div className="px-4 sm:px-6 pt-2">
          {publishedExams.length === 0 ? (
            <div
              data-testid="subject-exam-archive-empty-state"
              className="rounded-3xl bg-gradient-to-b from-[#F7F1E5] to-[#EFE5D2] border-2 border-[#C8A46B]/65 p-8 sm:p-10 text-center text-[#0E1B2E] shadow-[0_14px_34px_rgba(0,0,0,0.35)] space-y-3 max-w-xl mx-auto"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#0D1B2E] border border-[#C8A46B] text-[#E6CFA6] flex items-center justify-center mx-auto shadow-md">
                <FileText className="w-8 h-8" />
              </div>

              <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#0E1B2E]">
                لا توجد امتحانات منشورة حالياً
              </h3>

              <p className="text-xs sm:text-sm text-[#2C3746] leading-relaxed max-w-sm mx-auto font-medium">
                {hasActiveFilter
                  ? 'لا توجد امتحانات مطابقة لمعايير التصفية المختارة. يمكنك اختيار "الكل" لاستعراض جميع الامتحانات المتاحة.'
                  : `سيتم إتاحة امتحانات مادة ${
                      isGeography ? 'الجغرافيا' : 'التاريخ'
                    } بصيغة PDF في هذا الأرشيف فور نشرها من طرف الأستاذ رضوان راكب لفوجك الدراسي.`}
              </p>

              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear('all');
                    setSelectedType('all');
                    setSelectedLevel('all');
                    setSelectedSession('all');
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D1B2E] text-[#E6CFA6] text-xs font-bold border border-[#C8A46B]/50 cursor-pointer"
                >
                  <span>عرض جميع الامتحانات</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {publishedExams.map(({ exam, metadata }) => {
                const viewerUrl = `/student/exams/${subjectSlug}/${exam.id}`;
                const sessionText = formatExamSessionSubtitleAr(
                  metadata.examSession,
                  metadata.examYear
                );
                const typeBadge = formatExamTypeBadgeAr(metadata.examType);
                const typeFull = formatExamTypeFullAr(metadata.examType);
                const levelShort = formatExamLevelShortAr(
                  metadata.targetLevel,
                  metadata.semester
                );

                return (
                  <article
                    key={exam.id}
                    onClick={() => navigate(viewerUrl)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${exam.titleAr} - ${sessionText}`}
                    data-testid={`archive-exam-card-${exam.id}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(viewerUrl);
                      }
                    }}
                    className="group rounded-[22px] bg-gradient-to-b from-[#F8F3E8] to-[#EFE6D5] border border-[#D4C2A2] hover:border-[#C8A46B] px-3.5 py-3.5 sm:px-4 sm:py-4 shadow-[0_10px_24px_rgba(0,0,0,0.32)] flex items-center justify-between gap-3 transition-all cursor-pointer"
                  >
                    {/* Right side in RTL: Circular Burnished Gold Action Button */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CFA86B] to-[#9E763B] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </div>

                    {/* Center: Exam Title, Session & Year, and Bottom Metadata Icons */}
                    <div className="flex-1 text-center space-y-1 min-w-0 px-1">
                      <h3 className="font-display font-black text-base sm:text-lg text-[#0E1B2E] truncate">
                        {exam.titleAr}
                      </h3>

                      <p className="text-xs sm:text-sm font-bold text-[#253142]">
                        {sessionText}
                      </p>

                      <div className="pt-1 flex items-center justify-center gap-4 text-xs font-bold text-[#3A4656]">
                        <span
                          title={typeFull}
                          className="inline-flex items-center gap-1"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#A88248]" />
                          <span>{typeBadge}</span>
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-[#A88248]" />
                          <span>{levelShort}</span>
                        </span>
                      </div>
                    </div>

                    {/* Left side in RTL: Red & Cream PDF Document Badge */}
                    <ExamCardPdfBadge />
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper to count pages from a PDF binary ArrayBuffer (falls back to 1 if single-page)
 */
async function countPdfPagesFromBlob(blob: Blob): Promise<{
  pageCount: number;
  extractedTextSnippet: string;
}> {
  try {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const ascii = new TextDecoder('latin1').decode(bytes.slice(0, 512 * 1024));
    const pageMatches = ascii.match(/\/Type\s*\/Page\b(?!s)/g);
    const countMatch = ascii.match(/\/Count\s+(\d+)/);
    const countFromTree = countMatch ? Number(countMatch[1]) : 0;
    const detectedPages = Math.max(
      1,
      pageMatches ? pageMatches.length : countFromTree || 1
    );
    return {
      pageCount: Math.min(50, detectedPages),
      extractedTextSnippet: '',
    };
  } catch {
    return { pageCount: 1, extractedTextSnippet: '' };
  }
}

/**
 * ============================================================================
 * SCREEN 3: STUDENT — PDF EXAMINATION VIEWER (/student/exams/:subjectSlug/:examId)
 * Dedicated full-screen mobile-first academic PDF viewer with page navigation,
 * zoom in/out, zoom percentage indicator, full-screen toggle, and original PDF download
 * ============================================================================
 */
export function ExamPdfViewerPage() {
  const { subjectSlug: rawSlug, examId } = useParams<{
    subjectSlug?: string;
    examId?: string;
  }>();
  const navigate = useNavigate();
  const { profile, role } = useAuth();
  const {
    examinations,
    resources,
    resolveProtectedPdfBlob,
  } = useContent();

  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const subjectSlug: ExamSubjectSlug =
    rawSlug?.toLowerCase() === 'geography' ? 'geography' : 'history';

  const exam = useMemo(
    () => examinations.find((e) => e.id === examId) || null,
    [examinations, examId]
  );

  const isAuthorized = useMemo(() => {
    if (!exam) return false;
    if (!isExamMatchingSubject(exam, subjectSlug)) return false;
    if (role === 'admin') return true;
    return (
      exam.status === 'published' &&
      exam.effectiveStatus === 'published' &&
      canUserAccessContentItem(profile, exam)
    );
  }, [exam, subjectSlug, role, profile]);

  const metadata = useMemo(
    () => (exam ? decodeExamMetadataFromExam(exam) : null),
    [exam]
  );

  const linkedResource = useMemo(() => {
    if (!exam || !metadata) return null;
    return (
      resources.find(
        (r) =>
          r.id === metadata.pdfResourceId || exam.attachmentIds?.includes(r.id)
      ) || null
    );
  }, [exam, metadata, resources]);

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);
  const [pdfBlobSize, setPdfBlobSize] = useState<number>(0);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    let activeUrl: string | null = null;
    let cancelled = false;

    async function loadPdfDocument() {
      if (!exam || !isAuthorized) {
        setLoadingPdf(false);
        return;
      }
      setLoadingPdf(true);

      let resolvedBlob: Blob | null = null;
      if (linkedResource) {
        resolvedBlob = await resolveProtectedPdfBlob(linkedResource);
      }

      if (!resolvedBlob && metadata) {
        resolvedBlob = generateAcademicPdfBlob({
          titleFr: exam.titleFr || exam.titleAr,
          subjectFr:
            subjectSlug === 'geography' ? 'Geographie' : 'Histoire',
          year: metadata.examYear,
          sessionFr:
            metadata.examSession === 'resit'
              ? 'Session de Rattrapage'
              : 'Session Normale',
          pageCount: 2,
        });
      }

      if (!cancelled && resolvedBlob) {
        const info = await countPdfPagesFromBlob(resolvedBlob);
        setTotalPages(info.pageCount);
        setPdfBlobSize(resolvedBlob.size);
        setPdfBlob(resolvedBlob);
        activeUrl = URL.createObjectURL(resolvedBlob);
        setPdfObjectUrl(activeUrl);
      }

      if (!cancelled) {
        setLoadingPdf(false);
      }
    }

    void loadPdfDocument();

    return () => {
      cancelled = true;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [exam, isAuthorized, linkedResource, metadata, subjectSlug, resolveProtectedPdfBlob, reloadKey]);

  const handleDownloadOriginalPdf = () => {
    if (!pdfObjectUrl) return;
    const downloadFileName =
      linkedResource?.fileName ||
      metadata?.pdfFileName ||
      `${exam?.titleAr || 'Exam'}_${metadata?.examYear || 2025}.pdf`;

    const a = document.createElement('a');
    a.href = pdfObjectUrl;
    a.download = downloadFileName.endsWith('.pdf')
      ? downloadFileName
      : `${downloadFileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!exam || !isAuthorized || !metadata) {
    return (
      <div
        dir="rtl"
        data-testid="exam-pdf-viewer-unauthorized"
        className="min-h-screen bg-[#081322] text-[#F7F3EA] flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full rounded-3xl bg-[#0D1B2E] border-2 border-[#C8A46B]/55 p-7 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-400/50 text-red-300 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-display font-extrabold text-xl text-[#E6CFA6]">
            غير مصرح بالوصول إلى هذا الامتحان
          </h1>
          <p className="text-xs sm:text-sm text-[#F7F3EA]/80 leading-relaxed">
            هذا الامتحان غير موجود أو مخصص لمستوى أو فوج دراسي آخر غير فوجك المسجل.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/student/exams/${subjectSlug}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A265] to-[#E5C68E] text-[#081322] font-bold text-xs cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى أرشيف الامتحانات</span>
          </button>
        </div>
      </div>
    );
  }

  const sessionText = formatExamSessionSubtitleAr(
    metadata.examSession,
    metadata.examYear
  );
  const subjectLabelAr =
    subjectSlug === 'geography' ? 'الجغرافيا' : 'التاريخ';
  const fileNameLabel =
    linkedResource?.fileName || metadata.pdfFileName || 'Examination.pdf';

  return (
    <div
      ref={viewerContainerRef}
      dir="rtl"
      data-testid="student-exam-pdf-viewer-screen"
      className="min-h-screen w-full bg-[#081322] text-[#F7F3EA] flex flex-col"
    >
      {/* =====================================================================
          TOP VIEWER HEADER: Back Button, Exam Title & Metadata, Download PDF
         ===================================================================== */}
      <header className="shrink-0 z-30 bg-[#0A1628] border-b border-[#C8A46B]/40 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Back to Subject Archive */}
          <button
            type="button"
            onClick={() => navigate(`/student/exams/${subjectSlug}`)}
            aria-label="العودة إلى أرشيف المادة"
            data-testid="pdf-viewer-back-btn"
            className="w-10 h-10 rounded-full bg-[#112238] border border-[#C8A46B]/55 flex items-center justify-center text-[#E6CFA6] hover:border-[#E6CFA6] shrink-0 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Examination Title & Subtitle */}
          <div className="min-w-0 flex-1 text-center px-2">
            <h1
              data-testid="pdf-viewer-exam-title"
              className="font-display font-extrabold text-sm sm:text-lg text-[#F2D9A6] truncate"
            >
              {exam.titleAr}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#F7F3EA]/80 truncate">
              {subjectLabelAr} · {sessionText} ·{' '}
              {formatExamTypeBadgeAr(metadata.examType)}
            </p>
          </div>

          {/* Download Original PDF Button */}
          <button
            type="button"
            onClick={handleDownloadOriginalPdf}
            disabled={!pdfObjectUrl}
            aria-label="تحميل ملف PDF الأصلي"
            data-testid="pdf-viewer-download-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C09858] via-[#E5C68E] to-[#C09858] text-[#081322] font-bold text-xs shadow-md hover:brightness-105 shrink-0 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.4]" />
            <span className="hidden sm:inline">تحميل PDF</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          DOCUMENT DISPLAY AREA: Multi-Page High-DPI PDF.js Canvas Viewer
         ===================================================================== */}
      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6 bg-[#07101D]">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Official Document Info Ribbon */}
          <div className="w-full rounded-2xl bg-[#0D1C31] border border-[#C8A46B]/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-[#B91C1C] text-white font-extrabold text-[10px]">
                PDF
              </span>
              <span className="font-bold text-[#F7F3EA]">{fileNameLabel}</span>
              <span className="text-[#D6B47C] font-mono-tabular">
                ({formatFileSizeLabel(pdfBlobSize || metadata.pdfFileSize)})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[#E6CFA6]">
              <span>{formatExamLevelFullAr(metadata.targetLevel)}</span>
              <span>·</span>
              <span>{formatExamSessionLabelAr(metadata.examSession)}</span>
              <span>·</span>
              <span className="font-mono-tabular">{metadata.examYear}</span>
            </div>
          </div>

          <AcademicPdfViewer
            pdfBlob={pdfBlob}
            loading={loadingPdf}
            titleAr={`${exam.titleAr} — ${subjectLabelAr} (${metadata.examYear})`}
            subtitleAr={`${fileNameLabel} · ${sessionText}`}
            fallbackPageCount={totalPages}
            onRetry={() => setReloadKey((k) => k + 1)}
            onDownload={handleDownloadOriginalPdf}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Legacy export alias so existing imports of ExaminationsPage render Screen 1
 */
export function ExaminationsPage() {
  return <ExaminationsLibraryPage />;
}
