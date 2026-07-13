import { NextResponse } from "next/server";
import { addPhdOutreach, deletePhdOutreach } from "@/lib/tracking/store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ candidateSlug: string; offerId: string }> }
) {
  const { candidateSlug, offerId } = await params;
  const decoded = decodeURIComponent(offerId);
  const event = await req.json();
  const row = await addPhdOutreach(candidateSlug, decoded, event);
  return NextResponse.json(row);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ candidateSlug: string; offerId: string }> }
) {
  const { candidateSlug, offerId } = await params;
  const decoded = decodeURIComponent(offerId);
  const { eventId } = await req.json();
  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }
  const row = await deletePhdOutreach(candidateSlug, decoded, eventId);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}
