import { NextResponse } from "next/server";
import {
  getProgramTracking,
  upsertProgramTracking,
} from "@/lib/tracking/store";
import { createDefaultProgramTracking } from "@/lib/tracking/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ candidateSlug: string; programId: string }> }
) {
  const { candidateSlug, programId } = await params;
  const id = parseInt(programId, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid program id" }, { status: 400 });
  }
  const row =
    (await getProgramTracking(candidateSlug, id)) ??
    createDefaultProgramTracking(candidateSlug, id);
  return NextResponse.json(row);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ candidateSlug: string; programId: string }> }
) {
  const { candidateSlug, programId } = await params;
  const id = parseInt(programId, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid program id" }, { status: 400 });
  }
  const patch = await req.json();
  delete patch.programId;
  delete patch.candidateSlug;
  delete patch.createdAt;
  const row = await upsertProgramTracking(candidateSlug, id, patch);
  return NextResponse.json(row);
}
