import { NextResponse } from "next/server";
import {
  addProgramOutreach,
  deleteProgramOutreach,
} from "@/lib/tracking/store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ candidateSlug: string; programId: string }> }
) {
  const { candidateSlug, programId } = await params;
  const id = parseInt(programId, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid program id" }, { status: 400 });
  }
  const event = await req.json();
  const row = await addProgramOutreach(candidateSlug, id, event);
  return NextResponse.json(row);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ candidateSlug: string; programId: string }> }
) {
  const { candidateSlug, programId } = await params;
  const id = parseInt(programId, 10);
  const { eventId } = await req.json();
  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }
  const row = await deleteProgramOutreach(candidateSlug, id, eventId);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}
