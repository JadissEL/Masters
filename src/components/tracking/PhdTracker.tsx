"use client";

import { useEffect, useState } from "react";
import TrackingPanel from "./TrackingPanel";
import {
  addPhdOutreach,
  deletePhdOutreach,
  fetchPhdTracking,
  savePhdTracking,
} from "@/lib/tracking/api-client";
import type { PhdTracking } from "@/lib/tracking/types";
import { createDefaultPhdTracking } from "@/lib/tracking/types";

interface PhdTrackerProps {
  candidateSlug: string;
  offerId: string;
  initial?: PhdTracking | null;
}

export default function PhdTracker({ candidateSlug, offerId, initial }: PhdTrackerProps) {
  const [data, setData] = useState<PhdTracking | null>(initial ?? null);

  useEffect(() => {
    if (initial) return;
    fetchPhdTracking(candidateSlug, offerId)
      .then(setData)
      .catch(() => setData(createDefaultPhdTracking(candidateSlug, offerId)));
  }, [candidateSlug, offerId, initial]);

  return (
    <TrackingPanel
      candidateSlug={candidateSlug}
      mode="phd"
      entityId={offerId}
      initial={data}
      onSave={(patch) => savePhdTracking(candidateSlug, offerId, patch)}
      onAddOutreach={(event) => addPhdOutreach(candidateSlug, offerId, event)}
      onDeleteOutreach={(eventId) =>
        deletePhdOutreach(candidateSlug, offerId, eventId)
      }
    />
  );
}
