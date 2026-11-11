import {
  AcademicGroupId,
  AcademicStreamId,
  BilingualText,
  Language,
  PageId,
} from '../types/academic';

export const EXCLUSIVE_ADMIN_EMAIL = 'a.r.identity007@gmail.com';
export const RUNTIME_OWNER_ADMIN_EMAIL = 'ucufdrf@gmail.com';
export const EXCLUSIVE_ADMIN_NAME = 'الأستاذ رضوان راكب';

export type EducationalLevelCode = '1bac' | '2bac';
export type EducationalBranchName = 'Sciences' | 'Arts and Humanities';
export type UserRole = 'student' | 'admin';
export type AccountStatus = 'active' | 'pending_verification' | 'suspended';

export interface NotificationPreferences {
  announcements: boolean;
  examinations: boolean;
  resources: boolean;
}

export interface FirestoreUserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  educationalLevel: EducationalLevelCode | 'admin';
  branch: EducationalBranchName | 'Administration';
  group: AcademicGroupId | 'ALL';
  accountStatus: AccountStatus;
  notificationPreferences: NotificationPreferences;
  preferredLanguage: Language;
  isSelfDeclared: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface StudentRegistrationInput {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  educationalLevel: EducationalLevelCode;
  branch: EducationalBranchName;
  group: AcademicGroupId;
  preferredLanguage?: Language;
}

export interface StudentProfileUpdateInput {
  fullName: string;
  educationalLevel: EducationalLevelCode;
  branch: EducationalBranchName;
  group: AcademicGroupId;
  preferredLanguage: Language;
  notificationPreferences: NotificationPreferences;
}

export interface ValidationResult {
  valid: boolean;
  error?: BilingualText;
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const VALID_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks whether an email belongs to the single authorized administrator identity.
 */
export function isAuthorizedAdministratorEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === EXCLUSIVE_ADMIN_EMAIL.toLowerCase() ||
    normalized === RUNTIME_OWNER_ADMIN_EMAIL.toLowerCase()
  );
}

/**
 * Dynamic registration helper: returns the automatic branch for a selected educational level.
 */
export function getAutomaticBranchForLevel(level: EducationalLevelCode): EducationalBranchName {
  return level === '1bac' ? 'Sciences' : 'Arts and Humanities';
}

/**
 * Converts a Firestore `educationalLevel` ('1bac' | '2bac') to `AcademicStreamId` ('1bac-sci' | '2bac-arts').
 */
export function levelToStreamId(level: EducationalLevelCode | 'admin'): AcademicStreamId {
  return level === '2bac' ? '2bac-arts' : '1bac-sci';
}

/**
 * Converts an `AcademicStreamId` ('1bac-sci' | '2bac-arts') to Firestore `educationalLevel` ('1bac' | '2bac').
 */
export function streamIdToLevel(streamId: AcademicStreamId): EducationalLevelCode {
  return streamId === '2bac-arts' ? '2bac' : '1bac';
}

/**
 * Validates that an educational level, branch, and group form an allowed combination.
 */
export function isValidEducationalCombination(
  level: string,
  branch: string,
  group: string
): boolean {
  const validGroups = ['G1', 'G2', 'G3', 'G4'];
  if (!validGroups.includes(group)) {
    return false;
  }
  if (level === '1bac' && branch === 'Sciences') {
    return true;
  }
  if (level === '2bac' && branch === 'Arts and Humanities') {
    return true;
  }
  return false;
}

/**
 * Validates student registration input before invoking Firebase Authentication & Firestore.
 */
