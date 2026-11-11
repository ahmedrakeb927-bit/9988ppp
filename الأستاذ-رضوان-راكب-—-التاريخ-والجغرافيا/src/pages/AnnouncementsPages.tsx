import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Bell, Calendar, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { AcademicGroupId } from '../types/academic';
import { ACADEMIC_STREAMS } from '../utils/academicRules';
import { EducationalLevelCode, levelToStreamId } from '../utils/authSecurityRules';
import {
  filterPublishedAnnouncementsForUser,
  formatExamLevelFullAr,
} from '../utils/examModuleRules';

export function AnnouncementsPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const { profile, role } = useAuth();
  const { announcements } = useContent();

  // Derive authenticated student's exact registered stream and group
  const studentLevel: EducationalLevelCode =
    profile?.educationalLevel === '2bac' ? '2bac' : '1bac';
  const studentStreamId = levelToStreamId(studentLevel);
  const studentGroupId: AcademicGroupId =
    profile?.group && (['G1', 'G2', 'G3', 'G4'] as string[]).includes(profile.group)
      ? (profile.group as AcademicGroupId)
      : 'G1';

  const streamDef = ACADEMIC_STREAMS[studentStreamId];
  const groupDef =
    streamDef.groups.find((g) => g.id === studentGroupId) || streamDef.groups[0];

  const publishedList = useMemo(() => {
    if (role === 'admin') {
      return announcements.filter(
        (a) => a.status === 'published' && a.effectiveStatus === 'published'
      );
    }
    return filterPublishedAnnouncementsForUser({
      announcements,
      userProfile: profile,
    });
  }, [announcements, profile, role]);

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      <section className="bg-gradient-to-l from-[#0B1624] via-[#101C2B] to-[#0B1624] text-[#F5EFE2] border border-[#C6A064]/45 rounded-2xl p-6 sm:p-8 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#E5C18A] font-semibold">
            <Bell className="w-4 h-4 text-[#C6A064]" />
            <span>{lang === 'ar' ? 'الإعلانات التربوية' : 'Annonces Pédagogiques'}</span>
            <span aria-hidden="true">·</span>
            <span>
              {t(streamDef.levelLabel)} – {t(streamDef.branchLabel)} – {t(groupDef.label)}
            </span>
          </div>

          <Link
            to="/student"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16263B] border border-[#C6A064]/45 text-xs font-bold text-[#E5C18A] hover:bg-[#1E324D] transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#F5EFE2]">
          الإعلانات التربوية والمذكرات التنظيمية
        </h1>
      </section>

      {publishedList.length === 0 ? (
        <div
          data-testid="student-announcements-empty-state"
          className="rounded-3xl bg-[#FAF6EE] border border-[#D9C8A9] p-10 sm:p-14 text-center space-y-3 shadow-xs"
        >
          <div className="w-14 h-14 rounded-full bg-[#101C2B] border border-[#C6A064] text-[#E5C18A] flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-[#101C2B]">
            لا توجد إعلانات منشورة حالياً
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5346] max-w-md mx-auto leading-relaxed">
            سيتم عرض الإعلانات والبلاغات التربوية الخاصة بمستواك وفوجك الدراسي هنا فور نشرها من طرف الأستاذ رضوان راكب.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {publishedList.map((ann) => (
            <article
              key={ann.id}
              data-testid={`student-announcement-card-${ann.id}`}
              onClick={() => navigate(`/student/announcements/${ann.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/student/announcements/${ann.id}`);
                }
              }}
              className="group rounded-2xl bg-[#FAF6EE] border border-[#D9C8A9] hover:border-[#C6A064] p-6 shadow-[0_8px_24px_rgba(16,28,43,0.06)] hover:shadow-[0_12px_30px_rgba(198,160,100,0.16)] transition-all flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-[#101C2B] text-[#E5C18A] font-bold">
                    {formatExamLevelFullAr(ann.targetLevel)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono-tabular text-[#5C5346]">
                    <Calendar className="w-3.5 h-3.5 text-[#9E7C44]" />
                    <span>{ann.publishedAtAr}</span>
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-display font-bold text-[#101C2B] group-hover:text-[#8A6832] transition-colors">
                  {ann.titleAr}
                </h2>

                <p className="text-xs sm:text-sm text-[#334155] line-clamp-3 leading-relaxed">
                  {ann.contentAr}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2D5BE] flex items-center justify-between text-xs font-bold text-[#7A6A53]">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#9E7C44]" />
                  <span>
                    {ann.allGroupsSelected || ann.targetGroups.length === 4
                      ? 'جميع الأفواج'
                      : ann.targetGroups.join(' · ')}
                  </span>
                </span>
                <span className="text-[#101C2B] group-hover:text-[#9E7C44] inline-flex items-center gap-1">
                  <span>قراءة الإعلان</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnnouncementDetailPage() {
  const { dir } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const { profile, role } = useAuth();
  const { announcements } = useContent();

  const authorizedAnnouncements = useMemo(() => {
    if (role === 'admin') {
      return announcements.filter(
        (a) => a.status === 'published' && a.effectiveStatus === 'published'
      );
    }
    return filterPublishedAnnouncementsForUser({
      announcements,
      userProfile: profile,
    });
  }, [announcements, profile, role]);

  const current = authorizedAnnouncements.find((a) => a.id === id) || null;

  if (!current) {
    return (
      <div dir="rtl" className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        <div
          role="alert"
          data-testid="unauthorized-announcement-alert"
          className="bg-[#FAF6EE] border border-[#D9C8A9] rounded-2xl p-8 text-center space-y-4 shadow-xs"
        >
          <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
          <h1 className="text-lg sm:text-xl font-display font-bold text-[#101C2B]">
            هذا الإعلان غير متاح لفوجك الدراسي
          </h1>
          <p className="text-xs sm:text-sm text-[#4A4338]">
            يُسمح للتلميذ فقط بالاطلاع على الإعلانات والمضامين الموجهة لمستواه ومسلكه وفوجه المسجل.
          </p>
          <div>
            <Link
              to="/student/announcements"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101C2B] text-[#E5C18A] text-xs font-semibold hover:bg-[#1B2D45] transition-colors"
            >
              {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>العودة إلى إعلانات الفوج</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D9C8A9]">
        <Link
          to="/student/announcements"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#101C2B] hover:text-[#9E7C44] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى قائمة الإعلانات</span>
        </Link>
      </div>

      <article className="bg-[#FAF6EE] border border-[#D9C8A9] rounded-2xl p-6 sm:p-9 space-y-6 shadow-xs">
        <header className="pb-5 border-b border-[#E2D5BE] space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5346]">
            <span className="px-2.5 py-0.5 rounded-md bg-[#101C2B] text-[#E5C18A] font-bold">
              {formatExamLevelFullAr(current.targetLevel)}
            </span>
            <span>·</span>
            <span className="font-mono-tabular">{current.publishedAtAr}</span>
            <span>·</span>
            <span>
              {current.allGroupsSelected || current.targetGroups.length === 4
                ? 'جميع الأفواج'
                : current.targetGroups.join(' ، ')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#101C2B] leading-snug">
            {current.titleAr}
          </h1>
        </header>

        <div className="text-sm sm:text-base text-[#1E293B] whitespace-pre-line leading-relaxed">
          {current.contentAr}
        </div>
      </article>
    </div>
  );
}
