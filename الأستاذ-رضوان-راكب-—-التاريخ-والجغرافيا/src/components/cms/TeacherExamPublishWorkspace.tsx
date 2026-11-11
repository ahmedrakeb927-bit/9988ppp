import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import {
  AVAILABLE_EXAM_YEARS,
  decodeExamMetadataFromExam,
  ExamSemesterCode,
  ExamSubjectSlug,
  ExamTargetLevelOption,
  formatExamLevelFullAr,
  formatExamSessionLabelAr,
  formatExamSessionSubtitleAr,
  formatExamTypeFullAr,
  formatFileSizeLabel,
  OfficialExamSession,
  OfficialExamType,
  validateStrictPdfExamUpload,
} from '../../utils/examModuleRules';

const ALL_GROUPS: ('G1' | 'G2' | 'G3' | 'G4')[] = ['G1', 'G2', 'G3', 'G4'];

const GROUP_LABELS_AR: Record<'G1' | 'G2' | 'G3' | 'G4', string> = {
  G1: 'الفوج الأول (G1)',
  G2: 'الفوج الثاني (G2)',
  G3: 'الفوج الثالث (G3)',
  G4: 'الفوج الرابع (G4)',
};

export interface TeacherExamPublishWorkspaceProps {
  mode?: 'add' | 'edit' | 'published';
  editExamId?: string;
}

