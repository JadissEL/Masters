import Link from "next/link";
import { getTrackingStats } from "@/lib/tracking/store";

export default async function CandidateContextBar({ slug }: { slug: string }) {
  const stats = await getTrackingStats(slug);
  if (stats.totalTracked === 0 && stats.urgent === 0) return null;

  return (
    <div className="context-bar">
      <div className="context-bar-inner">
        <span className="context-bar-label">Your pipeline</span>
        <div className="context-bar-stats">
          {stats.ongoing > 0 && (
            <Link href={`/${slug}/tracker`} className="context-stat">
              <strong>{stats.ongoing}</strong> ongoing
            </Link>
          )}
          {stats.applied > 0 && (
            <Link href={`/${slug}/tracker`} className="context-stat">
              <strong>{stats.applied}</strong> applied
            </Link>
          )}
          {stats.urgent > 0 && (
            <Link href={`/${slug}/filter?trackDeadlineDays=14`} className="context-stat context-stat-urgent">
              <strong>{stats.urgent}</strong> due soon
            </Link>
          )}
          {stats.tierA > 0 && (
            <Link href={`/${slug}/filter?trackPriority=A`} className="context-stat">
              <strong>{stats.tierA}</strong> tier A
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
