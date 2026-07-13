import {
  getCandidate,
  getProgramById,
  getSchoolById,
  getCountryBySchoolId,
  getCityBySchoolId,
  getProgramDeadlines,
  getProgramSources,
  getSchoolAdmission,
  getScoreForSchool,
} from "@/lib/queries";
import { getProgramTracking } from "@/lib/tracking/store";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProgramTracker from "@/components/tracking/ProgramTracker";
import ProgramDetailCard from "@/app/[slug]/schools/[school]/ProgramDetailCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string; programId: string }>;
}) {
  const { slug, programId: programIdRaw } = await params;
  const programId = parseInt(programIdRaw, 10);
  if (Number.isNaN(programId)) return notFound();

  const candidate = getCandidate(slug);
  if (!candidate) return notFound();

  const program = getProgramById(programId);
  if (!program) return notFound();

  const school = getSchoolById(program.schoolId);
  if (!school) return notFound();

  const country = getCountryBySchoolId(school.id);
  const city = getCityBySchoolId(school.id);
  const score = getScoreForSchool(candidate.id, school.id);
  const admission = getSchoolAdmission(school.id);
  const tracking = await getProgramTracking(slug, programId);

  const admissionHints = admission
    ? {
        applicationUrl: admission.applicationUrl,
        applicationPortal: admission.applicationPortal,
        englishRequirements: admission.englishRequirements,
        frenchRequirements: admission.frenchRequirements,
        interviewRequired: admission.interviewRequired,
      }
    : undefined;

  return (
    <>
      <SectionHeader
        title={program.officialTitle || program.name}
        subtitle={`${school.name}${country ? ` · ${country.flag} ${country.name}` : ""}${city ? ` · ${city.name}` : ""}`}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/${slug}/schools/${school.slug}`} className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: 13 }}>
              View school
            </Link>
            {score && (
              <div className="score-ring" style={{
                width: 56, height: 56, fontSize: 18,
                background: score.overall >= 90 ? "var(--success-bg)" : score.overall >= 80 ? "var(--warning-bg)" : "var(--background-subtle)",
                color: score.overall >= 90 ? "var(--success)" : score.overall >= 80 ? "var(--warning)" : "var(--foreground)",
              }}>
                {score.overall}
              </div>
            )}
          </div>
        }
      />

      <ProgramTracker
        candidateSlug={slug}
        programId={programId}
        initial={tracking}
        prominent
      />

      <h2 className="section-title" style={{ fontSize: 20, marginTop: 8 }}>Programme information</h2>
      <ProgramDetailCard
        program={program}
        deadlines={getProgramDeadlines(programId)}
        sources={getProgramSources(programId)}
        admissionHints={admissionHints}
        candidateSlug={slug}
        tracking={tracking}
        mode="details"
      />
    </>
  );
}
