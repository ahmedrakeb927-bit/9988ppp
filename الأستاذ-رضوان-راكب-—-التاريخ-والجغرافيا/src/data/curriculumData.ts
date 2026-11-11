import {
  AcademicAnnouncement,
  CurriculumLesson,
  EducationalResource,
  ExaminationPaper,
  StudentProfile,
} from '../types/academic';

export const GENERATED_IMAGES = {
  heroArchitecture: '/assets/images/hero_moroccan_architecture_1794222929294.jpg',
  historyArchive: '/assets/images/subject_history_archive_1794222929933.jpg',
  geographyAtlas: '/assets/images/subject_geography_atlas_1794222930510.jpg',
};

export const SAMPLE_STUDENT_PROFILES: StudentProfile[] = [
  {
    fullName: {
      ar: 'ياسين المنصوري',
      fr: 'Yassine El Mansouri',
    },
    studentCode: 'MAS-1BAC-SCI-014',
    streamId: '1bac-sci',
    groupId: 'G1',
    institution: {
      ar: 'الثانوية التأهيلية المرجعية — المغرب',
      fr: 'Lycée Qualifiant de Référence — Maroc',
    },
    academicYear: '2026 / 2027',
  },
  {
    fullName: {
      ar: 'سلمى بنجلون',
      fr: 'Salma Benjelloun',
    },
    studentCode: 'MAS-1BAC-SCI-028',
    streamId: '1bac-sci',
    groupId: 'G3',
    institution: {
      ar: 'الثانوية التأهيلية المرجعية — المغرب',
      fr: 'Lycée Qualifiant de Référence — Maroc',
    },
    academicYear: '2026 / 2027',
  },
  {
    fullName: {
      ar: 'حمزة العلوي',
      fr: 'Hamza El Alaoui',
    },
    studentCode: 'MAS-2BAC-LSH-009',
    streamId: '2bac-arts',
    groupId: 'G2',
    institution: {
      ar: 'الثانوية التأهيلية المرجعية — المغرب',
      fr: 'Lycée Qualifiant de Référence — Maroc',
    },
    academicYear: '2026 / 2027',
  },
  {
    fullName: {
      ar: 'مريم الشرايبي',
      fr: 'Meriem Chraibi',
    },
    studentCode: 'MAS-2BAC-LSH-041',
    streamId: '2bac-arts',
    groupId: 'G4',
    institution: {
      ar: 'الثانوية التأهيلية المرجعية — المغرب',
      fr: 'Lycée Qualifiant de Référence — Maroc',
    },
    academicYear: '2026 / 2027',
  },
];

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  // 1st Year Bac Sciences - History
  {
    id: 'hist-1bac-01',
    unitNumber: '01',
    subject: 'history',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    semester: 1,
    title: {
      ar: 'التحولات الاقتصادية والمالية والاجتماعية والفكرية في العالم في القرن 19م',
      fr: 'Les transformations économiques, financières, sociales et intellectuelles au XIXe siècle',
    },
    axisSummary: {
      ar: 'دراسة مظاهر الثورة الصناعية، تطور الرأسمالية المالية، التحولات الديمغرافية والحضرية، وبروز الفكر الاشتراكي والحركة النقابية.',
      fr: 'Analyse des mutations industrielles, de l’essor du capitalisme financier, de la croissance urbaine et de l’émergence des courants syndicaux et socialistes.',
    },
    keyConcepts: [
      { ar: 'الرأسمالية المالية', fr: 'Capitalisme financier' },
      { ar: 'التركيز الرأسمالي', fr: 'Concentration capitaliste' },
      { ar: 'الفكر الاشتراكي', fr: 'Pensée socialiste' },
    ],
    documentCount: 8,
    readingDuration: { ar: '55 دقيقة', fr: '55 min' },
  },
  {
    id: 'hist-1bac-02',
    unitNumber: '02',
    subject: 'history',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    semester: 1,
    title: {
      ar: 'التنافس الإمبريالي واندلاع الحرب العالمية الأولى',
      fr: 'La rivalité impérialiste et le déclenchement de la Première Guerre mondiale',
    },
    axisSummary: {
      ar: 'تحليل مظاهر التنافس الاستعماري الأوروبي، التحالفات العسكرية، المؤتمرات الدولية (برلين، الجزيرة الخضراء)، والأزمات الممهدة لسنة 1914.',
      fr: 'Étude des rivalités coloniales européennes, des systèmes d’alliances, des conférences internationales (Berlin, Algésiras) et des crises balkaniques et marocaines.',
    },
    keyConcepts: [
      { ar: 'التنافس الإمبريالي', fr: 'Rivalité impérialiste' },
      { ar: 'مؤتمر الجزيرة الخضراء', fr: 'Conférence d’Algésiras' },
      { ar: 'التحالفات العسكرية', fr: 'Systèmes d’alliances' },
    ],
    documentCount: 7,
    readingDuration: { ar: '50 دقيقة', fr: '50 min' },
  },
  {
    id: 'hist-1bac-03',
    unitNumber: '03',
    subject: 'history',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2'],
    semester: 1,
    title: {
      ar: 'الضغوط الاستعمارية على المغرب ومحاولات الإصلاح في القرن 19م',
      fr: 'Les pressions coloniales sur le Maroc et les tentatives de réformes au XIXe siècle',
    },
    axisSummary: {
      ar: 'قراءة تاريخية في معركة إيسلي وحرب تطوان، المعاهدات التجارية غير المتكافئة، ومشاريع الإصلاح المخزنية في عهد الحسن الأول ومحدوديتها.',
      fr: 'Lecture historique de la bataille d’Isly, de la guerre de Tétouan, des traités inégaux et des réformes makhzeniennes sous le règne de Hassan Ier.',
    },
    keyConcepts: [
      { ar: 'الحمايات القنصلية', fr: 'Protections consulaires' },
      { ar: 'الإصلاحات المخزنية', fr: 'Réformes du Makhzen' },
      { ar: 'معاهدة لالة مغنية', fr: 'Traité de Lalla Maghnia' },
    ],
    documentCount: 9,
    readingDuration: { ar: '60 دقيقة', fr: '60 min' },
  },
  {
    id: 'hist-1bac-04',
    unitNumber: '04',
    subject: 'history',
    streamId: '1bac-sci',
    applicableGroups: ['G3', 'G4'],
    semester: 2,
    title: {
      ar: 'نظام الحماية بالمغرب والاستغلال الاستعماري والنضال من أجل الاستقلال',
      fr: 'Le régime du Protectorat au Maroc, l’exploitation coloniale et la lutte pour l’indépendance',
    },
    axisSummary: {
      ar: 'تفكيك بنود عقد الحماية (1912)، آليات الاستغلال الاقتصادي، مراحل المقاومة المسلحة، وتطور الحركة الوطنية من المطالبة بالإصلاحات إلى الاستقلال.',
      fr: 'Analyse du traité de Fès (1912), des mécanismes d’exploitation coloniale, de la résistance armée et du Mouvement National jusqu’au retour de Mohammed V.',
    },
    keyConcepts: [
      { ar: 'عقد الحماية 1912', fr: 'Traité de Protectorat 1912' },
      { ar: 'الحركة الوطنية', fr: 'Mouvement National' },
      { ar: 'وثيقة المطالبة بالاستقلال', fr: 'Manifeste de l’Indépendance' },
    ],
    documentCount: 11,
    readingDuration: { ar: '70 دقيقة', fr: '70 min' },
  },

  // 2nd Year Bac Arts & Humanities - History
  {
    id: 'hist-2bac-01',
    unitNumber: '01',
    subject: 'history',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    semester: 1,
    title: {
      ar: 'العالم غداة الحرب العالمية الأولى والثورة الروسية وأزمات الديمقراطيات الليبرالية',
      fr: 'Le monde au lendemain de la Grande Guerre, la Révolution russe et les crises des démocraties',
    },
    axisSummary: {
      ar: 'دراسة مؤتمر السلام ومعاهدات الصلح، تحولات الخريطة السياسية لأوروبا، بناء النظام الاشتراكي السوفياتي، وأزمة 1929 الاقتصادية الكبرى.',
      fr: 'Étude des traités de paix de 1919-1920, de la recomposition géopolitique européenne, de l’édification soviétique et de la Grande Dépression de 1929.',
    },
    keyConcepts: [
      { ar: 'معاهدة فرساي', fr: 'Traité de Versailles' },
      { ar: 'السياسة الاقتصادية الجديدة NEP', fr: 'Nouvelle Politique Économique (NEP)' },
      { ar: 'أزمة 1929 الاقتصادية', fr: 'Crise économique de 1929' },
    ],
    documentCount: 12,
    readingDuration: { ar: '75 دقيقة', fr: '75 min' },
  },
  {
    id: 'hist-2bac-02',
    unitNumber: '02',
    subject: 'history',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    semester: 1,
    title: {
      ar: 'الحرب العالمية الثانية: الأسباب والنتائج ونظام القطبية الثنائية والحرب الباردة',
      fr: 'La Seconde Guerre mondiale, le système bipolaire et les crises de la Guerre Froide',
    },
    axisSummary: {
      ar: 'تتبع مراحل الحرب العالمية الثانية، حصيلتها الديمغرافية والسياسية، تأسيس هيئة الأمم المتحدة، وتشكل المعسكرين الشرقي والغربي.',
      fr: 'Analyse des phases de la Seconde Guerre mondiale, de la création de l’ONU et de la structuration de l’ordre bipolaire durant la Guerre Froide.',
    },
    keyConcepts: [
      { ar: 'القطبية الثنائية', fr: 'Bipolarisation' },
      { ar: 'مشروع مارشال', fr: 'Plan Marshall' },
      { ar: 'التعايش السلمي', fr: 'Coexistence pacifique' },
    ],
    documentCount: 10,
    readingDuration: { ar: '65 دقيقة', fr: '65 min' },
  },
  {
    id: 'hist-2bac-03',
    unitNumber: '03',
    subject: 'history',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G3'],
    semester: 2,
    title: {
      ar: 'تصفية الاستعمار وبروز العالم الثالث والقضية الفلسطينية والصراع العربي الإسرائيلي',
      fr: 'La décolonisation, l’émergence du Tiers-Monde, la question palestinienne et le conflit israélo-arabe',
    },
    axisSummary: {
      ar: 'تحليل نماذج حركات التحرر في آسيا وإفريقيا، حركة عدم الانحياز، الجذور التاريخية للقضية الفلسطينية، وتطورات الصراع في الشرق الأوسط.',
      fr: 'Examen des mouvements de libération nationale, du mouvement des non-alignés et des racines historiques de la question palestinienne.',
    },
    keyConcepts: [
      { ar: 'تصفية الاستعمار', fr: 'Décolonisation' },
      { ar: 'حركة عدم الانحياز', fr: 'Mouvement des Non-Alignés' },
      { ar: 'القضية الفلسطينية', fr: 'Question palestinienne' },
    ],
    documentCount: 14,
    readingDuration: { ar: '80 دقيقة', fr: '80 min' },
  },

  // 1st Year Bac Sciences - Geography
  {
    id: 'geo-1bac-01',
    unitNumber: '01',
    subject: 'geography',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    semester: 1,
    title: {
      ar: 'مفهوم التنمية: تعدد المقاربات، التقسيمات الكبرى للعالم (خريطة التنمية)',
      fr: 'Le concept de développement : multiplicité des approches et grandes divisions du monde',
    },
    axisSummary: {
      ar: 'التمييز بين النمو والتنمية، المؤشرات السوسيو-اقتصادية ومؤشر التنمية البشرية (IDH)، وتباين مستويات التنمية بين الشمال والجنوب.',
      fr: 'Distinction entre croissance et développement, analyse de l’Indice de Développement Humain (IDH) et typologie spatiale Nord-Sud.',
    },
    keyConcepts: [
      { ar: 'مؤشر التنمية البشرية IDH', fr: 'Indice de Développement Humain (IDH)' },
      { ar: 'المقاربة السوسيو-اقتصادية', fr: 'Approche socio-économique' },
      { ar: 'التقسيمات المجالية', fr: 'Divisions spatiales' },
    ],
    documentCount: 6,
    readingDuration: { ar: '45 دقيقة', fr: '45 min' },
  },
  {
    id: 'geo-1bac-02',
    unitNumber: '02',
    subject: 'geography',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    semester: 1,
    title: {
      ar: 'المجال المغربي: الموارد الطبيعية والبشرية والاختيارات الكبرى لسياسة إعداد التراب الوطني',
      fr: 'L’espace marocain : ressources naturelles et humaines et grands choix de l’aménagement du territoire',
    },
    axisSummary: {
      ar: 'تشخيص وضعية الموارد المائية والغابوية والمعدنية والبحرية بالمغرب، الخصائص الديمغرافية، والتوجهات المجالية لسياسة إعداد التراب الوطني.',
      fr: 'Diagnostic des ressources hydriques, forestières et minières au Maroc, dynamique démographique et orientations de l’aménagement du territoire national.',
    },
    keyConcepts: [
      { ar: 'إعداد التراب الوطني', fr: 'Aménagement du territoire national' },
      { ar: 'التدبير المستدام للموارد', fr: 'Gestion durable des ressources' },
      { ar: 'التأهيل البشري', fr: 'Qualification humaine' },
    ],
    documentCount: 9,
    readingDuration: { ar: '60 دقيقة', fr: '60 min' },
  },
  {
    id: 'geo-1bac-03',
    unitNumber: '03',
    subject: 'geography',
    streamId: '1bac-sci',
    applicableGroups: ['G2', 'G4'],
    semester: 2,
    title: {
      ar: 'التهيئة الحضرية والريفية بالمغرب: أزمة المدينة والريف وأشكال التدخل',
      fr: 'L’aménagement urbain et rural au Maroc : crises spatiales et formes d’intervention',
    },
    axisSummary: {
      ar: 'رصد مظاهر وعوامل أزمة المدن والأرياف المغربية، وبرامج التدخل القطاعية والتهيئة المجالية لمعالجة الاختلالات.',
      fr: 'Analyse des facteurs de crise dans les espaces urbains et ruraux marocains et étude des programmes d’intervention sectoriels et spatiaux.',
    },
    keyConcepts: [
      { ar: 'التهيئة الحضرية', fr: 'Aménagement urbain' },
      { ar: 'التهيئة الريفية', fr: 'Aménagement rural' },
      { ar: 'التمدين السريع', fr: 'Urbanisation accélérée' },
    ],
    documentCount: 8,
    readingDuration: { ar: '55 دقيقة', fr: '55 min' },
  },

  // 2nd Year Bac Arts & Humanities - Geography
  {
    id: 'geo-2bac-01',
    unitNumber: '01',
    subject: 'geography',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    semester: 1,
    title: {
      ar: 'العولمة: المفهوم والآليات والفاعلون، وتنظيم المجال العالمي في إطار العولمة',
      fr: 'La mondialisation : concept, mécanismes, acteurs et organisation de l’espace mondial',
    },
    axisSummary: {
      ar: 'تفكيك الآليات الاقتصادية والمالية والتقنية للعولمة، دور الفاعلين الدوليين والشركات المتعددة الجنسيات، وبنية الثالوث العالمي والمجالات المندمجة والهامشية.',
      fr: 'Analyse des mécanismes financiers et technologiques de la mondialisation, du rôle des firmes transnationales et de la hiérarchisation de la Triade.',
    },
    keyConcepts: [
      { ar: 'الثالوث العالمي (Triade)', fr: 'La Triade mondiale' },
      { ar: 'الشركات المتعددة الجنسيات', fr: 'Firmes Transnationales (FTN)' },
      { ar: 'المجالات المهيمنة والهامشية', fr: 'Espaces moteurs et périphéries' },
    ],
    documentCount: 10,
    readingDuration: { ar: '65 دقيقة', fr: '65 min' },
  },
  {
    id: 'geo-2bac-02',
    unitNumber: '02',
    subject: 'geography',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    semester: 1,
    title: {
      ar: 'الاتحاد الأوروبي نحو اندماج شامل ومجموعة أمريكا الشمالية للتبادل الحر (ALENA)',
      fr: 'L’Union Européenne vers une intégration globale et l’ALENA (Libre-échange nord-américain)',
    },
    axisSummary: {
      ar: 'مقارنة جغرافية واقتصادية لمراحل ومظاهر الاندماج المجالي والمؤسساتي في الاتحاد الأوروبي ودينامية التبادل الحر بأمريكا الشمالية.',
      fr: 'Étude comparative des processus d’intégration territoriale et économique au sein de l’Union Européenne et de l’espace nord-américain.',
    },
    keyConcepts: [
      { ar: 'الاندماج المجالي', fr: 'Intégration régionale' },
      { ar: 'التبادل الحر', fr: 'Libre-échange' },
      { ar: 'التكتلات الاقتصادية', fr: 'Blocs économiques régionaux' },
    ],
    documentCount: 9,
    readingDuration: { ar: '60 دقيقة', fr: '60 min' },
  },
  {
    id: 'geo-2bac-03',
    unitNumber: '03',
    subject: 'geography',
    streamId: '2bac-arts',
    applicableGroups: ['G2', 'G3', 'G4'],
    semester: 2,
    title: {
      ar: 'الولايات المتحدة الأمريكية قوة اقتصادية عظمى والصين قوة اقتصادية صاعدة',
      fr: 'Les États-Unis (hyperpuissance économique) et la Chine (puissance économique émergente)',
    },
    axisSummary: {
      ar: 'تحليل مظاهر وعوامل القوة الفلاحية والصناعية والتجارية للولايات المتحدة، ومقومات الإقلاع الاقتصادي الصيني والتحديات المجالية والبيئية.',
      fr: 'Diagnostic des fondements de la puissance économique américaine et des facteurs de l’essor industriel et commercial de la Chine contemporaine.',
    },
    keyConcepts: [
      { ar: 'قوة اقتصادية عظمى', fr: 'Hyperpuissance économique' },
      { ar: 'قوة اقتصادية صاعدة', fr: 'Puissance économique émergente' },
      { ar: 'الأقطاب التكنولوجية', fr: 'Technopoles & littoralisation' },
    ],
    documentCount: 13,
    readingDuration: { ar: '75 دقيقة', fr: '75 min' },
  },
];

