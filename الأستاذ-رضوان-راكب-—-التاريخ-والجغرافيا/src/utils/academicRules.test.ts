import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACADEMIC_STREAMS,
  ALL_ADMIN_SIDEBAR_SECTIONS,
  ALL_PAGE_IDS,
  ALLOWED_GROUPS,
  ALLOWED_STREAMS,
  filterAnnouncements,
  filterLessons,
  getLanguageDirection,
  isValidAcademicGroup,
  isValidAcademicStream,
  mapAdminSectionToPageId,
} from './academicRules';
import { AcademicAnnouncement, CurriculumLesson } from '../types/academic';

test('Language direction resolves RTL for Arabic and LTR for French', () => {
  assert.equal(getLanguageDirection('ar'), 'rtl');
  assert.equal(getLanguageDirection('fr'), 'ltr');
});

test('Educational identity strictly enforces only 1st Year Bac Sciences and 2nd Year Bac Arts & Humanities with 4 groups each', () => {
  assert.deepEqual(ALLOWED_STREAMS, ['1bac-sci', '2bac-arts']);
  assert.deepEqual(ALLOWED_GROUPS, ['G1', 'G2', 'G3', 'G4']);
  assert.equal(isValidAcademicStream('1bac-sci'), true);
  assert.equal(isValidAcademicStream('2bac-arts'), true);
  assert.equal(isValidAcademicStream('tc-letters'), false);
  assert.equal(isValidAcademicGroup('G1'), true);
  assert.equal(isValidAcademicGroup('G4'), true);
  assert.equal(isValidAcademicGroup('G5'), false);

  assert.equal(ACADEMIC_STREAMS['1bac-sci'].groups.length, 4);
  assert.equal(ACADEMIC_STREAMS['2bac-arts'].groups.length, 4);
});

test('All 15 required page layouts and 14 administrator sidebar sections are registered', () => {
  assert.equal(ALL_PAGE_IDS.length, 15);
  assert.equal(ALL_ADMIN_SIDEBAR_SECTIONS.length, 14);
  assert.equal(mapAdminSectionToPageId('create-announcement'), 'admin-announcements');
  assert.equal(mapAdminSectionToPageId('subjects-lessons'), 'admin-content');
  assert.equal(mapAdminSectionToPageId('website-customization'), 'admin-customization');
  assert.equal(mapAdminSectionToPageId('dashboard'), 'admin-dashboard');
});

test('Student profile filtering accurately filters curriculum lessons and announcements by stream and group', () => {
  const sampleLessons: CurriculumLesson[] = [
    {
      id: 'L1',
      unitNumber: '01',
      subject: 'history',
      streamId: '1bac-sci',
      applicableGroups: ['G1', 'G2'],
      semester: 1,
      title: { ar: 'درس 1', fr: 'Leçon 1' },
      axisSummary: { ar: 'ملخص', fr: 'Résumé' },
      keyConcepts: [],
      documentCount: 4,
      readingDuration: { ar: '45 دقيقة', fr: '45 min' },
    },
    {
      id: 'L2',
      unitNumber: '02',
      subject: 'geography',
      streamId: '2bac-arts',
      applicableGroups: ['G3', 'G4'],
      semester: 2,
      title: { ar: 'درس 2', fr: 'Leçon 2' },
      axisSummary: { ar: 'ملخص', fr: 'Résumé' },
      keyConcepts: [],
      documentCount: 6,
      readingDuration: { ar: '60 دقيقة', fr: '60 min' },
    },
  ];

  const filteredSciG1 = filterLessons(sampleLessons, {
    streamId: '1bac-sci',
    groupId: 'G1',
  });
  assert.equal(filteredSciG1.length, 1);
  assert.equal(filteredSciG1[0].id, 'L1');

  const filteredSciG3 = filterLessons(sampleLessons, {
    streamId: '1bac-sci',
    groupId: 'G3',
  });
  assert.equal(filteredSciG3.length, 0);

  const sampleAnnouncements: AcademicAnnouncement[] = [
    {
      id: 'A1',
      referenceNumber: 'ANN-01',
      streamId: '1bac-sci',
      applicableGroups: ['G1', 'G2', 'G3', 'G4'],
      status: 'published',
      category: { ar: 'إعلان', fr: 'Annonce' },
      publishedAt: { ar: 'نونبر 2026', fr: 'Novembre 2026' },
      title: { ar: 'عنوان', fr: 'Titre' },
      excerpt: { ar: 'مقتطف', fr: 'Extrait' },
      bodyParagraphs: [],
      directiveNotes: [],
    },
    {
      id: 'A2',
      referenceNumber: 'ANN-02',
      streamId: '2bac-arts',
      applicableGroups: ['G2'],
      status: 'scheduled',
      category: { ar: 'إعلان', fr: 'Annonce' },
      publishedAt: { ar: 'نونبر 2026', fr: 'Novembre 2026' },
      title: { ar: 'عنوان 2', fr: 'Titre 2' },
      excerpt: { ar: 'مقتطف 2', fr: 'Extrait 2' },
      bodyParagraphs: [],
      directiveNotes: [],
    },
  ];

  const publishedFor1Bac = filterAnnouncements(sampleAnnouncements, {
    streamId: '1bac-sci',
    status: 'published',
  });
  assert.equal(publishedFor1Bac.length, 1);
  assert.equal(publishedFor1Bac[0].id, 'A1');
});

