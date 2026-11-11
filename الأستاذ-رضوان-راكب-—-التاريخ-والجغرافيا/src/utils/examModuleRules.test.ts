import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildExamAudienceConfigFromSelection,
  decodeAnnouncementFromFirestoreDoc,
  decodeExamMetadataFromExam,
  encodeAnnouncementTitleForFirestore,
  encodeExamMetadata,
  filterPublishedAnnouncementsForUser,
  filterPublishedSubjectExaminations,
  formatExamLevelFullAr,
  formatExamLevelShortAr,
  formatExamSessionSubtitleAr,
  formatExamTypeBadgeAr,
  formatExamTypeFullAr,
  getDefaultExamTitleAr,
  validateStrictPdfExamUpload,
} from './examModuleRules';
import { CmsExamination } from './cmsContentRules';
import { FirestoreUserProfile } from './authSecurityRules';

const sampleStudent1BacG1: FirestoreUserProfile = {
  uid: 'student_1',
  fullName: 'أمين العلوي',
  email: 'amine@student.ma',
  role: 'student',
  educationalLevel: '1bac',
  branch: 'Sciences',
  group: 'G1',
  accountStatus: 'active',
  notificationPreferences: {
    announcements: true,
    examinations: true,
    resources: true,
  },
  preferredLanguage: 'ar',
  isSelfDeclared: true,
  createdAt: null,
  updatedAt: null,
};

const sampleStudent1BacG2: FirestoreUserProfile = {
  ...sampleStudent1BacG1,
  uid: 'student_2',
  group: 'G2',
};

const sampleStudent2BacG1: FirestoreUserProfile = {
  ...sampleStudent1BacG1,
  uid: 'student_3',
  educationalLevel: '2bac',
  branch: 'Arts and Humanities',
  group: 'G1',
};

test('validateStrictPdfExamUpload enforces PDF extension, MIME type, and size bounds', () => {
  assert.equal(validateStrictPdfExamUpload(null).valid, false);
  assert.equal(
    validateStrictPdfExamUpload({ name: 'notes.docx', size: 1024, type: 'application/msword' }).valid,
    false
  );
  assert.equal(
    validateStrictPdfExamUpload({ name: 'image.png', size: 2048, type: 'image/png' }).valid,
    false
  );
  assert.equal(
    validateStrictPdfExamUpload({ name: 'empty.pdf', size: 0, type: 'application/pdf' }).valid,
    false
  );
  assert.equal(
    validateStrictPdfExamUpload({
      name: 'huge.pdf',
      size: 26 * 1024 * 1024,
      type: 'application/pdf',
    }).valid,
    false
  );
  assert.equal(
    validateStrictPdfExamUpload({
      name: 'regional_history_2025.pdf',
      size: 420_000,
      type: 'application/pdf',
    }).valid,
    true
  );
});

test('encodeExamMetadata and decodeExamMetadataFromExam round-trip cleanly', () => {
  const encoded = encodeExamMetadata({
    subjectSlug: 'history',
    examType: 'regional',
    examYear: 2025,
    examSession: 'normal',
    semester: 'S2',
    targetLevel: '1bac',
    targetGroups: ['G1', 'G3'],
    allGroupsSelected: false,
    pdfResourceId: 'res_pdf_123',
    pdfFileName: 'Histoire_2025.pdf',
    pdfFileSize: 512000,
    customNotesAr: 'مع عناصر الإجابة الرسمية',
  });

  const decoded = decodeExamMetadataFromExam({
    subjectId: 'subject_history',
    descriptionAr: 'مع عناصر الإجابة الرسمية',
    descriptionFr: encoded,
    attachmentIds: ['res_pdf_123'],
  });

  assert.equal(decoded.subjectSlug, 'history');
  assert.equal(decoded.examType, 'regional');
  assert.equal(decoded.examYear, 2025);
  assert.equal(decoded.examSession, 'normal');
  assert.equal(decoded.semester, 'S2');
  assert.equal(decoded.targetLevel, '1bac');
  assert.deepEqual(decoded.targetGroups, ['G1', 'G3']);
  assert.equal(decoded.allGroupsSelected, false);
  assert.equal(decoded.pdfResourceId, 'res_pdf_123');
  assert.equal(decoded.pdfFileName, 'Histoire_2025.pdf');
});

