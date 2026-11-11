import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_COHORT_GROUP_KEYS,
  AudienceConfig,
  buildInitialSubjectsSeed,
  canUserAccessContentItem,
  canUserManageEducationalContent,
  CmsLesson,
  CmsResource,
  CmsSubject,
  CmsUnit,
  computeEffectiveAudienceAndStatus,
  createAllStudentsAudienceConfig,
  reorderContentItems,
  resolveOwnCohortKeys,
  validateEducationalFileUpload,
} from './cmsContentRules';
import { EXCLUSIVE_ADMIN_EMAIL, FirestoreUserProfile } from './authSecurityRules';

const ADMIN_USER = {
  uid: 'admin_rakeb_uid',
  email: EXCLUSIVE_ADMIN_EMAIL,
  emailVerified: true,
  role: 'admin' as const,
};

const STUDENT_1BAC_G1: FirestoreUserProfile = {
  uid: 'student_1bac_g1',
  fullName: 'ياسين العلمي',
  email: 'yassine.g1@academie.ma',
  role: 'student',
  educationalLevel: '1bac',
  branch: 'Sciences',
  group: 'G1',
  accountStatus: 'active',
  notificationPreferences: { announcements: true, examinations: true, resources: true },
  preferredLanguage: 'ar',
  isSelfDeclared: true,
  createdAt: '2026-11-09T00:00:00Z',
  updatedAt: '2026-11-09T00:00:00Z',
};

const STUDENT_1BAC_G2: FirestoreUserProfile = {
  ...STUDENT_1BAC_G1,
  uid: 'student_1bac_g2',
  fullName: 'سلمى الفاسي',
  email: 'salma.g2@academie.ma',
  group: 'G2',
};

const STUDENT_1BAC_G3: FirestoreUserProfile = {
  ...STUDENT_1BAC_G1,
  uid: 'student_1bac_g3',
  fullName: 'حمزة بناني',
  email: 'hamza.g3@academie.ma',
  group: 'G3',
};

const STUDENT_1BAC_G4: FirestoreUserProfile = {
  ...STUDENT_1BAC_G1,
  uid: 'student_1bac_g4',
  fullName: 'مريم التازي',
  email: 'meryem.g4@academie.ma',
  group: 'G4',
};

const STUDENT_2BAC_G1: FirestoreUserProfile = {
  ...STUDENT_1BAC_G1,
  uid: 'student_2bac_g1',
  fullName: 'أمين الإدريسي',
  email: 'amine.2bac@academie.ma',
  educationalLevel: '2bac',
  branch: 'Arts and Humanities',
  group: 'G1',
};

test('Scenarios 1, 2 & 3: Administrator creates a subject, a hierarchical unit, and a lesson; initial seed has only History and Geography', () => {
  assert.equal(canUserManageEducationalContent(ADMIN_USER), true);

  // Initial seed provides strictly 2 subjects: History & Geography
  const initialSubjects = buildInitialSubjectsSeed(ADMIN_USER.uid, '2026-11-09T00:00:00Z');
  assert.equal(initialSubjects.length, 2);
  assert.equal(initialSubjects[0].titleAr, 'التاريخ');
  assert.equal(initialSubjects[0].titleFr, 'Histoire');
  assert.equal(initialSubjects[1].titleAr, 'الجغرافيا');
  assert.equal(initialSubjects[1].titleFr, 'Géographie');

  // 1. Administrator creates/edits a subject
  const customSubjectAudience = createAllStudentsAudienceConfig();
  const subjEff = computeEffectiveAudienceAndStatus({
    status: 'published',
    audienceMode: 'independent',
    audienceConfig: customSubjectAudience,
  });
  const createdSubject: CmsSubject = {
    id: 'subject_history',
    slug: 'history',
    titleAr: 'التاريخ',
    titleFr: 'Histoire',
    descriptionAr: 'مادة التاريخ للباكالوريا',
    descriptionFr: 'Histoire du Baccalauréat',
    order: 1,
    status: 'published',
    audienceMode: 'independent',
    audienceConfig: customSubjectAudience,
    effectiveStatus: subjEff.effectiveStatus,
    effectiveGroupKeys: subjEff.effectiveGroupKeys,
    authorUid: ADMIN_USER.uid,
    createdAt: '2026-11-09T00:00:00Z',
    updatedAt: '2026-11-09T00:00:00Z',
  };
  assert.equal(createdSubject.effectiveStatus, 'published');
  assert.equal(createdSubject.effectiveGroupKeys.length, 8);

  // 2. Administrator creates an educational unit under History
  const unitEff = computeEffectiveAudienceAndStatus(
    {
      status: 'published',
      audienceMode: 'inherit',
      audienceConfig: customSubjectAudience,
    },
    createdSubject
  );
  const createdUnit: CmsUnit = {
    id: 'unit_hist_01',
    subjectId: createdSubject.id,
    parentId: null,
    categoryKind: 'unit',
    customCategoryLabel: '',
    titleAr: 'المجزوءة الأولى: التحولات الكبرى للعالم الرأسمالي',
    titleFr: 'Unité 1 : Les grandes transformations du monde capitaliste',
    descriptionAr: 'تأطير منهجي للتحولات الاقتصادية والاجتماعية',
    descriptionFr: 'Cadrage méthodologique des mutations économiques et sociales',
    order: 1,
    status: 'published',
    audienceMode: 'inherit',
    audienceConfig: customSubjectAudience,
    effectiveStatus: unitEff.effectiveStatus,
    effectiveGroupKeys: unitEff.effectiveGroupKeys,
    authorUid: ADMIN_USER.uid,
    createdAt: '2026-11-09T00:00:00Z',
    updatedAt: '2026-11-09T00:00:00Z',
  };
  assert.equal(createdUnit.effectiveStatus, 'published');

  // Reordering test
  const reordered = reorderContentItems(
    [
      { id: 'u1', order: 1 },
      { id: 'u2', order: 2 },
      { id: 'u3', order: 3 },
    ],
    2,
    0
  );
  assert.deepEqual(
    reordered.map((i) => ({ id: i.id, order: i.order })),
    [
      { id: 'u3', order: 1 },
      { id: 'u1', order: 2 },
      { id: 'u2', order: 3 },
    ]
  );
});

