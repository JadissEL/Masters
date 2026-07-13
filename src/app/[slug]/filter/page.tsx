import { getCandidate, getCountries, getFilteredPrograms, formatTuition, type FilterCriteria } from "@/lib/queries";
import { getProgramTrackingMapAsync } from "@/lib/tracking/store";
import { parseTrackingFilterFromSearchParams } from "@/lib/tracking/filters";
import Link from "next/link";
import { notFound } from "next/navigation";
import FilterControls from "./FilterControls";
import FilterChipsBoundary from "@/components/filter/FilterChipsBoundary";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import { TrackingBadges } from "@/components/tracking/TrackingBadges";
import { schoolTypeBadgeStyle } from "@/lib/school-types";

export default async function FilterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const candidate = getCandidate(slug);
  if (!candidate) return notFound();

  const sp = await searchParams;
  const countries = getCountries();
  const trackingByProgramId = await getProgramTrackingMapAsync(candidate.slug);

  const criteria: FilterCriteria = {
    candidateSlug: candidate.slug,
    countries: Array.isArray(sp.country) ? sp.country : sp.country ? [sp.country] : undefined,
    languages: Array.isArray(sp.language) ? sp.language : sp.language ? [sp.language] : undefined,
    programTypes: Array.isArray(sp.programType) ? sp.programType : sp.programType ? [sp.programType] : undefined,
    schoolTypes: Array.isArray(sp.schoolType) ? sp.schoolType : sp.schoolType ? [sp.schoolType] : undefined,
    canEnterM2: (sp.canEnterM2 as FilterCriteria["canEnterM2"]) || undefined,
    maxTuition: sp.maxTuition ? parseInt(sp.maxTuition as string, 10) : undefined,
    minScore: sp.minScore ? parseInt(sp.minScore as string, 10) : undefined,
    alternanceOnly: sp.alternanceOnly === "true",
    internshipOnly: sp.internshipOnly === "true",
    verifiedOnly: sp.verifiedOnly === "true",
    tracking: parseTrackingFilterFromSearchParams(sp),
    trackingByProgramId,
  };

  let results = getFilteredPrograms(criteria);

  const sortBy = (sp.sortBy as string) || "";
  if (sortBy === "tuition-asc") {
    results.sort((a, b) => (a.program.tuitionYearly ?? 999999) - (b.program.tuitionYearly ?? 999999));
  } else if (sortBy === "tuition-desc") {
    results.sort((a, b) => (b.program.tuitionYearly ?? 0) - (a.program.tuitionYearly ?? 0));
  } else if (sortBy === "score-desc") {
    results.sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));
  }

  return (
    <>
      <SectionHeader
        title="Explore programmes"
        subtitle={`Find and track individual master's programmes for ${candidate.name}. Click any programme to update your application progress.`}
      />

      <FilterChipsBoundary candidateSlug={candidate.slug} />

      <div className="filter-page-layout">
        <aside className="filter-page-sidebar">
          <FilterControls
            candidateSlug={candidate.slug}
            countries={countries.map((c) => ({ slug: c.slug, name: c.name, flag: c.flag }))}
          />
        </aside>

        <div className="filter-page-results">
          <h2 className="section-title" style={{ fontSize: 22, marginBottom: 16 }}>
            {results.length} programme{results.length !== 1 ? "s" : ""} found
          </h2>

          {results.length === 0 ? (
            <EmptyState
              title="No programmes match your filters"
              description="Try removing filters or use tracking filters to find programmes you've already started reviewing."
              action={
                <Link href={`/${candidate.slug}/filter`} className="btn btn-primary">
                  Clear filters
                </Link>
              }
            />
          ) : (
            <div className="grid grid-2">
              {results.map(({ program, school, country, city, score }) => {
                const tracking = trackingByProgramId.get(program.id) ?? null;
                return (
                  <Link
                    key={program.id}
                    href={`/${candidate.slug}/programs/${program.id}`}
                    className="card school-card program-preview-card"
                  >
                    <div className="school-card-header">
                      <div style={{ flex: 1 }}>
                        <div className="school-name">{program.officialTitle || program.name}</div>
                        <div className="school-meta">
                          {school.name} · {country.flag} {country.name}
                          {city && ` · ${city.name}`}
                        </div>
                      </div>
                      {score && (
                        <div className="score-ring" style={{
                          background: score.overall >= 90 ? "var(--success-bg)" : score.overall >= 80 ? "var(--warning-bg)" : "var(--background-subtle)",
                          color: score.overall >= 90 ? "var(--success)" : score.overall >= 80 ? "var(--warning)" : "var(--foreground)",
                        }}>
                          {score.overall}
                        </div>
                      )}
                    </div>
                    <p className="school-description" style={{ fontSize: 14 }}>
                      {program.description.length > 120 ? `${program.description.slice(0, 120)}…` : program.description}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
                      <span className="badge badge-success">{program.tuitionFees}</span>
                      <span className="badge">{program.duration}</span>
                      <span className="badge" style={schoolTypeBadgeStyle(school.type)}>{school.type}</span>
                      {program.canEnterM2 === "YES" && <span className="badge badge-accent">Direct M2</span>}
                    </div>
                    <TrackingBadges tracking={tracking} />
                    <span className="program-preview-cta">Open & track this programme →</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
