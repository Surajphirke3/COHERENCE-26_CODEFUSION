// src/app/api/leads/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeadModel from "@/lib/models/Lead";
import { LeadCreateSchema, LeadFilterSchema } from "@/lib/validators/lead.schema";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const parsed = LeadFilterSchema.safeParse({
    stage: searchParams.get("stage") || undefined,
    search: searchParams.get("search") || undefined,
    campaignId: searchParams.get("campaignId") || undefined,
    page: searchParams.get("page") || 1,
    limit: searchParams.get("limit") || 20,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { stage, search, campaignId, page, limit } = parsed.data;
  const orgId = (session.user as { orgId: string }).orgId;

  const filter: Record<string, unknown> = { orgId };
  if (stage) filter.stage = stage;
  if (campaignId) filter.campaignId = campaignId;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [leads, total] = await Promise.all([
    LeadModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    LeadModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    leads,
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
  const parsed = LeadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const orgId = (session.user as { orgId: string }).orgId;

  const existing = await LeadModel.findOne({ orgId, email: parsed.data.email });
  if (existing) {
    return NextResponse.json({ error: "Lead with this email already exists in your organization" }, { status: 409 });
  }

  const lead = await LeadModel.create({ ...parsed.data, orgId });
  return NextResponse.json({ lead }, { status: 201 });
}