export const EDUCATIONAL_RESOURCES: EducationalResource[] = [
  {
    id: 'res-01',
    referenceCode: 'DOC-METH-1BAC-01',
    subject: 'history',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    resourceType: {
      ar: 'دليل منهجي',
      fr: 'Guide Méthodologique',
    },
    title: {
      ar: 'منهجية الاشتغال على الوثائق التاريخية وبناء الموضوع المقالي في الامتحان الجهوي',
      fr: 'Méthodologie de l’étude de documents historiques et de la dissertation au Régional',
    },
    description: {
      ar: 'مرجع تطبيقي مفصل لتحديد السياق التاريخي، شرح المفاهيم والمصطلحات وفق الإطار المرجعي، واستخراج المعطيات وتركيب الفكرة الأساس.',
      fr: 'Référentiel méthodologique complet pour cadrer le contexte historique, définir les notions du cadre de référence et rédiger une synthèse rigoureuse.',
    },
    format: 'PDF · A4',
    pageCount: 18,
    updatedDate: { ar: 'أكتوبر 2026', fr: 'Octobre 2026' },
  },
  {
    id: 'res-02',
    referenceCode: 'DOC-CART-1BAC-02',
    subject: 'geography',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    resourceType: {
      ar: 'ملف خرائطي ومبياني',
      fr: 'Atlas & Représentations Graphiques',
    },
    title: {
      ar: 'تقنيات إنجاز المبيانات الجغرافية وتوطين المعطيات على خريطة المجال المغربي',
      fr: 'Techniques de réalisation des graphiques et croquis cartographiques de l’espace marocain',
    },
    description: {
      ar: 'قواعد اختيار المبيان المناسب (بالمنحنى، بالأعمدة، القطاعي) مع نماذج خرائطية موضوعاتية للموارد الطبيعية والحواضر المغربية.',
      fr: 'Règles de sélection des représentations graphiques (courbes, histogrammes, secteurs) et fonds de cartes thématiques du Maroc.',
    },
    format: 'PDF · Atlas',
    pageCount: 24,
    updatedDate: { ar: 'نونبر 2026', fr: 'Novembre 2026' },
  },
  {
    id: 'res-03',
    referenceCode: 'DOC-CHRON-2BAC-03',
    subject: 'history',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    resourceType: {
      ar: 'معجم تاريخي وخطوط زمنية',
      fr: 'Lexique Historique & Frises Chronologiques',
    },
    title: {
      ar: 'المعجم المرجعي للمفاهيم والأعلام التاريخية للثانية باكالوريا آداب وعلوم إنسانية',
      fr: 'Répertoire des concepts, biographies et chronologies du XXe siècle (2ème Bac LSH)',
    },
    description: {
      ar: 'تصنيف منهجي لكافة المصطلحات والأعلام والوقائع التاريخية الواردة في الإطار المرجعي للامتحان الوطني الموحد.',
      fr: 'Classification intégrale des notions, acteurs historiques et repères chronologiques conformes au cadre de référence de l’Examen National.',
    },
    format: 'PDF · Monograph',
    pageCount: 32,
    updatedDate: { ar: 'أكتوبر 2026', fr: 'Octobre 2026' },
  },
  {
    id: 'res-04',
    referenceCode: 'DOC-GEO-2BAC-04',
    subject: 'geography',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    resourceType: {
      ar: 'ملخص تركيبي مقارن',
      fr: 'Dossier Comparatif & Synthèse',
    },
    title: {
      ar: 'جداول مقارنة للقوى الاقتصادية الكبرى والتكتلات الجهوية في المجال العالمي',
      fr: 'Tableaux synthétiques comparés des puissances économiques et regroupements régionaux',
    },
    description: {
      ar: 'بنية موضوعاتية تقارن بين مظاهر القوة والعوامل المفسرة والمشاكل والتحديات لكل من الولايات المتحدة، الاتحاد الأوروبي، والصين.',
      fr: 'Matrices comparatives structurant les manifestations, facteurs explicatifs et défis des États-Unis, de l’Union Européenne et de la Chine.',
    },
    format: 'PDF · Dossier',
    pageCount: 22,
    updatedDate: { ar: 'نونبر 2026', fr: 'Novembre 2026' },
  },
];

