import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXCLUSIVE_ADMIN_EMAIL,
  evaluateFirestoreRuleSimulation,
  getAutomaticBranchForLevel,
  isAuthorizedAdministratorEmail,
  isValidEducationalCombination,
  mapFirebaseAuthErrorToBilingualMessage,
  resolveAuthorizedPage,
  validateStudentProfileUpdate,
  validateStudentRegistration,
} from '../utils/authSecurityRules';

const SERVER_TIME = '2026-11-09T12:00:00Z';

const baseStudentProfile = {
  uid: 'student_01',
  fullName: 'ياسين المنصوري',
  email: 'yassine@student.ma',
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
  createdAt: SERVER_TIME,
  updatedAt: SERVER_TIME,
};

test('1. Student registration validation & dynamic branch pairing', () => {
  assert.equal(getAutomaticBranchForLevel('1bac'), 'Sciences');
  assert.equal(getAutomaticBranchForLevel('2bac'), 'Arts and Humanities');

  const valid1Bac = validateStudentRegistration({
    fullName: 'ياسين المنصوري',
    email: 'yassine@student.ma',
    password: 'StrongPassword123',
    passwordConfirmation: 'StrongPassword123',
    educationalLevel: '1bac',
    branch: 'Sciences',
    group: 'G2',
  });
  assert.equal(valid1Bac.valid, true);

  // Invalid combination: 1st Year Bac + Arts and Humanities
  const invalidCombo = validateStudentRegistration({
    fullName: 'ياسين المنصوري',
    email: 'yassine@student.ma',
    password: 'StrongPassword123',
    passwordConfirmation: 'StrongPassword123',
    educationalLevel: '1bac',
    branch: 'Arts and Humanities',
    group: 'G1',
  });
  assert.equal(invalidCombo.valid, false);

  // Block student registration using exclusive admin email
  const adminEmailAttempt = validateStudentRegistration({
    fullName: 'طالب',
    email: EXCLUSIVE_ADMIN_EMAIL,
    password: 'StrongPassword123',
    passwordConfirmation: 'StrongPassword123',
    educationalLevel: '1bac',
    branch: 'Sciences',
    group: 'G1',
  });
  assert.equal(adminEmailAttempt.valid, false);
});

test('2 & 3. Student login, logout, and no-guest-browsing route protection', () => {
  // Unauthenticated guest cannot access home, history, student-portal, or admin-dashboard
  assert.equal(
    resolveAuthorizedPage('home', { isAuthenticated: false, role: null }),
    'login'
  );
  assert.equal(
    resolveAuthorizedPage('student-portal', { isAuthenticated: false, role: null }),
    'login'
  );
  assert.equal(
    resolveAuthorizedPage('admin-dashboard', { isAuthenticated: false, role: null }),
    'login'
  );
  // Unauthenticated guest CAN access login, register, forgot-password
  assert.equal(
    resolveAuthorizedPage('register', { isAuthenticated: false, role: null }),
    'register'
  );
  assert.equal(
    resolveAuthorizedPage('forgot-password', { isAuthenticated: false, role: null }),
    'forgot-password'
  );

  // Authenticated student redirected from login to student-portal
  assert.equal(
    resolveAuthorizedPage('login', { isAuthenticated: true, role: 'student' }),
    'student-portal'
  );
});

test('4. Password recovery & non-revealing authentication error handling', () => {
  const invalidCredsMsg = mapFirebaseAuthErrorToBilingualMessage({
    code: 'auth/invalid-credential',
  });
  assert.ok(invalidCredsMsg.ar.includes('بيانات الولوج غير صحيحة'));
  assert.ok(invalidCredsMsg.fr.includes('Identifiants incorrects'));

  const duplicateEmailMsg = mapFirebaseAuthErrorToBilingualMessage({
    code: 'auth/email-already-in-use',
  });
  assert.ok(duplicateEmailMsg.ar.includes('مسجل مسبقاً'));
});

test('5. Student profile editing validation (allows self-declared level/branch/group updates)', () => {
  const validUpdate = validateStudentProfileUpdate({
    fullName: 'ياسين المنصوري المعدل',
    educationalLevel: '2bac',
    branch: 'Arts and Humanities',
    group: 'G4',
    preferredLanguage: 'fr',
    notificationPreferences: {
      announcements: true,
      examinations: false,
      resources: true,
    },
  });
  assert.equal(validUpdate.valid, true);

  const allowedFirestoreUpdate = evaluateFirestoreRuleSimulation({
    collection: 'users',
    operation: 'update',
    docId: 'student_01',
    auth: { uid: 'student_01', email: 'yassine@student.ma', emailVerified: true },
    existingData: baseStudentProfile,
    incomingData: {
      ...baseStudentProfile,
      fullName: 'ياسين المنصوري المعدل',
      educationalLevel: '2bac',
      branch: 'Arts and Humanities',
      group: 'G4',
      updatedAt: SERVER_TIME,
    },
    serverTime: SERVER_TIME,
  });
  assert.equal(allowedFirestoreUpdate, 'ALLOWED');
});