export function TeacherExamPublishWorkspace({
  mode = 'add',
  editExamId,
}: TeacherExamPublishWorkspaceProps) {
  const navigate = useNavigate();
  const {
    examinations,
    resources,
    cmsNotice,
    cmsError,
    clearCmsMessages,
    publishTeacherExaminationWithPdf,
    deleteExamination,
  } = useContent();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingExamId, setEditingExamId] = useState<string | null>(
    mode === 'edit' && editExamId ? editExamId : null
  );
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [existingPdfName, setExistingPdfName] = useState<string>('');
  const [existingPdfSize, setExistingPdfSize] = useState<number>(0);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Core metadata matching the reference design & full academic requirements
  const [subjectSlug, setSubjectSlug] = useState<ExamSubjectSlug>('history');
  const [examType, setExamType] = useState<OfficialExamType>('regional');
  const [examYear, setExamYear] = useState<number>(2025);
  const [examSession, setExamSession] = useState<OfficialExamSession>('normal');
  const [semester, setSemester] = useState<ExamSemesterCode>('annual');
  const [targetLevel, setTargetLevel] = useState<ExamTargetLevelOption>('1bac');
  const [allGroupsSelected, setAllGroupsSelected] = useState<boolean>(true);
  const [selectedGroups, setSelectedGroups] = useState<('G1' | 'G2' | 'G3' | 'G4')[]>([
    'G1',
    'G2',
    'G3',
    'G4',
  ]);
  const [customTitleAr, setCustomTitleAr] = useState<string>('');
  const [showGroupPickerModal, setShowGroupPickerModal] = useState<boolean>(false);
  const [archiveFilterSubject, setArchiveFilterSubject] = useState<
    'all' | ExamSubjectSlug
  >('all');

  // Pre-populate form when mode === 'edit' and editExamId is provided
  useEffect(() => {
    if (mode !== 'edit' || !editExamId) return;
    const foundExam = examinations.find((e) => e.id === editExamId);
    if (!foundExam) return;

    const meta = decodeExamMetadataFromExam(foundExam);
    const linkedRes = resources.find(
      (r) => r.id === meta.pdfResourceId || foundExam.attachmentIds?.includes(r.id)
    );

    setEditingExamId(foundExam.id);
    setSelectedPdfFile(null);
    setExistingPdfName(
      linkedRes?.fileName || meta.pdfFileName || 'Examination.pdf'
    );
    setExistingPdfSize(linkedRes?.fileSize || meta.pdfFileSize || 0);
    setSubjectSlug(meta.subjectSlug);
    setExamType(meta.examType);
    setExamYear(meta.examYear);
    setExamSession(meta.examSession);
    setSemester(meta.semester);
    setTargetLevel(meta.targetLevel);
    setAllGroupsSelected(meta.allGroupsSelected);
    setSelectedGroups(meta.targetGroups);
    setCustomTitleAr(foundExam.titleAr);
  }, [mode, editExamId, examinations, resources]);

  const handleFileCandidate = (file: File | null | undefined) => {
    clearCmsMessages();
    setLocalError(null);
    if (!file) return;

    const validation = validateStrictPdfExamUpload({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!validation.valid) {
      setLocalError(
        validation.error?.ar || 'يرجى اختيار ملف صالح بصيغة PDF فقط.'
      );
      return;
    }

    setSelectedPdfFile(file);
  };

  const resetForm = () => {
    if (mode === 'edit') {
      navigate('/admin/exams/published');
      return;
    }
    setEditingExamId(null);
    setSelectedPdfFile(null);
    setExistingPdfName('');
    setExistingPdfSize(0);
    setSubjectSlug('history');
    setExamType('regional');
    setExamYear(2025);
    setExamSession('normal');
    setSemester('annual');
    setTargetLevel('1bac');
    setAllGroupsSelected(true);
    setSelectedGroups(['G1', 'G2', 'G3', 'G4']);
    setCustomTitleAr('');
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleGroupSelection = (grp: 'G1' | 'G2' | 'G3' | 'G4') => {
    setAllGroupsSelected(false);
    setSelectedGroups((prev) => {
      if (prev.includes(grp)) {
        const next = prev.filter((g) => g !== grp);
        return next.length === 0 ? [grp] : next;
      }
      const next = [...prev, grp];
      if (next.length === 4) {
        setAllGroupsSelected(true);
      }
      return next;
    });
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearCmsMessages();
    setLocalError(null);

    if (!selectedPdfFile && !editingExamId) {
      setLocalError('يرجى رفع ملف الامتحان بصيغة PDF أولاً قبل النشر.');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedId = await publishTeacherExaminationWithPdf({
        id: editingExamId || undefined,
        file: selectedPdfFile,
        subjectSlug,
        examType,
        examYear,
        examSession,
        semester,
        targetLevel,
        allGroupsSelected,
        targetGroups: allGroupsSelected ? ['G1', 'G2', 'G3', 'G4'] : selectedGroups,
        customTitleAr: customTitleAr.trim() || undefined,
      });

      if (savedId) {
        if (mode === 'edit') {
          navigate('/admin/exams/published');
        } else {
          resetForm();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeFileName = selectedPdfFile?.name || existingPdfName;
  const activeFileSize = selectedPdfFile?.size || existingPdfSize;

  const groupSummaryLabel =
    allGroupsSelected || selectedGroups.length === 4
      ? 'جميع الأفواج'
      : selectedGroups.join(' · ');

  const enrichedExams = examinations.map((exam) => ({
    exam,
    meta: decodeExamMetadataFromExam(exam),
  }));

  const filteredManagedExams = enrichedExams.filter((item) => {
    if (archiveFilterSubject === 'all') return true;
    return item.meta.subjectSlug === archiveFilterSubject;
  });

  // =========================================================================
  // VIEW 1: DEDICATED PUBLISHED EXAMINATIONS PAGE (/admin/exams/published)
  // Strictly separated from the upload form
  // =========================================================================
  if (mode === 'published') {
    return (
      <div dir="rtl" className="space-y-6">
        {cmsNotice && (
          <div
            role="status"
            data-testid="teacher-exam-success-banner"
            className="rounded-2xl bg-[#101C2B] border border-[#C6A064] px-5 py-3.5 text-sm text-[#F5EFE2] flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#E5C18A] shrink-0" />
              <span>{cmsNotice.ar}</span>
            </div>
            <button
              type="button"
              onClick={clearCmsMessages}
              aria-label="إغلاق الإشعار"
              className="text-[#E5C18A] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <section className="bg-[#FAF6EE] border border-[#D9C8A9] rounded-2xl p-5 sm:p-7 space-y-5 shadow-[0_12px_32px_rgba(16,28,43,0.08)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2D5BE]">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-[#101C2B] flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#C6A064]" />
                <span>الامتحانات المنشورة ({filteredManagedExams.length})</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5346] mt-1">
                عرض وإدارة جميع الامتحانات الرسمية المنشورة للتلاميذ حسب المادة والمستوى والفوج.
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
                    data-testid={`published-exams-filter-${tab.id}`}
                    onClick={() => setArchiveFilterSubject(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      archiveFilterSubject === tab.id
                        ? 'bg-[#101C2B] text-[#E5C18A] shadow-xs'
                        : 'text-[#1E293B] hover:text-[#101C2B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Link
                to="/admin/exams/new"
                data-testid="goto-add-exam-from-published-btn"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101C2B] hover:bg-[#18283D] text-[#E5C18A] border border-[#C6A064]/50 text-xs sm:text-sm font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة امتحان جديد</span>
              </Link>
            </div>
          </div>

          {filteredManagedExams.length === 0 ? (
            <div
              data-testid="published-exams-empty-state"
              className="py-14 px-6 rounded-2xl bg-[#F5EFE2] border border-[#DFD1B8] text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-[#101C2B]/10 border border-[#C6A064]/40 flex items-center justify-center mx-auto text-[#9E7C44]">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-base font-display font-bold text-[#101C2B]">
                لا توجد امتحانات منشورة حالياً
              </p>
              <p className="text-xs sm:text-sm text-[#5C5346] max-w-md mx-auto">
                لم يتم نشر أي امتحان في هذا القسم بعد. يمكنك رفع ملف امتحان PDF جديد وتحديد الفوج المستهدف من صفحة إضافة امتحان.
              </p>
              <div className="pt-2">
                <Link
                  to="/admin/exams/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C6A064] via-[#E5C18A] to-[#C6A064] text-[#0B1624] font-bold text-xs sm:text-sm shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة امتحان الآن</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredManagedExams.map(({ exam, meta }) => {
                const linkedRes = resources.find(
                  (r) =>
                    r.id === meta.pdfResourceId || exam.attachmentIds?.includes(r.id)
                );
                const viewerPath = `/student/exams/${meta.subjectSlug}/${exam.id}`;
                const pdfName =
                  linkedRes?.fileName || meta.pdfFileName || 'Examination.pdf';
                const pdfSize = linkedRes?.fileSize || meta.pdfFileSize || 0;

                return (
                  <article
                    key={exam.id}
                    data-testid={`managed-exam-card-${exam.id}`}
                    className="rounded-2xl bg-[#F5EFE2] border border-[#D4C2A2] p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-[0_6px_18px_rgba(16,28,43,0.06)] hover:border-[#C6A064] transition-all"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Classic Academic PDF Badge */}
                      <div className="w-14 h-16 rounded-xl bg-[#EAE0CC] border border-[#C6A064]/50 flex flex-col items-center justify-center shrink-0 shadow-inner">
                        <span className="px-2 py-0.5 rounded bg-[#B91C1C] text-white text-[10px] font-extrabold tracking-wider">
                          PDF
                        </span>
                        <span className="text-[11px] font-mono-tabular font-bold text-[#101C2B] mt-1">
                          {meta.examYear}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#101C2B] text-[#E5C18A] text-[11px] font-bold">
                            {meta.subjectSlug === 'geography' ? 'الجغرافيا' : 'التاريخ'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-[#C6A064]/25 border border-[#C6A064]/45 text-[#101C2B] text-[11px] font-bold">
                            {formatExamTypeFullAr(meta.examType)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#EAE0CC] text-[#5C5346] text-[11px] font-semibold">
                            {formatExamSessionLabelAr(meta.examSession)} · {meta.examYear}
                          </span>
                        </div>

                        <h3 className="text-base font-display font-bold text-[#101C2B] leading-snug">
                          {exam.titleAr} —{' '}
                          {formatExamSessionSubtitleAr(meta.examSession, meta.examYear)}
                        </h3>

                        <div className="space-y-1 pt-0.5 text-xs text-[#4A4338]">
                          <p className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-[#9E7C44] shrink-0" />
                            <span className="font-semibold">المستوى والشعبة:</span>
                            <span>{formatExamLevelFullAr(meta.targetLevel)}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#9E7C44] shrink-0" />
                            <span className="font-semibold">الأفواج المستهدفة:</span>
                            <span>
                              {meta.allGroupsSelected || meta.targetGroups.length === 4
                                ? 'جميع الأفواج الأربعة (G1 - G4)'
                                : meta.targetGroups.join(' ، ')}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-[#5C5346]">
                            <FileText className="w-3.5 h-3.5 text-[#9E7C44] shrink-0" />
                            <span className="truncate max-w-[220px] sm:max-w-xs">
                              {pdfName}
                            </span>
                            {pdfSize > 0 && (
                              <span className="font-mono-tabular">
                                ({formatFileSizeLabel(pdfSize)})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E2D5BE] flex items-center justify-end gap-2">
                      <Link
                        to={viewerPath}
                        data-testid={`preview-published-exam-${exam.id}`}
                        title="معاينة الامتحان في قارئ PDF"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101C2B] text-[#E5C18A] hover:bg-[#192B42] text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة PDF</span>
                      </Link>

                      <Link
                        to={`/admin/exams/edit/${exam.id}`}
                        data-testid={`edit-published-exam-${exam.id}`}
                        title="تعديل بيانات الامتحان"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#C6A064]/60 text-[#101C2B] hover:bg-[#EFE6D5] text-xs font-bold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#9E7C44]" />
                        <span>تعديل</span>
                      </Link>

                      <button
                        type="button"
                        data-testid={`delete-published-exam-${exam.id}`}
                        title="حذف الامتحان"
                        onClick={() => void deleteExamination(exam.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6EE] border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
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
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED ADD / EDIT EXAMINATION PAGE (/admin/exams/new & /admin/exams/edit/:examId)
  // Strictly separated from the published examinations archive list
  // =========================================================================
  return (
    <div dir="rtl" className="w-full max-w-2xl mx-auto">
      <div className="py-1 sm:py-3 text-[#F7F3EA] relative">
        {/* Top Ornamental Header Instruction */}
        <div className="relative z-10 flex items-center justify-center gap-2.5 mb-6 text-center">
          <span className="h-[1px] w-7 sm:w-14 bg-gradient-to-l from-[#C8A46B] to-transparent inline-block" />
          <span className="text-[#C8A46B] text-xs">✦</span>
          <h2 className="text-xs sm:text-base font-bold text-[#E6CFA6] tracking-wide">
            {editingExamId
              ? 'تعديل بيانات الامتحان أو استبدال ملف PDF'
              : 'قم برفع ملف الامتحان وتحديد المعلومات المطلوبة'}
          </h2>
          <span className="text-[#C8A46B] text-xs">✦</span>
          <span className="h-[1px] w-7 sm:w-14 bg-gradient-to-r from-[#C8A46B] to-transparent inline-block" />
        </div>

        {/* Feedback Banners */}
        {(localError || cmsError) && (
          <div
            role="alert"
            data-testid="teacher-exam-error-banner"
            className="relative z-10 mb-5 rounded-xl bg-red-950/80 border border-red-400/50 px-4 py-3 text-xs sm:text-sm text-red-100 flex items-center justify-between gap-3"
          >
            <span>{localError || cmsError?.ar}</span>
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                clearCmsMessages();
              }}
              aria-label="إغلاق التنبيه"
              className="text-red-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {cmsNotice && (
          <div
            role="status"
            data-testid="teacher-exam-success-banner"
            className="relative z-10 mb-5 rounded-xl bg-emerald-950/80 border border-[#C8A46B]/60 px-4 py-3.5 text-xs sm:text-sm text-[#F7F3EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D6B47C] shrink-0" />
              <span>{cmsNotice.ar}</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Link
                to="/admin/exams/published"
                data-testid="view-published-exams-after-upload-link"
                className="px-3 py-1 rounded-lg bg-[#C8A46B] text-[#091322] font-bold text-xs hover:brightness-105 transition-all"
              >
                عرض الامتحانات المنشورة
              </Link>
              <button
                type="button"
                onClick={clearCmsMessages}
                aria-label="إغلاق الإشعار"
                className="text-[#D6B47C] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handlePublishSubmit} className="relative z-10 space-y-4">
          {/* =================================================================
              A. PDF DRAG-AND-DROP UPLOAD BOX
             ================================================================= */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              const droppedFile = e.dataTransfer.files?.[0];
              handleFileCandidate(droppedFile);
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="اسحب الملف هنا أو اختر ملف بصيغة PDF"
            data-testid="exam-pdf-dropzone"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`w-full rounded-2xl border-2 border-dashed transition-all px-5 py-7 text-center cursor-pointer select-none ${
              isDraggingOver
                ? 'border-[#E6C78C] bg-[#162944]/90 shadow-[0_0_25px_rgba(200,164,107,0.25)]'
                : activeFileName
                  ? 'border-[#C8A46B] bg-[#112238]/90'
                  : 'border-[#C8A46B]/60 bg-[#0E1C30]/85 hover:border-[#C8A46B]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              data-testid="exam-pdf-file-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleFileCandidate(file);
              }}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-14 h-11 rounded-2xl bg-[#C8A46B]/15 border border-[#C8A46B]/40 flex items-center justify-center text-[#DFC08A] shadow-inner">
                <CloudUpload className="w-7 h-7" />
              </div>

              {!activeFileName ? (
                <>
                  <p className="text-sm sm:text-base font-bold text-[#F7F3EA]">
                    اسحب الملف هنا أو اختر ملف
                  </p>
                  <p className="text-xs font-semibold text-[#D6B47C]">
                    ( بصيغة PDF )
                  </p>
                </>
              ) : (
                <div
                  data-testid="selected-pdf-file-preview"
                  className="w-full max-w-md mt-1 rounded-xl bg-[#091322] border border-[#C8A46B]/55 px-3.5 py-2.5 flex items-center justify-between gap-3 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-1 rounded-md bg-[#B91C1C] text-white text-[10px] font-bold tracking-wider shrink-0">
                      PDF
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#F7F3EA] truncate">
                        {activeFileName}
                      </p>
                      <p className="text-[11px] font-mono-tabular text-[#D6B47C]">
                        {formatFileSizeLabel(activeFileSize)} · جاهز للنشر
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid="replace-pdf-file-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-[#162842] border border-[#C8A46B]/45 text-[11px] font-semibold text-[#E6CFA6] hover:bg-[#C8A46B] hover:text-[#091322] transition-colors shrink-0 cursor-pointer"
                  >
                    استبدال الملف
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* =================================================================
              B. FOUR STRUCTURED METADATA ROWS (Matching Reference Image)
             ================================================================= */}
          <div className="space-y-3 pt-1">
            {/* Row 1: المادة */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-32 sm:w-36 shrink-0">
                <BookOpen className="w-5 h-5 text-[#D6B47C] shrink-0" />
                <label
                  htmlFor="teacher-exam-subject"
                  className="text-sm font-bold text-[#E6CFA6]"
                >
                  المادة
                </label>
              </div>

              <div className="relative flex-1">
                <select
                  id="teacher-exam-subject"
                  data-testid="teacher-exam-subject-select"
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

            {/* Row 2: نوع الامتحان */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-32 sm:w-36 shrink-0">
                <Star className="w-5 h-5 text-[#D6B47C] shrink-0" />
                <label
                  htmlFor="teacher-exam-type"
                  className="text-sm font-bold text-[#E6CFA6]"
                >
                  نوع الامتحان
                </label>
              </div>

              <div className="relative flex-1">
                <select
                  id="teacher-exam-type"
                  data-testid="teacher-exam-type-select"
                  value={examType}
                  onChange={(e) =>
                    setExamType(e.target.value as OfficialExamType)
                  }
                  className="w-full appearance-none rounded-xl bg-[#0F1E33] border border-[#C8A46B]/45 px-4 py-2.5 text-sm font-bold text-[#F7F3EA] focus:outline-none focus:border-[#E6C78C] cursor-pointer"
                >
                  <option value="regional" className="bg-[#0C192C] text-[#F7F3EA]">الامتحان الجهوي</option>
                  <option value="national" className="bg-[#0C192C] text-[#F7F3EA]">الامتحان الوطني</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#D6B47C] pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Row 3: السنة */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-32 sm:w-36 shrink-0">
                <Calendar className="w-5 h-5 text-[#D6B47C] shrink-0" />
                <label
                  htmlFor="teacher-exam-year"
                  className="text-sm font-bold text-[#E6CFA6]"
                >
                  السنة
                </label>
              </div>

              <div className="relative flex-1">
                <select
                  id="teacher-exam-year"
                  data-testid="teacher-exam-year-select"
                  value={examYear}
                  onChange={(e) => setExamYear(Number(e.target.value))}
                  className="w-full appearance-none rounded-xl bg-[#0F1E33] border border-[#C8A46B]/45 px-4 py-2.5 text-sm font-mono-tabular font-bold text-[#F7F3EA] focus:outline-none focus:border-[#E6C78C] cursor-pointer"
                >
                  {AVAILABLE_EXAM_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-[#0C192C] text-[#F7F3EA]">
                      {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#D6B47C] pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Row 4: الدورة */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-32 sm:w-36 shrink-0">
                <RefreshCw className="w-5 h-5 text-[#D6B47C] shrink-0" />
                <label
                  htmlFor="teacher-exam-session"
                  className="text-sm font-bold text-[#E6CFA6]"
                >
                  الدورة
                </label>
              </div>

              <div className="relative flex-1">
                <select
                  id="teacher-exam-session"
                  data-testid="teacher-exam-session-select"
                  value={examSession}
                  onChange={(e) =>
                    setExamSession(e.target.value as OfficialExamSession)
                  }
                  className="w-full appearance-none rounded-xl bg-[#0F1E33] border border-[#C8A46B]/45 px-4 py-2.5 text-sm font-bold text-[#F7F3EA] focus:outline-none focus:border-[#E6C78C] cursor-pointer"
                >
                  <option value="normal" className="bg-[#0C192C] text-[#F7F3EA]">الدورة العادية</option>
                  <option value="resit" className="bg-[#0C192C] text-[#F7F3EA]">الدورة الاستدراكية</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#D6B47C] pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* =================================================================
              C. TWO TARGETING CARDS AT BOTTOM (Level & Groups)
             ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Right Card in RTL: Educational Level & Stream Selector */}
            <div className="rounded-2xl bg-[#0F1E33] border border-[#C8A46B]/45 px-3.5 py-2.5 flex items-center justify-between gap-2.5">
              <GraduationCap className="w-5 h-5 text-[#D6B47C] shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] text-[#D6B47C]/80 font-semibold leading-tight">
                  المستوى الدراسي والشعبة
                </span>
                <select
                  aria-label="المستوى الدراسي المستهدف"
                  data-testid="teacher-exam-level-select"
                  value={targetLevel}
                  onChange={(e) =>
                    setTargetLevel(e.target.value as ExamTargetLevelOption)
                  }
                  className="w-full bg-transparent text-xs font-bold text-[#F7F3EA] focus:outline-none cursor-pointer truncate mt-0.5"
                >
                  <option value="1bac" className="bg-[#0C192C] text-[#F7F3EA]">
                    الأولى باكالوريا علوم
                  </option>
                  <option value="2bac" className="bg-[#0C192C] text-[#F7F3EA]">
                    الثانية باكالوريا آداب
                  </option>
                  <option value="all" className="bg-[#0C192C] text-[#F7F3EA]">
                    الأولى باكالوريا علوم والثانية باكالوريا آداب
                  </option>
                </select>
              </div>
            </div>

            {/* Left Card in RTL: Group Targeting Selector */}
            <button
              type="button"
              data-testid="teacher-exam-groups-trigger"
              onClick={() => setShowGroupPickerModal((prev) => !prev)}
              className="rounded-2xl bg-[#0F1E33] border border-[#C8A46B]/45 hover:border-[#E6C78C] px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-right transition-colors cursor-pointer"
            >
              <Users className="w-5 h-5 text-[#D6B47C] shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] text-[#D6B47C]/80 font-semibold leading-tight">
                  الأفواج المستهدفة
                </span>
                <span className="block text-xs font-bold text-[#F7F3EA] truncate mt-0.5">
                  {groupSummaryLabel}
                </span>
              </div>
            </button>
          </div>

          {/* Expandable Group Selection Chips */}
          {showGroupPickerModal && (
            <div
              data-testid="teacher-exam-groups-panel"
              className="rounded-2xl bg-[#091322] border border-[#C8A46B]/55 p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#E6CFA6]">
                  اختر الأفواج المسموح لها بالاطلاع على هذا الامتحان:
                </span>
                <button
                  type="button"
                  data-testid="select-all-groups-btn"
                  onClick={() => {
                    setAllGroupsSelected(true);
                    setSelectedGroups(['G1', 'G2', 'G3', 'G4']);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    allGroupsSelected
                      ? 'bg-[#C8A46B] text-[#091322]'
                      : 'bg-[#13253D] text-[#E6CFA6] border border-[#C8A46B]/40'
                  }`}
                >
                  جميع الأفواج الأربعة
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_GROUPS.map((grp) => {
                  const isSelected =
                    allGroupsSelected || selectedGroups.includes(grp);
                  return (
                    <button
                      key={grp}
                      type="button"
                      data-testid={`toggle-exam-group-${grp}`}
                      onClick={() => toggleGroupSelection(grp)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#C8A46B]/25 border-[#E6C78C] text-[#F7F3EA]'
                          : 'bg-[#0F1E33] border-[#C8A46B]/25 text-[#F7F3EA]/55'
                      }`}
                    >
                      {GROUP_LABELS_AR[grp]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================
              D. PROMINENT ANTIQUE-GOLD PUBLISHING BUTTON ("نشر الامتحان")
             ================================================================= */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="publish-exam-submit-btn"
              className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-[#C09858] via-[#E5C68E] to-[#C09858] hover:brightness-105 active:scale-[0.99] text-[#0A1524] font-display font-extrabold text-base sm:text-lg shadow-[0_10px_28px_rgba(198,160,100,0.35)] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <Send className="w-5 h-5 stroke-[2.4] -rotate-12" />
              <span>
                {isSubmitting
                  ? 'جاري رفع ونشر الامتحان...'
                  : editingExamId
                    ? 'حفظ ونشر التعديلات'
                    : 'نشر الامتحان'}
              </span>
            </button>

            {editingExamId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 h-13 rounded-2xl bg-[#13253D] border border-[#C8A46B]/45 text-xs font-bold text-[#E6CFA6] hover:bg-[#1B3252] transition-colors cursor-pointer"
              >
                إلغاء التعديل
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
