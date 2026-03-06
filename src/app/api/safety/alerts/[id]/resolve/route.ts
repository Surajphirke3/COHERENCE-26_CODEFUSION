// src/app/api/safety/alerts/[id]/resolve/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SafetyEventModel from "@/lib/models/SafetyEvent";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string; id: string }).orgId;
  const userId = (session.user as { id: string }).id;

  const event = await SafetyEventModel.findOneAndUpdate(
    { _id: id, orgId, isResolved: false },
    {
      $set: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: userId,
      },
    },
    { new: true }
  ).lean();

  if (!event) return NextResponse.json({ error: "Alert not found or already resolved" }, { status: 404 });

  return NextResponse.json({ event });
}
