import type { PhdTracking, ProgramTracking } from "@/lib/tracking/types";
import { FEASIBILITY_LABELS, PIPELINE_LABELS } from "@/lib/tracking/types";

export function TrackingBadges({
  tracking,
}: {
  tracking?: ProgramTracking | PhdTracking | null;
}) {
  if (!tracking || tracking.pipelineStatus === "not_started") return null;

  return (
    <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
      <span className={`badge tracker-badge-${tracking.pipelineStatus}`}>
        {PIPELINE_LABELS[tracking.pipelineStatus]}
      </span>
      {tracking.feasibility !== "undecided" && (
        <span
          className={`badge ${
            tracking.feasibility === "possible" ? "badge-success" : "badge-danger"
          }`}
        >
          {FEASIBILITY_LABELS[tracking.feasibility]}
        </span>
      )}
      {tracking.priorityTier && tracking.priorityTier !== "archived" && (
        <span className="badge badge-accent">Tier {tracking.priorityTier}</span>
      )}
      {tracking.blockers.length > 0 && (
        <span className="badge badge-warning">{tracking.blockers.length} blocker(s)</span>
      )}
    </span>
  );
}
