import { BilingualText } from '../types/academic';
import { FirestoreUserProfile } from './authSecurityRules';
import {
  ALL_COHORT_GROUP_KEYS,
  AudienceConfig,
  canUserAccessContentItem,
  CmsExamination,
  CohortGroupKey,
  PublicationStatus,
} from './cmsContentRules';

export type ExamSubjectSlug = 'history' | 'geography';

export type OfficialExamType = 'regional' | 'national';

export type OfficialExamSession = 'normal' | 'resit';

export type ExamSemesterCode = 'S1' | 'S2' | 'annual';

export type ExamTargetLevelOption = '1bac' | '2bac' | 'all';

export interface StructuredExamMetadata {
  subjectSlug: ExamSubjectSlug;
  examType: OfficialExamType;
  examYear: number;
  examSession: OfficialExamSession;
  semester: ExamSemesterCode;
  targetLevel: ExamTargetLevelOption;
  targetGroups: ('G1' | 'G2' | 'G3' | 'G4')[];
  allGroupsSelected: boolean;
  pdfResourceId: string;
  pdfFileName: string;
  pdfFileSize: number;
  customNotesAr?: string;
}

const EXAM_METADATA_PREFIX = '__EXAM_META_V1__:';

export const AVAILABLE_EXAM_YEARS: number[] = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018,
];

export function subjectSlugToId(slug: ExamSubjectSlug): string {
  return slug === 'geography' ? 'subject_geography' : 'subject_history';
}

export function subjectIdToSlug(subjectId: string): ExamSubjectSlug {
  const normalized = (subjectId || '').trim().toLowerCase();
  if (normalized.includes('geography') || normalized === 'geography') {
    return 'geography';
  }
  return 'history';
}

export function isExamMatchingSubject(
  exam: Pick<CmsExamination, 'subjectId' | 'descriptionFr'>,
  targetSlug: ExamSubjectSlug
): boolean {
  const expectedSubjectId = subjectSlugToId(targetSlug);
  const normalizedSubjectId = (exam.subjectId || '').trim().toLowerCase();
  if (normalizedSubjectId === expectedSubjectId || normalizedSubjectId === targetSlug) {
    return true;
  }
  const decoded = decodeExamMetadataFromExam(exam);
  return decoded.subjectSlug === targetSlug && normalizedSubjectId === expectedSubjectId;
}

export function getDefaultExamTitleAr(
  examType: OfficialExamType,
  semester?: ExamSemesterCode
): string {
  if (examType === 'national') {
    return 'الامتحان الوطني الموحد';
  }
  if (semester === 'S1') {
    return 'الامتحان الجهوي الموحد';
  }
  return 'الامتحان الجهوي الموحد';
}

export function getDefaultExamTitleFr(examType: OfficialExamType): string {
  return examType === 'national'
    ? 'Examen National Unifié du Baccalauréat'
    : 'Examen Régional Unifié du Baccalauréat';
}

export function formatExamSessionSubtitleAr(
  session: OfficialExamSession,
  year: number
): string {
  if (session === 'resit') {
    return `الدورة الاستدراكية ${year}`;
  }
  return `دورة يونيو ${year}`;
}

export function formatExamSessionLabelAr(session: OfficialExamSession): string {
  return session === 'resit' ? 'الدورة الاستدراكية' : 'الدورة العادية';
}

export function formatExamTypeBadgeAr(examType: OfficialExamType): string {
  return examType === 'national' ? 'وطني' : 'جهوي';
}

export function formatExamTypeFullAr(examType: OfficialExamType): string {
  return examType === 'national' ? 'الامتحان الوطني' : 'الامتحان الجهوي';
}

export function formatExamLevelShortAr(
  targetLevel: ExamTargetLevelOption,
  semester?: ExamSemesterCode
): string {
  if (targetLevel === '2bac') {
    return 'الثانية';
  }
  if (targetLevel === '1bac') {
    return 'الأولى';
  }
  if (semester === 'S2') {
    return 'الثانية';
  }
  return 'الأولى';
}

