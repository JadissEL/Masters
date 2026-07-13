import { getCandidate, getCountries, getFilteredSchools, getMinTuitionForSchoolByCandidate, formatTuition, type FilterCriteria } from "@/lib/queries";
import { getProgramTrackingMapAsync } from "@/lib/tracking/store";
import { parseTrackingFilterFromSearchParams } from "@/lib/tracking/filters";
import Link from "next/link";
import { notFound } from "next/navigation";
import FilterControls from "./FilterControls";
import FilterChipsBoundary from "@/components/filter/FilterChipsBoundary";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
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

  let results = getFilteredSchools(criteria);

  const sortBy = (sp.sortBy as string) || "";
  if (sortBy === "tuition-asc") {
    results.sort((a, b) => {
      const ta = getMinTuitionForSchoolByCandidate(a.school.id, candidate.slug);
      const tb = getMinTuitionForSchoolByCandidate(b.school.id, candidate.slug);
      if (ta === null && tb === null) return 0;
      if (ta === null) return 1;
      if (tb === null) return -1;
      return ta - tb;
    });
  } else if (sortBy === "tuition-desc") {
    results.sort((a, b) => {
      const ta = getMinTuitionForSchoolByCandidate(a.school.id, candidate.slug);
      const tb = getMinTuitionForSchoolByCandidate(b.school.id, candidate.slug);
      if (ta === null && tb === null) return 0;
      if (ta === null) return 1;
      if (tb === null) return -1;
      return tb - ta;
    });
  } else if (sortBy === "score-desc") {
    results.sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));
  }

  return (
    <>
      <SectionHeader
        title="Explore schools"
        subtitle={`Find schools matching ${candidate.name}'s criteria across ${countries.length} countries`}
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
            {results.length} school{results.length !== 1 ? "s" : ""} found
          </h2>

          {results.length === 0 ? (
            <EmptyState
              title="No schools match your filters"
              description="Try removing some filters or broadening your criteria to see more results."
              action={
                <Link href={`/${candidate.slug}/filter`} className="btn btn-primary">
                  Clear filters
                </Link>
              }
            />
          ) : (
            <div className="grid grid-2">
              {results.map((r) => {
                const minTuition = getMinTuitionForSchoolByCandidate(r.school.id, candidate.slug);
                return (
                  <Link
                    key={r.school.id}
                    href={`/${candidate.slug}/schools/${r.school.slug}`}
                    className="card school-card"
                  >
                    <div className="school-card-header">
                      <div style={{ flex: 1 }}>
                        <div className="school-name">{r.school.name}</div>
                        <div className="school-meta">
                          {r.country.flag} {r.country.name}
                          {r.city && ` · ${r.city.name}`}
                        </div>
                        <div className="school-meta">{r.school.ranking}</div>
                      </div>
                      {r.score && (
                        <div className="score-ring" style={{
                          background: r.score.overall >= 90 ? "var(--success-bg)" : r.score.overall >= 80 ? "var(--warning-bg)" : "var(--background-subtle)",
                          color: r.score.overall >= 90 ? "var(--success)" : r.score.overall >= 80 ? "var(--warning)" : "var(--foreground)",
                        }}>
                          {r.score.overall}
                        </div>
                      )}
                    </div>
                    <div className="school-description">{r.school.description}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
                      <span className="badge badge-success">
                        From {formatTuition(minTuition)}
                      </span>
                      <span className="badge">{r.school.teachingLanguage}</span>
                      <span className="badge" style={schoolTypeBadgeStyle(r.school.type)}>{r.school.type}</span>
                      {r.matchedPrograms.slice(0, 3).map((p) => (
                        <span key={p.id} className="badge badge-accent">{p.name}</span>
                      ))}
                      {r.matchedPrograms.length > 3 && (
                        <span className="badge">+{r.matchedPrograms.length - 3} more</span>
                      )}
                    </div>
                    {r.score && (
                      <span className={`badge ${r.score.recommendation === "Highly Recommended" ? "badge-success" : "badge-accent"}`}>
                        {r.score.recommendation}
                      </span>
                    )}
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
