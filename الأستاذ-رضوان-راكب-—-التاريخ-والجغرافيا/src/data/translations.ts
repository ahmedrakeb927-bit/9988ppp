import { AdminSidebarSectionId, BilingualText, PageId } from '../types/academic';

export const PAGE_LABELS: Record<PageId, BilingualText> = {
  home: {
    ar: 'الرئيسية العامة',
    fr: 'Accueil Général',
  },
  history: {
    ar: 'مادة التاريخ',
    fr: 'Histoire',
  },
  geography: {
    ar: 'مادة الجغرافيا',
    fr: 'Géographie',
  },
  resources: {
    ar: 'الموارد التربوية',
    fr: 'Ressources Pédagogiques',
  },
  examinations: {
    ar: 'الامتحانات والفروض',
    fr: 'Examens & Évaluations',
  },
  announcements: {
    ar: 'الإعلانات والمذكرات',
    fr: 'Annonces & Notes',
  },
  'announcement-detail': {
    ar: 'تفاصيل الإعلان',
    fr: 'Détail de l’Annonce',
  },
  login: {
    ar: 'تسجيل الدخول',
    fr: 'Connexion',
  },
  register: {
    ar: 'تسجيل تلميذ جديد',
    fr: 'Inscription Élève',
  },
  'forgot-password': {
    ar: 'استرجاع كلمة المرور',
    fr: 'Récupération du Mot de Passe',
  },
  'student-portal': {
    ar: 'الفضاء الشخصي للتلميذ',
    fr: 'Espace Personnel Élève',
  },
  'admin-dashboard': {
    ar: 'لوحة قيادة الأستاذ',
    fr: 'Tableau de Bord Administrateur',
  },
  'admin-content': {
    ar: 'إدارة المحتوى التربوي',
    fr: 'Gestion du Contenu Pédagogique',
  },
  'admin-announcements': {
    ar: 'إدارة الإعلانات',
    fr: 'Gestion des Annonces',
  },
  'admin-customization': {
    ar: 'تخصيص واجهة الموقع',
    fr: 'Personnalisation du Portail',
  },
};

export const ADMIN_SIDEBAR_LABELS: Record<AdminSidebarSectionId, BilingualText> = {
  dashboard: {
    ar: 'لوحة القيادة العامة',
    fr: 'Tableau de Bord',
  },
  announcements: {
    ar: 'الإعلانات',
    fr: 'Annonces',
  },
  'create-announcement': {
    ar: 'إنشاء إعلان جديد',
    fr: 'Créer une Annonce',
  },
  'published-announcements': {
    ar: 'الإعلانات المنشورة',
    fr: 'Annonces Publiées',
  },
  'scheduled-announcements': {
    ar: 'الإعلانات المبرمجة',
    fr: 'Annonces Programmées',
  },
  drafts: {
    ar: 'المسودات',
    fr: 'Brouillons',
  },
  archive: {
    ar: 'الأرشيف',
    fr: 'Archives',
  },
  students: {
    ar: 'التلاميذ والأفواج',
    fr: 'Élèves & Groupes',
  },
  'subjects-lessons': {
    ar: 'المواد والدروس',
    fr: 'Matières & Leçons',
  },
  'educational-resources': {
    ar: 'الموارد التربوية',
    fr: 'Ressources Pédagogiques',
  },
  examinations: {
    ar: 'الامتحانات والتقويمات',
    fr: 'Examens & Évaluations',
  },
  statistics: {
    ar: 'الإحصائيات الأكاديمية',
    fr: 'Statistiques',
  },
  'website-customization': {
    ar: 'تخصيص الموقع',
    fr: 'Personnalisation du Site',
  },
  settings: {
    ar: 'الإعدادات العامة',
    fr: 'Paramètres',
  },
};

export const UI_TEXT = {
  brandName: {
    ar: 'الأستاذ رضوان راكب',
    fr: 'Professeur Redouane Rakeb',
  },
  brandSubtitle: {
    ar: 'أستاذ التعليم الثانوي التأهيلي · التاريخ والجغرافيا · المملكة المغربية',
    fr: 'Enseignement Secondaire Qualifiant · Histoire & Géographie · Maroc',
  },
  phaseNotice: {
    ar: 'المرحلة التأسيسية الأولى (Phase 01) — الهيكل البصري والواجهة الأكاديمية',
    fr: 'Phase 01 — Fondation Visuelle & Architecture Éditoriale',
  },
  switchLanguageLabel: {
    ar: 'Français (LTR)',
    fr: 'العربية (RTL)',
  },
  allStreams: {
    ar: 'جميع المستويات والمسالك',
    fr: 'Tous les Niveaux & Séries',
  },
  allGroups: {
    ar: 'جميع الأفواج (01 - 04)',
    fr: 'Tous les Groupes (01 - 04)',
  },
  semester1: {
    ar: 'الأسدس الأول',
    fr: 'Premier Semestre',
  },
  semester2: {
    ar: 'الأسدس الثاني',
    fr: 'Deuxième Semestre',
  },
  allSemesters: {
    ar: 'الأسدسان معاً',
    fr: 'Tous les Semestres',
  },
  historyLabel: {
    ar: 'التاريخ',
    fr: 'Histoire',
  },
  geographyLabel: {
    ar: 'الجغرافيا',
    fr: 'Géographie',
  },
  bothSubjectsLabel: {
    ar: 'التاريخ والجغرافيا',
    fr: 'Histoire & Géographie',
  },
};