export function formatExamLevelFullAr(targetLevel: ExamTargetLevelOption): string {
  if (targetLevel === '2bac') {
    return 'الثانية باكالوريا آداب';
  }
  if (targetLevel === '1bac') {
    return 'الأولى باكالوريا علوم';
  }
  return 'الأولى باكالوريا علوم والثانية باكالوريا آداب';
}

export function formatFileSizeLabel(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'PDF';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function encodeExamMetadata(meta: StructuredExamMetadata): string {
  const cleanPayload: StructuredExamMetadata = {
    subjectSlug: meta.subjectSlug === 'geography' ? 'geography' : 'history',
    examType: meta.examType === 'national' ? 'national' : 'regional',
    examYear: Number(meta.examYear) || 2025,
    examSession: meta.examSession === 'resit' ? 'resit' : 'normal',
    semester:
      meta.semester === 'S1' || meta.semester === 'S2' ? meta.semester : 'annual',
    targetLevel:
      meta.targetLevel === '1bac' || meta.targetLevel === '2bac'
        ? meta.targetLevel
        : 'all',
    targetGroups: Array.isArray(meta.targetGroups) ? meta.targetGroups : ['G1', 'G2', 'G3', 'G4'],
    allGroupsSelected: Boolean(meta.allGroupsSelected),
    pdfResourceId: String(meta.pdfResourceId || ''),
    pdfFileName: String(meta.pdfFileName || 'Examination.pdf'),
    pdfFileSize: Number(meta.pdfFileSize) || 0,
    customNotesAr: (meta.customNotesAr || '').trim(),
  };

  return `${EXAM_METADATA_PREFIX}${JSON.stringify(cleanPayload)}`;
}

export function decodeExamMetadataFromExam(
  exam: Partial<Pick<CmsExamination, 'subjectId' | 'descriptionAr' | 'descriptionFr' | 'attachmentIds' | 'effectiveGroupKeys'>>
): StructuredExamMetadata {
  const fallbackSlug = subjectIdToSlug(exam.subjectId || 'subject_history');
  const rawCandidate = String(exam.descriptionFr || '').trim();

  if (rawCandidate.startsWith(EXAM_METADATA_PREFIX)) {
    try {
      const jsonPart = rawCandidate.slice(EXAM_METADATA_PREFIX.length);
      const parsed = JSON.parse(jsonPart) as Partial<StructuredExamMetadata>;
      return {
        subjectSlug: parsed.subjectSlug === 'geography' ? 'geography' : fallbackSlug,
        examType: parsed.examType === 'national' ? 'national' : 'regional',
        examYear: Number(parsed.examYear) || 2025,
        examSession: parsed.examSession === 'resit' ? 'resit' : 'normal',
        semester:
          parsed.semester === 'S1' || parsed.semester === 'S2'
            ? parsed.semester
            : 'annual',
        targetLevel:
          parsed.targetLevel === '1bac' || parsed.targetLevel === '2bac'
            ? parsed.targetLevel
            : 'all',
        targetGroups:
          Array.isArray(parsed.targetGroups) && parsed.targetGroups.length > 0
            ? parsed.targetGroups
            : ['G1', 'G2', 'G3', 'G4'],
        allGroupsSelected:
          typeof parsed.allGroupsSelected === 'boolean' ? parsed.allGroupsSelected : true,
        pdfResourceId:
          String(parsed.pdfResourceId || exam.attachmentIds?.[0] || ''),
        pdfFileName: String(parsed.pdfFileName || 'Examination.pdf'),
        pdfFileSize: Number(parsed.pdfFileSize) || 0,
        customNotesAr: String(parsed.customNotesAr || exam.descriptionAr || ''),
      };
    } catch {
      // Fallback to heuristic extraction below
    }
  }

  // Heuristic fallback for legacy examination records
  const descAr = String(exam.descriptionAr || '');
  const yearMatch = descAr.match(/\b(20\d{2})\b/);
  const inferredYear = yearMatch ? Number(yearMatch[1]) : 2025;
  const inferredType: OfficialExamType = descAr.includes('وطني') ? 'national' : 'regional';
  const inferredSession: OfficialExamSession = descAr.includes('استدراكية') ? 'resit' : 'normal';

  const groupKeys = exam.effectiveGroupKeys || [];
  const has1Bac = groupKeys.some((k) => k.startsWith('1bac:'));
  const has2Bac = groupKeys.some((k) => k.startsWith('2bac:'));
  const inferredTargetLevel: ExamTargetLevelOption =
    has1Bac && !has2Bac ? '1bac' : !has1Bac && has2Bac ? '2bac' : 'all';

  return {
    subjectSlug: fallbackSlug,
    examType: inferredType,
    examYear: inferredYear,
    examSession: inferredSession,
    semester: 'annual',
    targetLevel: inferredTargetLevel,
    targetGroups: ['G1', 'G2', 'G3', 'G4'],
    allGroupsSelected: groupKeys.length >= 4,
    pdfResourceId: exam.attachmentIds?.[0] || '',
    pdfFileName: 'Examination.pdf',
    pdfFileSize: 0,
    customNotesAr: descAr,
  };
}

export interface PdfUploadValidationResult {
  valid: boolean;
  error?: BilingualText;
}

export function validateStrictPdfExamUpload(
  file: { name: string; size: number; type?: string } | null | undefined
): PdfUploadValidationResult {
  if (!file || !file.name || !file.name.trim()) {
    return {
      valid: false,
      error: {
        ar: 'يرجى اختيار أو سحب ملف الامتحان بصيغة PDF أولاً قبل النشر.',
        fr: 'Veuillez sélectionner ou glisser un fichier d’examen au format PDF avant de publier.',
      },
    };
  }

  const trimmedName = file.name.trim().toLowerCase();
  const isPdfExtension = trimmedName.endsWith('.pdf');
  const mime = (file.type || '').trim().toLowerCase();
  const isPdfMime = !mime || mime === 'application/pdf' || mime === 'application/x-pdf';

  if (!isPdfExtension || !isPdfMime) {
    return {
      valid: false,
      error: {
        ar: 'صيغة الملف غير مدعومة: يُسمح حصرياً برفع ملفات الامتحانات بصيغة PDF.',
        fr: 'Format non pris en charge : seuls les fichiers PDF sont autorisés pour les examens.',
      },
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: {
        ar: 'ملف PDF فارغ أو تالف. يرجى اختيار ملف PDF صالح.',
        fr: 'Le fichier PDF est vide ou corrompu.',
      },
    };
  }

  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: {
        ar: 'حجم ملف PDF يتجاوز الحد الأقصى المسموح به (25 ميغابايت).',
        fr: 'La taille du fichier PDF dépasse la limite maximale autorisée (25 Mo).',
      },
    };
  }

  return { valid: true };
}

