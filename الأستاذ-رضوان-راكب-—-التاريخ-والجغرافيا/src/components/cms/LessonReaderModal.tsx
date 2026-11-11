import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Info,
  Quote,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';
import {
  CmsLesson,
  CmsResource,
  CmsSubject,
  CmsUnit,
  formatEffectiveAudienceSummary,
} from '../../utils/cmsContentRules';
import { AcademicPdfViewer } from './AcademicPdfViewer';

interface LessonReaderModalProps {
  lesson: CmsLesson;
  subject?: CmsSubject | null;
  unitChain?: CmsUnit[];
  attachedResources: CmsResource[];
  onClose: () => void;
  onDownloadResource?: (res: CmsResource) => void;
  isPreviewMode?: boolean;
}

export function LessonReaderModal({
  lesson,
  subject,
  unitChain = [],
  attachedResources,
  onClose,
  onDownloadResource,
  isPreviewMode = false,
}: LessonReaderModalProps) {
  const { lang } = useLanguage();
  const { resolveProtectedPdfBlob } = useContent();

  const primaryPdfResource = attachedResources.find(
    (r) =>
      r.fileType === 'PDF' ||
      r.mimeType === 'application/pdf' ||
      r.fileName.toLowerCase().endsWith('.pdf')
  );

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    if (!primaryPdfResource) {
      setPdfBlob(null);
      return;
    }
    setPdfLoading(true);
    void resolveProtectedPdfBlob(primaryPdfResource)
      .then((blob) => {
        if (!cancelled) {
          setPdfBlob(blob);
          setPdfLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPdfLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [primaryPdfResource, resolveProtectedPdfBlob]);

  const title = lang === 'ar' ? lesson.titleAr : lesson.titleFr || lesson.titleAr;
  const description =
    lang === 'ar' ? lesson.descriptionAr : lesson.descriptionFr || lesson.descriptionAr;
  const mainContent = lang === 'ar' ? lesson.contentAr : lesson.contentFr || lesson.contentAr;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-[#101C2C]/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Modal Header + Breadcrumb Navigation */}
        <div className="bg-[#101C2C] text-[#F7F5EF] p-5 sm:p-6 border-b border-[#B99A62]/30 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <nav
              aria-label={lang === 'ar' ? 'مسار الدرس' : 'Fil d’Ariane'}
              className="flex flex-wrap items-center gap-1.5 text-xs text-[#B99A62] font-medium"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>
                {subject
                  ? lang === 'ar'
                    ? subject.titleAr
                    : subject.titleFr
                  : lang === 'ar'
                    ? 'المادة الدراسية'
                    : 'Matière'}
              </span>
              {unitChain.map((u) => (
                <React.Fragment key={u.id}>
                  <ChevronRight className="w-3 h-3 text-[#F7F5EF]/60 rtl:rotate-180" />
                  <span>{lang === 'ar' ? u.titleAr : u.titleFr}</span>
                </React.Fragment>
              ))}
              <ChevronRight className="w-3 h-3 text-[#F7F5EF]/60 rtl:rotate-180" />
              <span className="text-[#F7F5EF] font-semibold">{title}</span>
            </nav>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F7F5EF]">
              {title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#F7F5EF]/75 font-mono-tabular">
              <span>
                {isPreviewMode
                  ? lang === 'ar'
                    ? 'معاينة الدرس'
                    : 'Aperçu de la leçon'
                  : lang === 'ar'
                    ? 'درس منشور'
                    : 'Leçon publiée'}
              </span>
              <span>·</span>
              <span>v{lesson.version}</span>
              <span>·</span>
              <span>{formatEffectiveAudienceSummary(lesson.effectiveGroupKeys, lang)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'ar' ? 'إغلاق نافذة الدرس' : 'Fermer la fenêtre de la leçon'}
            className="p-2 rounded-lg bg-[#252B33] text-[#F7F5EF] hover:text-[#B99A62] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Lesson Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-[#F7F5EF] text-[#252B33]">
          {description && (
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#B99A62]/40 text-sm text-[#101C2C] font-medium leading-relaxed">
              {description}
            </div>
          )}

          {mainContent && (
            <div className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-6 space-y-4 text-sm sm:text-base leading-relaxed whitespace-pre-line text-[#252B33]">
              {mainContent}
            </div>
          )}

          {/* Structured Rich Blocks */}
          {lesson.blocks && lesson.blocks.length > 0 && (
            <div className="space-y-4">
              {lesson.blocks.map((block) => {
                if (block.type === 'heading') {
                  return (
                    <h3
                      key={block.id}
                      className="text-lg font-display font-bold text-[#101C2C] pt-2 border-b border-[#E5E0D4] pb-2"
                    >
                      {block.text}
                    </h3>
                  );
                }

                if (block.type === 'subheading') {
                  return (
                    <h4
                      key={block.id}
                      className="text-base font-display font-semibold text-[#B99A62]"
                    >
                      {block.text}
                    </h4>
                  );
                }

                if (block.type === 'paragraph') {
                  return (
                    <p
                      key={block.id}
                      className="text-sm sm:text-base text-[#252B33] leading-relaxed bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E0D4]"
                    >
                      {block.text}
                    </p>
                  );
                }

                if (block.type === 'numbered_list') {
                  const items =
                    block.items && block.items.length > 0
                      ? block.items
                      : block.text.split('\n').filter(Boolean);
                  return (
                    <ol
                      key={block.id}
                      className="list-decimal list-inside bg-[#FFFFFF] p-5 rounded-xl border border-[#E5E0D4] space-y-1.5 text-sm"
                    >
                      {items.map((it, idx) => (
                        <li key={idx} className="text-[#252B33]">
                          {it}
                        </li>
                      ))}
                    </ol>
                  );
                }

                if (block.type === 'bullet_list') {
                  const items =
                    block.items && block.items.length > 0
                      ? block.items
                      : block.text.split('\n').filter(Boolean);
                  return (
                    <ul
                      key={block.id}
                      className="list-disc list-inside bg-[#FFFFFF] p-5 rounded-xl border border-[#E5E0D4] space-y-1.5 text-sm"
                    >
                      {items.map((it, idx) => (
                        <li key={idx} className="text-[#252B33]">
                          {it}
                        </li>
                      ))}
                    </ul>
                  );
                }

                if (block.type === 'table') {
                  const rows = block.text
                    .split('\n')
                    .filter(Boolean)
                    .map((line) => line.split('|').map((c) => c.trim()));
                  return (
                    <div
                      key={block.id}
                      className="overflow-x-auto bg-[#FFFFFF] rounded-xl border border-[#E5E0D4]"
                    >
                      {block.caption && (
                        <div className="px-4 py-2.5 bg-[#101C2C] text-[#B99A62] text-xs font-semibold">
                          {block.caption}
                        </div>
                      )}
                      <table className="w-full text-xs border-collapse">
                        <tbody className="divide-y divide-[#E5E0D4]">
                          {rows.map((r, rIdx) => (
                            <tr
                              key={rIdx}
                              className={rIdx === 0 ? 'bg-[#F7F5EF] font-semibold text-[#101C2C]' : ''}
                            >
                              {r.map((cell, cIdx) => (
                                <td key={cIdx} className="py-2.5 px-3 border-e border-[#E5E0D4]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (block.type === 'image') {
                  return (
                    <figure
                      key={block.id}
                      className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-4 space-y-2"
                    >
                      {block.url && (
                        <img
                          src={block.url}
                          alt={block.caption || block.text}
                          className="max-h-80 w-auto mx-auto object-contain rounded-lg"
                        />
                      )}
                      <figcaption className="text-xs text-[#252B33]/75 text-center">
                        {block.caption || block.text}
                      </figcaption>
                    </figure>
                  );
                }

                if (block.type === 'important_note') {
                  return (
                    <div
                      key={block.id}
                      className="p-4 rounded-xl bg-[#FFFFFF] border border-[#B99A62] flex items-start gap-3 text-xs sm:text-sm text-[#101C2C]"
                    >
                      <Info className="w-4 h-4 text-[#B99A62] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#B99A62] mb-1">
                          {lang === 'ar' ? 'ملاحظة منهجية:' : 'Note méthodologique :'}
                        </p>
                        <p>{block.text}</p>
                      </div>
                    </div>
                  );
                }

                if (block.type === 'quote') {
                  return (
                    <blockquote
                      key={block.id}
                      className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E0D4] text-sm italic text-[#101C2C] space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-[#B99A62] not-italic text-xs font-semibold">
                        <Quote className="w-3.5 h-3.5" />
                        <span>
                          {block.caption ||
                            (lang === 'ar' ? 'شاهد / وثيقة مرجعية' : 'Citation / Extrait')}
                        </span>
                      </div>
                      <p>{block.text}</p>
                    </blockquote>
                  );
                }

                if (block.type === 'external_link') {
                  return (
                    <div
                      key={block.id}
                      className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E0D4] flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-[#B99A62]" />
                        <span className="font-semibold text-[#101C2C]">{block.text}</span>
                      </div>
                      {block.url && (
                        <a
                          href={block.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#101C2C] font-mono-tabular underline hover:text-[#B99A62]"
                        >
                          {block.url}
                        </a>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}

          {/* Inline Multi-Page PDF Viewer when Lesson has an attached PDF */}
          {primaryPdfResource && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-[#101C2C] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B99A62]" />
                  <span>
                    {lang === 'ar'
                      ? 'عرض وثيقة الدرس مباشرة (PDF):'
                      : 'Aperçu direct du document PDF de la leçon :'}
                  </span>
                </h4>
                {onDownloadResource && (
                  <button
                    type="button"
                    onClick={() => onDownloadResource(primaryPdfResource)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#101C2C] text-[#F7F5EF] hover:bg-[#1B2D45] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#B99A62]" />
                    <span>{lang === 'ar' ? 'تحميل PDF' : 'Télécharger PDF'}</span>
                  </button>
                )}
              </div>

              <AcademicPdfViewer
                pdfBlob={pdfBlob}
                loading={pdfLoading}
                titleAr={title}
                subtitleAr={primaryPdfResource.fileName}
                compact={true}
                onDownload={
                  onDownloadResource
                    ? () => onDownloadResource(primaryPdfResource)
                    : undefined
                }
              />
            </div>
          )}

          {/* Attached Educational Files */}
          {attachedResources.length > 0 && (
            <div className="pt-4 border-t border-[#E5E0D4] space-y-3">
              <h4 className="text-sm font-semibold text-[#101C2C] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B99A62]" />
                <span>
                  {lang === 'ar'
                    ? `الملفات المرفقة بالدرس (${attachedResources.length}):`
                    : `Fichiers joints (${attachedResources.length}) :`}
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachedResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E0D4] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono-tabular text-[11px] text-[#B99A62] font-semibold block">
                        {res.fileType} · {Math.max(1, Math.round(res.fileSize / 1024))} KB
                      </span>
                      <p className="font-semibold text-[#101C2C]">
                        {lang === 'ar' ? res.titleAr : res.titleFr || res.titleAr}
                      </p>
                      <p className="text-[11px] text-[#252B33]/75 truncate">{res.fileName}</p>
                    </div>
                    {onDownloadResource && (
                      <button
                        type="button"
                        onClick={() => onDownloadResource(res)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101C2C] text-[#F7F5EF] hover:bg-[#1B2D45] font-medium transition-colors cursor-pointer shrink-0"
                      >
                        <Download className="w-3.5 h-3.5 text-[#B99A62]" />
                        <span>{lang === 'ar' ? 'تحميل' : 'Télécharger'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
