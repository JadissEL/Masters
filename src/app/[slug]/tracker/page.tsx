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
import SectionHeader from "@/components/ui/SectionHeader";
import StatTile from "@/components/ui/StatTile";
import EmptyState from "@/components/ui/EmptyState";

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
    <>
      <SectionHeader
        title="Application tracker"
        subtitle={`Masters programmes and PhD positions tracked for ${candidate.name}`}
      />

      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        <StatTile value={stats.totalTracked} label="Tracked items" variant="accent" />
        <StatTile value={stats.ongoing} label="Ongoing applications" />
        <StatTile value={stats.applied} label="Applied" variant="success" />
        <StatTile value={stats.accepted} label="Accepted" variant="success" />
        <StatTile value={stats.tierA} label="Tier A shortlist" href={`/${slug}/filter?trackPriority=A`} />
        <StatTile value={stats.urgent} label="Deadline ≤ 14 days" variant="warning" href={`/${slug}/filter?trackDeadlineDays=14`} />
      </div>

      <SectionHeader title="Master programmes" subtitle={`${activePrograms.length} active`} />

      {activePrograms.length === 0 ? (
        <EmptyState
          title="No programmes tracked yet"
          description="Open a school page and expand Application tracker to start tracking."
          action={
            <Link href={`/${slug}/filter`} className="btn btn-primary">
              Browse programmes
            </Link>
          }
        />
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

      <SectionHeader title="PhD positions" subtitle={`${activePhd.length} active`} />

      {activePhd.length === 0 ? (
        <EmptyState
          title="No PhD positions tracked yet"
          description="Browse open PhD offers and expand the tracker on any position."
          action={
            slug === "dina" ? (
              <Link href={`/${slug}/phd`} className="btn btn-secondary">
                Browse PhD offers
              </Link>
            ) : undefined
          }
        />
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
    </>
  );
}