export function buildExamAudienceConfigFromSelection(params: {
  targetLevel: ExamTargetLevelOption;
  allGroupsSelected: boolean;
  selectedGroups: ('G1' | 'G2' | 'G3' | 'G4')[];
}): AudienceConfig {
  const { targetLevel, allGroupsSelected, selectedGroups } = params;
  const groupsToUse: ('G1' | 'G2' | 'G3' | 'G4')[] =
    allGroupsSelected || selectedGroups.length === 0
      ? ['G1', 'G2', 'G3', 'G4']
      : selectedGroups;

  if (targetLevel === 'all' && (allGroupsSelected || groupsToUse.length === 4)) {
    return {
      scopePreset: 'all',
      allStudents: true,
      levels: ['1bac', '2bac'],
      branches: ['Sciences', 'Arts and Humanities'],
      groups: [...ALL_COHORT_GROUP_KEYS],
    };
  }

  const levels: ('1bac' | '2bac')[] =
    targetLevel === '1bac'
      ? ['1bac']
      : targetLevel === '2bac'
        ? ['2bac']
        : ['1bac', '2bac'];

  const branches =
    targetLevel === '1bac'
      ? (['Sciences'] as const)
      : targetLevel === '2bac'
        ? (['Arts and Humanities'] as const)
        : (['Sciences', 'Arts and Humanities'] as const);

  const groups: CohortGroupKey[] = [];
  for (const lvl of levels) {
    const prefix = lvl === '1bac' ? '1bac:Sciences' : '2bac:Arts and Humanities';
    for (const grp of groupsToUse) {
      groups.push(`${prefix}:${grp}` as CohortGroupKey);
    }
  }

  if (allGroupsSelected || groupsToUse.length === 4) {
    return {
      scopePreset: 'level',
      allStudents: false,
      levels,
      branches: [...branches],
      groups,
    };
  }

  return {
    scopePreset: groups.length === 1 ? 'single_group' : 'multiple_groups',
    allStudents: false,
    levels: [],
    branches: [],
    groups,
  };
}

