import { NextResponse } from "next/server";
import { getPhdTracking, upsertPhdTracking } from "@/lib/tracking/store";
import { createDefaultPhdTracking } from "@/lib/tracking/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ candidateSlug: string; offerId: string }> }
) {
  const { candidateSlug, offerId } = await params;
  const decoded = decodeURIComponent(offerId);
  const row =
    (await getPhdTracking(candidateSlug, decoded)) ??
    createDefaultPhdTracking(candidateSlug, decoded);
  return NextResponse.json(row);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ candidateSlug: string; offerId: string }> }
) {
  const { candidateSlug, offerId } = await params;
  const decoded = decodeURIComponent(offerId);
  const patch = await req.json();
  delete patch.offerId;
  delete patch.candidateSlug;
  delete patch.createdAt;
  const row = await upsertPhdTracking(candidateSlug, decoded, patch);
  return NextResponse.json(row);
}
