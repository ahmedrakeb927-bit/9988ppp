import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FolderTree } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { SubjectId } from '../types/academic';
import {
  formatStudentCompactCohortCode,
  HISTORY_STRUCTURAL_UNITS,
  HistoryUnitSlotNumber,
  resolveHistoryUnitSlot,
} from '../utils/academicRules';
import {
  canUserAccessContentItem,
  CmsLesson,
  CmsResource,
} from '../utils/cmsContentRules';
import { LessonReaderModal } from '../components/cms/LessonReaderModal';

interface SubjectPageProps {
  subject: SubjectId;
}

function ClassicalMonumentIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Pediment Roof */}
      <path
        d="M4 10.5L16 4L28 10.5H4Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      {/* Upper Architrave */}
      <path d="M5.5 13H26.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      {/* Three Classical Columns */}
      <path d="M9.5 13V23.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 13V23.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M22.5 13V23.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Stepped Stylobate Base */}
      <path d="M5.5 24H26.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M3.5 27H28.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function GeographicalGlobeIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Globe Sphere */}
      <circle cx="15.5" cy="14" r="9.2" stroke="currentColor" strokeWidth="1.9" />
      {/* Inner Meridian Ellipse */}
      <ellipse cx="15.5" cy="14" rx="4.5" ry="9.2" stroke="currentColor" strokeWidth="1.6" />
      {/* Equator & Parallels */}
      <path
        d="M6.8 11.2H24.2M6.8 16.8H24.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Central Axis */}
      <path d="M15.5 4.8V23.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Antique Brass Meridian Arm & Stand */}
      <path
        d="M19.5 3.6C24.4 5.4 27.6 9.4 27.6 14C27.6 19.6 22.8 24.4 15.5 24.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M15.5 24.8V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 28H20.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function OpenBookHeaderIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 5.5C11.6 3.7 7.6 3.2 3.5 4.2C2.9 4.35 2.5 4.9 2.5 5.5V18.2C2.5 18.9 3.15 19.45 3.85 19.3C7.7 18.45 11.4 18.9 14 20.8C16.6 18.9 20.3 18.45 24.15 19.3C24.85 19.45 25.5 18.9 25.5 18.2V5.5C25.5 4.9 25.1 4.35 24.5 4.2C20.4 3.2 16.4 3.7 14 5.5Z"
        fill="currentColor"
      />
      <path
        d="M14 5.5V20.5"
        stroke="#F7F3EA"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GeographyCompassHeaderIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="14" cy="14" r="7.8" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      <path
        d="M14 5.2L16.3 11.7L22.8 14L16.3 16.3L14 22.8L11.7 16.3L5.2 14L11.7 11.7L14 5.2Z"
        fill="currentColor"
      />
      <circle cx="14" cy="14" r="1.6" fill="#F7F3EA" />
    </svg>
  );
}

function GraduationCapBadgeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 4L2.5 8.75L12 13.5L21.5 8.75L12 4Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 11V15.75C6.5 17.5 9 19 12 19C15 19 17.5 17.5 17.5 15.75V11"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 9.25V15.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GeographyLeftTerrainWatermark() {
  return (
    <svg
      viewBox="0 0 280 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pointer-events-none select-none absolute left-0 bottom-9 sm:bottom-11 w-[145px] sm:w-[240px] h-auto opacity-[0.22]"
    >
      {/* Topographic Contour Rings */}
      <path
        d="M-20 80C40 65 95 95 145 75C195 55 225 90 265 110"
        stroke="#8B6E3B"
        strokeWidth="1.3"
        strokeDasharray="4 4"
      />
      <path
        d="M-20 115C35 100 100 130 160 105C210 85 240 120 275 145"
        stroke="#8B6E3B"
        strokeWidth="1.2"
      />
      <path
        d="M-20 150C45 140 110 165 175 140C220 122 250 155 280 180"
        stroke="#8B6E3B"
        strokeWidth="1.1"
      />
      {/* Mountain Range Silhouette & Ridges */}
      <path
        d="M-10 310L48 195L92 245L146 168L212 265L245 230L280 310H-10Z"
        fill="#B69A68"
        fillOpacity="0.35"
      />
      <path
        d="M-10 310L48 195L92 245L146 168L212 265L245 230L280 310"
        stroke="#8B6E3B"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M48 195L64 265M146 168L132 255M146 168L172 240"
        stroke="#8B6E3B"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function GeographyRightCompassWatermark() {
  return (
    <svg
      viewBox="0 0 220 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pointer-events-none select-none absolute right-0 bottom-10 sm:bottom-12 w-[105px] sm:w-[170px] h-auto opacity-[0.22]"
    >
      <g transform="translate(135, 155)">
        <circle cx="0" cy="0" r="88" stroke="#8B6E3B" strokeWidth="1.4" />
        <circle cx="0" cy="0" r="76" stroke="#8B6E3B" strokeWidth="1" strokeDasharray="3 4" />
        <circle cx="0" cy="0" r="56" stroke="#8B6E3B" strokeWidth="1.2" />
        {/* Compass Rose Points */}
        <path
          d="M0 -82L12 -18L76 0L12 18L0 82L-12 18L-76 0L-12 -18L0 -82Z"
          stroke="#8B6E3B"
          strokeWidth="1.5"
          fill="#B69A68"
          fillOpacity="0.25"
        />
        <path
          d="M-52 -52L-6 -14L52 -52L14 -6L52 52L6 14L-52 52L-14 6L-52 -52Z"
          stroke="#8B6E3B"
          strokeWidth="1.1"
        />
      </g>
    </svg>
  );
}

export function SubjectPage({ subject }: SubjectPageProps) {
  const { lang, t } = useLanguage();
  const { isAuthenticated, profile, role } = useAuth();
  const {
    subjects,
    units,
    lessons: cmsLessons,
    resources: cmsResources,
    requestProtectedResourceDownload,
  } = useContent();

  // State for the 4 structural units (defaults to Unit 01, resets on subject switch)
  const [selectedUnitSlot, setSelectedUnitSlot] = useState<HistoryUnitSlotNumber>(1);
  const [readingLesson, setReadingLesson] = useState<CmsLesson | null>(null);

  useEffect(() => {
    setSelectedUnitSlot(1);
    setReadingLesson(null);
  }, [subject]);

  const isHistory = subject === 'history';

  const compactCohortBadge = useMemo(
    () => formatStudentCompactCohortCode(profile),
    [profile]
  );

  const handleDownloadResource = async (res: CmsResource) => {
    const url = await requestProtectedResourceDownload(res);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = res.fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const matchedCmsSubject = useMemo(() => {
    return subjects.find((s) =>
      isHistory
        ? s.id === 'subject_history' ||
          s.titleAr.includes('التاريخ') ||
          s.titleFr.toLowerCase().includes('histoire')
        : s.id === 'subject_geography' ||
          s.titleAr.includes('الجغرافيا') ||
          s.titleFr.toLowerCase().includes('géographie') ||
          s.titleFr.toLowerCase().includes('geographie')
    );
  }, [subjects, isHistory]);

  const publishedSubjectUnits = useMemo(() => {
    if (!matchedCmsSubject) return [];
    return units.filter(
      (u) =>
        u.subjectId === matchedCmsSubject.id &&
        u.effectiveStatus === 'published' &&
        (role === 'admin' || canUserAccessContentItem(profile, u))
    );
  }, [units, matchedCmsSubject, role, profile]);

  // Real Firestore lessons for the selected unit slot (01..04)
  const activeUnitLessons = useMemo(() => {
    if (!matchedCmsSubject) return [];

    // Map each published unit of this subject to one of the 4 structural slots (1..4)
    const unitSlotMap = new Map<string, HistoryUnitSlotNumber>();
    publishedSubjectUnits.forEach((u, idx) => {
      unitSlotMap.set(u.id, resolveHistoryUnitSlot(u, idx));
    });

    return cmsLessons.filter((lesson) => {
      if (
        lesson.subjectId !== matchedCmsSubject.id ||
        lesson.effectiveStatus !== 'published'
      ) {
        return false;
      }
      if (role !== 'admin' && !canUserAccessContentItem(profile, lesson)) {
        return false;
      }

      if (lesson.unitId && unitSlotMap.has(lesson.unitId)) {
        return unitSlotMap.get(lesson.unitId) === selectedUnitSlot;
      }

      // Fallback if unitId directly encodes slot 1..4
      const inferredSlot = resolveHistoryUnitSlot(
        { id: lesson.unitId || '', titleAr: lesson.titleAr, titleFr: lesson.titleFr },
        0
      );
      return inferredSlot === selectedUnitSlot;
    });
  }, [
    matchedCmsSubject,
    publishedSubjectUnits,
    cmsLessons,
    role,
    profile,
    selectedUnitSlot,
  ]);

  const activeStructuralUnit =
    HISTORY_STRUCTURAL_UNITS.find((u) => u.slot === selectedUnitSlot) ||
    HISTORY_STRUCTURAL_UNITS[0];

  const SubjectUnitIcon = isHistory ? ClassicalMonumentIcon : GeographicalGlobeIcon;

  return (
    <div className="relative min-h-screen w-full bg-[#081322] text-[#FAF6EE] flex flex-col justify-between overflow-x-hidden select-none">
      {/* Ambient Midnight Navy Engraved Archive & Vignette Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 68% 18%, rgba(22, 40, 66, 0.42) 0%, rgba(8, 19, 34, 0.96) 72%, #060F1C 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[1120px] mx-auto pb-6">
        {/* 1. SUBJECT HERO SECTION (HISTORY OR GEOGRAPHY) */}
        <header className="relative w-full h-[250px] sm:h-[340px] md:h-[375px] overflow-hidden">
          {isHistory ? (
            /* Left & Center Historical Artwork (Antique Globe, Leather Books, Classical Ruins, Scroll, Astrolabe) */
            <img
              src="/assets/aistudio/history-hero.png"
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute left-0 top-0 h-full w-[82%] sm:w-[74%] object-cover object-left-top pointer-events-none select-none"
            />
          ) : (
            /* Left & Center Geographical Artwork (Antique Globe, Cartographic Maps, Compass, Mountains, Contours) */
            <img
              src="/assets/aistudio/geography-hero.jpg"
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute left-0 top-0 h-full w-[85%] sm:w-[78%] object-cover object-left-top pointer-events-none select-none"
            />
          )}

          {/* Smooth Gradient Blend on the Right & Bottom for Crisp Arabic Title Legibility */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isHistory
                ? 'linear-gradient(90deg, rgba(8,19,34,0) 0%, rgba(8,19,34,0.06) 52%, rgba(8,19,34,0.86) 73%, #081322 92%)'
                : 'linear-gradient(90deg, rgba(8,19,34,0) 0%, rgba(8,19,34,0.12) 48%, rgba(8,19,34,0.88) 70%, #081322 90%), linear-gradient(180deg, rgba(8,19,34,0) 78%, #081322 100%)',
            }}
          />

          {/* Top Navigation & Cohort Row inside Hero (Fixed LTR Geometry Matching Reference) */}
          <div
            dir="ltr"
            className="relative z-20 flex items-start justify-between px-3.5 sm:px-7 pt-3 sm:pt-5"
          >
            {/* Top-Left Back Button (<) */}
            <Link
              to="/student"
              data-testid="subject-back-btn"
              aria-label={lang === 'ar' ? 'العودة إلى الرئيسية' : 'Retour à l’accueil'}
              className="w-11 h-11 sm:w-[54px] sm:h-[54px] rounded-[16px] sm:rounded-[18px] bg-[#132032]/85 hover:bg-[#1B2C44] border border-[#C6A76E]/55 shadow-[0_8px_22px_rgba(0,0,0,0.5)] flex items-center justify-center text-[#EFE5D2] transition-all cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 sm:w-6 sm:h-6"
                aria-hidden="true"
              >
                <path
                  d="M14.5 6.5L9 12L14.5 17.5"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {/* Top-Right Dynamic Student Cohort Badge (e.g. 1BAC-SCI • G1) */}
            {compactCohortBadge && (
              <div
                data-testid="subject-cohort-badge"
                className="inline-flex items-center gap-2 sm:gap-2.5 pt-1.5 sm:pt-2 text-[#F3EBDD]"
              >
                <span className="font-mono-tabular text-xs sm:text-[17px] font-medium tracking-wider">
                  {compactCohortBadge}
                </span>
                <GraduationCapBadgeIcon className="w-4 h-4 sm:w-[22px] sm:h-[22px] text-[#D8B87C]" />
              </div>
            )}
          </div>

          {/* Right-Side Main Subject Heading ("التاريخ" / "الجغرافيا" + Icon & "الوحدات الدراسية") */}
          <div
            dir="rtl"
            className="relative z-20 flex flex-col items-start justify-center px-4 sm:px-8 mt-6 sm:mt-11 md:mt-14"
          >
            <div className="flex items-center gap-2.5 sm:gap-4">
              <SubjectUnitIcon className="w-9 h-9 sm:w-[52px] sm:h-[52px] text-[#D7B575] shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
              <h1
                data-testid="subject-hero-title"
                className="text-[34px] sm:text-[50px] md:text-[58px] font-display font-bold text-[#FAF6EE] leading-none tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]"
              >
                {isHistory
                  ? lang === 'ar'
                    ? 'التاريخ'
                    : 'Histoire'
                  : lang === 'ar'
                    ? 'الجغرافيا'
                    : 'Géographie'}
              </h1>
            </div>
            <p
              data-testid="subject-hero-subtitle"
              className="mt-2 sm:mt-3.5 text-sm sm:text-[22px] font-medium text-[#E4D2AE] tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            >
              {lang === 'ar' ? 'الوحدات الدراسية' : 'Unités d’enseignement'}
            </p>
          </div>

          {/* Subtle Ornamental Gold Wave Divider at the Bottom of the Hero */}
          <svg
            viewBox="0 0 1200 36"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute bottom-0 inset-x-0 w-full h-5 sm:h-7 pointer-events-none"
          >
            <path
              d="M0 30C320 30 640 28 880 16C1010 9 1115 8 1200 18"
              stroke="#C6A76E"
              strokeOpacity="0.42"
              strokeWidth="1.4"
            />
            <path
              d="M680 33C860 26 1030 14 1200 26"
              stroke="#DFC48F"
              strokeOpacity="0.28"
              strokeWidth="1"
            />
          </svg>
        </header>

        {/* 2. FOUR HORIZONTAL UNIT SELECTORS (الوحدة 01 .. الوحدة 04) */}
        <nav
          dir="rtl"
          aria-label={lang === 'ar' ? 'الوحدات الدراسية' : 'Unités d’enseignement'}
          className="px-3 sm:px-6 pt-1.5 sm:pt-2 pb-4 sm:pb-5 overflow-x-auto"
        >
          <div className="grid grid-cols-4 gap-2 sm:gap-4 min-w-[310px]">
            {HISTORY_STRUCTURAL_UNITS.map((unitItem) => {
              const isSelected = selectedUnitSlot === unitItem.slot;
              return (
                <button
                  key={unitItem.code}
                  type="button"
                  data-testid={`unit-selector-${unitItem.code}`}
                  onClick={() => setSelectedUnitSlot(unitItem.slot)}
                  aria-pressed={isSelected}
                  className={`relative h-[52px] sm:h-[72px] rounded-[16px] sm:rounded-[20px] px-2 sm:px-5 flex items-center justify-center gap-1.5 sm:gap-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#ECD5A2] via-[#D7B474] to-[#C69E58] text-[#0B1728] border border-[#F8E9C6] shadow-[0_6px_24px_rgba(215,180,116,0.35)]'
                      : 'bg-[#0E1C30]/90 hover:bg-[#142640] text-[#F5EFE2] border border-[#B99B68]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  }`}
                >
                  <SubjectUnitIcon
                    className={`w-4 h-4 sm:w-7 sm:h-7 shrink-0 ${
                      isSelected ? 'text-[#0B1728]' : 'text-[#E2CFA9]'
                    }`}
                  />
                  <span
                    className={`text-xs sm:text-[21px] whitespace-nowrap tracking-tight ${
                      isSelected
                        ? 'font-bold text-[#0B1728]'
                        : 'font-semibold text-[#F5EFE2]'
                    }`}
                  >
                    {t(unitItem.label)}
                  </span>

                  {/* Glowing Gold Underline Bar for Active Unit */}
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-8 sm:w-12 h-[3px] rounded-full bg-[#F5DFB0] shadow-[0_0_10px_#EAD19B]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 3. LARGE WARM IVORY LESSON DISPLAY PANEL */}
        <section className="px-3 sm:px-6">
          <div className="relative rounded-[24px] sm:rounded-[30px] bg-[#F7F3EA] p-2 sm:p-3 shadow-[0_22px_55px_rgba(0,0,0,0.65)] overflow-hidden">
            {/* Inner Antique-Gold Framed Container */}
            <div className="relative rounded-[18px] sm:rounded-[23px] border border-[#C6A76E]/60 bg-gradient-to-b from-[#FAF7F0] via-[#F6F1E6] to-[#EFE7D6] min-h-[390px] sm:min-h-[470px] flex flex-col justify-between overflow-hidden">
              {isHistory ? (
                <>
                  {/* Faded Left Classical Ruins Watermark inside Ivory Panel */}
                  <img
                    src="/assets/aistudio/history-ruins.png"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute left-0 bottom-9 sm:bottom-11 w-[140px] sm:w-[235px] h-auto object-contain opacity-90 mix-blend-multiply"
                  />

                  {/* Faded Right Vintage Hourglass Watermark inside Ivory Panel */}
                  <img
                    src="/assets/aistudio/history-hourglass.png"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute right-0 bottom-10 sm:bottom-12 w-[96px] sm:w-[155px] h-auto object-contain opacity-85 mix-blend-multiply"
                  />
                </>
              ) : (
                <>
                  {/* Faded Left Topographic Contour & Mountain Terrain Watermark */}
                  <GeographyLeftTerrainWatermark />
                  {/* Faded Right Mariner Compass Rose Watermark */}
                  <GeographyRightCompassWatermark />
                </>
              )}

              {/* Top Panel Header: Subject Icon + "دروس الوحدة 01" + Thin Gold Divider */}
              <div
                dir="rtl"
                className="relative z-10 px-4 sm:px-7 pt-3.5 sm:pt-5 pb-2.5 sm:pb-3.5 border-b border-[#C6A76E]/55 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {isHistory ? (
                    <OpenBookHeaderIcon className="w-5 h-5 sm:w-7 sm:h-7 text-[#0E1D30] shrink-0" />
                  ) : (
                    <GeographyCompassHeaderIcon className="w-5 h-5 sm:w-7 sm:h-7 text-[#0E1D30] shrink-0" />
                  )}
                  <h2
                    data-testid="unit-panel-heading"
                    className="text-base sm:text-[23px] font-display font-bold text-[#0E1D30] tracking-tight"
                  >
                    {t(activeStructuralUnit.panelTitle)}
                  </h2>
                </div>
              </div>

              {/* Panel Content Body: Real Database Lessons OR Empty State */}
              <div
                dir="rtl"
                className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-10 py-6 pb-16 sm:pb-20"
              >
                {isAuthenticated && activeUnitLessons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
                    {activeUnitLessons.map((lesson) => {
                      const lessonTitle =
                        lang === 'ar'
                          ? lesson.titleAr
                          : lesson.titleFr || lesson.titleAr;
                      const lessonDesc =
                        lang === 'ar'
                          ? lesson.descriptionAr
                          : lesson.descriptionFr || lesson.descriptionAr;

                      return (
                        <article
                          key={lesson.id}
                          className="p-5 rounded-2xl bg-[#FAF8F3]/95 border border-[#C6A76E]/50 shadow-sm flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-[#9C7A44] font-semibold">
                              <FolderTree className="w-3.5 h-3.5" />
                              <span>{t(activeStructuralUnit.label)}</span>
                            </div>
                            <h3 className="text-base sm:text-lg font-display font-bold text-[#0E1D30]">
                              {lessonTitle}
                            </h3>
                            {lessonDesc && (
                              <p className="text-xs sm:text-sm text-[#252B33]/80 line-clamp-2">
                                {lessonDesc}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between">
                            <span className="text-xs font-mono-tabular text-[#4A525D]">
                              v{lesson.version}
                            </span>
                            <button
                              type="button"
                              onClick={() => setReadingLesson(lesson)}
                              className="px-4 py-2 rounded-xl bg-[#0E1D30] text-[#FAF6EE] text-xs font-semibold hover:bg-[#182D47] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#D7B575]" />
                              <span>
                                {lang === 'ar' ? 'مطالعة الدرس' : 'Lire la leçon'}
                              </span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  /* Subject-Specific Empty State */
                  <div
                    data-testid="subject-empty-state"
                    className="flex flex-col items-center justify-center text-center my-auto"
                  >
                    <img
                      src={
                        isHistory
                          ? '/assets/aistudio/history-book.png'
                          : '/assets/aistudio/geography-book.png'
                      }
                      alt=""
                      loading="eager"
                      decoding="async"
                      className={`h-auto mx-auto mb-2 sm:mb-3 select-none pointer-events-none ${
                        isHistory
                          ? 'w-[230px] sm:w-[330px] md:w-[355px] mix-blend-multiply'
                          : 'w-[215px] sm:w-[295px] md:w-[320px]'
                      }`}
                    />
                    <h3 className="text-lg sm:text-[26px] font-display font-bold text-[#0E1D30] leading-snug">
                      {lang === 'ar'
                        ? 'لا توجد دروس منشورة بعد'
                        : 'Aucune leçon publiée pour le moment'}
                    </h3>
                    <p className="mt-1 sm:mt-1.5 text-xs sm:text-[17px] font-medium text-[#4A525D]">
                      {lang === 'ar'
                        ? 'سيتم عرض الدروس هنا بمجرد إضافتها من طرف الأستاذ'
                        : 'Les leçons seront affichées ici dès leur ajout par le professeur'}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Sweeping Deep-Navy & Antique-Gold Wave Inside Ivory Panel */}
              <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute bottom-0 inset-x-0 h-[50px] sm:h-[68px] z-10 overflow-hidden rounded-b-[17px] sm:rounded-b-[22px]"
              >
                <svg
                  viewBox="0 0 1200 90"
                  fill="none"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                >
                  {/* Warm Antique Gold Upper Ribbon */}
                  <path
                    d="M0 10C180 34 350 76 580 86C790 95 960 40 1200 62V90H0V10Z"
                    fill="url(#subjectPanelGoldWave)"
                  />
                  {/* Deep Midnight Navy Lower Wave */}
                  <path
                    d="M0 32C195 54 375 84 610 88C820 92 985 52 1200 70V90H0V32Z"
                    fill="#0B1829"
                  />
                  {/* Fine Highlight Gold Thread */}
                  <path
                    d="M0 31C195 53 375 83 610 87C820 91 985 51 1200 69"
                    stroke="#DFC38D"
                    strokeWidth="1.6"
                    strokeOpacity="0.8"
                  />
                  <defs>
                    <linearGradient
                      id="subjectPanelGoldWave"
                      x1="0"
                      y1="10"
                      x2="1200"
                      y2="90"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#D7B679" />
                      <stop offset="50%" stopColor="#C49E5B" />
                      <stop offset="100%" stopColor="#DEC189" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </section>
      </div>

      {readingLesson && (
        <LessonReaderModal
          lesson={readingLesson}
          subject={matchedCmsSubject || null}
          unitChain={units.filter((u) => u.id === readingLesson.unitId)}
          attachedResources={cmsResources.filter(
            (r) =>
              (readingLesson.attachmentIds?.includes(r.id) ||
                r.lessonId === readingLesson.id) &&
              r.effectiveStatus === 'published' &&
              (role === 'admin' || canUserAccessContentItem(profile, r))
          )}
          onDownloadResource={(res) => void handleDownloadResource(res)}
          onClose={() => setReadingLesson(null)}
        />
      )}
    </div>
  );
}
