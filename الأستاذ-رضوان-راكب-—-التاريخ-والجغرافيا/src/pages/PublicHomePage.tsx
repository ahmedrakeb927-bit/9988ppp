import React, { useState } from 'react';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  Compass,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  AcademicGroupId,
  AcademicStreamId,
  AdminSidebarSectionId,
  PageId,
} from '../types/academic';
import { ACADEMIC_STREAMS, filterAnnouncements, filterLessons } from '../utils/academicRules';
import {
  ACADEMIC_ANNOUNCEMENTS,
  CURRICULUM_LESSONS,
} from '../data/curriculumData';
import { LessonEditorialCard } from '../components/cards/EditorialCards';
import { UI_TEXT } from '../data/translations';

interface PublicHomePageProps {
  onNavigate: (page: PageId, adminSection?: AdminSidebarSectionId) => void;
  onOpenAnnouncement: (id: string) => void;
}

export function PublicHomePage({ onNavigate, onOpenAnnouncement }: PublicHomePageProps) {
  const { lang, dir, t } = useLanguage();
  const { profile } = useAuth();
  const [selectedStream, setSelectedStream] = useState<AcademicStreamId | 'all'>('all');
  const [selectedGroup, setSelectedGroup] = useState<AcademicGroupId | 'all'>('all');

  const recentLessons = filterLessons(CURRICULUM_LESSONS, {
    streamId: selectedStream,
    groupId: selectedGroup,
  }).slice(0, 4);

  const compactAnnouncements = filterAnnouncements(ACADEMIC_ANNOUNCEMENTS, {
    streamId: selectedStream,
    groupId: selectedGroup,
    status: 'published',
  }).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* 1. Minimal Personalized Welcome & 2. Student Educational Identity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Personalized Welcome Card */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-7 sm:p-9 flex flex-col justify-between space-y-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#4F46E5]">
              <span>{t(UI_TEXT.brandName)}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'ar' ? 'التاريخ والجغرافيا' : 'Histoire & Géographie'}</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#111827] leading-tight text-balance">
              {profile?.fullName
                ? lang === 'ar'
                  ? `مرحباً بك، ${profile.fullName}`
                  : `Bienvenue, ${profile.fullName}`
                : lang === 'ar'
                  ? 'مرحباً بك في المنصة التعليمية للأستاذ رضوان راكب'
                  : 'Bienvenue sur la plateforme du Professeur Redouane Rakeb'}
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl">
              {lang === 'ar'
                ? 'فضاء رقمي حديث ومُنظم لمتابعة الدروس المنشورة، الموارد التربوية، والإعلانات الموجهة لفوجك الدراسي.'
                : 'Un espace numérique structuré pour suivre vos leçons publiées, vos ressources pédagogiques et les annonces de votre groupe.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('student-portal')}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              {lang === 'ar' ? 'الفضاء الشخصي للتلميذ' : 'Mon Espace Élève'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#FFFFFF] text-[#111827] border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              {lang === 'ar' ? 'تصفح الدروس' : 'Parcourir les leçons'}
            </button>
          </div>
        </div>

        {/* Student Educational Identity Card */}
        <div className="lg:col-span-5 bg-[#EEF2FF]/60 border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4F46E5]">
                {lang === 'ar' ? 'الهوية التعليمية' : 'Identité Scolaire'}
              </span>
              <GraduationCap className="w-4 h-4 text-[#4F46E5]" />
            </div>
            <h2 className="text-lg font-display font-bold text-[#111827]">
              {lang === 'ar'
                ? 'تخصيص العرض حسب المستوى والفوج'
                : 'Filtrer par niveau et groupe'}
            </h2>
          </div>

          {/* Stream selector */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  { id: 'all', label: UI_TEXT.allStreams },
                  { id: '1bac-sci', label: ACADEMIC_STREAMS['1bac-sci'].fullTitle },
                  { id: '2bac-arts', label: ACADEMIC_STREAMS['2bac-arts'].fullTitle },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStream(tab.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg text-start border transition-all cursor-pointer ${
                    selectedStream === tab.id
                      ? 'bg-[#FFFFFF] text-[#4F46E5] border-[#4F46E5] font-semibold shadow-xs'
                      : 'bg-[#FFFFFF]/70 text-[#64748B] border-[#E2E8F0] hover:text-[#111827]'
                  }`}
                >
                  {t(tab.label)}
                </button>
              ))}
            </div>

            {/* Group selector */}
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-1">
              {(['all', 'G1', 'G2', 'G3', 'G4'] as const).map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`flex-1 py-1.5 text-xs font-mono-tabular font-medium rounded-md transition-all cursor-pointer ${
                    selectedGroup === grp
                      ? 'bg-[#4F46E5] text-white font-semibold'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  {grp === 'all' ? (lang === 'ar' ? 'الكل' : 'Tous') : grp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Navigation to Main Sections */}
      <section className="space-y-4">
        <h2 className="text-lg font-display font-bold text-[#111827]">
          {lang === 'ar' ? 'الولوج السريع إلى الأقسام الرئيسية' : 'Accès rapide aux sections'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              page: 'history' as PageId,
              icon: <BookOpen className="w-5 h-5 text-[#4F46E5]" />,
              title: UI_TEXT.historyLabel,
              desc: {
                ar: 'الوحدات الدراسية، المفاهيم، وتحليل الوثائق التاريخية.',
                fr: 'Unités du programme, notions clés et dossiers documentaires.',
              },
            },
            {
              page: 'geography' as PageId,
              icon: <Compass className="w-5 h-5 text-[#4F46E5]" />,
              title: UI_TEXT.geographyLabel,
              desc: {
                ar: 'النهج الجغرافي، الخرائط الموضوعاتية، والمبيانات.',
                fr: 'Démarche géographique, cartes thématiques et statistiques.',
              },
            },
            {
              page: 'resources' as PageId,
              icon: <FileText className="w-5 h-5 text-[#4F46E5]" />,
              title: { ar: 'الموارد التربوية', fr: 'Ressources Pédagogiques' },
              desc: {
                ar: 'ملفات PDF، ملخصات مركزة، ودلائل منهجية.',
                fr: 'Supports PDF, synthèses et guides méthodologiques.',
              },
            },
            {
              page: 'examinations' as PageId,
              icon: <GraduationCap className="w-5 h-5 text-[#4F46E5]" />,
              title: { ar: 'الفروض والامتحانات', fr: 'Contrôles & Examens' },
              desc: {
                ar: 'نماذج الفروض المحروسة والامتحانات الجهوية والوطنية.',
                fr: 'Sujets d’évaluation et préparation aux examens.',
              },
            },
          ].map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 text-start flex flex-col justify-between space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-[#6366F1] hover:shadow-[0_4px_12px_-2px_rgba(79,70,229,0.08)] transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-display font-semibold text-[#111827]">
                  {t(item.title)}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{t(item.desc)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Recently Published Lessons */}
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-[#111827]">
              {lang === 'ar' ? 'أحدث الدروس المنشورة' : 'Leçons récemment publiées'}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {lang === 'ar'
                ? 'مرتبة حسب المستوى والفوج المختار'
                : 'Filtrées selon le niveau et le groupe sélectionnés'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] cursor-pointer whitespace-nowrap shrink-0"
          >
            {lang === 'ar' ? 'عرض جميع الدروس' : 'Voir toutes les leçons'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {recentLessons.map((lesson) => (
            <LessonEditorialCard
              key={lesson.id}
              lesson={lesson}
              onSelectSubject={(subj) => onNavigate(subj)}
            />
          ))}
        </div>
      </section>

      {/* 5. Compact Announcements Section */}
      <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-[#111827]">
                {lang === 'ar' ? 'آخر الإعلانات والمستجدات' : 'Annonces récentes'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('announcements')}
            className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] cursor-pointer whitespace-nowrap shrink-0"
          >
            {lang === 'ar' ? 'كل الإعلانات' : 'Toutes les annonces'}
          </button>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {compactAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-mono-tabular font-semibold text-[#4F46E5]">
                    {ann.referenceNumber}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{t(ann.category)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t(ann.publishedAt)}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#111827]">{t(ann.title)}</h3>
              </div>

              <button
                type="button"
                onClick={() => onOpenAnnouncement(ann.id)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] cursor-pointer shrink-0"
              >
                <span>{lang === 'ar' ? 'التفاصيل' : 'Détails'}</span>
                {dir === 'rtl' ? (
                  <ArrowUpLeft className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
