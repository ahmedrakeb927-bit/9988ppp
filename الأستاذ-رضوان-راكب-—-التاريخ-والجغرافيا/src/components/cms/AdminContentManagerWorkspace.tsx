import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  FileCheck,
  FileEdit,
  FileText,
  FolderKanban,
  GraduationCap,
  GripVertical,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Info,
  Link2,
  List,
  ListOrdered,
  Quote,
  Search,
  Table,
  Trash2,
  Upload,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';
import {
  ALL_COHORT_GROUP_KEYS,
  AudienceConfig,
  AudienceMode,
  CmsLesson,
  CohortGroupKey,
  createAllStudentsAudienceConfig,
  ExamExerciseKind,
  formatEffectiveAudienceSummary,
  LessonBlockType,
  LessonContentBlock,
  PublicationStatus,
  ResourceCategoryType,
  UnitCategoryKind,
} from '../../utils/cmsContentRules';
import { AudienceTargetingConfigEditor } from './AudienceTargetingConfigEditor';
import { LessonReaderModal } from './LessonReaderModal';
import { TeacherExamPublishWorkspace } from './TeacherExamPublishWorkspace';

export type CmsSubTabId =
  | 'subjects'
  | 'units'
  | 'lessons'
  | 'resources'
  | 'examinations'
  | 'drafts'
  | 'published'
  | 'archived';

interface AdminContentManagerWorkspaceProps {
  initialTab?: CmsSubTabId;
  lockedSection?: 'subjects' | 'units' | 'lessons' | 'resources' | 'examinations';
}

const CMS_TABS: { id: CmsSubTabId; code: string; labelAr: string; labelFr: string }[] = [
  { id: 'subjects', code: 'A', labelAr: 'A. إدارة المواد', labelFr: 'A. Matières' },
  {
    id: 'units',
    code: 'B',
    labelAr: 'B. الوحدات والفئات',
    labelFr: 'B. Unités & Catégories',
  },
  {
    id: 'lessons',
    code: 'C',
    labelAr: 'C. الدروس والمحرر',
    labelFr: 'C. Leçons & Éditeur',
  },
  {
    id: 'examinations',
    code: 'D',
    labelAr: 'D. الامتحانات والتمارين',
    labelFr: 'D. Examens & Exercices',
  },
  { id: 'drafts', code: 'E', labelAr: 'E. المسودات', labelFr: 'E. Brouillons' },
  {
    id: 'published',
    code: 'F',
    labelAr: 'F. المحتوى المنشور',
    labelFr: 'F. Contenu Publié',
  },
  { id: 'archived', code: 'G', labelAr: 'G. الأرشيف', labelFr: 'G. Contenu Archivé' },
];

const LESSON_AUTOSAVE_KEY = 'radwan_rakeb_cms_lesson_draft_autosave_v1';