export const EXAMINATION_PAPERS: ExaminationPaper[] = [
  {
    id: 'exam-1bac-reg-01',
    examCode: 'EX-REG-1BAC-S1',
    subject: 'both',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    sessionTitle: {
      ar: 'الفرض المحروس الأول — الأسدس الأول',
      fr: 'Contrôle Continu N°1 — Semestre 1',
    },
    examCategory: {
      ar: 'مراقبة مستمرة موحدة',
      fr: 'Évaluation Continue Normalisée',
    },
    title: {
      ar: 'الاشتغال على وثائق في جغرافية التنمية وموضوع مقالي حول التحولات الاقتصادية في القرن 19م',
      fr: 'Étude de documents sur le développement et sujet de dissertation sur les mutations du XIXe siècle',
    },
    methodologyFocus: {
      ar: 'تحليل مبيان مؤشر التنمية البشرية + كتابة مقال تاريخي منظم (مقدمة، عرض، خاتمة)',
      fr: 'Construction graphique IDH + rédaction structurée d’une dissertation historique',
    },
    duration: { ar: 'ساعتان (2h00)', fr: '2 heures (2h00)' },
    gradingScale: '20 / 20',
    scheduledWindow: { ar: 'الأسبوع الثالث من نونبر 2026', fr: '3ème semaine de Novembre 2026' },
  },
  {
    id: 'exam-1bac-reg-02',
    examCode: 'EX-REG-1BAC-BLANC',
    subject: 'both',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    sessionTitle: {
      ar: 'نموذج الامتحان الجهوي الموحد التجريبي',
      fr: 'Examen Régional Blanc Normalisé',
    },
    examCategory: {
      ar: 'امتحان جهوي تجريبي',
      fr: 'Simulation d’Examen Régional',
    },
    title: {
      ar: 'ملف وثائقي حول نظام الحماية بالمغرب ومقال جغرافي حول سياسة إعداد التراب الوطني',
      fr: 'Dossier documentaire sur le Protectorat au Maroc et dissertation sur l’aménagement du territoire',
    },
    methodologyFocus: {
      ar: 'تطبيق شبكة التصحيح الرسمية وفق الإطار المرجعي للأكاديمية الجهوية للتربية والتكوين',
      fr: 'Application stricte du barème officiel selon le cadre de référence académique AREF',
    },
    duration: { ar: 'ساعتان (2h00)', fr: '2 heures (2h00)' },
    gradingScale: '20 / 20',
    scheduledWindow: { ar: 'الدورة الربيعية 2027', fr: 'Session de Printemps 2027' },
  },
  {
    id: 'exam-2bac-nat-01',
    examCode: 'EX-NAT-2BAC-S1',
    subject: 'both',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    sessionTitle: {
      ar: 'الفرض المحروس الأول — الثانية باكالوريا آداب وعلوم إنسانية',
      fr: 'Contrôle Continu N°1 — 2ème Bac Arts et Humanités',
    },
    examCategory: {
      ar: 'مراقبة مستمرة تأهيلية',
      fr: 'Évaluation Continue Qualifiante',
    },
    title: {
      ar: 'تحليل وثائق تاريخية حول العالم غداة الحرب العالمية الأولى ومقال جغرافي حول العولمة',
      fr: 'Analyse de documents historiques sur l’après-Première Guerre mondiale et dissertation sur la mondialisation',
    },
    methodologyFocus: {
      ar: 'التفكير التاريخي النقدي والنهج الجغرافي (الوصف، التفسير، التعميم)',
      fr: 'Pensée critique historique et démarche géographique (description, explication, généralisation)',
    },
    duration: { ar: 'ثلاث ساعات (3h00)', fr: '3 heures (3h00)' },
    gradingScale: '20 / 20',
    scheduledWindow: { ar: 'الأسبوع الرابع من نونبر 2026', fr: '4ème semaine de Novembre 2026' },
  },
  {
    id: 'exam-2bac-nat-02',
    examCode: 'EX-NAT-2BAC-BLANC',
    subject: 'both',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    sessionTitle: {
      ar: 'نموذج الامتحان الوطني الموحد للباكالوريا — مسلك الآداب والعلوم الإنسانية',
      fr: 'Examen National Normalisé du Baccalauréat — Série Arts et Humanités',
    },
    examCategory: {
      ar: 'امتحان وطني موحد تجريبي',
      fr: 'Simulation d’Examen National',
    },
    title: {
      ar: 'نظام القطبية الثنائية وتصفية الاستعمار / القوى الاقتصادية الكبرى في المجال العالمي',
      fr: 'Bipolarisation et décolonisation / Les grandes puissances économiques dans l’espace mondial',
    },
    methodologyFocus: {
      ar: 'التدبير الزمني لورقة التحرير (3 ساعات) والالتزام بمعايير العرض والمقروئية الأكاديمية',
      fr: 'Gestion rigoureuse des 3 heures d’épreuve et maîtrise des critères de présentation académique',
    },
    duration: { ar: 'ثلاث ساعات (3h00)', fr: '3 heures (3h00)' },
    gradingScale: '20 / 20',
    scheduledWindow: { ar: 'الدورة الإعدادية الوطنية 2027', fr: 'Session Préparatoire Nationale 2027' },
  },
];

