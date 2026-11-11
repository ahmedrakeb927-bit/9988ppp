import { AcademicGroupId, BilingualText, Language } from '../types/academic';
import {
  EducationalBranchName,
  EducationalLevelCode,
  FirestoreUserProfile,
  getAutomaticBranchForLevel,
  isAuthorizedAdministratorEmail,
  isValidEducationalCombination,
} from './authSecurityRules';

export type PublicationStatus =
  | 'draft'
  | 'published'
  | 'scheduled'
  | 'unpublished'
  | 'archived';

export type AudienceMode = 'independent' | 'inherit';

export type AudienceScopePreset =
  | 'all'
  | 'level'
  | 'branch'
  | 'single_group'
  | 'multiple_groups'
  | 'custom';

export type CohortGroupKey =
  | '1bac:Sciences:G1'
  | '1bac:Sciences:G2'
  | '1bac:Sciences:G3'
  | '1bac:Sciences:G4'
  | '2bac:Arts and Humanities:G1'
  | '2bac:Arts and Humanities:G2'
  | '2bac:Arts and Humanities:G3'
  | '2bac:Arts and Humanities:G4';

export const ALL_COHORT_GROUP_KEYS: CohortGroupKey[] = [
  '1bac:Sciences:G1',
  '1bac:Sciences:G2',
  '1bac:Sciences:G3',
  '1bac:Sciences:G4',
  '2bac:Arts and Humanities:G1',
  '2bac:Arts and Humanities:G2',
  '2bac:Arts and Humanities:G3',
  '2bac:Arts and Humanities:G4',
];

export interface AudienceConfig {
  scopePreset: AudienceScopePreset;
  allStudents: boolean;
  levels: EducationalLevelCode[];
  branches: EducationalBranchName[];
  groups: CohortGroupKey[];
}

export type UnitCategoryKind = 'unit' | 'chapter' | 'section' | 'custom';

export type LessonBlockType =
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'numbered_list'
  | 'bullet_list'
  | 'table'
  | 'image'
  | 'important_note'
  | 'quote'
  | 'external_link';

export interface LessonContentBlock {
  id: string;
  type: LessonBlockType;
  text: string;
  caption?: string;
  url?: string;
  items?: string[];
  tableRows?: string[][];
}

