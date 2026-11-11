import React from 'react';
import { ShieldCheck, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ALL_COHORT_GROUP_KEYS,
  AudienceConfig,
  AudienceMode,
  AudienceScopePreset,
  CohortGroupKey,
  computeEffectiveAudienceAndStatus,
  formatEffectiveAudienceSummary,
  ParentHierarchyNode,
  PublicationStatus,
} from '../../utils/cmsContentRules';
import {
  EducationalBranchName,
  EducationalLevelCode,
} from '../../utils/authSecurityRules';

interface AudienceTargetingConfigEditorProps {
  allowInheritance: boolean;
  audienceMode: AudienceMode;
  onChangeAudienceMode: (mode: AudienceMode) => void;
  audienceConfig: AudienceConfig;
  onChangeAudienceConfig: (config: AudienceConfig) => void;
  itemStatus: PublicationStatus;
  parentNode?: ParentHierarchyNode | null;
}

const FIRST_BAC_GROUPS: { key: CohortGroupKey; code: string; labelAr: string; labelFr: string }[] = [
  { key: '1bac:Sciences:G1', code: 'G1', labelAr: 'الفوج 1 (علوم)', labelFr: 'Groupe 1 (Sci)' },
  { key: '1bac:Sciences:G2', code: 'G2', labelAr: 'الفوج 2 (علوم)', labelFr: 'Groupe 2 (Sci)' },
  { key: '1bac:Sciences:G3', code: 'G3', labelAr: 'الفوج 3 (علوم)', labelFr: 'Groupe 3 (Sci)' },
  { key: '1bac:Sciences:G4', code: 'G4', labelAr: 'الفوج 4 (علوم)', labelFr: 'Groupe 4 (Sci)' },
];

const SECOND_BAC_GROUPS: { key: CohortGroupKey; code: string; labelAr: string; labelFr: string }[] = [
  {
    key: '2bac:Arts and Humanities:G1',
    code: 'G1',
    labelAr: 'الفوج 1 (آداب)',
    labelFr: 'Groupe 1 (LSH)',
  },
  {
    key: '2bac:Arts and Humanities:G2',
    code: 'G2',
    labelAr: 'الفوج 2 (آداب)',
    labelFr: 'Groupe 2 (LSH)',
  },
  {
    key: '2bac:Arts and Humanities:G3',
    code: 'G3',
    labelAr: 'الفوج 3 (آداب)',
    labelFr: 'Groupe 3 (LSH)',
  },
  {
    key: '2bac:Arts and Humanities:G4',
    code: 'G4',
    labelAr: 'الفوج 4 (آداب)',
    labelFr: 'Groupe 4 (LSH)',
  },
];