test('buildExamAudienceConfigFromSelection builds exact cohort keys for level and groups', () => {
  const all1Bac = buildExamAudienceConfigFromSelection({
    targetLevel: '1bac',
    allGroupsSelected: true,
    selectedGroups: ['G1', 'G2', 'G3', 'G4'],
  });
  assert.equal(all1Bac.scopePreset, 'level');
  assert.deepEqual(all1Bac.levels, ['1bac']);
  assert.equal(all1Bac.groups.length, 4);
  assert.ok(all1Bac.groups.includes('1bac:Sciences:G1'));

  const only1BacG1 = buildExamAudienceConfigFromSelection({
    targetLevel: '1bac',
    allGroupsSelected: false,
    selectedGroups: ['G1'],
  });
  assert.equal(only1BacG1.scopePreset, 'single_group');
  assert.deepEqual(only1BacG1.levels, []);
  assert.deepEqual(only1BacG1.groups, ['1bac:Sciences:G1']);
});

test('filterPublishedSubjectExaminations enforces strict subject isolation, cohort permissions, and type/level/year/session filters', () => {
  const historyMeta2025 = encodeExamMetadata({
    subjectSlug: 'history',
    examType: 'regional',
    examYear: 2025,
    examSession: 'normal',
    semester: 'S2',
    targetLevel: '1bac',
    targetGroups: ['G1'],
    allGroupsSelected: false,
    pdfResourceId: 'res_h_2025',
    pdfFileName: 'History_2025.pdf',
    pdfFileSize: 120000,
  });

  const historyMeta2024All1Bac = encodeExamMetadata({
    subjectSlug: 'history',
    examType: 'national',
    examYear: 2024,
    examSession: 'resit',
    semester: 'S1',
    targetLevel: '1bac',
    targetGroups: ['G1', 'G2', 'G3', 'G4'],
    allGroupsSelected: true,
    pdfResourceId: 'res_h_2024',
    pdfFileName: 'History_2024.pdf',
    pdfFileSize: 110000,
  });

  const geographyMeta2025 = encodeExamMetadata({
    subjectSlug: 'geography',
    examType: 'regional',
    examYear: 2025,
    examSession: 'normal',
    semester: 'S2',
    targetLevel: '1bac',
    targetGroups: ['G1', 'G2', 'G3', 'G4'],
    allGroupsSelected: true,
    pdfResourceId: 'res_g_2025',
    pdfFileName: 'Geography_2025.pdf',
    pdfFileSize: 130000,
  });

  const audG1Only = buildExamAudienceConfigFromSelection({
    targetLevel: '1bac',
    allGroupsSelected: false,
    selectedGroups: ['G1'],
  });

  const audAll1Bac = buildExamAudienceConfigFromSelection({
    targetLevel: '1bac',
    allGroupsSelected: true,
    selectedGroups: ['G1', 'G2', 'G3', 'G4'],
  });

  const exams: CmsExamination[] = [
    {
      id: 'exam_hist_2025_g1',
      titleAr: getDefaultExamTitleAr('regional'),
      titleFr: 'Examen Régional 2025',
      descriptionAr: formatExamSessionSubtitleAr('normal', 2025),
      descriptionFr: historyMeta2025,
      examKind: 'examination',
      subjectId: 'subject_history',
      unitId: null,
      attachmentIds: ['res_h_2025'],
      durationMinutes: 120,
      gradingScale: '20/20',
      order: 1,
      status: 'published',
      audienceMode: 'independent',
      audienceConfig: audG1Only,
      effectiveStatus: 'published',
      effectiveGroupKeys: audG1Only.groups,
      authorUid: 'admin_1',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'exam_hist_2024_all',
      titleAr: getDefaultExamTitleAr('national'),
      titleFr: 'Examen National 2024',
      descriptionAr: formatExamSessionSubtitleAr('resit', 2024),
      descriptionFr: historyMeta2024All1Bac,
      examKind: 'examination',
      subjectId: 'subject_history',
      unitId: null,
      attachmentIds: ['res_h_2024'],
      durationMinutes: 120,
      gradingScale: '20/20',
      order: 2,
      status: 'published',
      audienceMode: 'independent',
      audienceConfig: audAll1Bac,
      effectiveStatus: 'published',
      effectiveGroupKeys: audAll1Bac.groups,
      authorUid: 'admin_1',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'exam_geo_2025_all',
      titleAr: getDefaultExamTitleAr('regional'),
      titleFr: 'Examen Géographie 2025',
      descriptionAr: formatExamSessionSubtitleAr('normal', 2025),
      descriptionFr: geographyMeta2025,
      examKind: 'examination',
      subjectId: 'subject_geography',
      unitId: null,
      attachmentIds: ['res_g_2025'],
      durationMinutes: 120,
      gradingScale: '20/20',
      order: 1,
      status: 'published',
      audienceMode: 'independent',
      audienceConfig: audAll1Bac,
      effectiveStatus: 'published',
      effectiveGroupKeys: audAll1Bac.groups,
      authorUid: 'admin_1',
      createdAt: '',
      updatedAt: '',
    },
  ];

  // 1Bac G1 sees both History exams (2025 & 2024) and NEVER sees Geography exam in History archive
  const histForG1 = filterPublishedSubjectExaminations({
    examinations: exams,
    subjectSlug: 'history',
    userProfile: sampleStudent1BacG1,
  });
  assert.equal(histForG1.items.length, 2);
  assert.deepEqual(histForG1.availableYears, [2025, 2024]);
  assert.deepEqual(histForG1.availableTypes, ['regional', 'national']);

  // Filtering by examType 'national' returns only the 2024 national exam
  const histNationalOnly = filterPublishedSubjectExaminations({
    examinations: exams,
    subjectSlug: 'history',
    userProfile: sampleStudent1BacG1,
    examTypeFilter: 'national',
  });
  assert.equal(histNationalOnly.items.length, 1);
  assert.equal(histNationalOnly.items[0].exam.id, 'exam_hist_2024_all');

  // 1Bac G2 sees only the 2024 History exam (since 2025 was targeted only to G1)
  const histForG2 = filterPublishedSubjectExaminations({
    examinations: exams,
    subjectSlug: 'history',
    userProfile: sampleStudent1BacG2,
  });
  assert.equal(histForG2.items.length, 1);
  assert.equal(histForG2.items[0].exam.id, 'exam_hist_2024_all');

  // 2Bac G1 sees 0 History exams because both were targeted to 1Bac
  const histFor2Bac = filterPublishedSubjectExaminations({
    examinations: exams,
    subjectSlug: 'history',
    userProfile: sampleStudent2BacG1,
  });
  assert.equal(histFor2Bac.items.length, 0);

  // Geography archive for 1Bac G1 shows ONLY the Geography exam
  const geoForG1 = filterPublishedSubjectExaminations({
    examinations: exams,
    subjectSlug: 'geography',
    userProfile: sampleStudent1BacG1,
  });
  assert.equal(geoForG1.items.length, 1);
  assert.equal(geoForG1.items[0].exam.id, 'exam_geo_2025_all');
  assert.equal(formatExamTypeBadgeAr('regional'), 'جهوي');
  assert.equal(formatExamTypeFullAr('national'), 'الامتحان الوطني');
  assert.equal(formatExamLevelFullAr('1bac'), 'الأولى باكالوريا علوم');
  assert.equal(formatExamLevelFullAr('2bac'), 'الثانية باكالوريا آداب');
  assert.equal(formatExamLevelShortAr('1bac'), 'الأولى');
  assert.equal(formatExamLevelShortAr('2bac'), 'الثانية');
});