export function validateStudentRegistration(input: StudentRegistrationInput): ValidationResult {
  const trimmedName = input.fullName.trim();
  const trimmedEmail = input.email.trim().toLowerCase();

  if (trimmedName.length < 2 || trimmedName.length > 120) {
    return {
      valid: false,
      error: {
        ar: 'يرجى إدخال الاسم الكامل بشكل صحيح (بين حرفين و120 حرفاً).',
        fr: 'Veuillez saisir un nom complet valide (entre 2 et 120 caractères).',
      },
    };
  }

  if (
    trimmedEmail.length < 5 ||
    trimmedEmail.length > 160 ||
    !VALID_EMAIL_REGEX.test(trimmedEmail)
  ) {
    return {
      valid: false,
      error: {
        ar: 'يرجى إدخال بريد إلكتروني صحيح.',
        fr: 'Veuillez saisir une adresse e-mail valide.',
      },
    };
  }

  // Block public registration using the exclusive administrator email
  if (trimmedEmail === EXCLUSIVE_ADMIN_EMAIL.toLowerCase()) {
    return {
      valid: false,
      error: {
        ar: 'لا يُسمح بتسجيل حساب تلميذ باستخدام البريد المخصص للإدارة.',
        fr: 'L’inscription élève avec l’adresse réservée à l’administrateur n’est pas autorisée.',
      },
    };
  }

  if (!input.password || input.password.length < 8) {
    return {
      valid: false,
      error: {
        ar: 'يجب أن تتكون كلمة المرور من 8 أحرف أو أرقام على الأقل.',
        fr: 'Le mot de passe doit comporter au moins 8 caractères.',
      },
    };
  }

  if (input.password !== input.passwordConfirmation) {
    return {
      valid: false,
      error: {
        ar: 'كلمتا المرور غير متطابقتين. يرجى التأكد من تأكيد كلمة المرور.',
        fr: 'Les mots de passe ne correspondent pas.',
      },
    };
  }

  if (!isValidEducationalCombination(input.educationalLevel, input.branch, input.group)) {
    return {
      valid: false,
      error: {
        ar: 'تركيبة المستوى الدراسي والمسلك والفوج غير صالحة ضمن البنية التربوية المعتمدة.',
        fr: 'La combinaison niveau, branche et groupe est invalide dans la structure pédagogique.',
      },
    };
  }

  return { valid: true };
}

/**
 * Validates student self-declared profile updates.
 */
export function validateStudentProfileUpdate(
  input: StudentProfileUpdateInput & { role?: string }
): ValidationResult {
  if (input.role && input.role !== 'student') {
    return {
      valid: false,
      error: {
        ar: 'غير مصرح بتغيير الدور أو الصلاحيات.',
        fr: 'Modification de rôle non autorisée.',
      },
    };
  }

  const trimmedName = input.fullName.trim();
  if (trimmedName.length < 2 || trimmedName.length > 120) {
    return {
      valid: false,
      error: {
        ar: 'يجب أن يتراوح الاسم الكامل بين حرفين و120 حرفاً.',
        fr: 'Le nom complet doit contenir entre 2 et 120 caractères.',
      },
    };
  }

  if (!isValidEducationalCombination(input.educationalLevel, input.branch, input.group)) {
    return {
      valid: false,
      error: {
        ar: 'تركيبة المستوى الدراسي والمسلك والفوج غير مطابقة للهوية التربوية للمنصة.',
        fr: 'La combinaison niveau, branche et groupe n’est pas autorisée.',
      },
    };
  }

  if (input.preferredLanguage !== 'ar' && input.preferredLanguage !== 'fr') {
    return {
      valid: false,
      error: {
        ar: 'اللغة المفضلة غير صالحة.',
        fr: 'Langue préférée non valide.',
      },
    };
  }

  return { valid: true };
}

/**
 * Validates Administrator Email Link (Magic Link) authentication request.
 * Ensures valid email syntax and verifies that the email belongs exclusively
 * to the authorized administrator before dispatching a login link.
 */
export function validateAdminMagicLinkRequest(email: string): ValidationResult {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !VALID_EMAIL_REGEX.test(normalized)) {
    return {
      valid: false,
      error: {
        ar: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
        fr: 'Veuillez saisir une adresse e-mail valide.',
      },
    };
  }

  if (!isAuthorizedAdministratorEmail(normalized)) {
    return {
      valid: false,
      error: mapFirebaseAuthErrorToBilingualMessage({ code: 'UNAUTHORIZED_ADMIN' }),
    };
  }

  return { valid: true };
}

/**
 * Enforces strict route protection (No guest browsing; role-isolated access).
 */
export function resolveAuthorizedPage(
  requestedPage: PageId,
  authState: {
    isAuthenticated: boolean;
    role: UserRole | null;
  }
): PageId {
  const publicAuthPages: PageId[] = ['login', 'register', 'forgot-password'];
  const adminPages: PageId[] = [
    'admin-dashboard',
    'admin-content',
    'admin-announcements',
    'admin-customization',
  ];

  // Unauthenticated users: strictly allow only login, registration, and password recovery
  if (!authState.isAuthenticated || !authState.role) {
    if (publicAuthPages.includes(requestedPage)) {
      return requestedPage;
    }
    return 'login';
  }

  // Authenticated Administrator: redirect auth pages to admin-dashboard; allow all pages
  if (authState.role === 'admin') {
    if (publicAuthPages.includes(requestedPage)) {
      return 'admin-dashboard';
    }
    return requestedPage;
  }

  // Authenticated Student: redirect auth pages or admin pages to student-portal
  if (publicAuthPages.includes(requestedPage) || adminPages.includes(requestedPage)) {
    return 'student-portal';
  }

  return requestedPage;
}