export function AdminContentManagerWorkspace({
  initialTab = 'subjects',
  lockedSection,
}: AdminContentManagerWorkspaceProps) {
  const { lang, t } = useLanguage();
  const {
    subjects,
    units,
    lessons,
    resources,
    examinations,
    cmsNotice,
    cmsError,
    clearCmsMessages,
    saveSubject,
    deleteSubject,
    saveUnit,
    deleteUnit,
    saveLesson,
    updateLessonStatus,
    deleteLesson,
    uploadAndSaveResource,
    deleteResource,
    requestProtectedResourceDownload,
    saveExamination,
    deleteExamination,
    reorderCollectionItems,
    resolveParentNodeForUnit,
    resolveParentNodeForChild,
  } = useContent();

  const [activeTab, setActiveTab] = useState<CmsSubTabId>(lockedSection || initialTab);

  useEffect(() => {
    setActiveTab(lockedSection || initialTab);
  }, [lockedSection, initialTab]);

  // Global Table Search, Filter, Sort, Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterStatus] = useState<PublicationStatus | 'all'>('all');
  const [filterGroupKey, setFilterGroupKey] = useState<CohortGroupKey | 'all'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'status'>('order');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const pageSize = 8;

  // Confirmation before permanent deletion
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'subject' | 'unit' | 'lesson' | 'resource' | 'examination';
    id: string;
    title: string;
  } | null>(null);

  // Drag & Drop index tracking
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Preview Modal for Lesson
  const [previewLesson, setPreviewLesson] = useState<CmsLesson | null>(null);

  // ===============================================================
  // A. SUBJECT FORM STATE
  // ===============================================================
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjSlug, setSubjSlug] = useState('history');
  const [subjTitleAr, setSubjTitleAr] = useState('');
  const [subjTitleFr, setSubjTitleFr] = useState('');
  const [subjDescAr, setSubjDescAr] = useState('');
  const [subjDescFr, setSubjDescFr] = useState('');
  const [subjStatus, setSubjStatus] = useState<PublicationStatus>('published');
  const [subjAudience, setSubjAudience] = useState<AudienceConfig>(
    createAllStudentsAudienceConfig()
  );

  // ===============================================================
  // B. UNIT / CATEGORY FORM STATE
  // ===============================================================
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitSubjectId, setUnitSubjectId] = useState<string>('subject_history');
  const [unitParentId, setUnitParentId] = useState<string | null>(null);
  const [unitKind, setUnitKind] = useState<UnitCategoryKind>('unit');
  const [unitCustomLabel, setUnitCustomLabel] = useState('');
  const [unitTitleAr, setUnitTitleAr] = useState('');
  const [unitTitleFr, setUnitTitleFr] = useState('');
  const [unitDescAr, setUnitDescAr] = useState('');
  const [unitDescFr, setUnitDescFr] = useState('');
  const [unitStatus, setUnitStatus] = useState<PublicationStatus>('published');
  const [unitAudienceMode, setUnitAudienceMode] = useState<AudienceMode>('inherit');
  const [unitAudience, setUnitAudience] = useState<AudienceConfig>(
    createAllStudentsAudienceConfig()
  );

  // ===============================================================
  // C. PROFESSIONAL RICH-TEXT LESSON EDITOR STATE
  // ===============================================================
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonSubjectId, setLessonSubjectId] = useState<string>('subject_history');
  const [lessonUnitId, setLessonUnitId] = useState<string | null>(null);
  const [lessonTitleAr, setLessonTitleAr] = useState('');
  const [lessonTitleFr, setLessonTitleFr] = useState('');
  const [lessonDescAr, setLessonDescAr] = useState('');
  const [lessonDescFr, setLessonDescFr] = useState('');
  const [lessonContentAr, setLessonContentAr] = useState('');
  const [lessonContentFr, setLessonContentFr] = useState('');
  const [lessonWritingLang, setLessonWritingLang] = useState<'ar' | 'fr'>('ar');
  const [lessonBlocks, setLessonBlocks] = useState<LessonContentBlock[]>([]);
  const [lessonAttachmentIds, setLessonAttachmentIds] = useState<string[]>([]);
  const [lessonAudienceMode, setLessonAudienceMode] = useState<AudienceMode>('independent');
  const [lessonAudience, setLessonAudience] = useState<AudienceConfig>(
    createAllStudentsAudienceConfig()
  );
  const [lastAutosavedIso, setLastAutosavedIso] = useState<string | null>(null);

  // ===============================================================
  // D. EDUCATIONAL RESOURCE FORM STATE
  // ===============================================================
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resTitleAr, setResTitleAr] = useState('');
  const [resTitleFr, setResTitleFr] = useState('');
  const [resDescAr, setResDescAr] = useState('');
  const [resDescFr, setResDescFr] = useState('');
  const [resCategory, setResCategory] = useState<ResourceCategoryType>('summary');
  const [resSubjectId, setResSubjectId] = useState<string>('subject_history');
  const [resUnitId, setResUnitId] = useState<string | null>(null);
  const [resLessonId, setResLessonId] = useState<string | null>(null);
  const [resStatus, setResStatus] = useState<PublicationStatus>('published');
  const [resAudienceMode, setResAudienceMode] = useState<AudienceMode>('independent');
  const [resAudience, setResAudience] = useState<AudienceConfig>(
    createAllStudentsAudienceConfig()
  );
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [simulatedFileName, setSimulatedFileName] = useState('Document_Academique.pdf');

  // ===============================================================
  // E. EXAMINATION & EXERCISE FORM STATE
  // ===============================================================
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examTitleAr, setExamTitleAr] = useState('');
  const [examTitleFr, setExamTitleFr] = useState('');
  const [examDescAr, setExamDescAr] = useState('');
  const [examDescFr, setExamDescFr] = useState('');
  const [examKind, setExamKind] = useState<ExamExerciseKind>('examination');
  const [examSubjectId, setExamSubjectId] = useState<string>('subject_history');
  const [examUnitId, setExamUnitId] = useState<string | null>(null);
  const [examAttachmentIds, setExamAttachmentIds] = useState<string[]>([]);
  const [examDuration, setExamDuration] = useState<number>(120);
  const [examScale, setExamScale] = useState<string>('20/20');
  const [examStatus, setExamStatus] = useState<PublicationStatus>('published');
  const [examAudienceMode, setExamAudienceMode] = useState<AudienceMode>('independent');
  const [examAudience, setExamAudience] = useState<AudienceConfig>(
    createAllStudentsAudienceConfig()
  );

  // Sync default subject selection when subjects load
  useEffect(() => {
    if (subjects.length > 0) {
      const firstId = subjects[0].id;
      if (!subjects.some((s) => s.id === unitSubjectId)) setUnitSubjectId(firstId);
      if (!subjects.some((s) => s.id === lessonSubjectId)) setLessonSubjectId(firstId);
      if (!subjects.some((s) => s.id === resSubjectId)) setResSubjectId(firstId);
      if (!subjects.some((s) => s.id === examSubjectId)) setExamSubjectId(firstId);
    }
  }, [subjects, unitSubjectId, lessonSubjectId, resSubjectId, examSubjectId]);

  // Safe local draft autosave for Lesson Editor (never auto-publishes!)
  useEffect(() => {
    if (!lessonTitleAr && !lessonContentAr && lessonBlocks.length === 0) return;
    const timer = window.setTimeout(() => {
      try {
        const snapshot = {
          lessonSubjectId,
          lessonUnitId,
          lessonTitleAr,
          lessonTitleFr,
          lessonDescAr,
          lessonDescFr,
          lessonContentAr,
          lessonContentFr,
          lessonBlocks,
          savedAt: new Date().toLocaleTimeString(),
        };
        window.localStorage.setItem(LESSON_AUTOSAVE_KEY, JSON.stringify(snapshot));
        setLastAutosavedIso(snapshot.savedAt);
      } catch {
        // Ignore storage quota errors
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [
    lessonSubjectId,
    lessonUnitId,
    lessonTitleAr,
    lessonTitleFr,
    lessonDescAr,
    lessonDescFr,
    lessonContentAr,
    lessonContentFr,
    lessonBlocks,
  ]);

  const addLessonBlock = (type: LessonBlockType) => {
    const newBlock: LessonContentBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      text:
        type === 'table'
          ? 'العنصر | الوصف | الدلالة التاريخية\nالمعاهدة | وثيقة دبلوماسية | التحول السياسي'
          : type === 'numbered_list' || type === 'bullet_list'
            ? 'العنصر المنهجي الأول\nالعنصر المنهجي الثاني'
            : '',
      caption: '',
      url: '',
    };
    setLessonBlocks((prev) => [...prev, newBlock]);
  };

  const updateLessonBlock = (
    blockId: string,
    patch: Partial<LessonContentBlock>
  ) => {
    setLessonBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...patch } : b))
    );
  };

  const removeLessonBlock = (blockId: string) => {
    setLessonBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const resetSubjectForm = () => {
    setEditingSubjectId(null);
    setSubjSlug('custom');
    setSubjTitleAr('');
    setSubjTitleFr('');
    setSubjDescAr('');
    setSubjDescFr('');
    setSubjStatus('published');
    setSubjAudience(createAllStudentsAudienceConfig());
  };

  const resetUnitForm = () => {
    setEditingUnitId(null);
    setUnitParentId(null);
    setUnitKind('unit');
    setUnitCustomLabel('');
    setUnitTitleAr('');
    setUnitTitleFr('');
    setUnitDescAr('');
    setUnitDescFr('');
    setUnitStatus('published');
    setUnitAudienceMode('inherit');
    setUnitAudience(createAllStudentsAudienceConfig());
  };

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setLessonUnitId(null);
    setLessonTitleAr('');
    setLessonTitleFr('');
    setLessonDescAr('');
    setLessonDescFr('');
    setLessonContentAr('');
    setLessonContentFr('');
    setLessonBlocks([]);
    setLessonAttachmentIds([]);
    setLessonAudienceMode('independent');
    setLessonAudience(createAllStudentsAudienceConfig());
  };

  const resetResourceForm = () => {
    setEditingResourceId(null);
    setResTitleAr('');
    setResTitleFr('');
    setResDescAr('');
    setResDescFr('');
    setResCategory('summary');
    setResUnitId(null);
    setResLessonId(null);
    setResStatus('published');
    setResAudienceMode('independent');
    setResAudience(createAllStudentsAudienceConfig());
    setSelectedUploadFile(null);
  };

  const resetExamForm = () => {
    setEditingExamId(null);
    setExamTitleAr('');
    setExamTitleFr('');
    setExamDescAr('');
    setExamDescFr('');
    setExamKind('examination');
    setExamUnitId(null);
    setExamAttachmentIds([]);
    setExamDuration(120);
    setExamScale('20/20');
    setExamStatus('published');
    setExamAudienceMode('independent');
    setExamAudience(createAllStudentsAudienceConfig());
  };

  const renderStatusBadge = (status: PublicationStatus) => {
    const styles: Record<PublicationStatus, string> = {
      published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      draft: 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/30',
      scheduled: 'bg-[#4F46E5] text-[#FFFFFF] border-[#4F46E5]',
      unpublished: 'bg-red-50 text-red-600 border-red-200',
      archived: 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
    };
    const labels: Record<PublicationStatus, { ar: string; fr: string }> = {
      published: { ar: 'منشور رسمياً', fr: 'Publié' },
      draft: { ar: 'مسودة', fr: 'Brouillon' },
      scheduled: { ar: 'مجدول', fr: 'Programmé' },
      unpublished: { ar: 'غير منشور', fr: 'Dépublié' },
      archived: { ar: 'مؤرشف', fr: 'Archivé' },
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md border ${styles[status]}`}
      >
        {lang === 'ar' ? labels[status].ar : labels[status].fr}
      </span>
    );
  };

  function filterAndSortItems<
    T extends {
      id: string;
      titleAr: string;
      titleFr: string;
      order: number;
      status: PublicationStatus;
      effectiveGroupKeys: CohortGroupKey[];
      subjectId?: string;
    },
  >(list: T[]): T[] {
    const q = searchQuery.trim().toLowerCase();
    const filtered = list.filter((item) => {
      if (q) {
        const matchAr = item.titleAr.toLowerCase().includes(q);
        const matchFr = item.titleFr.toLowerCase().includes(q);
        if (!matchAr && !matchFr) return false;
      }
      const itemSubjId = item.subjectId || item.id;
      if (filterSubjectId !== 'all' && itemSubjId !== filterSubjectId) {
        return false;
      }
      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }
      if (
        filterGroupKey !== 'all' &&
        !item.effectiveGroupKeys.includes(filterGroupKey)
      ) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return (lang === 'ar' ? a.titleAr : a.titleFr).localeCompare(
          lang === 'ar' ? b.titleAr : b.titleFr
        );
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return a.order - b.order;
    });

    return filtered;
  }

  const handleConfirmPermanentDelete = async () => {
    if (!pendingDelete) return;
    const { type, id } = pendingDelete;
    setPendingDelete(null);
    if (type === 'subject') await deleteSubject(id);
    if (type === 'unit') await deleteUnit(id);
    if (type === 'lesson') await deleteLesson(id);
    if (type === 'resource') await deleteResource(id);
    if (type === 'examination') await deleteExamination(id);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Notifications */}
      {cmsError && (
        <div
          role="alert"
          className="p-4 bg-[#FFFFFF] border border-red-300 rounded-xl text-xs text-[#111827] flex items-center justify-between gap-4 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{t(cmsError)}</span>
          </div>
          <button
            type="button"
            onClick={clearCmsMessages}
            className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
          >
            {lang === 'ar' ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      )}

      {cmsNotice && (
        <div
          role="status"
          className="p-4 bg-[#FFFFFF] border border-emerald-300 rounded-xl text-xs text-[#111827] flex items-center justify-between gap-4 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t(cmsNotice)}</span>
          </div>
          <button
            type="button"
            onClick={clearCmsMessages}
            className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
          >
            {lang === 'ar' ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      )}

      {/* Confirmation Dialog before Permanent Deletion */}
      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="p-5 bg-[#FFFFFF] text-[#111827] border-2 border-red-500 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1 text-xs">
            <p className="font-bold text-red-600">
              {lang === 'ar'
                ? 'تأكيد الحذف النهائي من قاعدة البيانات (Permanent Deletion):'
                : 'Confirmation de suppression définitive :'}
            </p>
            <p className="text-[#64748B]">
              {lang === 'ar'
                ? `هل أنت متأكد من حذف "${pendingDelete.title}" نهائياً؟ لا يمكن التراجع عن هذه العملية.`
                : `Confirmez-vous la suppression définitive de « ${pendingDelete.title} » ?`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="confirm-permanent-delete-btn"
              onClick={() => void handleConfirmPermanentDelete()}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              {lang === 'ar' ? 'تأكيد الحذف النهائي' : 'Supprimer définitivement'}
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#F8FAFC] text-[#111827] border border-[#E2E8F0] hover:border-[#4F46E5] cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Section Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-2xl p-5 space-y-4 shadow-2xs">
        {!lockedSection && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E0D4]">
              <div>
                <span className="text-xs font-semibold text-[#B99A62] block">
                  {lang === 'ar'
                    ? 'نظام إدارة المحتوى التربوي المتكامل (Firestore & Storage)'
                    : 'Système Complet de Gestion du Contenu Pédagogique'}
                </span>
                <h2 className="text-lg font-bold text-[#101C2C]">
                  {lang === 'ar'
                    ? 'الأقسام الثمانية لإدارة المواد، الوحدات، الدروس، الموارد، والامتحانات'
                    : 'Les 8 Espaces de Gestion : Matières, Unités, Leçons, Ressources & Examens'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {CMS_TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    data-testid={`cms-tab-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPageIndex(1);
                    }}
                    className={`px-2.5 py-2 text-xs font-medium rounded-lg border text-start transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#101C2C] text-[#F7F5EF] border-[#B99A62] font-semibold'
                        : 'bg-[#F7F5EF] text-[#252B33] border-[#E5E0D4] hover:border-[#B99A62] hover:text-[#101C2C]'
                    }`}
                  >
                    {lang === 'ar' ? tab.labelAr : tab.labelFr}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {lockedSection === 'lessons' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E0D4]">
            <span className="text-xs font-semibold text-[#101C2C]">
              {lang === 'ar' ? 'حالة الدروس المعروضة:' : 'Statut des leçons :'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'lessons' as CmsSubTabId, ar: 'محرر الدروس واللائحة', fr: 'Éditeur & Liste' },
                  { id: 'published' as CmsSubTabId, ar: 'الدروس المنشورة', fr: 'Publiées' },
                  { id: 'drafts' as CmsSubTabId, ar: 'المسودات', fr: 'Brouillons' },
                  { id: 'archived' as CmsSubTabId, ar: 'الأرشيف', fr: 'Archivées' },
                ]
              ).map((sub) => {
                const active = activeTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    data-testid={`cms-tab-${sub.id}`}
                    onClick={() => {
                      setActiveTab(sub.id);
                      setCurrentPageIndex(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#101C2C] text-[#F7F5EF] border-[#B99A62]'
                        : 'bg-[#F7F5EF] text-[#252B33] border-[#E5E0D4] hover:border-[#B99A62]'
                    }`}
                  >
                    {lang === 'ar' ? sub.ar : sub.fr}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Universal Search, Filter, and Sort Bar */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute top-3 start-3" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPageIndex(1);
              }}
              placeholder={
                lang === 'ar'
                  ? 'بحث في العناوين (العربية أو الفرنسية)...'
                  : 'Rechercher par titre (AR / FR)...'
              }
              aria-label={lang === 'ar' ? 'بحث في المحتوى' : 'Rechercher un élément'}
              className="w-full ps-8 pe-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <select
            value={filterSubjectId}
            onChange={(e) => {
              setFilterSubjectId(e.target.value);
              setCurrentPageIndex(1);
            }}
            aria-label={lang === 'ar' ? 'تصفية حسب المادة' : 'Filtrer par matière'}
            className="px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="all">
              {lang === 'ar' ? 'جميع المواد الدراسية' : 'Toutes les matières'}
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {lang === 'ar' ? s.titleAr : s.titleFr}
              </option>
            ))}
          </select>

          <select
            value={filterGroupKey}
            onChange={(e) => {
              setFilterGroupKey(e.target.value as CohortGroupKey | 'all');
              setCurrentPageIndex(1);
            }}
            aria-label={lang === 'ar' ? 'تصفية حسب الفوج المستهدف' : 'Filtrer par groupe ciblé'}
            className="px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="all">
              {lang === 'ar' ? 'جميع الأفواج المستهدفة' : 'Tous les groupes ciblés'}
            </option>
            {ALL_COHORT_GROUP_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'order' | 'title' | 'status')}
            aria-label={lang === 'ar' ? 'ترتيب النتائج' : 'Trier par'}
            className="px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="order">
              {lang === 'ar' ? 'الترتيب: التسلسل الهرمي' : 'Tri : Ordre séquentiel'}
            </option>
            <option value="title">
              {lang === 'ar' ? 'الترتيب: الأبجدي' : 'Tri : Alphabétique'}
            </option>
            <option value="status">
              {lang === 'ar' ? 'الترتيب: حالة النشر' : 'Tri : Statut de publication'}
            </option>
          </select>
        </div>
      </div>

      {/* ===============================================================
          SECTION A: SUBJECT MANAGEMENT
         =============================================================== */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const id = await saveSubject({
                id: editingSubjectId || undefined,
                slug: subjSlug,
                titleAr: subjTitleAr,
                titleFr: subjTitleFr,
                descriptionAr: subjDescAr,
                descriptionFr: subjDescFr,
                status: subjStatus,
                audienceConfig: subjAudience,
              });
              if (id) resetSubjectForm();
            }}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                <span>
                  {editingSubjectId
                    ? lang === 'ar'
                      ? 'تعديل المادة الدراسية'
                      : 'Modifier la matière'
                    : lang === 'ar'
                      ? 'إضافة أو تعديل مادة دراسية (التاريخ / الجغرافيا / مخصصة)'
                      : 'Créer ou modifier une matière'}
                </span>
              </h3>
              {editingSubjectId && (
                <button
                  type="button"
                  onClick={resetSubjectForm}
                  className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء التعديل' : 'Nouvelle matière'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'اسم المادة (بالعربية) *' : 'Titre de la matière (AR) *'}
                </label>
                <input
                  type="text"
                  required
                  data-testid="subject-title-ar-input"
                  value={subjTitleAr}
                  onChange={(e) => setSubjTitleAr(e.target.value)}
                  placeholder="التاريخ"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'اسم المادة (بالفرنسية)' : 'Titre de la matière (FR)'}
                </label>
                <input
                  type="text"
                  data-testid="subject-title-fr-input"
                  value={subjTitleFr}
                  onChange={(e) => setSubjTitleFr(e.target.value)}
                  placeholder="Histoire"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'حالة الظهور والنشر' : 'Visibilité / Statut'}
                </label>
                <select
                  value={subjStatus}
                  onChange={(e) => setSubjStatus(e.target.value as PublicationStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="published">{lang === 'ar' ? 'منشور (Published)' : 'Publié'}</option>
                  <option value="draft">{lang === 'ar' ? 'مسودة (Draft)' : 'Brouillon'}</option>
                  <option value="unpublished">
                    {lang === 'ar' ? 'غير منشور (Unpublished)' : 'Dépublié'}
                  </option>
                  <option value="archived">
                    {lang === 'ar' ? 'مؤرشف (Archived)' : 'Archivé'}
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'الوصف الأكاديمي (بالعربية)' : 'Description (AR)'}
                </label>
                <textarea
                  rows={2}
                  value={subjDescAr}
                  onChange={(e) => setSubjDescAr(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'الوصف الأكاديمي (بالفرنسية)' : 'Description (FR)'}
                </label>
                <textarea
                  rows={2}
                  value={subjDescFr}
                  onChange={(e) => setSubjDescFr(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
            </div>

            <AudienceTargetingConfigEditor
              allowInheritance={false}
              audienceMode="independent"
              onChangeAudienceMode={() => {}}
              audienceConfig={subjAudience}
              onChangeAudienceConfig={setSubjAudience}
              itemStatus={subjStatus}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                data-testid="save-subject-btn"
                className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#4F46E5] text-[#FFFFFF] hover:bg-[#6366F1] transition-colors cursor-pointer"
              >
                {editingSubjectId
                  ? lang === 'ar'
                    ? 'حفظ تعديلات المادة'
                    : 'Mettre à jour la matière'
                  : lang === 'ar'
                    ? 'حفظ المادة الدراسية'
                    : 'Enregistrer la matière'}
              </button>
            </div>
          </form>

          {/* Subjects Table with Drag-and-Drop Reordering */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#111827]">
              {lang === 'ar'
                ? `قائمة المواد الدراسية المعتمدة (${subjects.length})`
                : `Liste des Matières (${subjects.length})`}
            </h3>

            <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
              {filterAndSortItems(subjects).map((subj, idx, arr) => (
                <div
                  key={subj.id}
                  draggable
                  onDragStart={() => setDraggedIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async () => {
                    if (draggedIdx !== null && draggedIdx !== idx) {
                      await reorderCollectionItems(
                        'subjects',
                        arr.map((x) => x.id),
                        draggedIdx,
                        idx
                      );
                    }
                    setDraggedIdx(null);
                  }}
                  className="p-4 bg-[#FFFFFF] hover:bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-4 h-4 text-[#64748B] mt-0.5 cursor-grab shrink-0" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-tabular font-bold text-[#4F46E5]">
                          #{subj.order}
                        </span>
                        <span className="font-bold text-sm text-[#111827]">
                          {subj.titleAr} / {subj.titleFr}
                        </span>
                        {renderStatusBadge(subj.status)}
                      </div>
                      <p className="text-[#64748B]">
                        {lang === 'ar' ? subj.descriptionAr : subj.descriptionFr}
                      </p>
                      <p className="text-[11px] font-mono-tabular text-[#64748B]">
                        {formatEffectiveAudienceSummary(subj.effectiveGroupKeys, lang)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        void reorderCollectionItems(
                          'subjects',
                          arr.map((x) => x.id),
                          idx,
                          idx - 1
                        )
                      }
                      aria-label={lang === 'ar' ? 'تحريك لأعلى' : 'Monter'}
                      className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#111827] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === arr.length - 1}
                      onClick={() =>
                        void reorderCollectionItems(
                          'subjects',
                          arr.map((x) => x.id),
                          idx,
                          idx + 1
                        )
                      }
                      aria-label={lang === 'ar' ? 'تحريك لأسفل' : 'Descendre'}
                      className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#111827] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubjectId(subj.id);
                        setSubjSlug(subj.slug);
                        setSubjTitleAr(subj.titleAr);
                        setSubjTitleFr(subj.titleFr);
                        setSubjDescAr(subj.descriptionAr);
                        setSubjDescFr(subj.descriptionFr);
                        setSubjStatus(subj.status);
                        setSubjAudience(subj.audienceConfig);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] hover:border-[#4F46E5] font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>{lang === 'ar' ? 'تعديل' : 'Modifier'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingDelete({
                          type: 'subject',
                          id: subj.id,
                          title: subj.titleAr,
                        })
                      }
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
                      aria-label={`${lang === 'ar' ? 'حذف' : 'Supprimer'} ${subj.titleAr}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===============================================================
          SECTION B: UNIT & NESTED CATEGORY MANAGEMENT
         =============================================================== */}
      {activeTab === 'units' && (
        <div className="space-y-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const id = await saveUnit({
                id: editingUnitId || undefined,
                subjectId: unitSubjectId,
                parentId: unitParentId,
                categoryKind: unitKind,
                customCategoryLabel: unitCustomLabel,
                titleAr: unitTitleAr,
                titleFr: unitTitleFr,
                descriptionAr: unitDescAr,
                descriptionFr: unitDescFr,
                status: unitStatus,
                audienceMode: unitAudienceMode,
                audienceConfig: unitAudience,
              });
              if (id) resetUnitForm();
            }}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#111827]">
                {editingUnitId
                  ? lang === 'ar'
                    ? 'تعديل الوحدة أو الفئة التربوية'
                    : 'Modifier l’unité ou la catégorie'
                  : lang === 'ar'
                    ? 'إنشاء وحدة، فصل، أو فئة هرمية متداخلة (Unit / Chapter / Custom Category)'
                    : 'Créer une Unité, un Chapitre ou une Catégorie imbriquée'}
              </h3>
              {editingUnitId && (
                <button
                  type="button"
                  onClick={resetUnitForm}
                  className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء التعديل' : 'Nouvelle unité'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'المادة الدراسية الأم' : 'Matière parente'}
                </label>
                <select
                  value={unitSubjectId}
                  onChange={(e) => {
                    setUnitSubjectId(e.target.value);
                    setUnitParentId(null);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'ar' ? s.titleAr : s.titleFr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar'
                    ? 'العنصر الأب (اختياري للتداخل الهرمي)'
                    : 'Unité parente (optionnel)'}
                </label>
                <select
                  value={unitParentId || ''}
                  onChange={(e) => setUnitParentId(e.target.value || null)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="">
                    {lang === 'ar' ? '— مباشرة تحت المادة (مستوى رئيسي) —' : '— Racine de la matière —'}
                  </option>
                  {units
                    .filter((u) => u.subjectId === unitSubjectId && u.id !== editingUnitId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {lang === 'ar' ? u.titleAr : u.titleFr}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'نوع التقسيم التنظيمي' : 'Type de catégorie'}
                </label>
                <select
                  value={unitKind}
                  onChange={(e) => setUnitKind(e.target.value as UnitCategoryKind)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="unit">{lang === 'ar' ? 'مجزوءة / وحدة (Unit)' : 'Unité'}</option>
                  <option value="chapter">
                    {lang === 'ar' ? 'فصل / محور (Chapter)' : 'Chapitre'}
                  </option>
                  <option value="section">
                    {lang === 'ar' ? 'مقطع تعليمي (Section)' : 'Section'}
                  </option>
                  <option value="custom">
                    {lang === 'ar' ? 'تصنيف مخصص (Custom)' : 'Catégorie personnalisée'}
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'حالة النشر' : 'Statut'}
                </label>
                <select
                  value={unitStatus}
                  onChange={(e) => setUnitStatus(e.target.value as PublicationStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="published">{lang === 'ar' ? 'منشور' : 'Publié'}</option>
                  <option value="draft">{lang === 'ar' ? 'مسودة' : 'Brouillon'}</option>
                  <option value="unpublished">{lang === 'ar' ? 'غير منشور' : 'Dépublié'}</option>
                  <option value="archived">{lang === 'ar' ? 'مؤرشف' : 'Archivé'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'عنوان الوحدة / المحور (بالعربية) *' : 'Intitulé (AR) *'}
                </label>
                <input
                  type="text"
                  required
                  data-testid="unit-title-ar-input"
                  value={unitTitleAr}
                  onChange={(e) => setUnitTitleAr(e.target.value)}
                  placeholder="المجزوءة الأولى: التحولات الكبرى للعالم الرأسمالي"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'عنوان الوحدة / المحور (بالفرنسية)' : 'Intitulé (FR)'}
                </label>
                <input
                  type="text"
                  data-testid="unit-title-fr-input"
                  value={unitTitleFr}
                  onChange={(e) => setUnitTitleFr(e.target.value)}
                  placeholder="Module 1 : Les grandes transformations du monde capitaliste"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
            </div>

            <AudienceTargetingConfigEditor
              allowInheritance={true}
              audienceMode={unitAudienceMode}
              onChangeAudienceMode={setUnitAudienceMode}
              audienceConfig={unitAudience}
              onChangeAudienceConfig={setUnitAudience}
              itemStatus={unitStatus}
              parentNode={resolveParentNodeForUnit(unitSubjectId, unitParentId)}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                data-testid="save-unit-btn"
                className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#4F46E5] text-[#FFFFFF] hover:bg-[#6366F1] transition-colors cursor-pointer"
              >
                {editingUnitId
                  ? lang === 'ar'
                    ? 'تحديث الوحدة التربوية'
                    : 'Mettre à jour l’unité'
                  : lang === 'ar'
                    ? 'إضافة الوحدة / الفئة التربوية'
                    : 'Créer l’unité'}
              </button>
            </div>
          </form>

          {/* Units List */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#111827]">
              {lang === 'ar'
                ? `الهيكل الهرمي للوحدات والفئات (${units.length})`
                : `Structure Hiérarchique des Unités (${units.length})`}
            </h3>

            {units.length === 0 ? (
              <p className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-center text-[#64748B]">
                {lang === 'ar'
                  ? 'لم يتم إنشاء وحدات بعد. يتمتع الأستاذ بحرية كاملة لإنشاء الوحدات أو الفصول أو إضافة الدروس مباشرة تحت المادة.'
                  : 'Aucune unité créée pour le moment. Vous pouvez créer des unités ou ajouter des leçons directement.'}
              </p>
            ) : (
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
                {filterAndSortItems(units).map((u, idx, arr) => {
                  const subj = subjects.find((s) => s.id === u.subjectId);
                  const parentU = u.parentId ? units.find((p) => p.id === u.parentId) : null;
                  return (
                    <div
                      key={u.id}
                      className="p-4 bg-[#FFFFFF] hover:bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-tabular font-bold text-[#4F46E5]">
                            #{u.order} · {u.categoryKind.toUpperCase()}
                          </span>
                          <span className="text-[#64748B]">
                            [{subj ? (lang === 'ar' ? subj.titleAr : subj.titleFr) : u.subjectId}]
                          </span>
                          {parentU && (
                            <span className="text-[#4F46E5]">
                              ↳ {lang === 'ar' ? parentU.titleAr : parentU.titleFr}
                            </span>
                          )}
                          {renderStatusBadge(u.status)}
                        </div>
                        <p className="font-bold text-sm text-[#111827]">
                          {u.titleAr} {u.titleFr ? `/ ${u.titleFr}` : ''}
                        </p>
                        <p className="text-[11px] font-mono-tabular text-[#64748B]">
                          {u.audienceMode === 'inherit'
                            ? lang === 'ar'
                              ? 'توارث تلقائي من الأب · '
                              : 'Hérité · '
                            : ''}
                          {formatEffectiveAudienceSummary(u.effectiveGroupKeys, lang)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            void reorderCollectionItems(
                              'units',
                              arr.map((x) => x.id),
                              idx,
                              idx - 1
                            )
                          }
                          className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === arr.length - 1}
                          onClick={() =>
                            void reorderCollectionItems(
                              'units',
                              arr.map((x) => x.id),
                              idx,
                              idx + 1
                            )
                          }
                          className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUnitId(u.id);
                            setUnitSubjectId(u.subjectId);
                            setUnitParentId(u.parentId);
                            setUnitKind(u.categoryKind);
                            setUnitCustomLabel(u.customCategoryLabel);
                            setUnitTitleAr(u.titleAr);
                            setUnitTitleFr(u.titleFr);
                            setUnitDescAr(u.descriptionAr);
                            setUnitDescFr(u.descriptionFr);
                            setUnitStatus(u.status);
                            setUnitAudienceMode(u.audienceMode);
                            setUnitAudience(u.audienceConfig);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] hover:border-[#4F46E5] font-semibold cursor-pointer"
                        >
                          {lang === 'ar' ? 'تعديل' : 'Modifier'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingDelete({
                              type: 'unit',
                              id: u.id,
                              title: u.titleAr,
                            })
                          }
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===============================================================
          SECTION C: PROFESSIONAL RICH-TEXT LESSON EDITOR & MANAGEMENT
         =============================================================== */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
              <div>
                <span className="text-xs font-semibold text-[#4F46E5] block">
                  {lang === 'ar'
                    ? 'المحرر الأكاديمي المتقدم للدروس (Rich-Text Lesson Editor)'
                    : 'Éditeur Académique de Leçons (Rich-Text RTL / LTR)'}
                </span>
                <h3 className="text-lg font-bold text-[#111827]">
                  {editingLessonId
                    ? lang === 'ar'
                      ? 'تحرير الدرس وتحديث الإصدار'
                      : 'Édition de la leçon et gestion de version'
                    : lang === 'ar'
                      ? 'إنشاء درس تربوي جديد'
                      : 'Créer une nouvelle leçon'}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {lastAutosavedIso && (
                  <span className="text-[11px] font-mono-tabular text-[#64748B]">
                    {lang === 'ar'
                      ? `حفظ مسودة محلي تلقائي: ${lastAutosavedIso}`
                      : `Sauvegarde locale : ${lastAutosavedIso}`}
                  </span>
                )}
                {editingLessonId && (
                  <button
                    type="button"
                    onClick={resetLessonForm}
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold cursor-pointer"
                  >
                    {lang === 'ar' ? 'درس جديد' : 'Nouvelle leçon'}
                  </button>
                )}
              </div>
            </div>

            {/* Subject & Unit Location Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'المادة الدراسية *' : 'Matière *'}
                </label>
                <select
                  data-testid="lesson-subject-select"
                  value={lessonSubjectId}
                  onChange={(e) => {
                    setLessonSubjectId(e.target.value);
                    setLessonUnitId(null);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'ar' ? s.titleAr : s.titleFr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar'
                    ? 'الموقع التنظيمي (الوحدة / الفصل — أو مباشرة تحت المادة)'
                    : 'Emplacement (Unité / Chapitre — ou racine de la matière)'}
                </label>
                <select
                  value={lessonUnitId || ''}
                  onChange={(e) => setLessonUnitId(e.target.value || null)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="">
                    {lang === 'ar'
                      ? '— مباشرة تحت المادة الدراسية (بدون وحدة إلزامية) —'
                      : '— Directement sous la matière —'}
                  </option>
                  {units
                    .filter((u) => u.subjectId === lessonSubjectId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {lang === 'ar' ? u.titleAr : u.titleFr}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Titles & Short Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'عنوان الدرس (بالعربية — RTL) *' : 'Titre de la leçon (AR) *'}
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  data-testid="lesson-title-ar-input"
                  value={lessonTitleAr}
                  onChange={(e) => setLessonTitleAr(e.target.value)}
                  placeholder="التحولات الاقتصادية والمالية والاجتماعية والفكرية في العالم في القرن 19م"
                  className="w-full px-3 py-2.5 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'عنوان الدرس (بالفرنسية — LTR)' : 'Titre de la leçon (FR)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  data-testid="lesson-title-fr-input"
                  value={lessonTitleFr}
                  onChange={(e) => setLessonTitleFr(e.target.value)}
                  placeholder="Les transformations économiques, financières et sociales au XIXe siècle"
                  className="w-full px-3 py-2.5 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'تقديم إشكالي / وصف موجز (AR)' : 'Description courte (AR)'}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  data-testid="lesson-desc-ar-input"
                  value={lessonDescAr}
                  onChange={(e) => setLessonDescAr(e.target.value)}
                  placeholder="تأطير إشكالي ومفاهيمي للدرس..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'وصف موجز (FR)' : 'Description courte (FR)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={lessonDescFr}
                  onChange={(e) => setLessonDescFr(e.target.value)}
                  placeholder="Introduction problématique et concepts clés..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
            </div>

            {/* Modern Formatting Toolbar */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#4F46E5] font-semibold pe-2">
                  {lang === 'ar' ? 'شريط أدوات التحرير:' : 'Barre d’outils :'}
                </span>
                {(
                  [
                    {
                      type: 'heading' as LessonBlockType,
                      icon: <Heading1 className="w-3.5 h-3.5" />,
                      labelAr: 'عنوان رئيسي',
                      labelFr: 'Titre H2',
                    },
                    {
                      type: 'subheading' as LessonBlockType,
                      icon: <Heading2 className="w-3.5 h-3.5" />,
                      labelAr: 'عنوان فرعي',
                      labelFr: 'Sous-titre H3',
                    },
                    {
                      type: 'paragraph' as LessonBlockType,
                      icon: <FileText className="w-3.5 h-3.5" />,
                      labelAr: 'فقرة تحليلية',
                      labelFr: 'Paragraphe',
                    },
                    {
                      type: 'numbered_list' as LessonBlockType,
                      icon: <ListOrdered className="w-3.5 h-3.5" />,
                      labelAr: 'قائمة مرقمة',
                      labelFr: 'Liste numérotée',
                    },
                    {
                      type: 'bullet_list' as LessonBlockType,
                      icon: <List className="w-3.5 h-3.5" />,
                      labelAr: 'قائمة نقطية',
                      labelFr: 'Liste à puces',
                    },
                    {
                      type: 'table' as LessonBlockType,
                      icon: <Table className="w-3.5 h-3.5" />,
                      labelAr: 'جدول مقارن',
                      labelFr: 'Tableau',
                    },
                    {
                      type: 'image' as LessonBlockType,
                      icon: <ImageIcon className="w-3.5 h-3.5" />,
                      labelAr: 'صورة + تعليق',
                      labelFr: 'Image + Légende',
                    },
                    {
                      type: 'important_note' as LessonBlockType,
                      icon: <Info className="w-3.5 h-3.5" />,
                      labelAr: 'ملاحظة هامة',
                      labelFr: 'Note importante',
                    },
                    {
                      type: 'quote' as LessonBlockType,
                      icon: <Quote className="w-3.5 h-3.5" />,
                      labelAr: 'استشهاد / نص تاريخي',
                      labelFr: 'Citation',
                    },
                    {
                      type: 'external_link' as LessonBlockType,
                      icon: <Link2 className="w-3.5 h-3.5" />,
                      labelAr: 'رابط تربوي خارجي',
                      labelFr: 'Lien externe',
                    },
                  ]
                ).map((tool) => (
                  <button
                    key={tool.type}
                    type="button"
                    data-testid={`toolbar-add-${tool.type}`}
                    onClick={() => addLessonBlock(tool.type)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-[#FFFFFF] text-[#111827] border border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors cursor-pointer"
                  >
                    {tool.icon}
                    <span>{lang === 'ar' ? tool.labelAr : tool.labelFr}</span>
                  </button>
                ))}
              </div>

              {/* Writing Direction Switcher (Arabic RTL vs French LTR) */}
              <div className="flex items-center bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLessonWritingLang('ar')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer ${
                    lessonWritingLang === 'ar'
                      ? 'bg-[#4F46E5] text-[#FFFFFF] font-semibold'
                      : 'text-[#64748B]'
                  }`}
                >
                  تحرير بالعربية (RTL)
                </button>
                <button
                  type="button"
                  onClick={() => setLessonWritingLang('fr')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer ${
                    lessonWritingLang === 'fr'
                      ? 'bg-[#4F46E5] text-[#FFFFFF] font-semibold'
                      : 'text-[#64748B]'
                  }`}
                >
                  Édition Français (LTR)
                </button>
              </div>
            </div>

            {/* Main Educational Content Textarea (RTL / LTR) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#111827]">
                {lessonWritingLang === 'ar'
                  ? 'المحتوى التربوي الرئيسي للدرس (تحرير بالعربية — RTL):'
                  : 'Contenu pédagogique principal de la leçon (Édition Française — LTR) :'}
              </label>
              {lessonWritingLang === 'ar' ? (
                <textarea
                  rows={6}
                  dir="rtl"
                  data-testid="lesson-content-ar-textarea"
                  value={lessonContentAr}
                  onChange={(e) => setLessonContentAr(e.target.value)}
                  placeholder="اكتب المتن التحليلي للدرس والمحاور الكبرى..."
                  className="w-full p-4 text-sm rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] leading-relaxed focus:outline-none focus:border-[#4F46E5]"
                />
              ) : (
                <textarea
                  rows={6}
                  dir="ltr"
                  data-testid="lesson-content-fr-textarea"
                  value={lessonContentFr}
                  onChange={(e) => setLessonContentFr(e.target.value)}
                  placeholder="Rédigez le corps analytique de la leçon..."
                  className="w-full p-4 text-sm rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] leading-relaxed focus:outline-none focus:border-[#4F46E5]"
                />
              )}
            </div>

            {/* Structured Rich Blocks Editor List */}
            {lessonBlocks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#111827]">
                  {lang === 'ar'
                    ? `العناصر والفقرات المهيكلة المضافة للدرس (${lessonBlocks.length}):`
                    : `Blocs structurés de la leçon (${lessonBlocks.length}) :`}
                </h4>
                <div className="space-y-3">
                  {lessonBlocks.map((blk, bIdx) => (
                    <div
                      key={blk.id}
                      className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-tabular font-bold text-[#4F46E5]">
                          0{bIdx + 1} · {blk.type.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLessonBlock(blk.id)}
                          className="text-red-600 hover:underline cursor-pointer"
                        >
                          {lang === 'ar' ? 'حذف العنصر' : 'Retirer'}
                        </button>
                      </div>

                      {(blk.type === 'image' || blk.type === 'external_link') && (
                        <input
                          type="url"
                          value={blk.url || ''}
                          onChange={(e) => updateLessonBlock(blk.id, { url: e.target.value })}
                          placeholder={
                            blk.type === 'image'
                              ? 'https://.../image.jpg'
                              : 'https://.../ressource-educative'
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0]"
                        />
                      )}

                      <textarea
                        rows={blk.type === 'heading' || blk.type === 'subheading' ? 1 : 3}
                        value={blk.text}
                        onChange={(e) => updateLessonBlock(blk.id, { text: e.target.value })}
                        placeholder={
                          blk.type === 'table'
                            ? 'العمود 1 | العمود 2 | العمود 3'
                            : lang === 'ar'
                              ? 'محتوى العنصر...'
                              : 'Contenu du bloc...'
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0]"
                      />

                      {(blk.type === 'image' ||
                        blk.type === 'table' ||
                        blk.type === 'quote') && (
                        <input
                          type="text"
                          value={blk.caption || ''}
                          onChange={(e) =>
                            updateLessonBlock(blk.id, { caption: e.target.value })
                          }
                          placeholder={
                            lang === 'ar'
                              ? 'التعليق التوضيحي / المصدر التاريخي أو الجغرافي...'
                              : 'Légende / Source documentaire...'
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attach Multiple Educational Files / Resources to Lesson */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
              <span className="block text-xs font-bold text-[#111827]">
                {lang === 'ar'
                  ? 'إرفاق ملفات وموارد تربوية بالدرس (PDF / DOCX / وثائق):'
                  : 'Attacher des fichiers et supports pédagogiques à la leçon :'}
              </span>
              {resources.length === 0 ? (
                <p className="text-xs text-[#64748B]">
                  {lang === 'ar'
                    ? 'يمكنك رفع ملفات PDF أو مستندات من تبويب (D. الموارد والملفات) ثم إرفاقها بالدرس.'
                    : 'Téléversez des fichiers depuis l’onglet D. Ressources pour les attacher ici.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {resources.map((res) => {
                    const attached = lessonAttachmentIds.includes(res.id);
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() =>
                          setLessonAttachmentIds((prev) =>
                            prev.includes(res.id)
                              ? prev.filter((x) => x !== res.id)
                              : [...prev, res.id]
                          )
                        }
                        className={`p-2.5 rounded-lg border text-start text-xs cursor-pointer transition-colors ${
                          attached
                            ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5] font-semibold'
                            : 'bg-[#FFFFFF] text-[#111827] border-[#E2E8F0]'
                        }`}
                      >
                        <span className="font-mono-tabular text-[#4F46E5] block">
                          {res.fileType} · {res.fileName}
                        </span>
                        <span className="block truncate">
                          {lang === 'ar' ? res.titleAr : res.titleFr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Audience Targeting for Lesson */}
            <AudienceTargetingConfigEditor
              allowInheritance={true}
              audienceMode={lessonAudienceMode}
              onChangeAudienceMode={setLessonAudienceMode}
              audienceConfig={lessonAudience}
              onChangeAudienceConfig={setLessonAudience}
              itemStatus="published"
              parentNode={resolveParentNodeForChild(lessonSubjectId, lessonUnitId)}
            />

            {/* Explicit Actions: Preview, Save as Draft, Publish Explicitly */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                data-testid="preview-lesson-btn"
                onClick={() =>
                  setPreviewLesson({
                    id: editingLessonId || 'preview_temp',
                    subjectId: lessonSubjectId,
                    unitId: lessonUnitId,
                    titleAr: lessonTitleAr || 'معاينة الدرس',
                    titleFr: lessonTitleFr || lessonTitleAr || 'Aperçu de la leçon',
                    descriptionAr: lessonDescAr,
                    descriptionFr: lessonDescFr,
                    contentAr: lessonContentAr,
                    contentFr: lessonContentFr,
                    blocks: lessonBlocks,
                    attachmentIds: lessonAttachmentIds,
                    order: 1,
                    status: 'draft',
                    audienceMode: lessonAudienceMode,
                    audienceConfig: lessonAudience,
                    effectiveStatus: 'draft',
                    effectiveGroupKeys: [...ALL_COHORT_GROUP_KEYS],
                    version: 1,
                    authorUid: '',
                    createdAt: '',
                    updatedAt: '',
                    publishedAt: null,
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#F8FAFC] text-[#111827] border border-[#E2E8F0] hover:border-[#4F46E5] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>{lang === 'ar' ? 'معاينة الدرس (Preview Mode)' : 'Aperçu de la leçon'}</span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  data-testid="save-lesson-draft-btn"
                  onClick={async () => {
                    const id = await saveLesson({
                      id: editingLessonId || undefined,
                      subjectId: lessonSubjectId,
                      unitId: lessonUnitId,
                      titleAr: lessonTitleAr,
                      titleFr: lessonTitleFr,
                      descriptionAr: lessonDescAr,
                      descriptionFr: lessonDescFr,
                      contentAr: lessonContentAr,
                      contentFr: lessonContentFr,
                      blocks: lessonBlocks,
                      attachmentIds: lessonAttachmentIds,
                      status: 'draft',
                      audienceMode: lessonAudienceMode,
                      audienceConfig: lessonAudience,
                    });
                    if (id) resetLessonForm();
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/30 hover:bg-[#4F46E5] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ar'
                      ? 'حفظ كمسودة (Save Draft — لا يُنشر للتلاميذ)'
                      : 'Enregistrer comme brouillon'}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="publish-lesson-btn"
                  onClick={async () => {
                    const id = await saveLesson({
                      id: editingLessonId || undefined,
                      subjectId: lessonSubjectId,
                      unitId: lessonUnitId,
                      titleAr: lessonTitleAr,
                      titleFr: lessonTitleFr,
                      descriptionAr: lessonDescAr,
                      descriptionFr: lessonDescFr,
                      contentAr: lessonContentAr,
                      contentFr: lessonContentFr,
                      blocks: lessonBlocks,
                      attachmentIds: lessonAttachmentIds,
                      status: 'published',
                      audienceMode: lessonAudienceMode,
                      audienceConfig: lessonAudience,
                    });
                    if (id) resetLessonForm();
                  }}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold rounded-lg bg-[#4F46E5] text-[#FFFFFF] hover:bg-[#6366F1] transition-colors cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ar'
                      ? 'نشر الدرس رسمياً للأفواج المستهدفة (Publish)'
                      : 'Publier officiellement la leçon'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Lessons Directory Table */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#111827]">
              {lang === 'ar'
                ? `سجل الدروس التربوية (${lessons.length})`
                : `Répertoire des Leçons (${lessons.length})`}
            </h3>

            {lessons.length === 0 ? (
              <p className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-center text-[#64748B]">
                {lang === 'ar'
                  ? 'لا توجد دروس مسجلة بعد. استخدم المحرر أعلاه لإنشاء الدروس وحفظها كمسودات أو نشرها للأفواج.'
                  : 'Aucune leçon enregistrée. Utilisez l’éditeur ci-dessus pour créer votre première leçon.'}
              </p>
            ) : (
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
                {filterAndSortItems(lessons)
                  .slice((currentPageIndex - 1) * pageSize, currentPageIndex * pageSize)
                  .map((les) => {
                    const subj = subjects.find((s) => s.id === les.subjectId);
                    const unit = les.unitId ? units.find((u) => u.id === les.unitId) : null;
                    return (
                      <div
                        key={les.id}
                        data-testid={`cms-lesson-row-${les.id}`}
                        className="p-4 bg-[#FFFFFF] hover:bg-[#F8FAFC] flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono-tabular font-bold text-[#4F46E5]">
                              #{les.order} · v{les.version}
                            </span>
                            <span className="font-semibold text-[#111827]">
                              [{subj ? (lang === 'ar' ? subj.titleAr : subj.titleFr) : les.subjectId}]
                            </span>
                            {unit && (
                              <span className="text-[#64748B]">
                                ↳ {lang === 'ar' ? unit.titleAr : unit.titleFr}
                              </span>
                            )}
                            {renderStatusBadge(les.status)}
                          </div>
                          <p className="font-bold text-sm text-[#111827]">
                            {les.titleAr} {les.titleFr ? `/ ${les.titleFr}` : ''}
                          </p>
                          <p className="text-[11px] font-mono-tabular text-[#64748B]">
                            {formatEffectiveAudienceSummary(les.effectiveGroupKeys, lang)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewLesson(les)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#4F46E5]" />
                            <span>{lang === 'ar' ? 'معاينة' : 'Aperçu'}</span>
                          </button>

                          {les.status !== 'published' ? (
                            <button
                              type="button"
                              data-testid={`quick-publish-lesson-${les.id}`}
                              onClick={() => void updateLessonStatus(les.id, 'published')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
                            >
                              {lang === 'ar' ? 'نشر (Publish)' : 'Publier'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              data-testid={`quick-unpublish-lesson-${les.id}`}
                              onClick={() => void updateLessonStatus(les.id, 'unpublished')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#EEF2FF] text-[#4F46E5] font-semibold cursor-pointer"
                            >
                              {lang === 'ar' ? 'إلغاء النشر (Unpublish)' : 'Dépublier'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingLessonId(les.id);
                              setLessonSubjectId(les.subjectId);
                              setLessonUnitId(les.unitId);
                              setLessonTitleAr(les.titleAr);
                              setLessonTitleFr(les.titleFr);
                              setLessonDescAr(les.descriptionAr);
                              setLessonDescFr(les.descriptionFr);
                              setLessonContentAr(les.contentAr);
                              setLessonContentFr(les.contentFr);
                              setLessonBlocks(les.blocks || []);
                              setLessonAttachmentIds(les.attachmentIds || []);
                              setLessonAudienceMode(les.audienceMode);
                              setLessonAudience(les.audienceConfig);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold cursor-pointer"
                          >
                            {lang === 'ar' ? 'تعديل' : 'Modifier'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPendingDelete({
                                type: 'lesson',
                                id: les.id,
                                title: les.titleAr,
                              })
                            }
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===============================================================
          SECTION D: EDUCATIONAL RESOURCE MANAGEMENT
         =============================================================== */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              let fileToUpload = selectedUploadFile;
              if (!fileToUpload && !editingResourceId && simulatedFileName.trim()) {
                const blob = new Blob(
                  [`الأستاذ رضوان راكب — وثيقة تربوية: ${resTitleAr}`],
                  { type: 'application/pdf' }
                );
                fileToUpload = new File([blob], simulatedFileName.trim(), {
                  type: 'application/pdf',
                });
              }

              const id = await uploadAndSaveResource(
                {
                  id: editingResourceId || undefined,
                  titleAr: resTitleAr,
                  titleFr: resTitleFr,
                  descriptionAr: resDescAr,
                  descriptionFr: resDescFr,
                  category: resCategory,
                  subjectId: resSubjectId,
                  unitId: resUnitId,
                  lessonId: resLessonId,
                  status: resStatus,
                  audienceMode: resAudienceMode,
                  audienceConfig: resAudience,
                },
                fileToUpload
              );
              if (id) resetResourceForm();
            }}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#4F46E5]" />
                <span>
                  {editingResourceId
                    ? lang === 'ar'
                      ? 'تعديل بيانات أو استبدال الملف التربوي'
                      : 'Modifier ou remplacer la ressource'
                    : lang === 'ar'
                      ? 'رفع ملف تربوي محمي إلى Firebase Storage (PDF, DOCX, PPTX, صور)'
                      : 'Téléverser une ressource protégée (PDF, DOCX, PPTX, Images)'}
                </span>
              </h3>
              {editingResourceId && (
                <button
                  type="button"
                  onClick={resetResourceForm}
                  className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء التعديل' : 'Nouvelle ressource'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'المادة الدراسية *' : 'Matière *'}
                </label>
                <select
                  value={resSubjectId}
                  onChange={(e) => setResSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'ar' ? s.titleAr : s.titleFr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'ربط بدرس معين (اختياري)' : 'Leçon associée (optionnel)'}
                </label>
                <select
                  value={resLessonId || ''}
                  onChange={(e) => setResLessonId(e.target.value || null)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="">
                    {lang === 'ar' ? '— مورد عام للمادة —' : '— Ressource générale —'}
                  </option>
                  {lessons
                    .filter((l) => l.subjectId === resSubjectId)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {lang === 'ar' ? l.titleAr : l.titleFr}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'تصنيف المورد' : 'Catégorie'}
                </label>
                <select
                  value={resCategory}
                  onChange={(e) => setResCategory(e.target.value as ResourceCategoryType)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="summary">{lang === 'ar' ? 'ملخص مركب' : 'Synthèse'}</option>
                  <option value="archive_doc">
                    {lang === 'ar' ? 'ملف وثائقي / تاريخي' : 'Dossier documentaire'}
                  </option>
                  <option value="map_atlas">
                    {lang === 'ar' ? 'خريطة / مبيان جغرافي' : 'Carte / Graphique'}
                  </option>
                  <option value="exercise">
                    {lang === 'ar' ? 'سلسلة تمارين تطبيقية' : 'Série d’exercices'}
                  </option>
                  <option value="examination_paper">
                    {lang === 'ar' ? 'موضوع امتحان مرجعي' : 'Sujet d’examen'}
                  </option>
                  <option value="general">{lang === 'ar' ? 'دعامة عامة' : 'Support général'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'حالة النشر' : 'Statut'}
                </label>
                <select
                  value={resStatus}
                  onChange={(e) => setResStatus(e.target.value as PublicationStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="published">{lang === 'ar' ? 'منشور' : 'Publié'}</option>
                  <option value="draft">{lang === 'ar' ? 'مسودة' : 'Brouillon'}</option>
                  <option value="unpublished">{lang === 'ar' ? 'غير منشور' : 'Dépublié'}</option>
                  <option value="archived">{lang === 'ar' ? 'مؤرشف' : 'Archivé'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'عنوان الملف التربوي (AR) *' : 'Titre du fichier (AR) *'}
                </label>
                <input
                  type="text"
                  required
                  data-testid="resource-title-ar-input"
                  value={resTitleAr}
                  onChange={(e) => setResTitleAr(e.target.value)}
                  placeholder="دليل منهجية الاشتغال بالوثائق التاريخية"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'عنوان الملف التربوي (FR)' : 'Titre du fichier (FR)'}
                </label>
                <input
                  type="text"
                  value={resTitleFr}
                  onChange={(e) => setResTitleFr(e.target.value)}
                  placeholder="Guide méthodologique d’analyse de documents"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
            </div>

            {/* File Input + Filename Specification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar'
                    ? 'اختر الملف من جهازك (PDF, DOCX, PPTX, PNG, JPG — بحد أقصى 25MB):'
                    : 'Sélectionner un fichier (PDF, DOCX, PPTX, Images — max 25 Mo) :'}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.xlsx,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setSelectedUploadFile(f);
                    if (f) setSimulatedFileName(f.name);
                  }}
                  className="w-full text-xs text-[#111827]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'اسم الملف المرجعي:' : 'Nom du fichier :'}
                </label>
                <input
                  type="text"
                  data-testid="resource-filename-input"
                  value={simulatedFileName}
                  onChange={(e) => setSimulatedFileName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] font-mono-tabular"
                />
              </div>
            </div>

            <AudienceTargetingConfigEditor
              allowInheritance={true}
              audienceMode={resAudienceMode}
              onChangeAudienceMode={setResAudienceMode}
              audienceConfig={resAudience}
              onChangeAudienceConfig={setResAudience}
              itemStatus={resStatus}
              parentNode={resolveParentNodeForChild(resSubjectId, resUnitId)}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                data-testid="save-resource-btn"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#4F46E5] text-[#FFFFFF] hover:bg-[#6366F1] transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {editingResourceId
                    ? lang === 'ar'
                      ? 'حفظ تعديلات المورد'
                      : 'Mettre à jour la ressource'
                    : lang === 'ar'
                      ? 'رفع وحفظ المورد التربوي المحمي'
                      : 'Téléverser et enregistrer la ressource'}
                </span>
              </button>
            </div>
          </form>

          {/* Resources List */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#111827]">
              {lang === 'ar'
                ? `المكتبة الوثائقية والملفات المحمية (${resources.length})`
                : `Répertoire des Ressources Protégées (${resources.length})`}
            </h3>

            {resources.length === 0 ? (
              <p className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-center text-[#64748B]">
                {lang === 'ar'
                  ? 'لا توجد ملفات مرفوعة حالياً.'
                  : 'Aucun fichier téléversé pour le moment.'}
              </p>
            ) : (
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
                {filterAndSortItems(resources).map((res) => (
                  <div
                    key={res.id}
                    className="p-4 bg-[#FFFFFF] hover:bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-tabular font-bold text-[#4F46E5]">
                          {res.fileType} · {res.fileName}
                        </span>
                        {renderStatusBadge(res.status)}
                      </div>
                      <p className="font-bold text-sm text-[#111827]">
                        {res.titleAr} {res.titleFr ? `/ ${res.titleFr}` : ''}
                      </p>
                      <p className="text-[11px] font-mono-tabular text-[#64748B]">
                        {formatEffectiveAudienceSummary(res.effectiveGroupKeys, lang)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          const url = await requestProtectedResourceDownload(res);
                          if (url) {
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = res.fileName;
                            a.click();
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4F46E5] text-[#FFFFFF] font-semibold cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تحميل أصلي' : 'Télécharger'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingResourceId(res.id);
                          setResTitleAr(res.titleAr);
                          setResTitleFr(res.titleFr);
                          setResDescAr(res.descriptionAr);
                          setResDescFr(res.descriptionFr);
                          setResCategory(res.category);
                          setResSubjectId(res.subjectId);
                          setResUnitId(res.unitId);
                          setResLessonId(res.lessonId);
                          setResStatus(res.status);
                          setResAudienceMode(res.audienceMode);
                          setResAudience(res.audienceConfig);
                          setSimulatedFileName(res.fileName);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold cursor-pointer"
                      >
                        {lang === 'ar' ? 'تعديل' : 'Modifier'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingDelete({
                            type: 'resource',
                            id: res.id,
                            title: res.titleAr,
                          })
                        }
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===============================================================
          SECTION E: EXAMINATION & EXERCISE MANAGEMENT
         =============================================================== */}
      {activeTab === 'examinations' && (
        <div className="space-y-6">
          <TeacherExamPublishWorkspace />
        </div>
      )}
      {activeTab === ('legacy_examinations' as unknown as CmsSubTabId) && (
        <div className="space-y-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const id = await saveExamination({
                id: editingExamId || undefined,
                titleAr: examTitleAr,
                titleFr: examTitleFr,
                descriptionAr: examDescAr,
                descriptionFr: examDescFr,
                examKind,
                subjectId: examSubjectId,
                unitId: examUnitId,
                attachmentIds: examAttachmentIds,
                durationMinutes: examDuration,
                gradingScale: examScale,
                status: examStatus,
                audienceMode: examAudienceMode,
                audienceConfig: examAudience,
              });
              if (id) resetExamForm();
            }}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-2xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#4F46E5]" />
                <span>
                  {editingExamId
                    ? lang === 'ar'
                      ? 'تعديل الامتحان أو التمرين'
                      : 'Modifier l’examen ou l’exercice'
                    : lang === 'ar'
                      ? 'إضافة امتحان موحد، فرض محروس، أو سلسلة تمارين'
                      : 'Créer un examen, contrôle continu ou exercice'}
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'المادة الدراسية *' : 'Matière *'}
                </label>
                <select
                  value={examSubjectId}
                  onChange={(e) => setExamSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'ar' ? s.titleAr : s.titleFr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'نوع التقويم' : 'Type d’évaluation'}
                </label>
                <select
                  value={examKind}
                  onChange={(e) => setExamKind(e.target.value as ExamExerciseKind)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="examination">
                    {lang === 'ar' ? 'امتحان إشهادي / موحد' : 'Examen normalisé'}
                  </option>
                  <option value="continuous_assessment">
                    {lang === 'ar' ? 'فرض محروس (Contrôle continu)' : 'Contrôle continu'}
                  </option>
                  <option value="exercise">
                    {lang === 'ar' ? 'تمرين منهجي تطبيقي' : 'Exercice d’application'}
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'المدة الزمنية (بالدقائق)' : 'Durée (minutes)'}
                </label>
                <input
                  type="number"
                  min={15}
                  max={300}
                  value={examDuration}
                  onChange={(e) => setExamDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'حالة النشر' : 'Statut'}
                </label>
                <select
                  value={examStatus}
                  onChange={(e) => setExamStatus(e.target.value as PublicationStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                >
                  <option value="published">{lang === 'ar' ? 'منشور' : 'Publié'}</option>
                  <option value="draft">{lang === 'ar' ? 'مسودة' : 'Brouillon'}</option>
                  <option value="unpublished">{lang === 'ar' ? 'غير منشور' : 'Dépublié'}</option>
                  <option value="archived">{lang === 'ar' ? 'مؤرشف' : 'Archivé'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'عنوان الامتحان / التمرين (AR) *' : 'Intitulé (AR) *'}
                </label>
                <input
                  type="text"
                  required
                  data-testid="exam-title-ar-input"
                  value={examTitleAr}
                  onChange={(e) => setExamTitleAr(e.target.value)}
                  placeholder="الفرض المحروس رقم 1 — الأسدس الأول"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#111827]">
                  {lang === 'ar' ? 'عنوان الامتحان / التمرين (FR)' : 'Intitulé (FR)'}
                </label>
                <input
                  type="text"
                  value={examTitleFr}
                  onChange={(e) => setExamTitleFr(e.target.value)}
                  placeholder="Contrôle Continu N°1 — Semestre 1"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]"
                />
              </div>
            </div>

            <AudienceTargetingConfigEditor
              allowInheritance={true}
              audienceMode={examAudienceMode}
              onChangeAudienceMode={setExamAudienceMode}
              audienceConfig={examAudience}
              onChangeAudienceConfig={setExamAudience}
              itemStatus={examStatus}
              parentNode={resolveParentNodeForChild(examSubjectId, examUnitId)}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                data-testid="save-exam-btn"
                className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#4F46E5] text-[#FFFFFF] hover:bg-[#6366F1] transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'حفظ الامتحان / التمرين' : 'Enregistrer l’évaluation'}
              </button>
            </div>
          </form>

          {/* Examinations Table */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#111827]">
              {lang === 'ar'
                ? `سجل الامتحانات والتمارين (${examinations.length})`
                : `Répertoire des Examens et Exercices (${examinations.length})`}
            </h3>
            {examinations.length === 0 ? (
              <p className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-center text-[#64748B]">
                {lang === 'ar'
                  ? 'لا توجد امتحانات أو تمارين مسجلة حالياً.'
                  : 'Aucun examen ou exercice enregistré.'}
              </p>
            ) : (
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
                {filterAndSortItems(examinations).map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 bg-[#FFFFFF] hover:bg-[#F8FAFC] flex items-center justify-between gap-4 text-xs transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tabular font-bold text-[#4F46E5]">
                          {ex.examKind.toUpperCase()} · {ex.durationMinutes} min · {ex.gradingScale}
                        </span>
                        {renderStatusBadge(ex.status)}
                      </div>
                      <p className="font-bold text-sm text-[#111827]">
                        {ex.titleAr} {ex.titleFr ? `/ ${ex.titleFr}` : ''}
                      </p>
                      <p className="text-[11px] font-mono-tabular text-[#64748B]">
                        {formatEffectiveAudienceSummary(ex.effectiveGroupKeys, lang)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingDelete({
                          type: 'examination',
                          id: ex.id,
                          title: ex.titleAr,
                        })
                      }
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===============================================================
          SECTIONS F, G, H: DRAFTS, PUBLISHED CONTENT, ARCHIVED CONTENT
         =============================================================== */}
      {(activeTab === 'drafts' || activeTab === 'published' || activeTab === 'archived') && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              {activeTab === 'drafts' && <FileEdit className="w-4 h-4 text-[#4F46E5]" />}
              {activeTab === 'published' && <FileCheck className="w-4 h-4 text-emerald-600" />}
              {activeTab === 'archived' && <Archive className="w-4 h-4 text-[#64748B]" />}
              <span>
                {activeTab === 'drafts'
                  ? lang === 'ar'
                    ? 'F. إدارة المسودات والمحتوى غير المنشور (غير مرئي للتلاميذ)'
                    : 'F. Gestion des Brouillons et Contenus Dépubliés (Invisibles aux élèves)'
                  : activeTab === 'published'
                    ? lang === 'ar'
                      ? 'G. المحتوى المنشور رسمياً للتلاميذ حسب الأفواج'
                      : 'G. Contenu Publié Officiellement aux Élèves'
                    : lang === 'ar'
                      ? 'H. أرشيف المحتوى التربوي'
                      : 'H. Contenu Pédagogique Archivé'}
              </span>
            </h3>
          </div>

          {(() => {
            const matchingLessons = filterAndSortItems(lessons).filter((l) =>
              activeTab === 'drafts'
                ? l.status === 'draft' || l.status === 'unpublished'
                : activeTab === 'published'
                  ? l.status === 'published' || l.status === 'scheduled'
                  : l.status === 'archived'
            );

            if (matchingLessons.length === 0) {
              return (
                <p className="p-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-center text-[#64748B]">
                  {lang === 'ar'
                    ? 'لا توجد عناصر مطابقة في هذا القسم حالياً.'
                    : 'Aucun élément correspondant dans cette section.'}
                </p>
              );
            }

            return (
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
                {matchingLessons.map((les) => (
                  <div
                    key={les.id}
                    className="p-4 bg-[#FFFFFF] hover:bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tabular font-bold text-[#4F46E5]">
                          v{les.version}
                        </span>
                        {renderStatusBadge(les.status)}
                      </div>
                      <p className="font-bold text-sm text-[#111827]">
                        {les.titleAr} {les.titleFr ? `/ ${les.titleFr}` : ''}
                      </p>
                      <p className="text-[11px] font-mono-tabular text-[#64748B]">
                        {formatEffectiveAudienceSummary(les.effectiveGroupKeys, lang)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewLesson(les)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] cursor-pointer"
                      >
                        {lang === 'ar' ? 'معاينة' : 'Aperçu'}
                      </button>
                      {les.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => void updateLessonStatus(les.id, 'published')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
                        >
                          {lang === 'ar' ? 'نشر الآن' : 'Publier'}
                        </button>
                      )}
                      {les.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => void updateLessonStatus(les.id, 'unpublished')}
                          className="px-3 py-1.5 rounded-lg bg-[#EEF2FF] text-[#4F46E5] font-semibold cursor-pointer"
                        >
                          {lang === 'ar' ? 'إلغاء النشر' : 'Dépublier'}
                        </button>
                      )}
                      {les.status !== 'archived' ? (
                        <button
                          type="button"
                          onClick={() => void updateLessonStatus(les.id, 'archived')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] cursor-pointer"
                        >
                          {lang === 'ar' ? 'أرشفة' : 'Archiver'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void updateLessonStatus(les.id, 'draft')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#4F46E5] text-[#FFFFFF] font-semibold cursor-pointer"
                        >
                          {lang === 'ar' ? 'استعادة كمسودة' : 'Restaurer en brouillon'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Lesson Preview Modal */}
      {previewLesson && (
        <LessonReaderModal
          lesson={previewLesson}
          subject={subjects.find((s) => s.id === previewLesson.subjectId)}
          unitChain={
            previewLesson.unitId
              ? units.filter((u) => u.id === previewLesson.unitId)
              : []
          }
          attachedResources={resources.filter((r) =>
            previewLesson.attachmentIds.includes(r.id)
          )}
          onClose={() => setPreviewLesson(null)}
          onDownloadResource={async (res) => {
            const url = await requestProtectedResourceDownload(res);
            if (url) {
              const a = document.createElement('a');
              a.href = url;
              a.download = res.fileName;
              a.click();
            }
          }}
          isPreviewMode={true}
        />
      )}
    </div>
  );
}