export interface EnrichedPublishedExam {
  exam: CmsExamination;
  metadata: StructuredExamMetadata;
}

export function filterPublishedSubjectExaminations(params: {
  examinations: CmsExamination[];
  subjectSlug: ExamSubjectSlug;
  userProfile: FirestoreUserProfile | null | undefined;
  yearFilter?: number | 'all';
  examTypeFilter?: OfficialExamType | 'all';
  levelFilter?: ExamTargetLevelOption | 'all';
  sessionFilter?: OfficialExamSession | 'all';
}): {
  items: EnrichedPublishedExam[];
  availableYears: number[];
  availableTypes: OfficialExamType[];
  availableLevels: ('1bac' | '2bac')[];
  availableSessions: OfficialExamSession[];
} {
  const {
    examinations,
    subjectSlug,
    userProfile,
    yearFilter = 'all',
    examTypeFilter = 'all',
    levelFilter = 'all',
    sessionFilter = 'all',
  } = params;

  const subjectAccessible: EnrichedPublishedExam[] = [];

  for (const exam of examinations) {
    if (exam.status !== 'published' || exam.effectiveStatus !== 'published') {
      continue;
    }
    if (!isExamMatchingSubject(exam, subjectSlug)) {
      continue;
    }
    if (!canUserAccessContentItem(userProfile || null, exam)) {
      continue;
    }

    const metadata = decodeExamMetadataFromExam(exam);
    subjectAccessible.push({ exam, metadata });
  }

  // Sort newest year first, then by order
  subjectAccessible.sort((a, b) => {
    if (b.metadata.examYear !== a.metadata.examYear) {
      return b.metadata.examYear - a.metadata.examYear;
    }
    return a.exam.order - b.exam.order;
  });

  const yearSet = new Set<number>();
  const typeSet = new Set<OfficialExamType>();
  const levelSet = new Set<'1bac' | '2bac'>();
  const sessionSet = new Set<OfficialExamSession>();

  for (const item of subjectAccessible) {
    if (Number.isFinite(item.metadata.examYear)) {
      yearSet.add(item.metadata.examYear);
    }
    typeSet.add(item.metadata.examType);
    sessionSet.add(item.metadata.examSession);
    if (item.metadata.targetLevel === '1bac' || item.metadata.targetLevel === 'all') {
      levelSet.add('1bac');
    }
    if (item.metadata.targetLevel === '2bac' || item.metadata.targetLevel === 'all') {
      levelSet.add('2bac');
    }
  }

  const availableYears = Array.from(yearSet).sort((a, b) => b - a);
  const availableTypes = Array.from(typeSet);
  const availableLevels = Array.from(levelSet);
  const availableSessions = Array.from(sessionSet);

  const filtered = subjectAccessible.filter((item) => {
    if (yearFilter !== 'all' && item.metadata.examYear !== yearFilter) {
      return false;
    }
    if (examTypeFilter !== 'all' && item.metadata.examType !== examTypeFilter) {
      return false;
    }
    if (
      levelFilter !== 'all' &&
      item.metadata.targetLevel !== 'all' &&
      item.metadata.targetLevel !== levelFilter
    ) {
      return false;
    }
    if (sessionFilter !== 'all' && item.metadata.examSession !== sessionFilter) {
      return false;
    }
    return true;
  });

  return {
    items: filtered,
    availableYears,
    availableTypes,
    availableLevels,
    availableSessions,
  };
}

// ============================================================================
// INDEPENDENT ANNOUNCEMENTS MODULE HELPERS (Database & Cohort Access)
// ============================================================================