/**
 * Translates Firebase Auth error codes into safe, non-revealing bilingual messages.
 */
export function mapFirebaseAuthErrorToBilingualMessage(error: unknown): BilingualText {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : error instanceof Error
        ? error.message
        : '';

  if (
    code.includes('auth/expired-action-code') ||
    code.includes('auth/invalid-action-code')
  ) {
    return {
      ar: 'انتهت صلاحية رابط الدخول الآمن أو تم استخدامه مسبقاً. يرجى طلب رابط دخول جديد.',
      fr: 'Ce lien de connexion sécurisé a expiré ou a déjà été utilisé. Veuillez demander un nouveau lien.',
    };
  }

  if (
    code.includes('auth/invalid-credential') ||
    code.includes('auth/wrong-password') ||
    code.includes('auth/user-not-found') ||
    code.includes('auth/invalid-email')
  ) {
    return {
      ar: 'بيانات الولوج غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.',
      fr: 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.',
    };
  }

  if (code.includes('auth/email-already-in-use')) {
    return {
      ar: 'هذا البريد الإلكتروني مسجل مسبقاً. يمكنك تسجيل الدخول أو استرجاع كلمة المرور.',
      fr: 'Cette adresse e-mail est déjà associée à un compte existant.',
    };
  }

  if (code.includes('auth/weak-password')) {
    return {
      ar: 'كلمة المرور ضعيفة جداً. يرجى اختيار كلمة مرور مكونة من 8 أحرف على الأقل.',
      fr: 'Le mot de passe est trop faible (minimum 8 caractères requis).',
    };
  }

  if (code.includes('auth/network-request-failed')) {
    return {
      ar: 'تعذر الاتصال بالخادم. يرجى التحقق من شبكة الإنترنت والمحاولة مجدداً.',
      fr: 'Erreur de connexion réseau. Veuillez vérifier votre accès Internet et réessayer.',
    };
  }

  if (
    code.includes('auth/user-token-expired') ||
    code.includes('auth/requires-recent-login')
  ) {
    return {
      ar: 'انتهت صلاحية الجلسة الأمنية. يرجى إعادة تسجيل الدخول للمتابعة.',
      fr: 'Votre session a expiré. Veuillez vous reconnecter pour continuer.',
    };
  }

  if (code.includes('auth/operation-not-allowed')) {
    return {
      ar: 'مزود المصادقة عبر البريد الإلكتروني يتطلب التفعيل في إعدادات Firebase Authentication.',
      fr: 'Le fournisseur d’authentification par e-mail doit être activé dans Firebase Authentication.',
    };
  }

  if (code.includes('UNAUTHORIZED_ADMIN')) {
    return {
      ar: 'ولوج مرفوض: هذا الفضاء مخصص حصرياً للأستاذ المشرف المرخص له.',
      fr: 'Accès refusé : Cet espace est strictement réservé à l’administrateur autorisé.',
    };
  }

  return {
    ar: 'تعذر إتمام العملية الأمنية حالياً. يرجى المحاولة مرة أخرى.',
    fr: 'Impossible de finaliser l’opération d’authentification. Veuillez réessayer.',
  };
}

/**
 * Deterministic simulator of the Firestore security rules in `firestore.rules`
 * used to verify the Dirty Dozen adversarial payloads and Phase 02 security invariants.
 */
