import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  OutreachEvent,
  PhdTracking,
  ProgramTracking,
  TrackingDatabase,
} from "./types";
import {
  createDefaultPhdTracking,
  createDefaultProgramTracking,
} from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "candidate-tracking.json");
const BLOB_PATHNAME = "candidate-tracking.json";
const EMPTY_DB: TrackingDatabase = {
  version: 1,
  programTracking: [],
  phdTracking: [],
};

function ensureFile(): void {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(EMPTY_DB, null, 2) + "\n", "utf-8");
  }
}

function loadFromDisk(): TrackingDatabase {
  ensureFile();
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const parsed = JSON.parse(raw) as TrackingDatabase;
  return {
    version: 1,
    programTracking: parsed.programTracking ?? [],
    phdTracking: parsed.phdTracking ?? [],
  };
}

function saveToDisk(db: TrackingDatabase): void {
  ensureFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2) + "\n", "utf-8");
}

async function loadFromBlob(): Promise<TrackingDatabase | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url);
    if (!res.ok) return null;
    const parsed = (await res.json()) as TrackingDatabase;
    return {
      version: 1,
      programTracking: parsed.programTracking ?? [],
      phdTracking: parsed.phdTracking ?? [],
    };
  } catch {
    return null;
  }
}

async function saveToBlob(db: TrackingDatabase): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const { put } = await import("@vercel/blob");
  await put(BLOB_PATHNAME, JSON.stringify(db, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function loadTrackingDb(): Promise<TrackingDatabase> {
  const blob = await loadFromBlob();
  if (blob) return blob;
  return loadFromDisk();
}

export async function saveTrackingDb(db: TrackingDatabase): Promise<void> {
  saveToDisk(db);
  await saveToBlob(db);
}

/** Sync read for build-time / fallback (disk only). */
export function loadTrackingDbSync(): TrackingDatabase {
  return loadFromDisk();
}

export function getProgramTrackingMap(candidateSlug: string): Map<number, ProgramTracking> {
  const db = loadFromDisk();
  const map = new Map<number, ProgramTracking>();
  for (const row of db.programTracking) {
    if (row.candidateSlug === candidateSlug) map.set(row.programId, row);
  }
  return map;
}

export async function getProgramTrackingMapAsync(
  candidateSlug: string
): Promise<Map<number, ProgramTracking>> {
  const db = await loadTrackingDb();
  const map = new Map<number, ProgramTracking>();
  for (const row of db.programTracking) {
    if (row.candidateSlug === candidateSlug) map.set(row.programId, row);
  }
  return map;
}

export function getPhdTrackingMap(candidateSlug: string): Map<string, PhdTracking> {
  const db = loadFromDisk();
  const map = new Map<string, PhdTracking>();
  for (const row of db.phdTracking) {
    if (row.candidateSlug === candidateSlug) map.set(row.offerId, row);
  }
  return map;
}

export async function getPhdTrackingMapAsync(
  candidateSlug: string
): Promise<Map<string, PhdTracking>> {
  const db = await loadTrackingDb();
  const map = new Map<string, PhdTracking>();
  for (const row of db.phdTracking) {
    if (row.candidateSlug === candidateSlug) map.set(row.offerId, row);
  }
  return map;
}

export async function getProgramTracking(
  candidateSlug: string,
  programId: number
): Promise<ProgramTracking | null> {
  const db = await loadTrackingDb();
  return (
    db.programTracking.find(
      (t) => t.candidateSlug === candidateSlug && t.programId === programId
    ) ?? null
  );
}

export async function getPhdTracking(
  candidateSlug: string,
  offerId: string
): Promise<PhdTracking | null> {
  const db = await loadTrackingDb();
  return (
    db.phdTracking.find(
      (t) => t.candidateSlug === candidateSlug && t.offerId === offerId
    ) ?? null
  );
}

export async function listProgramTracking(candidateSlug: string): Promise<ProgramTracking[]> {
  const db = await loadTrackingDb();
  return db.programTracking.filter((t) => t.candidateSlug === candidateSlug);
}

export async function listPhdTracking(candidateSlug: string): Promise<PhdTracking[]> {
  const db = await loadTrackingDb();
  return db.phdTracking.filter((t) => t.candidateSlug === candidateSlug);
}

export async function upsertProgramTracking(
  candidateSlug: string,
  programId: number,
  patch: Partial<ProgramTracking>
): Promise<ProgramTracking> {
  const db = await loadTrackingDb();
  const idx = db.programTracking.findIndex(
    (t) => t.candidateSlug === candidateSlug && t.programId === programId
  );
  const now = new Date().toISOString();
  let row: ProgramTracking;
  if (idx >= 0) {
    row = { ...db.programTracking[idx], ...patch, programId, candidateSlug, lastUpdatedAt: now };
    if (!row.firstReviewedAt && row.pipelineStatus !== "not_started") {
      row.firstReviewedAt = now;
    }
    db.programTracking[idx] = row;
  } else {
    row = {
      ...createDefaultProgramTracking(candidateSlug, programId),
      ...patch,
      programId,
      candidateSlug,
      lastUpdatedAt: now,
      createdAt: now,
    };
    if (row.pipelineStatus !== "not_started" && !row.firstReviewedAt) {
      row.firstReviewedAt = now;
    }
    db.programTracking.push(row);
  }
  await saveTrackingDb(db);
  return row;
}

export async function upsertPhdTracking(
  candidateSlug: string,
  offerId: string,
  patch: Partial<PhdTracking>
): Promise<PhdTracking> {
  const db = await loadTrackingDb();
  const idx = db.phdTracking.findIndex(
    (t) => t.candidateSlug === candidateSlug && t.offerId === offerId
  );
  const now = new Date().toISOString();
  let row: PhdTracking;
  if (idx >= 0) {
    row = { ...db.phdTracking[idx], ...patch, offerId, candidateSlug, lastUpdatedAt: now };
    if (!row.firstReviewedAt && row.pipelineStatus !== "not_started") {
      row.firstReviewedAt = now;
    }
    db.phdTracking[idx] = row;
  } else {
    row = {
      ...createDefaultPhdTracking(candidateSlug, offerId),
      ...patch,
      offerId,
      candidateSlug,
      lastUpdatedAt: now,
      createdAt: now,
    };
    if (row.pipelineStatus !== "not_started" && !row.firstReviewedAt) {
      row.firstReviewedAt = now;
    }
    db.phdTracking.push(row);
  }
  await saveTrackingDb(db);
  return row;
}

export async function addProgramOutreach(
  candidateSlug: string,
  programId: number,
  event: Omit<OutreachEvent, "id">
): Promise<ProgramTracking> {
  const existing = await getProgramTracking(candidateSlug, programId);
  const base = existing ?? createDefaultProgramTracking(candidateSlug, programId);
  const outreachEvents = [...base.outreachEvents, { ...event, id: randomUUID() }];
  return upsertProgramTracking(candidateSlug, programId, { outreachEvents });
}

export async function addPhdOutreach(
  candidateSlug: string,
  offerId: string,
  event: Omit<OutreachEvent, "id">
): Promise<PhdTracking> {
  const existing = await getPhdTracking(candidateSlug, offerId);
  const base = existing ?? createDefaultPhdTracking(candidateSlug, offerId);
  const outreachEvents = [...base.outreachEvents, { ...event, id: randomUUID() }];
  return upsertPhdTracking(candidateSlug, offerId, { outreachEvents });
}

export async function deleteProgramOutreach(
  candidateSlug: string,
  programId: number,
  eventId: string
): Promise<ProgramTracking | null> {
  const existing = await getProgramTracking(candidateSlug, programId);
  if (!existing) return null;
  return upsertProgramTracking(candidateSlug, programId, {
    outreachEvents: existing.outreachEvents.filter((e) => e.id !== eventId),
  });
}

export async function deletePhdOutreach(
  candidateSlug: string,
  offerId: string,
  eventId: string
): Promise<PhdTracking | null> {
  const existing = await getPhdTracking(candidateSlug, offerId);
  if (!existing) return null;
  return upsertPhdTracking(candidateSlug, offerId, {
    outreachEvents: existing.outreachEvents.filter((e) => e.id !== eventId),
  });
}

export async function getTrackingStats(candidateSlug: string) {
  const programs = await listProgramTracking(candidateSlug);
  const phds = await listPhdTracking(candidateSlug);
  const all = [...programs, ...phds];
  const urgent = all.filter((t) => {
    if (!t.personalDeadline) return false;
    const d = new Date(t.personalDeadline);
    const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 14;
  }).length;
  return {
    totalTracked: all.filter((t) => t.pipelineStatus !== "not_started").length,
    ongoing: all.filter((t) => t.pipelineStatus === "ongoing").length,
    applied: all.filter((t) => t.pipelineStatus === "applied").length,
    accepted: all.filter((t) => t.pipelineStatus === "accepted").length,
    possible: all.filter((t) => t.feasibility === "possible").length,
    urgent,
    tierA: all.filter((t) => t.priorityTier === "A").length,
  };
}
