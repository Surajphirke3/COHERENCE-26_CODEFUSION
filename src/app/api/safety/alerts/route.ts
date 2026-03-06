// src/app/api/safety/alerts/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SafetyEventModel from "@/lib/models/SafetyEvent";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const { searchParams } = new URL(req.url);
  const showAll = searchParams.get("all") === "true";

  const filter: Record<string, unknown> = { orgId };
  if (!showAll) filter.isResolved = false;

  const alerts = await SafetyEventModel.find(filter)
    .sort({ triggeredAt: -1 })
    .lean();

  return NextResponse.json({ alerts });
}
