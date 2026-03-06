// src/app/api/campaigns/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CampaignModel from "@/lib/models/Campaign";
import { SafetyConfigUpdateSchema } from "@/lib/validators/safety.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const campaign = await CampaignModel.findOne({ _id: id, orgId })
    .populate("workflowId")
    .lean();

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  return NextResponse.json({ campaign, leadCount: campaign.leadIds?.length ?? 0 });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;

  if (body.safetyConfig !== undefined) {
    const parsed = SafetyConfigUpdateSchema.safeParse(body.safetyConfig);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    for (const [key, value] of Object.entries(parsed.data)) {
      update[`safetyConfig.${key}`] = value;
    }
  }

  const campaign = await CampaignModel.findOneAndUpdate(
    { _id: id, orgId },
    { $set: update },
    { new: true }
  ).lean();

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  return NextResponse.json({ campaign });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const campaign = await CampaignModel.findOne({ _id: id, orgId });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  if (campaign.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft campaigns can be deleted" },
      { status: 400 }
    );
  }

  await CampaignModel.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}
