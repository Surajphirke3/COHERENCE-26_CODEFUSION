// src/app/api/leads/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeadModel from "@/lib/models/Lead";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const lead = await LeadModel.findOne({ _id: id, orgId }).populate("campaignId").lean();
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;
  const body = await req.json();

  const allowedFields = ["stage", "score", "tags", "metadata", "name", "company", "role", "painPoint"];
  const update: Record<string, unknown> = { lastTouchedAt: new Date() };
  for (const key of allowedFields) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  const lead = await LeadModel.findOneAndUpdate(
    { _id: id, orgId },
    { $set: update },
    { new: true }
  ).lean();

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ lead });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const lead = await LeadModel.findOneAndUpdate(
    { _id: id, orgId },
    { $set: { stage: "unsubscribed" } },
    { new: true }
  ).lean();

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ success: true, lead });
}