test('6, 7 & 8. Exclusive Administrator login, authorization, and unauthorized access rejection', () => {
  assert.equal(isAuthorizedAdministratorEmail('a.r.identity007@gmail.com'), true);
  assert.equal(isAuthorizedAdministratorEmail('A.R.IDENTITY007@GMAIL.COM'), true);
  assert.equal(isAuthorizedAdministratorEmail('impersonator@gmail.com'), false);

  // Student attempting to access admin-dashboard is redirected to student-portal
  assert.equal(
    resolveAuthorizedPage('admin-dashboard', { isAuthenticated: true, role: 'student' }),
    'student-portal'
  );
  assert.equal(
    resolveAuthorizedPage('admin-customization', { isAuthenticated: true, role: 'student' }),
    'student-portal'
  );

  // Admin accessing login is redirected to admin-dashboard
  assert.equal(
    resolveAuthorizedPage('login', { isAuthenticated: true, role: 'admin' }),
    'admin-dashboard'
  );
  assert.equal(
    resolveAuthorizedPage('admin-dashboard', { isAuthenticated: true, role: 'admin' }),
    'admin-dashboard'
  );
});

test('9 & 10. Dirty Dozen Adversarial Payloads & Firestore Security Restrictions all return PERMISSION_DENIED', () => {
  const studentAuth = {
    uid: 'student_01',
    email: 'yassine@student.ma',
    emailVerified: true,
  };

  // Dirty Dozen #1: Student Role Escalation on Registration
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'users',
      operation: 'create',
      docId: 'student_01',
      auth: studentAuth,
      incomingData: {
        ...baseStudentProfile,
        role: 'admin',
        educationalLevel: 'admin',
        branch: 'Administration',
        group: 'ALL',
      },
      serverTime: SERVER_TIME,
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #2: Student Role Escalation on Profile Update
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'users',
      operation: 'update',
      docId: 'student_01',
      auth: studentAuth,
      existingData: baseStudentProfile,
      incomingData: {
        ...baseStudentProfile,
        role: 'admin',
        educationalLevel: 'admin',
        branch: 'Administration',
        group: 'ALL',
      },
      serverTime: SERVER_TIME,
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #3: Invalid Level/Branch Combination (1bac + Arts and Humanities)
  assert.equal(isValidEducationalCombination('1bac', 'Arts and Humanities', 'G1'), false);
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'users',
      operation: 'create',
      docId: 'student_01',
      auth: studentAuth,
      incomingData: {
        ...baseStudentProfile,
        educationalLevel: '1bac',
        branch: 'Arts and Humanities',
      },
      serverTime: SERVER_TIME,
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #4: Invalid Group G5
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'users',
      operation: 'create',
      docId: 'student_01',
      auth: studentAuth,
      incomingData: {
        ...baseStudentProfile,
        group: 'G5',
      },
      serverTime: SERVER_TIME,
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #5: Cross-User Profile Read (PII Leak)
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'users',
      operation: 'get',
      docId: 'student_02',
      auth: studentAuth,
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #6: Shadow Field Injection on Profile Update
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'users',
      operation: 'update',
      docId: 'student_01',
      auth: studentAuth,
      existingData: baseStudentProfile,
      incomingData: {
        ...baseStudentProfile,
        isOfficiallyVerified: true,
      },
      serverTime: SERVER_TIME,
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #7: Falsified Self-Declared Flag
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'users',
      operation: 'create',
      docId: 'student_01',
      auth: studentAuth,
      incomingData: {
        ...baseStudentProfile,
        isSelfDeclared: false,
      },
      serverTime: SERVER_TIME,
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #8: Student Modifying websiteSettings
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'websiteSettings',
      operation: 'update',
      docId: 'global',
      auth: studentAuth,
      incomingData: { websiteName: 'Hacked' },
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #9: Student Creating an Announcement
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'announcements',
      operation: 'create',
      docId: 'ann_1',
      auth: studentAuth,
      incomingData: { id: 'ann_1', status: 'published' },
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #10: Student Reading Unpublished Draft Announcement
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'announcements',
      operation: 'get',
      docId: 'draft_1',
      auth: studentAuth,
      existingData: { id: 'draft_1', status: 'draft' },
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #11: Forged createdAt Timestamp
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'users',
      operation: 'create',
      docId: 'student_01',
      auth: studentAuth,
      incomingData: {
        ...baseStudentProfile,
        createdAt: '2020-01-01T00:00:00Z',
      },
      serverTime: SERVER_TIME,
    }),
    'PERMISSION_DENIED'
  );

  // Dirty Dozen #12: Oversized String Resource Exhaustion (Denial of Wallet)
  assert.equal(
    evaluateFirestoreRuleSimulation({
      collection: 'users',
      operation: 'update',
      docId: 'student_01',
      auth: studentAuth,
      existingData: baseStudentProfile,
      incomingData: {
        ...baseStudentProfile,
        fullName: 'A'.repeat(1000),
      },
      serverTime: SERVER_TIME,
    }),
    'PERMISSION_DENIED'
  );
});
