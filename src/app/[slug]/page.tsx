import {
  getCandidate,
  getCountries,
  getSchoolsWithScores,
  getMinTuitionForSchoolByCandidate,
  formatTuition,
} from "@/lib/queries";
import { getPhdOffers } from "@/lib/phd-store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, SlidersHorizontal } from "lucide-react";
import { getTrackingStats } from "@/lib/tracking/store";
import SectionHeader from "@/components/ui/SectionHeader";
import StatTile from "@/components/ui/StatTile";

export default async function CandidatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const candidate = getCandidate(slug);
  if (!candidate) return notFound();

  const countries = getCountries();
  const schools = getSchoolsWithScores(candidate.id).slice(0, 5);
  const phdOpenCount = getPhdOffers().filter((o) => o.status === "open").length;
  const trackStats = await getTrackingStats(candidate.slug);
  const tint = candidate.slug === "dina" ? "dina" : "jadiss";

  return (
    <>
      <SectionHeader
        title={candidate.name}
        subtitle={`${candidate.nationality} · ${candidate.languages}`}
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`/${candidate.slug}/filter`} className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 14 }}>
              <SlidersHorizontal size={16} style={{ marginRight: 6 }} /> Explore programmes
            </Link>
            {candidate.slug === "dina" && phdOpenCount > 0 && (
              <Link href={`/${candidate.slug}/phd`} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 14 }}>
                <GraduationCap size={16} style={{ marginRight: 6 }} /> PhD ({phdOpenCount})
              </Link>
            )}
          </div>
        }
      />

      {trackStats.totalTracked > 0 && (
        <div className="grid grid-4" style={{ marginBottom: 32 }}>
          <StatTile value={trackStats.ongoing} label="Ongoing" href={`/${slug}/filter?trackPipeline=ongoing`} variant="accent" />
          <StatTile value={trackStats.applied} label="Applied" href={`/${slug}/filter?trackPipeline=applied`} variant="success" />
          <StatTile value={trackStats.tierA} label="Tier A" href={`/${slug}/filter?trackPriority=A`} />
          <StatTile value={trackStats.urgent} label="Due soon" href={`/${slug}/filter?trackDeadlineDays=14`} variant="warning" />
        </div>
      )}

      <div className={`card candidate-card-v2 tint-${tint}`} style={{ marginBottom: 32 }}>
        <div className="grid grid-2">
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontWeight: 500 }}>Education</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{candidate.education}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontWeight: 500 }}>Experience</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{candidate.experience}</p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontWeight: 500 }}>Career objectives</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{candidate.careerObjectives}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontWeight: 500 }}>Preferences</p>
            <p style={{ fontSize: 14 }}>{candidate.preferences}</p>
          </div>
        </div>
      </div>

      <SectionHeader
        title="Top recommended schools"
        subtitle={`Best matches based on ${candidate.name}'s profile`}
      />

      <div className="grid grid-3" style={{ marginBottom: 40 }}>
        {schools.map((s) => (
          <Link key={s.id} href={`/${candidate.slug}/schools/${s.slug}`} className="card school-card">
            <div className="school-card-header">
              <div>
                <div className="school-name">{s.name}</div>
                <div className="school-meta">{s.ranking}</div>
              </div>
              {s.score && (
                <div className="score-ring" style={{
                  background: s.score.overall >= 90 ? "var(--success-bg)" : s.score.overall >= 80 ? "var(--warning-bg)" : "var(--background-subtle)",
                  color: s.score.overall >= 90 ? "var(--success)" : s.score.overall >= 80 ? "var(--warning)" : "var(--foreground)",
                }}>
                  {s.score.overall}
                </div>
              )}
            </div>
            <div className="school-description">{s.description}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
              <span className="badge badge-success">
                From {formatTuition(getMinTuitionForSchoolByCandidate(s.id, candidate.slug))}
              </span>
            </div>
            {s.score && (
              <span className={`badge ${s.score.recommendation === "Highly Recommended" ? "badge-success" : "badge-accent"}`}>
                {s.score.recommendation}
              </span>
            )}
          </Link>
        ))}
      </div>

      <SectionHeader title="Explore countries" subtitle="Browse schools by destination" />

      <div className="grid grid-2">
        {countries.map((c) => (
          <Link key={c.id} href={`/${candidate.slug}/countries/${c.slug}`} className="card country-card">
            <span className="flag">{c.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{c.summary}</div>
            </div>
            <span style={{ color: "var(--muted)" }}>›</span>
          </Link>
        ))}
      </div>
    </>
  );
}