test('encodeAnnouncementTitleForFirestore and filterPublishedAnnouncementsForUser enforce cohort isolation', () => {
  const encodedTitle = encodeAnnouncementTitleForFirestore({
    titleAr: 'إعلان هام بخصوص حصة الدعم',
    contentAr: 'ستنظم حصة الدعم يوم السبت لفائدة الفوج الأول.',
    targetGroups: ['G1'],
    allGroupsSelected: false,
    publishedAtAr: '10 نونبر 2026',
  });

  const decoded = decodeAnnouncementFromFirestoreDoc({
    id: 'ann_test_1',
    title: encodedTitle,
    status: 'published',
    educationalLevel: '1bac',
    branch: 'Sciences',
    authorUid: 'admin_1',
  });

  assert.equal(decoded.titleAr, 'إعلان هام بخصوص حصة الدعم');
  assert.equal(decoded.contentAr, 'ستنظم حصة الدعم يوم السبت لفائدة الفوج الأول.');
  assert.deepEqual(decoded.targetGroups, ['G1']);
  assert.equal(decoded.allGroupsSelected, false);

  const visibleToG1 = filterPublishedAnnouncementsForUser({
    announcements: [decoded],
    userProfile: sampleStudent1BacG1,
  });
  assert.equal(visibleToG1.length, 1);

  const visibleToG2 = filterPublishedAnnouncementsForUser({
    announcements: [decoded],
    userProfile: sampleStudent1BacG2,
  });
  assert.equal(visibleToG2.length, 0);
});