export const ACADEMIC_ANNOUNCEMENTS: AcademicAnnouncement[] = [
  {
    id: 'ann-2026-01',
    referenceNumber: 'NOTE-2026-11-A',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    status: 'published',
    category: {
      ar: 'توجيه منهجي وتأطير',
      fr: 'Directive Méthodologique',
    },
    publishedAt: {
      ar: '09 نونبر 2026',
      fr: '09 Novembre 2026',
    },
    title: {
      ar: 'تنظيم حصص الاشتغال التطبيقي على الخرائط والمبيانات لتلاميذ الأولى باكالوريا علوم (الأفواج 01 إلى 04)',
      fr: 'Organisation des séances de travaux pratiques cartographiques et graphiques pour la 1ère Bac Sciences (Groupes 01 à 04)',
    },
    excerpt: {
      ar: 'إخبار لكافة تلاميذ الأولى باكالوريا علوم بالأفواج الأربعة حول الوثائق والأدوات الهندسية المطلوبة لحصة التطبيقات المبيانية في وحدة المجال المغربي.',
      fr: 'Note destinée aux élèves de 1ère Année Bac Sciences (Groupes 01 à 04) concernant le matériel et le dossier statistique requis pour l’atelier sur l’espace marocain.',
    },
    bodyParagraphs: [
      {
        ar: 'في إطار أجرأة البرنامج الدراسي لمادة الجغرافيا للسنة الأولى من سلك الباكالوريا (مسلك العلوم)، وعملاً بمقتضيات الإطار المرجعي للامتحان الجهوي الموحد، ستُخصص الحصص التطبيقية المقبلة للتدرب المنهجي على تحويل الجداول الإحصائية إلى مبيانات دقيقة.',
        fr: 'Dans le cadre de la mise en œuvre du programme de Géographie de Première Année du Baccalauréat (Série Sciences) et conformément aux exigences du cadre de référence de l’Examen Régional Normalisé, les prochaines séances seront consacrées à la construction méthodique des représentations graphiques.',
      },
      {
        ar: 'يتعين على تلاميذ الأفواج الأربعة (الفوج 01، الفوج 02، الفوج 03، الفوج 04) إحضار الملف الوثائقي المرجعي رقم DOC-CART-1BAC-02 مع الأوراق المليمترية والأدوات الهندسية الكاملة لضمان جودة الإنجاز داخل الفصل.',
        fr: 'Les élèves des quatre groupes (Groupe 01, Groupe 02, Groupe 03 et Groupe 04) sont priés de se munir du dossier documentaire de référence DOC-CART-1BAC-02, de papier millimétré ainsi que du matériel géométrique complet.',
      },
    ],
    directiveNotes: [
      {
        ar: 'الفوج 01 والفوج 02: التركيز على مبيان المنحنى التطوري ومبيان الأعمدة المقارن.',
        fr: 'Groupes 01 et 02 : Travail approfondi sur les courbes d’évolution et histogrammes comparatifs.',
      },
      {
        ar: 'الفوج 03 والفوج 04: تطبيقات التوطين الخرائطي للموارد المائية والمعدنية بالمغرب.',
        fr: 'Groupes 03 et 04 : Exercices de localisation cartographique des ressources hydriques et minières.',
      },
    ],
    relatedUnitCode: 'DOC-CART-1BAC-02',
  },
  {
    id: 'ann-2026-02',
    referenceNumber: 'NOTE-2026-11-B',
    streamId: '2bac-arts',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    status: 'published',
    category: {
      ar: 'برمجة الفروض المحروسة',
      fr: 'Calendrier des Évaluations',
    },
    publishedAt: {
      ar: '06 نونبر 2026',
      fr: '06 Novembre 2026',
    },
    title: {
      ar: 'مذكرة تأطيرية بخصوص الفرض المحروس الأول للأسدس الأول — الثانية باكالوريا آداب وعلوم إنسانية',
      fr: 'Note de cadrage relative au premier contrôle continu du Semestre 1 — 2ème Bac Arts et Humanités',
    },
    excerpt: {
      ar: 'تحديد المحاور والمجزوءات المعنية بالفرض المحروس الأول في مادتي التاريخ والجغرافيا لفائدة تلاميذ الثانية باكالوريا آداب وعلوم إنسانية بالأفواج الأربعة.',
      fr: 'Précision des axes thématiques et des compétences évaluées lors du premier contrôle continu d’Histoire et de Géographie pour les quatre groupes de 2ème Bac LSH.',
    },
    bodyParagraphs: [
      {
        ar: 'ينهي الأستاذ رضوان راكب إلى علم تلاميذ السنة الثانية باكالوريا مسلك الآداب والعلوم الإنسانية (الأفواج 01، 02، 03، 04) أن الفرض المحروس الأول سيتضمن وضعيتين اختباريتين متكاملتين تحاكيان مواصفات الامتحان الوطني الموحد.',
        fr: 'Le Professeur Redouane Rakeb porte à la connaissance des élèves de Deuxième Année Baccalauréat, série Arts et Humanités (Groupes 01, 02, 03 et 04), que le premier contrôle continu comportera deux situations d’évaluation conformes aux standards de l’Examen National.',
      },
      {
        ar: 'تتعلق الوضعية الأولى بالاشتغال على وثائق تاريخية حول التحولات الترابية والسياسية في العالم غداة الحرب العالمية الأولى، بينما تتناول الوضعية الثانية موضوعاً مقالياً في مادة الجغرافيا حول مفهوم العولمة وآلياتها وتنظيم المجال العالمي.',
        fr: 'La première épreuve portera sur l’analyse critique d’un corpus documentaire historique relatif au monde au lendemain de la Grande Guerre, tandis que la seconde consistera en une dissertation géographique sur la mondialisation et l’organisation de l’espace mondial.',
      },
    ],
    directiveNotes: [
      {
        ar: 'الالتزام الصارم بمنهجية المقدمة المؤطرة إشكالياً وتفادي السرد غير المهيكل.',
        fr: 'Respect rigoureux de la problématisation en introduction et structuration logique des axes.',
      },
      {
        ar: 'مراجعة المعجم التاريخي والجغرافي المرفق في فضاء الموارد التربوية (DOC-CHRON-2BAC-03).',
        fr: 'Révision préalable du lexique conceptuel disponible dans l’espace Ressources (DOC-CHRON-2BAC-03).',
      },
    ],
    relatedUnitCode: 'DOC-CHRON-2BAC-03',
  },
  {
    id: 'ann-2026-03',
    referenceNumber: 'NOTE-2026-10-C',
    streamId: 'all',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    status: 'published',
    category: {
      ar: 'مذكرة منهجية عامة',
      fr: 'Orientation Pédagogique Générale',
    },
    publishedAt: {
      ar: '28 أكتوبر 2026',
      fr: '28 Octobre 2026',
    },
    title: {
      ar: 'الميثاق المنهجي لتنظيم الدفتر الدراسي وملف الوثائق المرجعية لمادتي التاريخ والجغرافيا',
      fr: 'Charte méthodologique pour la tenue du cahier de cours et du portfolio documentaire',
    },
    excerpt: {
      ar: 'توجيهات تنظيمية موحدة لتلاميذ الأولى باكالوريا علوم والثانية باكالوريا آداب وعلوم إنسانية حول هيكلة الدفاتر والخطاطات التركيبية.',
      fr: 'Orientations communes aux classes de 1ère Bac Sciences et 2ème Bac Arts et Humanités pour la structuration des synthèses et dossiers.',
    },
    bodyParagraphs: [
      {
        ar: 'يشكل التنظيم المنهجي للدفتر الدراسي وملف الدعامات الوثائقية ركيزة أساسية للتحصيل الأكاديمي الرصين والاستعداد المبكر للاستحقاقات الإشهادية الجهوية والوطنية.',
        fr: 'L’organisation méthodique du cahier de cours et du dossier documentaire constitue un levier fondamental pour la réussite aux épreuves certifiantes régionales et nationales.',
      },
    ],
    directiveNotes: [
      {
        ar: 'تخصيص قسم مستقل للمفاهيم والمصطلحات والأعلام وفق الإطار المرجعي.',
        fr: 'Réserver un répertoire dédié aux concepts, termes et repères du cadre de référence.',
      },
    ],
  },
  {
    id: 'ann-2026-04',
    referenceNumber: 'NOTE-2026-12-S',
    streamId: '1bac-sci',
    applicableGroups: ['G1', 'G2'],
    status: 'scheduled',
    category: {
      ar: 'إعلان مبرمج',
      fr: 'Annonce Programmée',
    },
    publishedAt: {
      ar: 'مبرمج للنشر: 20 نونبر 2026',
      fr: 'Publication prévue : 20 Novembre 2026',
    },
    title: {
      ar: 'إيداع عناصر الإجابة الرسمية وشبكة التقويم الذاتي للفرض المحروس الأول (الأفواج 01 و02)',
      fr: 'Publication du corrigé type et de la grille d’auto-évaluation du Contrôle N°1 (Groupes 01 & 02)',
    },
    excerpt: {
      ar: 'مذكرة مبرمجة للنشر عقب انتهاء حصة التصحيح الجماعي داخل الفصل الدراسي.',
      fr: 'Note programmée pour publication à l’issue de la séance de correction collective en classe.',
    },
    bodyParagraphs: [],
    directiveNotes: [],
  },
  {
    id: 'ann-2026-05',
    referenceNumber: 'DRAFT-2026-11-D',
    streamId: '2bac-arts',
    applicableGroups: ['G3', 'G4'],
    status: 'draft',
    category: {
      ar: 'مسودة قيد الإعداد',
      fr: 'Brouillon en Rédaction',
    },
    publishedAt: {
      ar: 'مسودة داخلية',
      fr: 'Brouillon interne',
    },
    title: {
      ar: 'برنامج حصص الدعم المنهجي استعداداً للامتحان الموحد التجريبي — الدورة الأولى',
      fr: 'Programme des séances de soutien méthodologique en préparation de l’examen blanc — Semestre 1',
    },
    excerpt: {
      ar: 'مسودة قيد المراجعة لتحديد الحجرات الدراسية وتوزيع الأفواج 03 و04.',
      fr: 'Brouillon en cours de validation pour la répartition des salles des Groupes 03 et 04.',
    },
    bodyParagraphs: [],
    directiveNotes: [],
  },
  {
    id: 'ann-2026-06',
    referenceNumber: 'ARCH-2026-09-A',
    streamId: 'all',
    applicableGroups: ['G1', 'G2', 'G3', 'G4'],
    status: 'archived',
    category: {
      ar: 'أرشيف بداية الموسم',
      fr: 'Archive Rentrée Scolaire',
    },
    publishedAt: {
      ar: 'شتنبر 2026',
      fr: 'Septembre 2026',
    },
    title: {
      ar: 'توزيع المجزوءات الدراسية السنوية والجدولة الزمنية للتقويم التشخيصي',
      fr: 'Répartition annuelle des modules du programme et calendrier de l’évaluation diagnostique',
    },
    excerpt: {
      ar: 'وثيقة مؤرشفة خاصة بانطلاق الموسم الدراسي وتوزيع الأفواج التربوية.',
      fr: 'Document archivé relatif au lancement de l’année scolaire et à la répartition des groupes.',
    },
    bodyParagraphs: [],
    directiveNotes: [],
  },
];
