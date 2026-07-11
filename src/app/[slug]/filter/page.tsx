import { getCandidate, getCountries, getFilteredSchools, getMinTuitionForSchoolByCandidate, formatTuition, type FilterCriteria } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FilterControls from "./FilterControls";

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

  // Build filter criteria from search params
  const criteria: FilterCriteria = {
    candidateSlug: candidate.slug,
    countries: Array.isArray(sp.country) ? sp.country : sp.country ? [sp.country] : undefined,
    languages: Array.isArray(sp.language) ? sp.language : sp.language ? [sp.language] : undefined,
    programTypes: Array.isArray(sp.programType) ? sp.programType : sp.programType ? [sp.programType] : undefined,
    canEnterM2: (sp.canEnterM2 as FilterCriteria["canEnterM2"]) || undefined,
    maxTuition: sp.maxTuition ? parseInt(sp.maxTuition as string, 10) : undefined,
    minScore: sp.minScore ? parseInt(sp.minScore as string, 10) : undefined,
    alternanceOnly: sp.alternanceOnly === "true",
    internshipOnly: sp.internshipOnly === "true",
  };

  let results = getFilteredSchools(criteria);

  // Apply sorting
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
    <div className="container">
      <Link href={`/${candidate.slug}`} className="nav-back" style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, display: "inline-flex" }}>
        <ArrowLeft size={18} /> Back to {candidate.name}
      </Link>
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href={`/${candidate.slug}`}>{candidate.name}</Link>
        <span>›</span>
        <span>Filter Schools</span>
      </div>

      <h1 className="section-title">Filter Schools Across All Countries</h1>
      <p className="section-subtitle">
        Find schools matching {candidate.name}'s criteria from all {countries.length} countries
      </p>

      <FilterControls
        candidateSlug={candidate.slug}
        countries={countries.map((c) => ({ slug: c.slug, name: c.name, flag: c.flag }))}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="section-title" style={{ fontSize: 22 }}>
          {results.length} School{results.length !== 1 ? "s" : ""} Found
        </h2>
      </div>

      {results.length === 0 ? (
        <div className="card empty-state">
          <p style={{ fontSize: 16, marginBottom: 8 }}>No schools match the selected filters.</p>
          <p style={{ fontSize: 14 }}>Try removing some filters to see more results.</p>
        </div>
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
                      background: r.score.overall >= 90 ? "#e8f9ed" : r.score.overall >= 80 ? "#fff5e6" : "#f0f0f0",
                      color: r.score.overall >= 90 ? "#1a7a3a" : r.score.overall >= 80 ? "#8a5a00" : "#333",
                    }}>
                      {r.score.overall}
                    </div>
                  )}
                </div>
                <div className="school-description">{r.school.description}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
                  <span className="badge" style={{ fontWeight: 600, color: "#1a7a3a", background: "#e8f9ed" }}>
                    💰 From {formatTuition(minTuition)}
                  </span>
                  <span className="badge">{r.school.teachingLanguage}</span>
                  <span className="badge">{r.school.type}</span>
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
  );
}