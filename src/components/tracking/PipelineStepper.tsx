import type { PipelineStatus } from "@/lib/tracking/types";
import { PIPELINE_LABELS } from "@/lib/tracking/types";

const STEPS: PipelineStatus[] = [
  "not_started",
  "reviewing",
  "ongoing",
  "applied",
  "decision_pending",
  "accepted",
];

interface PipelineStepperProps {
  current: PipelineStatus;
  onSelect?: (status: PipelineStatus) => void;
}

export default function PipelineStepper({ current, onSelect }: PipelineStepperProps) {
  const currentIdx = STEPS.indexOf(current);
  const effectiveIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="pipeline-stepper" role="list" aria-label="Application pipeline">
      {STEPS.map((step, idx) => {
        const isDone = idx < effectiveIdx;
        const isCurrent = step === current || (currentIdx < 0 && idx === 0);
        const shortLabel = PIPELINE_LABELS[step].split(" ")[0];

        return (
          <button
            key={step}
            type="button"
            role="listitem"
            className={`pipeline-step ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
            onClick={() => onSelect?.(step)}
            disabled={!onSelect}
            title={PIPELINE_LABELS[step]}
          >
            <div className="pipeline-step-dot" />
            <div className="pipeline-step-label">{shortLabel}</div>
          </button>
        );
      })}
    </div>
  );
}
