import type {
  OutreachEvent,
  PhdTracking,
  ProgramTracking,
} from "./types";

const base = () => "";

export async function fetchCandidateTracking(candidateSlug: string): Promise<{
  programs: ProgramTracking[];
  phd: PhdTracking[];
}> {
  const res = await fetch(`${base()}/api/tracking/${candidateSlug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load tracking");
  return res.json();
}

export async function fetchProgramTracking(
  candidateSlug: string,
  programId: number
): Promise<ProgramTracking> {
  const res = await fetch(
    `${base()}/api/tracking/${candidateSlug}/programs/${programId}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load program tracking");
  return res.json();
}

export async function saveProgramTracking(
  candidateSlug: string,
  programId: number,
  patch: Partial<ProgramTracking>
): Promise<ProgramTracking> {
  const res = await fetch(
    `${base()}/api/tracking/${candidateSlug}/programs/${programId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }
  );
  if (!res.ok) throw new Error("Failed to save tracking");
  return res.json();
}

export async function addProgramOutreach(
  candidateSlug: string,
  programId: number,
  event: Omit<OutreachEvent, "id">
): Promise<ProgramTracking> {
  const res = await fetch(
    `${base()}/api/tracking/${candidateSlug}/programs/${programId}/outreach`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }
  );
  if (!res.ok) throw new Error("Failed to add outreach");
  return res.json();
}

export async function deleteProgramOutreach(
  candidateSlug: string,
  programId: number,
  eventId: string
): Promise<ProgramTracking> {
  const res = await fetch(
    `${base()}/api/tracking/${candidateSlug}/programs/${programId}/outreach`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    }
  );
  if (!res.ok) throw new Error("Failed to delete outreach");
  return res.json();
}

export async function fetchPhdTracking(
  candidateSlug: string,
  offerId: string
): Promise<PhdTracking> {
  const res = await fetch(
    `${base()}/api/tracking/${candidateSlug}/phd/${encodeURIComponent(offerId)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load PhD tracking");
  return res.json();
}

export async function savePhdTracking(
  candidateSlug: string,
  offerId: string,
  patch: Partial<PhdTracking>
): Promise<PhdTracking> {
  const res = await fetch(
    `${base()}/api/tracking/${candidateSlug}/phd/${encodeURIComponent(offerId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }
  );
  if (!res.ok) throw new Error("Failed to save PhD tracking");
  return res.json();
}

export async function addPhdOutreach(
  candidateSlug: string,
  offerId: string,
  event: Omit<OutreachEvent, "id">
): Promise<PhdTracking> {
  const res = await fetch(
    `${base()}/api/tracking/${candidateSlug}/phd/${encodeURIComponent(offerId)}/outreach`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }
  );
  if (!res.ok) throw new Error("Failed to add outreach");
  return res.json();
}

export async function deletePhdOutreach(
  candidateSlug: string,
  offerId: string,
  eventId: string
): Promise<PhdTracking> {
  const res = await fetch(
    `${base()}/api/tracking/${candidateSlug}/phd/${encodeURIComponent(offerId)}/outreach`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    }
  );
  if (!res.ok) throw new Error("Failed to delete outreach");
  return res.json();
}
