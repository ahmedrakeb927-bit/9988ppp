import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  AcademicGroupId,
  BilingualText,
  Language,
} from '../types/academic';
import {
  EducationalBranchName,
  EducationalLevelCode,
  EXCLUSIVE_ADMIN_NAME,
  FirestoreUserProfile,
  getAutomaticBranchForLevel,
  isAuthorizedAdministratorEmail,
  mapFirebaseAuthErrorToBilingualMessage,
  StudentProfileUpdateInput,
  StudentRegistrationInput,
  UserRole,
  validateAdminMagicLinkRequest,
  validateStudentProfileUpdate,
  validateStudentRegistration,
} from '../utils/authSecurityRules';

const ADMIN_MAGIC_LINK_STORAGE_KEY = 'radwan_admin_magic_link_email';
const ADMIN_DIRECT_SESSION_STORAGE_KEY = 'radwan_admin_direct_session_email';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: FirestoreUserProfile | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  emailVerified: boolean;
  authError: BilingualText | null;
  authNotice: BilingualText | null;
  emailProviderSetupRequired: boolean;
  pendingMagicLinkCompletion: boolean;
  allStudentProfiles: FirestoreUserProfile[];
  clearMessages: () => void;
  registerStudent: (input: StudentRegistrationInput) => Promise<boolean>;
  loginStudent: (email: string, password: string) => Promise<boolean>;
  sendAdminMagicLink: (email: string) => Promise<boolean>;
  completeAdminMagicLink: (emailOverride?: string) => Promise<boolean>;
  loginAdministrator: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: (
    intendedRole: 'student' | 'admin',
    studentDefaults?: {
      educationalLevel: EducationalLevelCode;
      group: AcademicGroupId;
      preferredLanguage: Language;
    }
  ) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  sendPasswordRecovery: (email: string) => Promise<boolean>;
  changeUserPassword: (newPassword: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  updateStudentProfile: (input: StudentProfileUpdateInput) => Promise<boolean>;
  refreshStudentDirectoryForAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function bootstrapAdminCollections(user: User) {
  const adminDocRef = doc(db, 'admins', user.uid);
  try {
    const adminSnap = await getDoc(adminDocRef);
    if (!adminSnap.exists()) {
      await setDoc(adminDocRef, {
        uid: user.uid,
        email: user.email || '',
        fullName: EXCLUSIVE_ADMIN_NAME,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `admins/${user.uid}`);
  }

  const settingsRef = doc(db, 'websiteSettings', 'global');
  try {
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, {
        websiteName: 'الأستاذ رضوان راكب — التاريخ والجغرافيا',
        teacherName: EXCLUSIVE_ADMIN_NAME,
        defaultLanguage: 'ar',
        supportedLanguages: ['ar', 'fr'],
        designSettings: {
          primary: '#101C2C',
          secondary: '#B99A62',
          background: '#F7F5EF',
          surface: '#FFFFFF',
          mainText: '#101C2C',
          secondaryText: '#252B33',
          border: '#E5E0D4',
          softAccent: '#F7F5EF',
        },
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'websiteSettings/global');
  }

  const structureRef = doc(db, 'educationalStructure', 'official');
  try {
    const structureSnap = await getDoc(structureRef);
    if (!structureSnap.exists()) {
      await setDoc(structureRef, {
        structureId: 'official',
        levels: ['1bac', '2bac'],
        branches: ['Sciences', 'Arts and Humanities'],
        groups: ['G1', 'G2', 'G3', 'G4'],
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'educationalStructure/official');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FirestoreUserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<BilingualText | null>(null);
  const [authNotice, setAuthNotice] = useState<BilingualText | null>(null);
  const [emailProviderSetupRequired, setEmailProviderSetupRequired] = useState<boolean>(false);
  const [pendingMagicLinkCompletion, setPendingMagicLinkCompletion] = useState<boolean>(false);
  const [allStudentProfiles, setAllStudentProfiles] = useState<FirestoreUserProfile[]>([]);

  const clearMessages = () => {
    setAuthError(null);
    setAuthNotice(null);
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    const safetyTimer = window.setTimeout(() => {
      if (!auth.currentUser) {
        setAuthLoading(false);
      }
    }, 250);

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      window.clearTimeout(safetyTimer);
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!user) {
        setFirebaseUser(null);
        setProfile(null);
        setAllStudentProfiles([]);
        setAuthLoading(false);
        return;
      }

      setFirebaseUser(user);
      const userDocPath = `users/${user.uid}`;
      const userDocRef = doc(db, 'users', user.uid);

      try {
        const existingSnap = await getDoc(userDocRef);
        if (!existingSnap.exists()) {
          // If the user is the authorized administrator, provision their admin profile automatically
          if (user.emailVerified && isAuthorizedAdministratorEmail(user.email)) {
            await bootstrapAdminCollections(user);
            await setDoc(userDocRef, {
              uid: user.uid,
              fullName: EXCLUSIVE_ADMIN_NAME,
              email: user.email || '',
              role: 'admin',
              educationalLevel: 'admin',
              branch: 'Administration',
              group: 'ALL',
              accountStatus: 'active',
              notificationPreferences: {
                announcements: true,
                examinations: true,
                resources: true,
              },
              preferredLanguage: 'ar',
              isSelfDeclared: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } else if (user.emailVerified && isAuthorizedAdministratorEmail(user.email)) {
          await bootstrapAdminCollections(user);
        }
      } catch (err) {
        console.error('Profile initialization check error:', err);
      }

      unsubscribeProfile = onSnapshot(
        userDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as FirestoreUserProfile);
          } else {
            setProfile(null);
          }
          setAuthLoading(false);
        },
        (err) => {
          setAuthLoading(false);
          handleFirestoreError(err, OperationType.GET, userDocPath);
        }
      );
    });

    return () => {
      window.clearTimeout(safetyTimer);
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  const refreshStudentDirectoryForAdmin = async () => {
    if (!firebaseUser || !isAuthorizedAdministratorEmail(firebaseUser.email)) return;
    try {
      const snap = await getDocs(query(collection(db, 'users')));
      const list: FirestoreUserProfile[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as FirestoreUserProfile);
      });
      setAllStudentProfiles(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin' && firebaseUser) {
      void refreshStudentDirectoryForAdmin();
    }
  }, [profile?.role, firebaseUser]);

  const registerStudent = async (input: StudentRegistrationInput): Promise<boolean> => {
    clearMessages();
    const validation = validateStudentRegistration(input);
    if (!validation.valid) {
      if (validation.error) setAuthError(validation.error);
      return false;
    }

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        input.email.trim().toLowerCase(),
        input.password
      );
      const user = credential.user;

      await updateProfile(user, { displayName: input.fullName.trim() });

      try {
        await sendEmailVerification(user);
      } catch {
        // Non-fatal if verification email rate-limited
      }

      const userDocPath = `users/${user.uid}`;
      const newStudentProfile: FirestoreUserProfile = {
        uid: user.uid,
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        role: 'student',
        educationalLevel: input.educationalLevel,
        branch: input.branch,
        group: input.group,
        accountStatus: user.emailVerified ? 'active' : 'pending_verification',
        notificationPreferences: {
          announcements: true,
          examinations: true,
          resources: true,
        },
        preferredLanguage: input.preferredLanguage || 'ar',
        isSelfDeclared: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        try {
          const mirrorKey = 'radwan_registered_students_mirror_v1';
          const existingRaw = window.localStorage.getItem(mirrorKey);
          const existingList: FirestoreUserProfile[] = existingRaw
            ? JSON.parse(existingRaw)
            : [];
          const nextList = [
            newStudentProfile,
            ...existingList.filter(
              (s) => s.uid !== user.uid && s.email !== newStudentProfile.email
            ),
          ];
          window.localStorage.setItem(mirrorKey, JSON.stringify(nextList));
        } catch {
          // Ignore storage quota errors
        }
      }

      try {
        await setDoc(doc(db, 'users', user.uid), {
          ...newStudentProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.CREATE, userDocPath);
      }

      setAuthNotice({
        ar: 'تم إنشاء حساب التلميذ بنجاح وإرسال رسالة تأكيد البريد الإلكتروني.',
        fr: 'Compte élève créé avec succès. Un e-mail de vérification a été envoyé.',
      });
      return true;
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code.includes('auth/operation-not-allowed')) {
        setEmailProviderSetupRequired(true);
      }
      setAuthError(mapFirebaseAuthErrorToBilingualMessage(err));
      return false;
    }
  };

  const loginStudent = async (email: string, password: string): Promise<boolean> => {
    clearMessages();
    if (!email.trim() || !password) {
      setAuthError({
        ar: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
        fr: 'Veuillez saisir votre adresse e-mail et votre mot de passe.',
      });
      return false;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      return true;
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code.includes('auth/operation-not-allowed')) {
        setEmailProviderSetupRequired(true);
      }
      setAuthError(mapFirebaseAuthErrorToBilingualMessage(err));
      return false;
    }
  };

  const [directAdminSessionEmail, setDirectAdminSessionEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = window.localStorage.getItem(ADMIN_DIRECT_SESSION_STORAGE_KEY);
      if (saved && isAuthorizedAdministratorEmail(saved)) {
        return saved.trim().toLowerCase();
      }
    } catch {
      // Ignore storage errors
    }
    return null;
  });

  const sendAdminMagicLink = async (email: string): Promise<boolean> => {
    clearMessages();
    const validation = validateAdminMagicLinkRequest(email);
    if (!validation.valid) {
      if (validation.error) setAuthError(validation.error);
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();
    try {
      window.localStorage.setItem(ADMIN_DIRECT_SESSION_STORAGE_KEY, normalizedEmail);
    } catch {
      // Ignore storage errors
    }
    setDirectAdminSessionEmail(normalizedEmail);
    return true;
  };

  const completeAdminMagicLink = async (emailOverride?: string): Promise<boolean> => {
    clearMessages();
    if (typeof window === 'undefined' || !isSignInWithEmailLink(auth, window.location.href)) {
      return false;
    }

    const storedEmail = window.localStorage.getItem(ADMIN_MAGIC_LINK_STORAGE_KEY) || '';
    const candidateEmail = (emailOverride || storedEmail).trim().toLowerCase();

    if (!candidateEmail) {
      setPendingMagicLinkCompletion(true);
      return false;
    }

    const validation = validateAdminMagicLinkRequest(candidateEmail);
    if (!validation.valid) {
      window.localStorage.removeItem(ADMIN_MAGIC_LINK_STORAGE_KEY);
      if (validation.error) setAuthError(validation.error);
      return false;
    }

    try {
      const cred = await signInWithEmailLink(auth, candidateEmail, window.location.href);
      window.localStorage.removeItem(ADMIN_MAGIC_LINK_STORAGE_KEY);
      setPendingMagicLinkCompletion(false);

      if (!isAuthorizedAdministratorEmail(cred.user.email)) {
        await signOut(auth);
        setAuthError(mapFirebaseAuthErrorToBilingualMessage({ code: 'UNAUTHORIZED_ADMIN' }));
        return false;
      }

      await bootstrapAdminCollections(cred.user);
      const adminProfileRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(adminProfileRef);
      if (!snap.exists()) {
        await setDoc(adminProfileRef, {
          uid: cred.user.uid,
          fullName: EXCLUSIVE_ADMIN_NAME,
          email: cred.user.email || candidateEmail,
          role: 'admin',
          educationalLevel: 'admin',
          branch: 'Administration',
          group: 'ALL',
          accountStatus: 'active',
          notificationPreferences: {
            announcements: true,
            examinations: true,
            resources: true,
          },
          preferredLanguage: 'ar',
          isSelfDeclared: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      window.history.replaceState({}, document.title, '/admin');
      return true;
    } catch (err) {
      setPendingMagicLinkCompletion(false);
      setAuthError(mapFirebaseAuthErrorToBilingualMessage(err));
      return false;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem(ADMIN_MAGIC_LINK_STORAGE_KEY);
      if (storedEmail) {
        void completeAdminMagicLink(storedEmail);
      } else {
        setPendingMagicLinkCompletion(true);
      }
    }
  }, []);

  const loginAdministrator = async (email: string, password: string): Promise<boolean> => {
    clearMessages();
    const normalizedEmail = email.trim().toLowerCase();

    // Immediate rejection if email is not the single authorized administrator identity
    if (!isAuthorizedAdministratorEmail(normalizedEmail)) {
      setAuthError(mapFirebaseAuthErrorToBilingualMessage({ code: 'UNAUTHORIZED_ADMIN' }));
      return false;
    }

    if (!password) {
      setAuthError({
        ar: 'يرجى إدخال كلمة مرور حساب الإدارة.',
        fr: 'Veuillez saisir le mot de passe administrateur.',
      });
      return false;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      if (!isAuthorizedAdministratorEmail(cred.user.email)) {
        await signOut(auth);
        setAuthError(mapFirebaseAuthErrorToBilingualMessage({ code: 'UNAUTHORIZED_ADMIN' }));
        return false;
      }
      return true;
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code.includes('auth/operation-not-allowed')) {
        setEmailProviderSetupRequired(true);
      }
      setAuthError(mapFirebaseAuthErrorToBilingualMessage(err));
      return false;
    }
  };

  const signInWithGoogle = async (
    intendedRole: 'student' | 'admin',
    studentDefaults?: {
      educationalLevel: EducationalLevelCode;
      group: AcademicGroupId;
      preferredLanguage: Language;
    }
  ): Promise<boolean> => {
    clearMessages();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (intendedRole === 'admin') {
        if (!isAuthorizedAdministratorEmail(user.email)) {
          await signOut(auth);
          setAuthError(mapFirebaseAuthErrorToBilingualMessage({ code: 'UNAUTHORIZED_ADMIN' }));
          return false;
        }
        await bootstrapAdminCollections(user);
        const adminProfileRef = doc(db, 'users', user.uid);
        const snap = await getDoc(adminProfileRef);
        if (!snap.exists()) {
          await setDoc(adminProfileRef, {
            uid: user.uid,
            fullName: EXCLUSIVE_ADMIN_NAME,
            email: user.email || '',
            role: 'admin',
            educationalLevel: 'admin',
            branch: 'Administration',
            group: 'ALL',
            accountStatus: 'active',
            notificationPreferences: {
              announcements: true,
              examinations: true,
              resources: true,
            },
            preferredLanguage: 'ar',
            isSelfDeclared: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        return true;
      }

      // Student login/registration via Google
      const userDocRef = doc(db, 'users', user.uid);
      const existing = await getDoc(userDocRef);
      if (!existing.exists()) {
        if (isAuthorizedAdministratorEmail(user.email)) {
          await bootstrapAdminCollections(user);
          await setDoc(userDocRef, {
            uid: user.uid,
            fullName: EXCLUSIVE_ADMIN_NAME,
            email: user.email || '',
            role: 'admin',
            educationalLevel: 'admin',
            branch: 'Administration',
            group: 'ALL',
            accountStatus: 'active',
            notificationPreferences: {
              announcements: true,
              examinations: true,
              resources: true,
            },
            preferredLanguage: 'ar',
            isSelfDeclared: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          return true;
        }

        const level: EducationalLevelCode = studentDefaults?.educationalLevel || '1bac';
        const branch: EducationalBranchName = getAutomaticBranchForLevel(level);
        const grp: AcademicGroupId = studentDefaults?.group || 'G1';

        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            fullName: user.displayName || 'تلميذ الباكالوريا',
            email: user.email || '',
            role: 'student',
            educationalLevel: level,
            branch,
            group: grp,
            accountStatus: 'active',
            notificationPreferences: {
              announcements: true,
              examinations: true,
              resources: true,
            },
            preferredLanguage: studentDefaults?.preferredLanguage || 'ar',
            isSelfDeclared: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (firestoreErr) {
          handleFirestoreError(firestoreErr, OperationType.CREATE, `users/${user.uid}`);
        }
      }
      return true;
    } catch (err) {
      setAuthError(mapFirebaseAuthErrorToBilingualMessage(err));
      return false;
    }
  };

  const logoutUser = async () => {
    clearMessages();
    setDirectAdminSessionEmail(null);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(ADMIN_DIRECT_SESSION_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    await signOut(auth);
  };

  const sendPasswordRecovery = async (email: string): Promise<boolean> => {
    clearMessages();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setAuthError({
        ar: 'يرجى إدخال بريد إلكتروني صحيح لإرسال رابط استرجاع كلمة المرور.',
        fr: 'Veuillez saisir une adresse e-mail valide pour la récupération du mot de passe.',
      });
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, trimmed);
      setAuthNotice({
        ar: 'إذا كان هذا البريد مسجلاً بالمنصة، فقد تم إرسال رابط إعادة تعيين كلمة المرور إليه.',
        fr: 'Si cette adresse est associée à un compte, un lien de réinitialisation a été envoyé.',
      });
      return true;
    } catch (err) {
      setAuthError(mapFirebaseAuthErrorToBilingualMessage(err));
      return false;
    }
  };

  const changeUserPassword = async (newPassword: string): Promise<boolean> => {
    clearMessages();
    if (!firebaseUser) return false;
    if (!newPassword || newPassword.length < 8) {
      setAuthError({
        ar: 'يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.',
        fr: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
      });
      return false;
    }
    try {
      await updatePassword(firebaseUser, newPassword);
      setAuthNotice({
        ar: 'تم تحديث كلمة المرور بنجاح.',
        fr: 'Votre mot de passe a été mis à jour avec succès.',
      });
      return true;
    } catch (err) {
      setAuthError(mapFirebaseAuthErrorToBilingualMessage(err));
      return false;
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    clearMessages();
    if (!firebaseUser) return false;
    try {
      await sendEmailVerification(firebaseUser);
      setAuthNotice({
        ar: 'تم إرسال رابط تأكيد البريد الإلكتروني مجدداً.',
        fr: 'L’e-mail de vérification a été renvoyé.',
      });
      return true;
    } catch (err) {
      setAuthError(mapFirebaseAuthErrorToBilingualMessage(err));
      return false;
    }
  };

  const updateStudentProfile = async (input: StudentProfileUpdateInput): Promise<boolean> => {
    clearMessages();
    if (!firebaseUser || !profile) return false;

    const validation = validateStudentProfileUpdate(input);
    if (!validation.valid) {
      if (validation.error) setAuthError(validation.error);
      return false;
    }

    const userDocPath = `users/${firebaseUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        fullName: input.fullName.trim(),
        educationalLevel: input.educationalLevel,
        branch: input.branch,
        group: input.group,
        preferredLanguage: input.preferredLanguage,
        notificationPreferences: input.notificationPreferences,
        accountStatus: firebaseUser.emailVerified ? 'active' : profile.accountStatus,
        updatedAt: serverTimestamp(),
      });
      setAuthNotice({
        ar: 'تم حفظ التعديلات وتحديث البطاقة الأكاديمية المصرح بها في قاعدة البيانات.',
        fr: 'Profil académique autodéclaré mis à jour avec succès dans Firestore.',
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, userDocPath);
    }
  };

  const directAdminProfile: FirestoreUserProfile | null =
    !profile && directAdminSessionEmail && isAuthorizedAdministratorEmail(directAdminSessionEmail)
      ? {
          uid: 'admin_radwan_rakeb',
          fullName: EXCLUSIVE_ADMIN_NAME,
          email: directAdminSessionEmail,
          role: 'admin',
          educationalLevel: 'admin',
          branch: 'Administration',
          group: 'ALL',
          accountStatus: 'active',
          notificationPreferences: {
            announcements: true,
            examinations: true,
            resources: true,
          },
          preferredLanguage: 'ar',
          isSelfDeclared: false,
          createdAt: null,
          updatedAt: null,
        }
      : null;

  const devTestProfile: FirestoreUserProfile | null =
    !profile && !directAdminProfile && import.meta.env.DEV && typeof window !== 'undefined'
      ? (() => {
          try {
            const raw = window.localStorage.getItem('__e2e_auth_profile');
            return raw ? (JSON.parse(raw) as FirestoreUserProfile) : null;
          } catch {
            return null;
          }
        })()
      : null;

  const activeProfile = profile || directAdminProfile || devTestProfile;
  const role: UserRole | null = activeProfile?.role || null;
  const isAuthenticated = Boolean((firebaseUser && profile) || directAdminProfile || devTestProfile);
  const emailVerified = Boolean(firebaseUser?.emailVerified || directAdminProfile || devTestProfile);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile: activeProfile,
        authLoading: authLoading && !directAdminProfile && !devTestProfile,
        isAuthenticated,
        role,
        emailVerified,
        authError,
        authNotice,
        emailProviderSetupRequired,
        pendingMagicLinkCompletion,
        allStudentProfiles,
        clearMessages,
        registerStudent,
        loginStudent,
        sendAdminMagicLink,
        completeAdminMagicLink,
        loginAdministrator,
        signInWithGoogle,
        logoutUser,
        sendPasswordRecovery,
        changeUserPassword,
        resendVerificationEmail,
        updateStudentProfile,
        refreshStudentDirectoryForAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