test('Scenarios 4, 5, 6 & 10: Administrator uploads a PDF, saves a draft (not visible to students), publishes a lesson, and unpublishes a lesson', () => {
  // 4. Administrator uploads a PDF
  const validPdf = validateEducationalFileUpload({
    name: 'Synthese_Histoire_1Bac.pdf',
    size: 1024 * 512,
    type: 'application/pdf',
  });
  assert.equal(validPdf.valid, true);
  assert.equal(validPdf.detectedFormat, 'PDF');

  // Reject executable or unsupported extensions and oversized files
  const invalidExe = validateEducationalFileUpload({
    name: 'script.exe',
    size: 1024,
  });
  assert.equal(invalidExe.valid, false);

  const oversizedPdf = validateEducationalFileUpload({
    name: 'Huge_Atlas.pdf',
    size: 30 * 1024 * 1024, // 30 MB > 25 MB limit
  });
  assert.equal(oversizedPdf.valid, false);

  // 5. Administrator saves a lesson as Draft (must NOT auto-publish)
  const audienceAll = createAllStudentsAudienceConfig();
  const draftEff = computeEffectiveAudienceAndStatus({
    status: 'draft',
    audienceMode: 'independent',
    audienceConfig: audienceAll,
  });

  const lessonDraft: CmsLesson = {
    id: 'lesson_hist_01',
    subjectId: 'subject_history',
    unitId: 'unit_hist_01',
    titleAr: 'التحولات الاقتصادية والمالية في القرن 19',
    titleFr: 'Les transformations économiques et financières au XIXe siècle',
    descriptionAr: 'ملخص منهجي للدرس الأول',
    descriptionFr: 'Synthèse méthodologique de la première leçon',
    contentAr: 'محتوى الدرس باللغة العربية',
    contentFr: 'Contenu de la leçon en français',
    blocks: [
      { id: 'b1', type: 'heading', text: 'مقدمة إشكالية' },
      { id: 'b2', type: 'paragraph', text: 'شهد العالم الرأسمالي تحولات جذرية.' },
    ],
    attachmentIds: ['res_pdf_01'],
    order: 1,
    status: 'draft',
    audienceMode: 'independent',
    audienceConfig: audienceAll,
    effectiveStatus: draftEff.effectiveStatus,
    effectiveGroupKeys: draftEff.effectiveGroupKeys,
    version: 1,
    previousVersionSnapshot: null,
    authorUid: ADMIN_USER.uid,
    createdAt: '2026-11-09T00:00:00Z',
    updatedAt: '2026-11-09T00:00:00Z',
    publishedAt: null,
  };

  assert.equal(lessonDraft.effectiveStatus, 'draft');
  // Scenario 13: Student cannot access unpublished/draft lessons
  assert.equal(canUserAccessContentItem(STUDENT_1BAC_G1, lessonDraft), false);

  // 6. Administrator publishes the lesson explicitly
  const pubEff = computeEffectiveAudienceAndStatus({
    status: 'published',
    audienceMode: 'independent',
    audienceConfig: audienceAll,
  });
  const publishedLesson: CmsLesson = {
    ...lessonDraft,
    status: 'published',
    effectiveStatus: pubEff.effectiveStatus,
    publishedAt: '2026-11-09T01:00:00Z',
  };
  assert.equal(publishedLesson.effectiveStatus, 'published');
  assert.equal(canUserAccessContentItem(STUDENT_1BAC_G1, publishedLesson), true);

  // 10. Administrator unpublishes the lesson
  const unpubEff = computeEffectiveAudienceAndStatus({
    status: 'unpublished',
    audienceMode: 'independent',
    audienceConfig: audienceAll,
  });
  const unpublishedLesson: CmsLesson = {
    ...publishedLesson,
    status: 'unpublished',
    effectiveStatus: unpubEff.effectiveStatus,
  };
  assert.equal(unpublishedLesson.effectiveStatus, 'unpublished');
  assert.equal(canUserAccessContentItem(STUDENT_1BAC_G1, unpublishedLesson), false);
});