export function AudienceTargetingConfigEditor({
  allowInheritance,
  audienceMode,
  onChangeAudienceMode,
  audienceConfig,
  onChangeAudienceConfig,
  itemStatus,
  parentNode,
}: AudienceTargetingConfigEditorProps) {
  const { lang } = useLanguage();

  const effective = computeEffectiveAudienceAndStatus(
    {
      status: itemStatus,
      audienceMode: allowInheritance ? audienceMode : 'independent',
      audienceConfig,
    },
    parentNode
  );

  const handleSelectPreset = (preset: AudienceScopePreset) => {
    if (preset === 'all') {
      onChangeAudienceConfig({
        scopePreset: 'all',
        allStudents: true,
        levels: ['1bac', '2bac'],
        branches: ['Sciences', 'Arts and Humanities'],
        groups: [...ALL_COHORT_GROUP_KEYS],
      });
      return;
    }

    if (preset === 'level') {
      onChangeAudienceConfig({
        scopePreset: 'level',
        allStudents: false,
        levels: ['1bac'],
        branches: [],
        groups: [],
      });
      return;
    }

    if (preset === 'branch') {
      onChangeAudienceConfig({
        scopePreset: 'branch',
        allStudents: false,
        levels: [],
        branches: ['Sciences'],
        groups: [],
      });
      return;
    }

    if (preset === 'single_group') {
      onChangeAudienceConfig({
        scopePreset: 'single_group',
        allStudents: false,
        levels: [],
        branches: [],
        groups: ['1bac:Sciences:G1'],
      });
      return;
    }

    onChangeAudienceConfig({
      scopePreset: preset,
      allStudents: false,
      levels: [],
      branches: [],
      groups: ['1bac:Sciences:G1', '1bac:Sciences:G3'],
    });
  };

  const toggleLevel = (lvl: EducationalLevelCode) => {
    const exists = audienceConfig.levels.includes(lvl);
    const nextLevels = exists
      ? audienceConfig.levels.filter((x) => x !== lvl)
      : [...audienceConfig.levels, lvl];
    onChangeAudienceConfig({
      ...audienceConfig,
      allStudents: false,
      levels: nextLevels,
    });
  };

  const toggleBranch = (br: EducationalBranchName) => {
    const exists = audienceConfig.branches.includes(br);
    const nextBranches = exists
      ? audienceConfig.branches.filter((x) => x !== br)
      : [...audienceConfig.branches, br];
    onChangeAudienceConfig({
      ...audienceConfig,
      allStudents: false,
      branches: nextBranches,
    });
  };

  const toggleGroupKey = (key: CohortGroupKey) => {
    if (audienceConfig.scopePreset === 'single_group') {
      onChangeAudienceConfig({
        ...audienceConfig,
        allStudents: false,
        levels: [],
        branches: [],
        groups: [key],
      });
      return;
    }

    const exists = audienceConfig.groups.includes(key);
    const nextGroups = exists
      ? audienceConfig.groups.filter((k) => k !== key)
      : [...audienceConfig.groups, key];
    onChangeAudienceConfig({
      ...audienceConfig,
      allStudents: false,
      groups: nextGroups,
    });
  };

  return (
    <div className="bg-[#F7F5EF] border border-[#E5E0D4] rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0D4]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#B99A62]" />
          <h4 className="text-xs font-semibold text-[#101C2C]">
            {lang === 'ar'
              ? 'إعدادات استهداف الجمهور والتوارث'
              : 'Ciblage d’Audience et Héritage'}
          </h4>
        </div>

        {allowInheritance && (
          <div className="flex items-center bg-[#FFFFFF] border border-[#E5E0D4] rounded-lg p-1">
            <button
              type="button"
              data-testid="audience-mode-inherit"
              onClick={() => onChangeAudienceMode('inherit')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md cursor-pointer ${
                audienceMode === 'inherit'
                  ? 'bg-[#101C2C] text-[#F7F5EF] font-semibold'
                  : 'text-[#252B33] hover:text-[#101C2C]'
              }`}
            >
              {lang === 'ar' ? 'توارث من العنصر الأب' : 'Hériter du parent'}
            </button>
            <button
              type="button"
              data-testid="audience-mode-independent"
              onClick={() => onChangeAudienceMode('independent')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md cursor-pointer ${
                audienceMode === 'independent'
                  ? 'bg-[#101C2C] text-[#F7F5EF] font-semibold'
                  : 'text-[#252B33] hover:text-[#101C2C]'
              }`}
            >
              {lang === 'ar' ? 'تخصيص مستقل' : 'Personnalisé'}
            </button>
          </div>
        )}
      </div>

      {/* Independent Configuration Controls */}
      {(!allowInheritance || audienceMode === 'independent') && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="block text-[11px] font-medium text-[#252B33]">
              {lang === 'ar' ? 'نطاق الجمهور المستهدف:' : 'Portée du ciblage :'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  {
                    id: 'all',
                    labelAr: '1. جميع التلاميذ',
                    labelFr: '1. Tous les élèves',
                  },
                  {
                    id: 'level',
                    labelAr: '2. مستوى دراسي كامل',
                    labelFr: '2. Niveau complet',
                  },
                  {
                    id: 'branch',
                    labelAr: '3. مسلك دراسي كامل',
                    labelFr: '3. Branche complète',
                  },
                  {
                    id: 'single_group',
                    labelAr: '4. فوج واحد محدد',
                    labelFr: '4. Un seul groupe',
                  },
                  {
                    id: 'multiple_groups',
                    labelAr: '5. عدة أفواج مختارة',
                    labelFr: '5. Plusieurs groupes',
                  },
                  {
                    id: 'custom',
                    labelAr: '6. تركيبة مخصصة',
                    labelFr: '6. Combinaison',
                  },
                ] as const
              ).map((preset) => {
                const active = audienceConfig.scopePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    data-testid={`audience-preset-${preset.id}`}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`px-3 py-2 text-xs text-start rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#101C2C] text-[#F7F5EF] border-[#B99A62] font-semibold'
                        : 'bg-[#FFFFFF] text-[#101C2C] border-[#E5E0D4] hover:border-[#B99A62]'
                    }`}
                  >
                    {lang === 'ar' ? preset.labelAr : preset.labelFr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Selection */}
          {(audienceConfig.scopePreset === 'level' ||
            audienceConfig.scopePreset === 'custom') && (
            <div className="space-y-1.5">
              <span className="block text-[11px] font-medium text-[#101C2C]">
                {lang === 'ar' ? 'المستويات المستهدفة:' : 'Niveaux ciblés :'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  [
                    {
                      lvl: '1bac' as EducationalLevelCode,
                      ar: 'الأولى باكالوريا (علوم · G1-G4)',
                      fr: '1ère Année Bac (Sciences · G1-G4)',
                    },
                    {
                      lvl: '2bac' as EducationalLevelCode,
                      ar: 'الثانية باكالوريا (آداب وعلوم إنسانية · G1-G4)',
                      fr: '2ème Année Bac (Arts & Humanités · G1-G4)',
                    },
                  ]
                ).map((item) => {
                  const selected = audienceConfig.levels.includes(item.lvl);
                  return (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => toggleLevel(item.lvl)}
                      className={`p-2.5 text-xs text-start rounded-lg border cursor-pointer ${
                        selected
                          ? 'bg-[#101C2C] text-[#F7F5EF] border-[#B99A62] font-semibold'
                          : 'bg-[#FFFFFF] text-[#101C2C] border-[#E5E0D4]'
                      }`}
                    >
                      {lang === 'ar' ? item.ar : item.fr}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Branch Selection */}
          {(audienceConfig.scopePreset === 'branch' ||
            audienceConfig.scopePreset === 'custom') && (
            <div className="space-y-1.5">
              <span className="block text-[11px] font-medium text-[#101C2C]">
                {lang === 'ar' ? 'المسالك المستهدفة:' : 'Branches ciblées :'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  [
                    {
                      br: 'Sciences' as EducationalBranchName,
                      ar: 'مسلك العلوم (الأولى باكالوريا)',
                      fr: 'Branche Sciences (1ère Bac)',
                    },
                    {
                      br: 'Arts and Humanities' as EducationalBranchName,
                      ar: 'مسلك الآداب والعلوم الإنسانية (الثانية باكالوريا)',
                      fr: 'Branche Arts et Humanités (2ème Bac)',
                    },
                  ]
                ).map((item) => {
                  const selected = audienceConfig.branches.includes(item.br);
                  return (
                    <button
                      key={item.br}
                      type="button"
                      onClick={() => toggleBranch(item.br)}
                      className={`p-2.5 text-xs text-start rounded-lg border cursor-pointer ${
                        selected
                          ? 'bg-[#101C2C] text-[#F7F5EF] border-[#B99A62] font-semibold'
                          : 'bg-[#FFFFFF] text-[#101C2C] border-[#E5E0D4]'
                      }`}
                    >
                      {lang === 'ar' ? item.ar : item.fr}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Granular Group Checkboxes */}
          {(audienceConfig.scopePreset === 'single_group' ||
            audienceConfig.scopePreset === 'multiple_groups' ||
            audienceConfig.scopePreset === 'custom') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-3.5 space-y-2">
                <p className="text-xs font-semibold text-[#101C2C]">
                  {lang === 'ar' ? 'الأولى باكالوريا — علوم:' : '1ère Bac — Sciences :'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {FIRST_BAC_GROUPS.map((g) => {
                    const checked = audienceConfig.groups.includes(g.key);
                    return (
                      <button
                        key={g.key}
                        type="button"
                        data-testid={`target-group-1bac-${g.code}`}
                        onClick={() => toggleGroupKey(g.key)}
                        className={`px-2.5 py-2 text-xs rounded-lg border text-start transition-colors cursor-pointer ${
                          checked
                            ? 'bg-[#101C2C] text-[#F7F5EF] border-[#B99A62] font-semibold'
                            : 'bg-[#F7F5EF] text-[#101C2C] border-[#E5E0D4]'
                        }`}
                      >
                        <span className="font-mono-tabular block text-[#B99A62]">{g.code}</span>
                        <span className="text-[11px] opacity-90">
                          {lang === 'ar' ? g.labelAr : g.labelFr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E5E0D4] rounded-xl p-3.5 space-y-2">
                <p className="text-xs font-semibold text-[#101C2C]">
                  {lang === 'ar'
                    ? 'الثانية باكالوريا — آداب وعلوم إنسانية:'
                    : '2ème Bac — Arts et Humanités :'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SECOND_BAC_GROUPS.map((g) => {
                    const checked = audienceConfig.groups.includes(g.key);
                    return (
                      <button
                        key={g.key}
                        type="button"
                        data-testid={`target-group-2bac-${g.code}`}
                        onClick={() => toggleGroupKey(g.key)}
                        className={`px-2.5 py-2 text-xs rounded-lg border text-start transition-colors cursor-pointer ${
                          checked
                            ? 'bg-[#101C2C] text-[#F7F5EF] border-[#B99A62] font-semibold'
                            : 'bg-[#F7F5EF] text-[#101C2C] border-[#E5E0D4]'
                        }`}
                      >
                        <span className="font-mono-tabular block text-[#B99A62]">{g.code}</span>
                        <span className="text-[11px] opacity-90">
                          {lang === 'ar' ? g.labelAr : g.labelFr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Effective Audience Live Banner */}
      <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#B99A62]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#B99A62] shrink-0" />
          <span className="text-[#252B33]">
            {lang === 'ar' ? 'الجمهور الفعلي:' : 'Audience effective :'}
          </span>
          <strong className="text-[#101C2C]" data-testid="effective-audience-summary">
            {formatEffectiveAudienceSummary(effective.effectiveGroupKeys, lang)}
          </strong>
        </div>
        <span className="font-mono-tabular text-[11px] text-[#B99A62] font-semibold">
          {effective.effectiveGroupKeys.length} / 8{' '}
          {lang === 'ar' ? 'أفواج مخولة' : 'groupes autorisés'}
        </span>
      </div>
    </div>
  );
}
