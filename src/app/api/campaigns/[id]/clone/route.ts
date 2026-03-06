// src/app/api/campaigns/[id]/clone/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CampaignModel from "@/lib/models/Campaign";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string; id: string }).orgId;
  const userId = (session.user as { id: string }).id;

  const original = await CampaignModel.findOne({ _id: id, orgId }).lean();
  if (!original) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const cloned = await CampaignModel.create({
    orgId,
    name: `${original.name} (copy)`,
    workflowId: original.workflowId,
    leadIds: original.leadIds,
    status: "draft",
    safetyConfig: original.safetyConfig,
    stats: {
      totalLeads: original.leadIds?.length ?? 0,
      contacted: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      bounced: 0,
      converted: 0,
    },
    createdBy: userId,
  });

  return NextResponse.json({ campaign: cloned }, { status: 201 });
}
