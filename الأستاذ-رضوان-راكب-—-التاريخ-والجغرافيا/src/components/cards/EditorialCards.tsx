import React, { useState } from 'react';
import { ArrowUpLeft, ArrowUpRight, BookOpen, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  AcademicAnnouncement,
  CurriculumLesson,
  EducationalResource,
  ExaminationPaper,
} from '../../types/academic';
import { ACADEMIC_STREAMS } from '../../utils/academicRules';
import { UI_TEXT } from '../../data/translations';

export function ResilientEditorialImage({
  src,
  alt,
  caption,
  aspectClass = 'aspect-[16/9]',
}: {
  src: string;
  alt: string;
  caption?: string;
  aspectClass?: string;
  captionTone?: 'dark' | 'light';
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <figure className="w-full">
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-[#F7F5EF] border border-[#E5E0D4] ${aspectClass}`}
      >
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-[1.01]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F7F5EF] text-[#101C2C]">
            <BookOpen className="w-8 h-8 text-[#B99A62] mb-3 stroke-[1.5]" />
            <p className="text-sm font-medium text-[#101C2C] max-w-md">{alt}</p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-xs text-[#252B33]/75 leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function LessonEditorialCard({
  lesson,
  onSelectSubject,
}: {
  lesson: CurriculumLesson;
  onSelectSubject?: (subject: 'history' | 'geography') => void;
}) {
  const { lang, t } = useLanguage();
  const stream = ACADEMIC_STREAMS[lesson.streamId];
  const subjectLabel =
    lesson.subject === 'history' ? t(UI_TEXT.historyLabel) : t(UI_TEXT.geographyLabel);
  const semesterLabel = lesson.semester === 1 ? t(UI_TEXT.semester1) : t(UI_TEXT.semester2);
  const groupsLabel = lesson.applicableGroups.join(' · ');

  return (
    <article className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-6 flex flex-col justify-between shadow-[0_1px_2px_rgba(16,28,44,0.03)] transition-all duration-150 hover:border-[#B99A62]">
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#252B33]/75 mb-2.5">
          <span className="font-mono-tabular font-semibold text-[#B99A62]">
            {lang === 'ar' ? `الوحدة ${lesson.unitNumber}` : `Unité ${lesson.unitNumber}`}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-[#101C2C] font-semibold">{subjectLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{t(stream.levelLabel)}</span>
          <span aria-hidden="true">·</span>
          <span>{semesterLabel}</span>
        </div>

        <h3 className="text-base sm:text-lg font-display font-bold text-[#101C2C] leading-snug mb-2 text-balance">
          {t(lesson.title)}
        </h3>

        <p className="text-sm text-[#252B33]/85 leading-relaxed mb-4">{t(lesson.axisSummary)}</p>
      </div>

      <div className="pt-4 border-t border-[#E5E0D4] flex flex-wrap items-center justify-between gap-3 text-xs text-[#252B33]/75">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-[#101C2C]">
            {lang === 'ar' ? 'المفاهيم:' : 'Notions :'}
          </span>
          {lesson.keyConcepts.map((concept, idx) => (
            <React.Fragment key={idx}>
              <span>{t(concept)}</span>
              {idx < lesson.keyConcepts.length - 1 && <span aria-hidden="true">/</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3 font-mono-tabular text-[#101C2C] font-medium shrink-0">
          <span>{groupsLabel}</span>
          {onSelectSubject && (
            <button
              type="button"
              onClick={() => onSelectSubject(lesson.subject)}
              className="text-[#B99A62] hover:text-[#101C2C] font-sans font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {lang === 'ar' ? 'عرض الدرس' : 'Consulter'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ResourceEditorialCard({
  resource,
  onInspect,
}: {
  resource: EducationalResource;
  onInspect?: (res: EducationalResource) => void;
}) {
  const { lang, t } = useLanguage();
  const stream = ACADEMIC_STREAMS[resource.streamId];
  const subjectLabel =
    resource.subject === 'history' ? t(UI_TEXT.historyLabel) : t(UI_TEXT.geographyLabel);

  return (
    <article className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-6 flex flex-col justify-between shadow-[0_1px_2px_rgba(16,28,44,0.03)] transition-all duration-150 hover:border-[#B99A62]">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#252B33]/75 mb-2">
          <span className="font-mono-tabular text-[#B99A62] font-semibold">
            {resource.referenceCode}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-[#101C2C] font-semibold">{t(resource.resourceType)}</span>
          <span aria-hidden="true">·</span>
          <span>{subjectLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{t(stream.fullTitle)}</span>
        </div>

        <h3 className="text-base sm:text-lg font-display font-bold text-[#101C2C] leading-snug mb-2 text-balance">
          {t(resource.title)}
        </h3>

        <p className="text-sm text-[#252B33]/85 leading-relaxed mb-4">
          {t(resource.description)}
        </p>
      </div>

      <div className="pt-4 border-t border-[#E5E0D4] flex items-center justify-between gap-4 text-xs text-[#252B33]/75">
        <div className="flex items-center gap-2 font-mono-tabular">
          <span className="text-[#101C2C] font-semibold">{resource.format}</span>
          <span aria-hidden="true">·</span>
          <span>
            {resource.pageCount} {lang === 'ar' ? 'صفحة' : 'pages'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t(resource.updatedDate)}</span>
        </div>

        {onInspect && (
          <button
            type="button"
            onClick={() => onInspect(resource)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#101C2C] hover:text-[#B99A62] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-[#B99A62]" />
            <span>{lang === 'ar' ? 'التفاصيل' : 'Détails'}</span>
          </button>
        )}
      </div>
    </article>
  );
}

export function ExaminationEditorialCard({
  exam,
  onSelectExam,
}: {
  exam: ExaminationPaper;
  onSelectExam?: (exam: ExaminationPaper) => void;
}) {
  const { lang, t } = useLanguage();
  const stream = ACADEMIC_STREAMS[exam.streamId];

  return (
    <article className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-6 shadow-[0_1px_2px_rgba(16,28,44,0.03)] transition-all duration-150 hover:border-[#B99A62]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D4]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#252B33]/75 mb-2">
            <span className="font-mono-tabular font-semibold text-[#B99A62]">{exam.examCode}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#101C2C] font-semibold">{t(exam.examCategory)}</span>
            <span aria-hidden="true">·</span>
            <span>{t(stream.fullTitle)}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              {exam.applicableGroups.join(' / ')}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-display font-bold text-[#101C2C] leading-snug text-balance">
            {t(exam.sessionTitle)} — {t(exam.title)}
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-tabular text-[#252B33]/75 shrink-0">
          <div>
            <span className="block font-sans">
              {lang === 'ar' ? 'المدة' : 'Durée'}
            </span>
            <span className="font-semibold text-[#101C2C]">{t(exam.duration)}</span>
          </div>
          <span aria-hidden="true" className="text-[#E5E0D4]">
            |
          </span>
          <div>
            <span className="block font-sans">
              {lang === 'ar' ? 'التنقيط' : 'Barème'}
            </span>
            <span className="font-semibold text-[#101C2C]">{exam.gradingScale}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#252B33]/80">
        <p>
          <strong className="text-[#101C2C] font-semibold">
            {lang === 'ar' ? 'التركيز المنهجي: ' : 'Axe méthodologique : '}
          </strong>
          {t(exam.methodologyFocus)}
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <span>{t(exam.scheduledWindow)}</span>
          {onSelectExam && (
            <button
              type="button"
              onClick={() => onSelectExam(exam)}
              className="text-[#101C2C] hover:text-[#B99A62] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {lang === 'ar' ? 'عرض التفاصيل' : 'Voir le détail'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function AnnouncementEditorialCard({
  announcement,
  onOpenDetail,
}: {
  announcement: AcademicAnnouncement;
  onOpenDetail: (announcementId: string) => void;
}) {
  const { lang, dir, t } = useLanguage();
  const streamText =
    announcement.streamId === 'all'
      ? t(UI_TEXT.allStreams)
      : t(ACADEMIC_STREAMS[announcement.streamId].fullTitle);

  return (
    <article className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-6 shadow-[0_1px_2px_rgba(16,28,44,0.03)] transition-all duration-150 hover:border-[#B99A62] flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#252B33]/75 mb-2.5">
          <span className="font-mono-tabular font-semibold text-[#B99A62]">
            {announcement.referenceNumber}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-[#101C2C] font-semibold">{t(announcement.category)}</span>
          <span aria-hidden="true">·</span>
          <span>{t(announcement.publishedAt)}</span>
          <span aria-hidden="true">·</span>
          <span>{streamText}</span>
        </div>

        <h3 className="text-base sm:text-lg font-display font-bold text-[#101C2C] leading-snug mb-2 text-balance">
          {t(announcement.title)}
        </h3>

        <p className="text-sm text-[#252B33]/85 leading-relaxed mb-4">{t(announcement.excerpt)}</p>
      </div>

      <div className="pt-4 border-t border-[#E5E0D4] flex items-center justify-between text-xs">
        <span className="text-[#252B33]/75 font-mono-tabular">
          {announcement.applicableGroups.join(' · ')}
        </span>

        <button
          type="button"
          onClick={() => onOpenDetail(announcement.id)}
          className="inline-flex items-center gap-1.5 font-semibold text-[#101C2C] hover:text-[#B99A62] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>{lang === 'ar' ? 'قراءة الإعلان' : 'Lire l’annonce'}</span>
          {dir === 'rtl' ? (
            <ArrowUpLeft className="w-3.5 h-3.5 text-[#B99A62]" />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5 text-[#B99A62]" />
          )}
        </button>
      </div>
    </article>
  );
}