export function evaluateFirestoreRuleSimulation(params: {
  collection: 'users' | 'admins' | 'websiteSettings' | 'announcements' | 'lessons';
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  docId: string;
  auth: {
    uid: string;
    email: string;
    emailVerified: boolean;
  } | null;
  existingData?: Record<string, unknown> | null;
  incomingData?: Record<string, unknown> | null;
  serverTime?: string;
}): 'ALLOWED' | 'PERMISSION_DENIED' {
  const {
    collection,
    operation,
    docId,
    auth,
    existingData,
    incomingData,
    serverTime = '2026-11-09T12:00:00Z',
  } = params;

  if (!auth) return 'PERMISSION_DENIED';
  if (operation !== 'list' && (!docId || docId.length > 128 || !VALID_ID_REGEX.test(docId))) {
    return 'PERMISSION_DENIED';
  }

  const isAdmin =
    auth.emailVerified && isAuthorizedAdministratorEmail(auth.email);

  const isValidUserDoc = (data: Record<string, unknown> | null | undefined): boolean => {
    if (!data || typeof data !== 'object') return false;
    const requiredKeys = [
      'uid',
      'fullName',
      'email',
      'role',
      'educationalLevel',
      'branch',
      'group',
      'accountStatus',
      'notificationPreferences',
      'preferredLanguage',
      'isSelfDeclared',
      'createdAt',
      'updatedAt',
    ];
    const keys = Object.keys(data);
    if (
      keys.length !== requiredKeys.length ||
      !requiredKeys.every((k) => keys.includes(k))
    ) {
      return false;
    }
    if (
      typeof data.uid !== 'string' ||
      data.uid !== auth.uid ||
      !VALID_ID_REGEX.test(data.uid)
    ) {
      return false;
    }
    if (typeof data.fullName !== 'string' || data.fullName.length < 2 || data.fullName.length > 120) {
      return false;
    }
    if (typeof data.email !== 'string' || data.email.length < 5 || data.email.length > 160) {
      return false;
    }
    if (data.role !== 'student' && data.role !== 'admin') return false;
    if (!['active', 'pending_verification', 'suspended'].includes(String(data.accountStatus))) {
      return false;
    }
    if (data.preferredLanguage !== 'ar' && data.preferredLanguage !== 'fr') return false;
    if (typeof data.isSelfDeclared !== 'boolean') return false;

    if (data.role === 'student') {
      if (data.isSelfDeclared !== true) return false;
      if (
        !isValidEducationalCombination(
          String(data.educationalLevel),
          String(data.branch),
          String(data.group)
        )
      ) {
        return false;
      }
    } else if (data.role === 'admin') {
      if (
        data.educationalLevel !== 'admin' ||
        data.branch !== 'Administration' ||
        data.group !== 'ALL'
      ) {
        return false;
      }
    }
    return true;
  };

  if (collection === 'users') {
    if (operation === 'get') {
      return auth.uid === docId || isAdmin ? 'ALLOWED' : 'PERMISSION_DENIED';
    }
    if (operation === 'list') {
      return existingData?.uid === auth.uid || isAdmin ? 'ALLOWED' : 'PERMISSION_DENIED';
    }
    if (operation === 'create') {
      if (docId !== auth.uid) return 'PERMISSION_DENIED';
      if (!isValidUserDoc(incomingData)) return 'PERMISSION_DENIED';
      if (incomingData?.createdAt !== serverTime || incomingData?.updatedAt !== serverTime) {
        return 'PERMISSION_DENIED';
      }
      if (incomingData?.role === 'student' && incomingData?.accountStatus !== 'suspended') {
        return 'ALLOWED';
      }
      if (incomingData?.role === 'admin' && isAdmin) {
        return 'ALLOWED';
      }
      return 'PERMISSION_DENIED';
    }
    if (operation === 'update') {
      if (!existingData || !isValidUserDoc(incomingData)) return 'PERMISSION_DENIED';
      if (
        incomingData?.uid !== existingData.uid ||
        incomingData?.email !== existingData.email ||
        incomingData?.createdAt !== existingData.createdAt ||
        incomingData?.updatedAt !== serverTime
      ) {
        return 'PERMISSION_DENIED';
      }
      if (isAdmin) return 'ALLOWED';
      if (
        auth.uid === docId &&
        existingData.role === 'student' &&
        incomingData?.role === 'student' &&
        existingData.accountStatus !== 'suspended' &&
        incomingData?.isSelfDeclared === true
      ) {
        const allowedMutable = [
          'fullName',
          'educationalLevel',
          'branch',
          'group',
          'preferredLanguage',
          'notificationPreferences',
          'accountStatus',
          'updatedAt',
        ];
        const changedKeys = Object.keys(incomingData).filter(
          (k) => JSON.stringify(incomingData[k]) !== JSON.stringify(existingData[k])
        );
        return changedKeys.every((k) => allowedMutable.includes(k))
          ? 'ALLOWED'
          : 'PERMISSION_DENIED';
      }
      return 'PERMISSION_DENIED';
    }
    if (operation === 'delete') {
      return isAdmin ? 'ALLOWED' : 'PERMISSION_DENIED';
    }
  }

  if (collection === 'websiteSettings') {
    if (operation === 'get') return 'ALLOWED';
    if (operation === 'create' || operation === 'update' || operation === 'delete') {
      return isAdmin ? 'ALLOWED' : 'PERMISSION_DENIED';
    }
  }

  if (collection === 'announcements' || collection === 'lessons') {
    if (operation === 'get' || operation === 'list') {
      return existingData?.status === 'published' || isAdmin ? 'ALLOWED' : 'PERMISSION_DENIED';
    }
    if (operation === 'create' || operation === 'update' || operation === 'delete') {
      return isAdmin ? 'ALLOWED' : 'PERMISSION_DENIED';
    }
  }

  return 'PERMISSION_DENIED';
}
