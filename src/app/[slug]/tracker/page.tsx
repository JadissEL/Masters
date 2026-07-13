import {
  getCandidate,
  getProgramById,
  getSchoolById,
  getPhdOffer,
} from "@/lib/queries";
import {
  listPhdTracking,
  listProgramTracking,
  getTrackingStats,
} from "@/lib/tracking/store";
import { FEASIBILITY_LABELS, PIPELINE_LABELS } from "@/lib/tracking/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bookmark } from "lucide-react";

export default async function TrackerDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const candidate = getCandidate(slug);
  if (!candidate) return notFound();

  const [programs, phd, stats] = await Promise.all([
    listProgramTracking(slug),
    listPhdTracking(slug),
    getTrackingStats(slug),
  ]);

  const activePrograms = programs
    .filter((t) => t.pipelineStatus !== "not_started")
    .sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt));
  const activePhd = phd
    .filter((t) => t.pipelineStatus !== "not_started")
    .sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt));

  return (
    <div className="container">
      <Link
        href={`/${slug}`}
        className="nav-back"
        style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, display: "inline-flex" }}
      >
        <ArrowLeft size={18} /> Back to {candidate.name}
      </Link>

      <h1 className="section-title">
        <Bookmark size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
        Application tracker
      </h1>
      <p className="section-subtitle">
        Masters programmes and PhD positions tracked for {candidate.name}
      </p>

      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        {[
          [stats.totalTracked, "Tracked items"],
          [stats.ongoing, "Ongoing applications"],
          [stats.applied, "Applied"],
          [stats.accepted, "Accepted"],
          [stats.tierA, "Tier A shortlist"],
          [stats.urgent, "Deadline ≤ 14 days"],
        ].map(([value, label]) => (
          <div key={String(label)} className="card tracker-stat-card">
            <div className="tracker-stat-value">{value}</div>
            <div className="tracker-stat-label">{label}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title" style={{ fontSize: 20 }}>
        Master programmes
      </h2>
      {activePrograms.length === 0 ? (
        <div className="card empty-state" style={{ marginBottom: 32 }}>
          <p>No programmes tracked yet. Open a school page and expand Application tracker.</p>
          <Link href={`/${slug}/filter`} className="btn btn-primary" style={{ marginTop: 12 }}>
            Browse programmes
          </Link>
        </div>
      ) : (
        <div className="grid grid-2" style={{ marginBottom: 32 }}>
          {activePrograms.map((t) => {
            const program = getProgramById(t.programId);
            const school = program ? getSchoolById(program.schoolId) : undefined;
            return (
              <Link
                key={t.programId}
                href={school ? `/${slug}/schools/${school.slug}` : `/${slug}/filter`}
                className="card school-card"
              >
                <div className="school-name">{program?.name ?? `Program #${t.programId}`}</div>
                <div className="school-meta">{school?.name ?? "Unknown school"}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  <span className={`badge tracker-badge-${t.pipelineStatus}`}>
                    {PIPELINE_LABELS[t.pipelineStatus]}
                  </span>
                  {t.feasibility !== "undecided" && (
                    <span className="badge badge-accent">{FEASIBILITY_LABELS[t.feasibility]}</span>
                  )}
                  {t.priorityTier && <span className="badge badge-accent">Tier {t.priorityTier}</span>}
                </div>
                {t.personalDeadline && (
                  <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
                    Deadline: {t.personalDeadline.slice(0, 10)}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <h2 className="section-title" style={{ fontSize: 20 }}>
        PhD positions
      </h2>
      {activePhd.length === 0 ? (
        <div className="card empty-state">
          <p>No PhD positions tracked yet.</p>
          <Link href={`/${slug}/phd`} className="btn btn-secondary" style={{ marginTop: 12 }}>
            Browse PhD offers
          </Link>
        </div>
      ) : (
        <div className="grid grid-2">
          {activePhd.map((t) => {
            const offer = getPhdOffer(t.offerId);
            return (
              <Link
                key={t.offerId}
                href={`/${slug}/phd/${encodeURIComponent(t.offerId)}`}
                className="card school-card"
              >
                <div className="school-name">{offer?.title ?? t.offerId}</div>
                <div className="school-meta">{offer?.institution ?? "PhD"}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  <span className={`badge tracker-badge-${t.pipelineStatus}`}>
                    {PIPELINE_LABELS[t.pipelineStatus]}
                  </span>
                  {t.priorityTier && <span className="badge badge-accent">Tier {t.priorityTier}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
