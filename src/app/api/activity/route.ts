// src/app/api/activity/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ActivityModel from "@/lib/models/Activity";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const { searchParams } = new URL(req.url);
  const resourceType = searchParams.get("resourceType");
  const resourceId = searchParams.get("resourceId");
  const userId = searchParams.get("userId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const filter: Record<string, unknown> = { orgId };
  if (resourceType) filter.resourceType = resourceType;
  if (resourceId) filter.resourceId = resourceId;
  if (userId) filter.userId = userId;

  const skip = (page - 1) * limit;
  const [activities, total] = await Promise.all([
    ActivityModel.find(filter)
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    activities,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
