import { NextResponse } from "next/server";
import { listPhdTracking, listProgramTracking } from "@/lib/tracking/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ candidateSlug: string }> }
) {
  const { candidateSlug } = await params;
  const [programs, phd] = await Promise.all([
    listProgramTracking(candidateSlug),
    listPhdTracking(candidateSlug),
  ]);
  return NextResponse.json({ programs, phd });
}