export interface CmsSubject {
  id: string;
  slug: 'history' | 'geography' | string;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  descriptionFr: string;
  order: number;
  status: PublicationStatus;
  audienceMode: 'independent';
  audienceConfig: AudienceConfig;
  effectiveStatus: PublicationStatus;
  effectiveGroupKeys: CohortGroupKey[];
  authorUid: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface CmsUnit {
  id: string;
  subjectId: string;
  parentId: string | null;
  categoryKind: UnitCategoryKind;
  customCategoryLabel: string;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  descriptionFr: string;
  order: number;
  status: PublicationStatus;
  audienceMode: AudienceMode;
  audienceConfig: AudienceConfig;
  effectiveStatus: PublicationStatus;
  effectiveGroupKeys: CohortGroupKey[];
  authorUid: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface CmsLesson {
  id: string;
  subjectId: string;
  unitId: string | null;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  descriptionFr: string;
  contentAr: string;
  contentFr: string;
  blocks: LessonContentBlock[];
  attachmentIds: string[];
  order: number;
  status: PublicationStatus;
  audienceMode: AudienceMode;
  audienceConfig: AudienceConfig;
  effectiveStatus: PublicationStatus;
  effectiveGroupKeys: CohortGroupKey[];
  version: number;
  previousVersionSnapshot?: {
    version: number;
    titleAr: string;
    titleFr: string;
    contentAr: string;
    contentFr: string;
    savedAtIso: string;
  } | null;
  authorUid: string;
  createdAt: unknown;
  updatedAt: unknown;
  publishedAt: unknown | null;
}

export type PermittedResourceFormat =
  | 'PDF'
  | 'DOCX'
  | 'PPTX'
  | 'IMAGE'
  | 'XLSX'
  | 'TXT';

export type ResourceCategoryType =
  | 'summary'
  | 'exercise'
  | 'examination_paper'
  | 'map_atlas'
  | 'archive_doc'
  | 'general';

export interface CmsResource {
  id: string;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  descriptionFr: string;
  category: ResourceCategoryType;
  fileName: string;
  filePath: string;
  downloadUrl: string;
  fileType: PermittedResourceFormat;
  mimeType: string;
  fileSize: number;
  subjectId: string;
  unitId: string | null;
  lessonId: string | null;
  order: number;
  status: PublicationStatus;
  audienceMode: AudienceMode;
  audienceConfig: AudienceConfig;
  effectiveStatus: PublicationStatus;
  effectiveGroupKeys: CohortGroupKey[];
  authorUid: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export type ExamExerciseKind = 'examination' | 'exercise' | 'continuous_assessment';

export interface CmsExamination {
  id: string;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  descriptionFr: string;
  examKind: ExamExerciseKind;
  subjectId: string;
  unitId: string | null;
  attachmentIds: string[];
  durationMinutes: number;
  gradingScale: string;
  order: number;
  status: PublicationStatus;
  audienceMode: AudienceMode;
  audienceConfig: AudienceConfig;
  effectiveStatus: PublicationStatus;
  effectiveGroupKeys: CohortGroupKey[];
  authorUid: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export const MAX_EDUCATIONAL_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const ALLOWED_EXTENSION_TO_FORMAT: Record<string, PermittedResourceFormat> = {
  pdf: 'PDF',
  docx: 'DOCX',
  doc: 'DOCX',
  pptx: 'PPTX',
  ppt: 'PPTX',
  png: 'IMAGE',
  jpg: 'IMAGE',
  jpeg: 'IMAGE',
  webp: 'IMAGE',
  xlsx: 'XLSX',
  txt: 'TXT',
};

export function createAllStudentsAudienceConfig(): AudienceConfig {
  return {
    scopePreset: 'all',
    allStudents: true,
    levels: ['1bac', '2bac'],
    branches: ['Sciences', 'Arts and Humanities'],
    groups: [...ALL_COHORT_GROUP_KEYS],
  };
}

export function buildCohortKey(
  level: EducationalLevelCode,
  branch: EducationalBranchName,
  group: AcademicGroupId
): CohortGroupKey | null {
  if (!isValidEducationalCombination(level, branch, group)) {
    return null;
  }
  return `${level}:${branch}:${group}` as CohortGroupKey;
}

export function getStudentCohortKey(
  profile: Pick<FirestoreUserProfile, 'role' | 'educationalLevel' | 'branch' | 'group'> | null
): CohortGroupKey | null {
  if (!profile || profile.role !== 'student') return null;
  if (profile.educationalLevel !== '1bac' && profile.educationalLevel !== '2bac') {
    return null;
  }
  if (profile.branch !== 'Sciences' && profile.branch !== 'Arts and Humanities') {
    return null;
  }
  if (!['G1', 'G2', 'G3', 'G4'].includes(profile.group)) {
    return null;
  }
  return buildCohortKey(
    profile.educationalLevel,
    profile.branch,
    profile.group as AcademicGroupId
  );
}

/**
 * Resolves an AudienceConfig into a deduplicated, canonical list of CohortGroupKeys.
 * Prevents duplicate recipients when combining multiple targeting rules.
 */
export function resolveOwnCohortKeys(config: AudienceConfig): CohortGroupKey[] {
  if (config.allStudents || config.scopePreset === 'all') {
    return [...ALL_COHORT_GROUP_KEYS];
  }

  const keySet = new Set<CohortGroupKey>();

  // 1. Add entire educational levels if selected
  for (const level of config.levels || []) {
    if (level === '1bac' || level === '2bac') {
      const branch = getAutomaticBranchForLevel(level);
      (['G1', 'G2', 'G3', 'G4'] as AcademicGroupId[]).forEach((grp) => {
        const key = buildCohortKey(level, branch, grp);
        if (key) keySet.add(key);
      });
    }
  }

  // 2. Add entire branches if selected
  for (const branch of config.branches || []) {
    const level: EducationalLevelCode = branch === 'Sciences' ? '1bac' : '2bac';
    (['G1', 'G2', 'G3', 'G4'] as AcademicGroupId[]).forEach((grp) => {
      const key = buildCohortKey(level, branch, grp);
      if (key) keySet.add(key);
    });
  }

  // 3. Add individual or multiple selected groups
  for (const rawKey of config.groups || []) {
    if (ALL_COHORT_GROUP_KEYS.includes(rawKey)) {
      keySet.add(rawKey);
    }
  }

  return ALL_COHORT_GROUP_KEYS.filter((k) => keySet.has(k));
}

export interface ParentHierarchyNode {
  status: PublicationStatus;
  effectiveStatus: PublicationStatus;
  effectiveGroupKeys: CohortGroupKey[];
}

/**
 * Enforces Section 7: Targeting Inheritance and Overrides.
 * - If audienceMode === 'inherit' and parent exists, inherits parent's effectiveGroupKeys.
 * - If audienceMode === 'independent', uses item's own resolved keys, INTERSECTED with parent's
 *   effectiveGroupKeys so a child never silently expands a restricted parent's audience.
 * - A child item never becomes accessible if its parent is not published.
 */
export function computeEffectiveAudienceAndStatus(
  item: {
    status: PublicationStatus;
    audienceMode: AudienceMode;
    audienceConfig: AudienceConfig;
  },
  parentNode?: ParentHierarchyNode | null
): {
  effectiveStatus: PublicationStatus;
  effectiveGroupKeys: CohortGroupKey[];
} {
  const ownKeys = resolveOwnCohortKeys(item.audienceConfig);

  let effectiveGroupKeys: CohortGroupKey[];
  if (!parentNode) {
    effectiveGroupKeys = ownKeys;
  } else if (item.audienceMode === 'inherit') {
    effectiveGroupKeys = [...parentNode.effectiveGroupKeys];
  } else {
    // Independent override: restricted by parent's maximum accessible audience
    const parentSet = new Set(parentNode.effectiveGroupKeys);
    effectiveGroupKeys = ownKeys.filter((k) => parentSet.has(k));
  }

  let effectiveStatus: PublicationStatus = item.status;
  if (parentNode && parentNode.effectiveStatus !== 'published') {
    // Child cannot be effectively published if its parent is not published
    effectiveStatus = item.status === 'published' ? 'unpublished' : item.status;
  }

  return {
    effectiveStatus,
    effectiveGroupKeys,
  };
}

/**
 * Formats a human-readable bilingual badge of the effective audience.
 */
export function formatEffectiveAudienceSummary(
  effectiveGroupKeys: CohortGroupKey[],
  lang: Language
): string {
  if (effectiveGroupKeys.length === 0) {
    return lang === 'ar' ? 'لا يوجد جمهور مطابق (مقيد)' : 'Aucun groupe éligible (restreint)';
  }
  if (effectiveGroupKeys.length === ALL_COHORT_GROUP_KEYS.length) {
    return lang === 'ar'
      ? 'جميع التلاميذ المسجلين (1 باك علوم + 2 باك آداب · G1-G4)'
      : 'Tous les élèves inscrits (1Bac Sci + 2Bac LSH · G1-G4)';
  }

  const sciGroups = effectiveGroupKeys
    .filter((k) => k.startsWith('1bac:Sciences:'))
    .map((k) => k.split(':')[2]);
  const artsGroups = effectiveGroupKeys
    .filter((k) => k.startsWith('2bac:Arts and Humanities:'))
    .map((k) => k.split(':')[2]);

  const parts: string[] = [];
  if (sciGroups.length === 4) {
    parts.push(lang === 'ar' ? '1 باك علوم (كل الأفواج)' : '1Bac Sciences (Tous G1-G4)');
  } else if (sciGroups.length > 0) {
    parts.push(
      lang === 'ar'
        ? `1 باك علوم (${sciGroups.join(' · ')})`
        : `1Bac Sci (${sciGroups.join(' · ')})`
    );
  }

  if (artsGroups.length === 4) {
    parts.push(lang === 'ar' ? '2 باك آداب (كل الأفواج)' : '2Bac Arts & Hum. (Tous G1-G4)');
  } else if (artsGroups.length > 0) {
    parts.push(
      lang === 'ar'
        ? `2 باك آداب (${artsGroups.join(' · ')})`
        : `2Bac LSH (${artsGroups.join(' · ')})`
    );
  }

  return parts.join(' + ');
}

export function validateEducationalFileUpload(file: {
  name: string;
  size: number;
  type?: string;
}): {
  valid: boolean;
  detectedFormat?: PermittedResourceFormat;
  error?: BilingualText;
} {
  const trimmedName = (file.name || '').trim();
  if (!trimmedName || !trimmedName.includes('.')) {
    return {
      valid: false,
      error: {
        ar: 'يرجى اختيار ملف تربوي يحمل امتداداً واضحاً (PDF, DOCX, PPTX, PNG, JPG).',
        fr: 'Veuillez sélectionner un fichier avec une extension valide (PDF, DOCX, PPTX, PNG, JPG).',
      },
    };
  }

  const ext = trimmedName.split('.').pop()?.toLowerCase() || '';
  const detectedFormat = ALLOWED_EXTENSION_TO_FORMAT[ext];
  if (!detectedFormat) {
    return {
      valid: false,
      error: {
        ar: `صيغة الملف (.${ext}) غير مسموح بها. الصيغ التربوية المعتمدة: PDF, DOCX, PPTX, الصور, XLSX, TXT.`,
        fr: `Format (.${ext}) non autorisé. Formats pédagogiques permis : PDF, DOCX, PPTX, Images, XLSX, TXT.`,
      },
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: {
        ar: 'حجم الملف غير صالح (ملف فارغ).',
        fr: 'La taille du fichier est invalide (fichier vide).',
      },
    };
  }

  if (file.size > MAX_EDUCATIONAL_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: {
        ar: 'يتجاوز حجم الملف الحد الأقصى المسموح به (25 ميغابايت).',
        fr: 'Le fichier dépasse la taille maximale autorisée (25 Mo).',
      },
    };
  }

  return {
    valid: true,
    detectedFormat,
  };
}

/**
 * Verifies whether a user profile is authorized to read/download a content item or resource.
 */
export function canUserAccessContentItem(
  user: Pick<
    FirestoreUserProfile,
    'uid' | 'email' | 'role' | 'educationalLevel' | 'branch' | 'group' | 'accountStatus'
  > | null,
  item: {
    status: PublicationStatus;
    effectiveStatus: PublicationStatus;
    effectiveGroupKeys: CohortGroupKey[];
  }
): boolean {
  if (!user) return false;
  if (user.accountStatus === 'suspended') return false;

  if (user.role === 'admin' && isAuthorizedAdministratorEmail(user.email)) {
    return true;
  }

  if (user.role !== 'student') return false;
  if (item.status !== 'published' || item.effectiveStatus !== 'published') {
    return false;
  }

  const studentKey = getStudentCohortKey(user);
  if (!studentKey) return false;

  return item.effectiveGroupKeys.includes(studentKey);
}

/**
 * Verifies whether a user is authorized to perform CMS mutations (create, edit, publish, delete, upload).
 */
export function canUserManageEducationalContent(
  user: {
    uid?: string | null;
    email?: string | null;
    emailVerified?: boolean;
    role?: string | null;
  } | null
): boolean {
  if (!user || !user.uid || !user.email) return false;
  if (!user.emailVerified) return false;
  if (user.role !== 'admin') return false;
  return isAuthorizedAdministratorEmail(user.email);
}

/**
 * Initial 2 subjects required by Section 3:
 * 1. History — التاريخ
 * 2. Geography — الجغرافيا
 * No additional subjects or fictional lessons/units are generated automatically.
 */
export function buildInitialSubjectsSeed(adminUid: string, timestampValue: unknown): CmsSubject[] {
  const defaultAudience = createAllStudentsAudienceConfig();
  return [
    {
      id: 'subject_history',
      slug: 'history',
      titleAr: 'التاريخ',
      titleFr: 'Histoire',
      descriptionAr:
        'مادة التاريخ للسنة الأولى باكالوريا (مسلك العلوم) والسنة الثانية باكالوريا (مسلك الآداب والعلوم الإنسانية).',
      descriptionFr:
        'Programme d’Histoire pour la 1ère Année Bac Sciences et la 2ème Année Bac Arts et Humanités.',
      order: 1,
      status: 'published',
      audienceMode: 'independent',
      audienceConfig: defaultAudience,
      effectiveStatus: 'published',
      effectiveGroupKeys: [...ALL_COHORT_GROUP_KEYS],
      authorUid: adminUid,
      createdAt: timestampValue,
      updatedAt: timestampValue,
    },
    {
      id: 'subject_geography',
      slug: 'geography',
      titleAr: 'الجغرافيا',
      titleFr: 'Géographie',
      descriptionAr:
        'مادة الجغرافيا للسنة الأولى باكالوريا (مسلك العلوم) والسنة الثانية باكالوريا (مسلك الآداب والعلوم الإنسانية).',
      descriptionFr:
        'Programme de Géographie pour la 1ère Année Bac Sciences et la 2ème Année Bac Arts et Humanités.',
      order: 2,
      status: 'published',
      audienceMode: 'independent',
      audienceConfig: defaultAudience,
      effectiveStatus: 'published',
      effectiveGroupKeys: [...ALL_COHORT_GROUP_KEYS],
      authorUid: adminUid,
      createdAt: timestampValue,
      updatedAt: timestampValue,
    },
  ];
}

/**
 * Reorders an array of items by dragging/moving item from `fromIndex` to `toIndex`,
 * returning a new array with normalized 1-based `order` values.
 */
export function reorderContentItems<T extends { id: string; order: number }>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= sorted.length ||
    toIndex >= sorted.length ||
    fromIndex === toIndex
  ) {
    return sorted.map((item, idx) => ({ ...item, order: idx + 1 }));
  }
  const [moved] = sorted.splice(fromIndex, 1);
  sorted.splice(toIndex, 0, moved);
  return sorted.map((item, idx) => ({
    ...item,
    order: idx + 1,
  }));
}
