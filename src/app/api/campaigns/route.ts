// src/app/api/campaigns/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CampaignModel from "@/lib/models/Campaign";
import { CampaignCreateSchema } from "@/lib/validators/campaign.schema";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const filter: Record<string, unknown> = { orgId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [campaigns, total] = await Promise.all([
    CampaignModel.find(filter)
      .populate("workflowId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CampaignModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    campaigns,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const parsed = CampaignCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const orgId = (session.user as { orgId: string; id: string }).orgId;
  const userId = (session.user as { id: string }).id;

  const campaign = await CampaignModel.create({
    ...parsed.data,
    orgId,
    createdBy: userId,
    stats: {
      totalLeads: parsed.data.leadIds.length,
      contacted: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      bounced: 0,
      converted: 0,
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
