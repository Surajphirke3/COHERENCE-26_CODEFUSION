// src/app/api/executions/[id]/retry/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ExecutionModel from "@/lib/models/Execution";
import CampaignModel from "@/lib/models/Campaign";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const execution = await ExecutionModel.findById(id);
  if (!execution) return NextResponse.json({ error: "Execution not found" }, { status: 404 });

  // Verify org ownership via campaign
  const campaign = await CampaignModel.findOne({ _id: execution.campaignId, orgId }).lean();
  if (!campaign) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  execution.status = "pending";
  execution.retryCount = 0;
  execution.error = undefined;
  execution.executedAt = undefined;
  await execution.save();

  return NextResponse.json({ execution });
}
