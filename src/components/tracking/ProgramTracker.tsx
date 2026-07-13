"use client";

import { useEffect, useState } from "react";
import TrackingPanel from "./TrackingPanel";
import {
  addProgramOutreach,
  deleteProgramOutreach,
  fetchProgramTracking,
  saveProgramTracking,
} from "@/lib/tracking/api-client";
import type { ProgramTracking } from "@/lib/tracking/types";
import { createDefaultProgramTracking } from "@/lib/tracking/types";

interface ProgramTrackerProps {
  candidateSlug: string;
  programId: number;
  initial?: ProgramTracking | null;
}

export default function ProgramTracker({
  candidateSlug,
  programId,
  initial,
}: ProgramTrackerProps) {
  const [data, setData] = useState<ProgramTracking | null>(
    initial ?? null
  );

  useEffect(() => {
    if (initial) return;
    fetchProgramTracking(candidateSlug, programId)
      .then(setData)
      .catch(() =>
        setData(createDefaultProgramTracking(candidateSlug, programId))
      );
  }, [candidateSlug, programId, initial]);

  return (
    <TrackingPanel
      candidateSlug={candidateSlug}
      mode="program"
      entityId={programId}
      initial={data}
      onSave={(patch) => saveProgramTracking(candidateSlug, programId, patch)}
      onAddOutreach={(event) => addProgramOutreach(candidateSlug, programId, event)}
      onDeleteOutreach={(eventId) =>
        deleteProgramOutreach(candidateSlug, programId, eventId)
      }
    />
  );
}
