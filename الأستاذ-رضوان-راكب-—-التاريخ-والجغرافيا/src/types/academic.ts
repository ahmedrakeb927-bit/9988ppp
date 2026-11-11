export type Language = 'ar' | 'fr';

export interface BilingualText {
  ar: string;
  fr: string;
}

export type AcademicStreamId = '1bac-sci' | '2bac-arts';

export type AcademicGroupId = 'G1' | 'G2' | 'G3' | 'G4';

export type SubjectId = 'history' | 'geography';

export type PageId =
  | 'home'
  | 'history'
  | 'geography'
  | 'resources'
  | 'examinations'
  | 'announcements'
  | 'announcement-detail'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'student-portal'
  | 'admin-dashboard'
  | 'admin-content'
  | 'admin-announcements'
  | 'admin-customization';

export type AdminSidebarSectionId =
  | 'dashboard'
  | 'announcements'
  | 'create-announcement'
  | 'published-announcements'
  | 'scheduled-announcements'
  | 'drafts'
  | 'archive'
  | 'students'
  | 'subjects-lessons'
  | 'educational-resources'
  | 'examinations'
  | 'statistics'
  | 'website-customization'
  | 'settings';

export interface AcademicStreamDefinition {
  id: AcademicStreamId;
  code: string;
  levelLabel: BilingualText;
  branchLabel: BilingualText;
  fullTitle: BilingualText;
  examinationType: BilingualText;
  groups: {
    id: AcademicGroupId;
    label: BilingualText;
  }[];
}

export interface StudentProfile {
  fullName: BilingualText;
  studentCode: string;
  streamId: AcademicStreamId;
  groupId: AcademicGroupId;
  institution: BilingualText;
  academicYear: string;
}

export interface CurriculumLesson {
  id: string;
  unitNumber: string;
  subject: SubjectId;
  streamId: AcademicStreamId;
  applicableGroups: AcademicGroupId[];
  semester: 1 | 2;
  title: BilingualText;
  axisSummary: BilingualText;
  keyConcepts: BilingualText[];
  documentCount: number;
  readingDuration: BilingualText;
}

export interface EducationalResource {
  id: string;
  referenceCode: string;
  subject: SubjectId;
  streamId: AcademicStreamId;
  applicableGroups: AcademicGroupId[];
  resourceType: BilingualText;
  title: BilingualText;
  description: BilingualText;
  format: string;
  pageCount: number;
  updatedDate: BilingualText;
}

export interface ExaminationPaper {
  id: string;
  examCode: string;
  subject: SubjectId | 'both';
  streamId: AcademicStreamId;
  applicableGroups: AcademicGroupId[];
  sessionTitle: BilingualText;
  examCategory: BilingualText;
  title: BilingualText;
  methodologyFocus: BilingualText;
  duration: BilingualText;
  gradingScale: string;
  scheduledWindow: BilingualText;
}

export interface AcademicAnnouncement {
  id: string;
  referenceNumber: string;
  streamId: AcademicStreamId | 'all';
  applicableGroups: AcademicGroupId[];
  status: 'published' | 'scheduled' | 'draft' | 'archived';
  category: BilingualText;
  publishedAt: BilingualText;
  title: BilingualText;
  excerpt: BilingualText;
  bodyParagraphs: BilingualText[];
  directiveNotes: BilingualText[];
  relatedUnitCode?: string;
}
