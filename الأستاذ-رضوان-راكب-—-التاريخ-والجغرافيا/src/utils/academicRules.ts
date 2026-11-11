import {
  AcademicAnnouncement,
  AcademicGroupId,
  AcademicStreamDefinition,
  AcademicStreamId,
  AdminSidebarSectionId,
  BilingualText,
  CurriculumLesson,
  EducationalResource,
  ExaminationPaper,
  Language,
  PageId,
  SubjectId,
} from '../types/academic';

export const ALLOWED_STREAMS: readonly AcademicStreamId[] = ['1bac-sci', '2bac-arts'] as const;

export const ALLOWED_GROUPS: readonly AcademicGroupId[] = ['G1', 'G2', 'G3', 'G4'] as const;

export const ALL_PAGE_IDS: readonly PageId[] = [
  'login',
  'register',
  'forgot-password',
  'home',
  'history',
  'geography',
  'resources',
  'examinations',
  'announcements',
  'announcement-detail',
  'student-portal',
  'admin-dashboard',
  'admin-content',
  'admin-announcements',
  'admin-customization',
] as const;

export const ALL_ADMIN_SIDEBAR_SECTIONS: readonly AdminSidebarSectionId[] = [
  'dashboard',
  'announcements',
  'create-announcement',
  'published-announcements',
  'scheduled-announcements',
  'drafts',
  'archive',
  'students',
  'subjects-lessons',
  'educational-resources',
  'examinations',
  'statistics',
  'website-customization',
  'settings',
] as const;

export const ACADEMIC_STREAMS: Record<AcademicStreamId, AcademicStreamDefinition> = {
  '1bac-sci': {
    id: '1bac-sci',
    code: '1BAC-SCI',
    levelLabel: {
      ar: 'الأولى باكالوريا',
      fr: 'Première Année Baccalauréat',
    },
    branchLabel: {
      ar: 'العلوم',
      fr: 'Sciences',
    },
    fullTitle: {
      ar: 'الأولى باكالوريا — مسلك العلوم',
      fr: '1ère Année Baccalauréat — Série Sciences',
    },
    examinationType: {
      ar: 'الامتحان الجهوي الموحد',
      fr: 'Examen Régional Normalisé',
    },
    groups: [
      { id: 'G1', label: { ar: 'الفوج الأول (01)', fr: 'Groupe 01' } },
      { id: 'G2', label: { ar: 'الفوج الثاني (02)', fr: 'Groupe 02' } },
      { id: 'G3', label: { ar: 'الفوج الثالث (03)', fr: 'Groupe 03' } },
      { id: 'G4', label: { ar: 'الفوج الرابع (04)', fr: 'Groupe 04' } },
    ],
  },
  '2bac-arts': {
    id: '2bac-arts',
    code: '2BAC-LSH',
    levelLabel: {
      ar: 'الثانية باكالوريا',
      fr: 'Deuxième Année Baccalauréat',
    },
    branchLabel: {
      ar: 'الآداب والعلوم الإنسانية',
      fr: 'Arts et Humanités (Lettres & Sciences Humaines)',
    },
    fullTitle: {
      ar: 'الثانية باكالوريا — الآداب والعلوم الإنسانية',
      fr: '2ème Année Baccalauréat — Arts et Humanités',
    },
    examinationType: {
      ar: 'الامتحان الوطني الموحد',
      fr: 'Examen National Normalisé',
    },
    groups: [
      { id: 'G1', label: { ar: 'الفوج الأول (01)', fr: 'Groupe 01' } },
      { id: 'G2', label: { ar: 'الفوج الثاني (02)', fr: 'Groupe 02' } },
      { id: 'G3', label: { ar: 'الفوج الثالث (03)', fr: 'Groupe 03' } },
      { id: 'G4', label: { ar: 'الفوج الرابع (04)', fr: 'Groupe 04' } },
    ],
  },
};

export function getLanguageDirection(lang: Language): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function tText(text: BilingualText, lang: Language): string {
  return text[lang];
}

export function isValidAcademicStream(streamId: string): streamId is AcademicStreamId {
  return ALLOWED_STREAMS.includes(streamId as AcademicStreamId);
}

export function isValidAcademicGroup(groupId: string): groupId is AcademicGroupId {
  return ALLOWED_GROUPS.includes(groupId as AcademicGroupId);
}

export function getStreamDefinition(streamId: AcademicStreamId): AcademicStreamDefinition {
  return ACADEMIC_STREAMS[streamId];
}