export interface CmsAnnouncementRecord {
  id: string;
  titleAr: string;
  titleFr: string;
  contentAr: string;
  contentFr: string;
  targetLevel: ExamTargetLevelOption;
  targetGroups: ('G1' | 'G2' | 'G3' | 'G4')[];
  allGroupsSelected: boolean;
  status: PublicationStatus;
  effectiveStatus: PublicationStatus;
  effectiveGroupKeys: CohortGroupKey[];
  authorUid: string;
  createdAt: string;
  updatedAt: string;
  publishedAtAr: string;
}

const ANNOUNCEMENT_FIRESTORE_DELIM = ' ||ANN_V1|| ';

export function encodeAnnouncementTitleForFirestore(params: {
  titleAr: string;
  contentAr: string;
  targetGroups: ('G1' | 'G2' | 'G3' | 'G4')[];
  allGroupsSelected: boolean;
  publishedAtAr: string;
}): string {
  const cleanTitle = params.titleAr.trim().slice(0, 85);
  const grpTag =
    params.allGroupsSelected || params.targetGroups.length === 4
      ? 'ALL'
      : params.targetGroups.join(',');
  const cleanDate = (params.publishedAtAr || '').trim().slice(0, 24);
  const cleanContent = params.contentAr.trim().slice(0, 95);
  const combined = `${cleanTitle}${ANNOUNCEMENT_FIRESTORE_DELIM}${grpTag}${ANNOUNCEMENT_FIRESTORE_DELIM}${cleanDate}${ANNOUNCEMENT_FIRESTORE_DELIM}${cleanContent}`;
  return combined.slice(0, 238);
}

export function decodeAnnouncementFromFirestoreDoc(raw: {
  id: string;
  title: string;
  status: string;
  educationalLevel: string;
  branch: string;
  authorUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}): CmsAnnouncementRecord {
  const rawTitle = String(raw.title || '');
  const parts = rawTitle.split(ANNOUNCEMENT_FIRESTORE_DELIM);
  const titleAr = (parts[0] || rawTitle || 'إعلان تربوي').trim();
  const grpRaw = (parts[1] || 'ALL').trim();
  const publishedAtAr = (parts[2] || '').trim() || new Date().toLocaleDateString('ar-MA');
  const contentAr = (parts[3] || titleAr).trim();

  const targetLevel: ExamTargetLevelOption =
    raw.educationalLevel === '1bac'
      ? '1bac'
      : raw.educationalLevel === '2bac'
        ? '2bac'
        : 'all';

  const parsedGroups = grpRaw
    .split(',')
    .map((g) => g.trim())
    .filter((g): g is 'G1' | 'G2' | 'G3' | 'G4' =>
      g === 'G1' || g === 'G2' || g === 'G3' || g === 'G4'
    );

  const allGroupsSelected = grpRaw === 'ALL' || parsedGroups.length === 0 || parsedGroups.length === 4;
  const targetGroups: ('G1' | 'G2' | 'G3' | 'G4')[] = allGroupsSelected
    ? ['G1', 'G2', 'G3', 'G4']
    : parsedGroups;

  const aud = buildExamAudienceConfigFromSelection({
    targetLevel,
    allGroupsSelected,
    selectedGroups: targetGroups,
  });

  const status: PublicationStatus =
    raw.status === 'published' ||
    raw.status === 'draft' ||
    raw.status === 'scheduled' ||
    raw.status === 'archived'
      ? raw.status
      : 'published';

  return {
    id: String(raw.id || ''),
    titleAr,
    titleFr: titleAr,
    contentAr,
    contentFr: contentAr,
    targetLevel,
    targetGroups,
    allGroupsSelected,
    status,
    effectiveStatus: status,
    effectiveGroupKeys: aud.groups,
    authorUid: String(raw.authorUid || 'admin_radwan_rakeb'),
    createdAt: '',
    updatedAt: '',
    publishedAtAr,
  };
}

export function filterPublishedAnnouncementsForUser(params: {
  announcements: CmsAnnouncementRecord[];
  userProfile: FirestoreUserProfile | null | undefined;
}): CmsAnnouncementRecord[] {
  const { announcements, userProfile } = params;
  return announcements.filter((ann) => {
    if (ann.status !== 'published' || ann.effectiveStatus !== 'published') {
      return false;
    }
    return canUserAccessContentItem(userProfile || null, ann);
  });
}