test('Administrator Magic Link validation strictly permits only the authorized administrator email and handles expired/used links', async () => {
  const {
    validateAdminMagicLinkRequest,
    mapFirebaseAuthErrorToBilingualMessage,
    EXCLUSIVE_ADMIN_EMAIL,
  } = await import('./authSecurityRules');

  // Invalid email format rejected
  const invalidSyntax = validateAdminMagicLinkRequest('not-an-email');
  assert.equal(invalidSyntax.valid, false);

  // Unauthorized student or third-party email rejected
  const unauthorized = validateAdminMagicLinkRequest('student@ecole.ma');
  assert.equal(unauthorized.valid, false);
  assert.ok(unauthorized.error?.ar.includes('ولوج مرفوض'));

  // Authorized administrator email accepted
  const authorized = validateAdminMagicLinkRequest(EXCLUSIVE_ADMIN_EMAIL);
  assert.equal(authorized.valid, true);

  // Expired or already-used magic link error codes map to clear bilingual messages
  const expiredMsg = mapFirebaseAuthErrorToBilingualMessage({ code: 'auth/expired-action-code' });
  assert.ok(expiredMsg.ar.includes('انتهت صلاحية رابط الدخول الآمن'));
  assert.ok(expiredMsg.fr.includes('Ce lien de connexion sécurisé a expiré'));

  const usedMsg = mapFirebaseAuthErrorToBilingualMessage({ code: 'auth/invalid-action-code' });
  assert.ok(usedMsg.ar.includes('تم استخدامه مسبقاً'));
});

test('formatStudentWelcomeIdentity dynamically formats authenticated student data and never invents missing fields', async () => {
  const { formatStudentWelcomeIdentity } = await import('./academicRules');

  // Student 1: Ahmed (1bac Sciences G1)
  const ahmedAr = formatStudentWelcomeIdentity(
    {
      fullName: 'أحمد',
      educationalLevel: '1bac',
      branch: 'Sciences',
      group: 'G1',
    },
    'ar'
  );
  assert.equal(ahmedAr.greeting, 'مرحباً، أحمد');
  assert.equal(ahmedAr.cohortLine, 'الأولى باكالوريا – مسلك العلوم – الفوج الأول (01)');

  // Student 2: Youssef (2bac Arts and Humanities G3)
  const youssefAr = formatStudentWelcomeIdentity(
    {
      fullName: 'يوسف',
      educationalLevel: '2bac',
      branch: 'Arts and Humanities',
      group: 'G3',
    },
    'ar'
  );
  assert.equal(youssefAr.greeting, 'مرحباً، يوسف');
  assert.equal(
    youssefAr.cohortLine,
    'الثانية باكالوريا – مسلك الآداب والعلوم الإنسانية – الفوج الثالث (03)'
  );

  // Partial record: does not invent missing branch or group
  const partialAr = formatStudentWelcomeIdentity(
    {
      fullName: 'سارة',
      educationalLevel: '1bac',
      branch: '',
      group: null,
    },
    'ar'
  );
  assert.equal(partialAr.greeting, 'مرحباً، سارة');
  assert.equal(partialAr.cohortLine, 'الأولى باكالوريا');

  // Empty/null profile: does not invent any fake name or cohort
  const emptyAr = formatStudentWelcomeIdentity(null, 'ar');
  assert.equal(emptyAr.greeting, 'مرحباً');
  assert.equal(emptyAr.cohortLine, '');
});

test('History 4 structural units and compact cohort badge resolve accurately', async () => {
  const {
    HISTORY_STRUCTURAL_UNITS,
    resolveHistoryUnitSlot,
    formatStudentCompactCohortCode,
  } = await import('./academicRules');

  assert.equal(HISTORY_STRUCTURAL_UNITS.length, 4);
  assert.deepEqual(
    HISTORY_STRUCTURAL_UNITS.map((u) => u.label.ar),
    ['الوحدة 01', 'الوحدة 02', 'الوحدة 03', 'الوحدة 04']
  );
  assert.deepEqual(
    HISTORY_STRUCTURAL_UNITS.map((u) => u.panelTitle.ar),
    ['دروس الوحدة 01', 'دروس الوحدة 02', 'دروس الوحدة 03', 'دروس الوحدة 04']
  );

  assert.equal(resolveHistoryUnitSlot({ titleAr: 'الوحدة 01' }, 0), 1);
  assert.equal(resolveHistoryUnitSlot({ titleAr: 'الوحدة الثانية' }, 0), 2);
  assert.equal(resolveHistoryUnitSlot({ titleAr: 'Unité 03' }, 0), 3);
  assert.equal(resolveHistoryUnitSlot({ order: 4 }, 0), 4);

  assert.equal(
    formatStudentCompactCohortCode({ educationalLevel: '1bac', group: 'G1' }),
    '1BAC-SCI • G1'
  );
  assert.equal(
    formatStudentCompactCohortCode({ educationalLevel: '2bac', group: 'G3' }),
    '2BAC-LSH • G3'
  );
});