test('Scenarios 7, 8, 9, 11, 12 & 14: Advanced Audience Targeting (Single Group, Multiple Groups 1Bac Sciences G1 & G3, Audience Changes, Inheritance, and Restricted File Downloads)', () => {
  // 7. Administrator targets ONE specific group (2Bac Arts & Humanities G1)
  const singleGroupAudience: AudienceConfig = {
    scopePreset: 'single_group',
    allStudents: false,
    levels: [],
    branches: [],
    groups: ['2bac:Arts and Humanities:G1'],
  };
  const singleEff = computeEffectiveAudienceAndStatus({
    status: 'published',
    audienceMode: 'independent',
    audienceConfig: singleGroupAudience,
  });
  assert.deepEqual(singleEff.effectiveGroupKeys, ['2bac:Arts and Humanities:G1']);
  assert.equal(
    canUserAccessContentItem(STUDENT_2BAC_G1, {
      status: 'published',
      ...singleEff,
    }),
    true
  );
  assert.equal(
    canUserAccessContentItem(STUDENT_1BAC_G1, {
      status: 'published',
      ...singleEff,
    }),
    false
  );

  // 8. Exact Specification Example:
  // Administrator creates a History lesson and selects First Year Baccalaureate — Sciences: Group 1 and Group 3.
  // Only students registered in G1 and G3 can access the lesson. Groups 2 and 4 must NOT see or access it.
  const multiGroupG1G3: AudienceConfig = {
    scopePreset: 'multiple_groups',
    allStudents: false,
    levels: [],
    branches: [],
    groups: ['1bac:Sciences:G1', '1bac:Sciences:G3', '1bac:Sciences:G1'], // duplicate included to test deduplication
  };
  const resolvedG1G3 = resolveOwnCohortKeys(multiGroupG1G3);
  assert.deepEqual(resolvedG1G3, ['1bac:Sciences:G1', '1bac:Sciences:G3']);

  const lessonG1G3 = computeEffectiveAudienceAndStatus({
    status: 'published',
    audienceMode: 'independent',
    audienceConfig: multiGroupG1G3,
  });

  // Scenario 11: Students in Group 1 and Group 3 CAN see and access the published lesson
  assert.equal(
    canUserAccessContentItem(STUDENT_1BAC_G1, { status: 'published', ...lessonG1G3 }),
    true
  );
  assert.equal(
    canUserAccessContentItem(STUDENT_1BAC_G3, { status: 'published', ...lessonG1G3 }),
    true
  );

  // Scenario 12: Students in Group 2, Group 4, and 2Bac CANNOT see or access the lesson
  assert.equal(
    canUserAccessContentItem(STUDENT_1BAC_G2, { status: 'published', ...lessonG1G3 }),
    false
  );
  assert.equal(
    canUserAccessContentItem(STUDENT_1BAC_G4, { status: 'published', ...lessonG1G3 }),
    false
  );
  assert.equal(
    canUserAccessContentItem(STUDENT_2BAC_G1, { status: 'published', ...lessonG1G3 }),
    false
  );

  // Scenario 14: Student cannot download restricted files targeted to other groups
  const restrictedPdfResource: CmsResource = {
    id: 'res_restricted_g1g3',
    titleAr: 'وثيقة خاصة بالفوجين 1 و 3',
    titleFr: 'Document réservé aux groupes 1 et 3',
    descriptionAr: 'ملف PDF محمي',
    descriptionFr: 'Fichier PDF protégé',
    category: 'archive_doc',
    fileName: 'Archive_G1_G3.pdf',
    filePath: 'educational_resources/res_restricted_g1g3/Archive_G1_G3.pdf',
    downloadUrl: 'https://storage.googleapis.com/protected/Archive_G1_G3.pdf',
    fileType: 'PDF',
    mimeType: 'application/pdf',
    fileSize: 204800,
    subjectId: 'subject_history',
    unitId: 'unit_hist_01',
    lessonId: 'lesson_hist_01',
    order: 1,
    status: 'published',
    audienceMode: 'inherit',
    audienceConfig: multiGroupG1G3,
    effectiveStatus: lessonG1G3.effectiveStatus,
    effectiveGroupKeys: lessonG1G3.effectiveGroupKeys,
    authorUid: ADMIN_USER.uid,
    createdAt: '2026-11-09T00:00:00Z',
    updatedAt: '2026-11-09T00:00:00Z',
  };

  assert.equal(canUserAccessContentItem(STUDENT_1BAC_G1, restrictedPdfResource), true);
  assert.equal(canUserAccessContentItem(STUDENT_1BAC_G2, restrictedPdfResource), false);
  assert.equal(canUserAccessContentItem(STUDENT_1BAC_G4, restrictedPdfResource), false);

  // 9. Administrator changes the audience to include Group 2 AND tests Inheritance & Parent Restrictions
  const updatedAudienceG1G2G3: AudienceConfig = {
    scopePreset: 'multiple_groups',
    allStudents: false,
    levels: [],
    branches: [],
    groups: ['1bac:Sciences:G1', '1bac:Sciences:G2', '1bac:Sciences:G3'],
  };
  const updatedEff = computeEffectiveAudienceAndStatus({
    status: 'published',
    audienceMode: 'independent',
    audienceConfig: updatedAudienceG1G2G3,
  });
  assert.equal(
    canUserAccessContentItem(STUDENT_1BAC_G2, { status: 'published', ...updatedEff }),
    true
  );

  // Inheritance & Parent Restriction Check:
  // If parent unit is restricted to 1Bac Sciences (G1..G4), a child lesson trying to target ALL students
  // must NEVER silently expand the restricted parent's audience to 2Bac!
  const parentRestrictedTo1Bac = computeEffectiveAudienceAndStatus({
    status: 'published',
    audienceMode: 'independent',
    audienceConfig: {
      scopePreset: 'level',
      allStudents: false,
      levels: ['1bac'],
      branches: [],
      groups: [],
    },
  });
  const childAttemptingAll = computeEffectiveAudienceAndStatus(
    {
      status: 'published',
      audienceMode: 'independent',
      audienceConfig: createAllStudentsAudienceConfig(),
    },
    {
      status: 'published',
      ...parentRestrictedTo1Bac,
    }
  );
  assert.deepEqual(childAttemptingAll.effectiveGroupKeys, [
    '1bac:Sciences:G1',
    '1bac:Sciences:G2',
    '1bac:Sciences:G3',
    '1bac:Sciences:G4',
  ]);
  assert.equal(
    canUserAccessContentItem(STUDENT_2BAC_G1, { status: 'published', ...childAttemptingAll }),
    false
  );

  // And if parent unit is unpublished, child lesson must NEVER be accessible even if child.status === 'published'
  const childUnderUnpublishedParent = computeEffectiveAudienceAndStatus(
    {
      status: 'published',
      audienceMode: 'inherit',
      audienceConfig: createAllStudentsAudienceConfig(),
    },
    {
      status: 'unpublished',
      effectiveStatus: 'unpublished',
      effectiveGroupKeys: [...ALL_COHORT_GROUP_KEYS],
    }
  );
  assert.equal(childUnderUnpublishedParent.effectiveStatus, 'unpublished');
  assert.equal(
    canUserAccessContentItem(STUDENT_1BAC_G1, {
      status: 'published',
      ...childUnderUnpublishedParent,
    }),
    false
  );
});

test('Scenarios 15 & 16: Students cannot modify educational content, and unauthorized users cannot access management functions', () => {
  // Student cannot manage content
  assert.equal(
    canUserManageEducationalContent({
      uid: STUDENT_1BAC_G1.uid,
      email: STUDENT_1BAC_G1.email,
      emailVerified: true,
      role: 'student',
    }),
    false
  );

  // Student spoofing role='admin' with student email is rejected
  assert.equal(
    canUserManageEducationalContent({
      uid: STUDENT_1BAC_G1.uid,
      email: STUDENT_1BAC_G1.email,
      emailVerified: true,
      role: 'admin',
    }),
    false
  );

  // Admin email with unverified email is rejected
  assert.equal(
    canUserManageEducationalContent({
      uid: 'spoof_admin',
      email: EXCLUSIVE_ADMIN_EMAIL,
      emailVerified: false,
      role: 'admin',
    }),
    false
  );

  // Unauthenticated user is rejected from both management and reading content
  assert.equal(canUserManageEducationalContent(null), false);
  assert.equal(
    canUserAccessContentItem(null, {
      status: 'published',
      effectiveStatus: 'published',
      effectiveGroupKeys: [...ALL_COHORT_GROUP_KEYS],
    }),
    false
  );
});