export function filterLessons(
  lessons: CurriculumLesson[],
  options: {
    subject?: SubjectId | 'all';
    streamId?: AcademicStreamId | 'all';
    groupId?: AcademicGroupId | 'all';
    semester?: 1 | 2 | 'all';
  }
): CurriculumLesson[] {
  return lessons.filter((lesson) => {
    if (options.subject && options.subject !== 'all' && lesson.subject !== options.subject) {
      return false;
    }
    if (options.streamId && options.streamId !== 'all' && lesson.streamId !== options.streamId) {
      return false;
    }
    if (
      options.groupId &&
      options.groupId !== 'all' &&
      !lesson.applicableGroups.includes(options.groupId)
    ) {
      return false;
    }
    if (options.semester && options.semester !== 'all' && lesson.semester !== options.semester) {
      return false;
    }
    return true;
  });
}

export function filterResources(
  resources: EducationalResource[],
  options: {
    subject?: SubjectId | 'all';
    streamId?: AcademicStreamId | 'all';
    groupId?: AcademicGroupId | 'all';
  }
): EducationalResource[] {
  return resources.filter((res) => {
    if (options.subject && options.subject !== 'all' && res.subject !== options.subject) {
      return false;
    }
    if (options.streamId && options.streamId !== 'all' && res.streamId !== options.streamId) {
      return false;
    }
    if (
      options.groupId &&
      options.groupId !== 'all' &&
      !res.applicableGroups.includes(options.groupId)
    ) {
      return false;
    }
    return true;
  });
}

export function filterExaminations(
  exams: ExaminationPaper[],
  options: {
    subject?: SubjectId | 'all';
    streamId?: AcademicStreamId | 'all';
    groupId?: AcademicGroupId | 'all';
  }
): ExaminationPaper[] {
  return exams.filter((exam) => {
    if (
      options.subject &&
      options.subject !== 'all' &&
      exam.subject !== 'both' &&
      exam.subject !== options.subject
    ) {
      return false;
    }
    if (options.streamId && options.streamId !== 'all' && exam.streamId !== options.streamId) {
      return false;
    }
    if (
      options.groupId &&
      options.groupId !== 'all' &&
      !exam.applicableGroups.includes(options.groupId)
    ) {
      return false;
    }
    return true;
  });
}

export function filterAnnouncements(
  announcements: AcademicAnnouncement[],
  options: {
    streamId?: AcademicStreamId | 'all';
    groupId?: AcademicGroupId | 'all';
    status?: AcademicAnnouncement['status'] | 'all';
  }
): AcademicAnnouncement[] {
  return announcements.filter((ann) => {
    if (
      options.streamId &&
      options.streamId !== 'all' &&
      ann.streamId !== 'all' &&
      ann.streamId !== options.streamId
    ) {
      return false;
    }
    if (
      options.groupId &&
      options.groupId !== 'all' &&
      !ann.applicableGroups.includes(options.groupId)
    ) {
      return false;
    }
    if (options.status && options.status !== 'all' && ann.status !== options.status) {
      return false;
    }
    return true;
  });
}

export function mapAdminSectionToPageId(section: AdminSidebarSectionId): PageId {
  switch (section) {
    case 'announcements':
    case 'create-announcement':
    case 'published-announcements':
    case 'scheduled-announcements':
    case 'drafts':
    case 'archive':
      return 'admin-announcements';
    case 'subjects-lessons':
    case 'educational-resources':
    case 'examinations':
      return 'admin-content';
    case 'website-customization':
      return 'admin-customization';
    case 'dashboard':
    case 'students':
    case 'statistics':
    case 'settings':
    default:
      return 'admin-dashboard';
  }
}

export interface StudentWelcomeIdentity {
  greeting: string;
  levelText: string;
  branchText: string;
  groupText: string;
  cohortLine: string;
}

/**
 * Formats the student's welcome card identity strictly from their authenticated database record.
 * Never invents fallback names, levels, branches, or groups when fields are absent.
 */
export function formatStudentWelcomeIdentity(
  profile:
    | {
        fullName?: string | null;
        educationalLevel?: string | null;
        branch?: string | null;
        group?: string | null;
      }
    | null
    | undefined,
  lang: Language
): StudentWelcomeIdentity {
  const rawName = typeof profile?.fullName === 'string' ? profile.fullName.trim() : '';
  const greeting = rawName
    ? lang === 'ar'
      ? `مرحباً، ${rawName}`
      : `Bonjour, ${rawName}`
    : lang === 'ar'
      ? 'مرحباً'
      : 'Bonjour';

  const rawLevel =
    typeof profile?.educationalLevel === 'string' ? profile.educationalLevel.trim() : '';
  let levelText = '';
  if (rawLevel === '1bac') {
    levelText = ACADEMIC_STREAMS['1bac-sci'].levelLabel[lang];
  } else if (rawLevel === '2bac') {
    levelText = ACADEMIC_STREAMS['2bac-arts'].levelLabel[lang];
  } else if (rawLevel && rawLevel !== 'admin') {
    levelText = rawLevel;
  }

  const rawBranch = typeof profile?.branch === 'string' ? profile.branch.trim() : '';
  let branchText = '';
  if (rawBranch === 'Sciences') {
    branchText =
      lang === 'ar'
        ? `مسلك ${ACADEMIC_STREAMS['1bac-sci'].branchLabel.ar}`
        : ACADEMIC_STREAMS['1bac-sci'].branchLabel.fr;
  } else if (rawBranch === 'Arts and Humanities') {
    branchText =
      lang === 'ar'
        ? `مسلك ${ACADEMIC_STREAMS['2bac-arts'].branchLabel.ar}`
        : ACADEMIC_STREAMS['2bac-arts'].branchLabel.fr;
  } else if (rawBranch && rawBranch !== 'Administration') {
    branchText = rawBranch;
  }

  const rawGroup = typeof profile?.group === 'string' ? profile.group.trim() : '';
  let groupText = '';
  if (rawGroup && ALLOWED_GROUPS.includes(rawGroup as AcademicGroupId)) {
    const grpDef = ACADEMIC_STREAMS['1bac-sci'].groups.find((g) => g.id === rawGroup);
    if (grpDef) {
      groupText = grpDef.label[lang];
    }
  } else if (rawGroup && rawGroup !== 'ALL') {
    groupText = rawGroup;
  }

  const cohortParts = [levelText, branchText, groupText].filter((part) => part.length > 0);
  return {
    greeting,
    levelText,
    branchText,
    groupText,
    cohortLine: cohortParts.join(' – '),
  };
}

export type HistoryUnitSlotNumber = 1 | 2 | 3 | 4;

export interface HistoryStructuralUnit {
  slot: HistoryUnitSlotNumber;
  code: '01' | '02' | '03' | '04';
  label: BilingualText;
  panelTitle: BilingualText;
}

export const HISTORY_STRUCTURAL_UNITS: readonly HistoryStructuralUnit[] = [
  {
    slot: 1,
    code: '01',
    label: { ar: 'الوحدة 01', fr: 'Unité 01' },
    panelTitle: { ar: 'دروس الوحدة 01', fr: 'Leçons de l’Unité 01' },
  },
  {
    slot: 2,
    code: '02',
    label: { ar: 'الوحدة 02', fr: 'Unité 02' },
    panelTitle: { ar: 'دروس الوحدة 02', fr: 'Leçons de l’Unité 02' },
  },
  {
    slot: 3,
    code: '03',
    label: { ar: 'الوحدة 03', fr: 'Unité 03' },
    panelTitle: { ar: 'دروس الوحدة 03', fr: 'Leçons de l’Unité 03' },
  },
  {
    slot: 4,
    code: '04',
    label: { ar: 'الوحدة 04', fr: 'Unité 04' },
    panelTitle: { ar: 'دروس الوحدة 04', fr: 'Leçons de l’Unité 04' },
  },
] as const;

export function resolveHistoryUnitSlot(
  unit: { id?: string; titleAr?: string; titleFr?: string; order?: number },
  indexInSubjectUnits: number
): HistoryUnitSlotNumber {
  const combined = `${unit.id || ''} ${unit.titleAr || ''} ${unit.titleFr || ''}`.toLowerCase();
  if (/(?:^|\D)(?:01|1)(?:\D|$)|الأولى|première|premiere/.test(combined)) return 1;
  if (/(?:^|\D)(?:02|2)(?:\D|$)|الثانية|deuxième|deuxieme/.test(combined)) return 2;
  if (/(?:^|\D)(?:03|3)(?:\D|$)|الثالثة|troisième|troisieme/.test(combined)) return 3;
  if (/(?:^|\D)(?:04|4)(?:\D|$)|الرابعة|quatrième|quatrieme/.test(combined)) return 4;

  if (typeof unit.order === 'number' && unit.order >= 1 && unit.order <= 4) {
    return unit.order as HistoryUnitSlotNumber;
  }

  const boundedIndex = ((indexInSubjectUnits % 4) + 4) % 4;
  return (boundedIndex + 1) as HistoryUnitSlotNumber;
}

export function formatStudentCompactCohortCode(
  profile:
    | {
        educationalLevel?: string | null;
        group?: string | null;
      }
    | null
    | undefined
): string {
  if (!profile) return '';
  const rawLevel =
    typeof profile.educationalLevel === 'string' ? profile.educationalLevel.trim() : '';
  const levelCode =
    rawLevel === '2bac' ? '2BAC-LSH' : rawLevel === '1bac' ? '1BAC-SCI' : '';
  const rawGroup = typeof profile.group === 'string' ? profile.group.trim() : '';
  const groupCode =
    rawGroup && ALLOWED_GROUPS.includes(rawGroup as AcademicGroupId) ? rawGroup : '';

  if (levelCode && groupCode) return `${levelCode} • ${groupCode}`;
  return levelCode || groupCode;
}


