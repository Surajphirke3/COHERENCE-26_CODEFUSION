// src/app/api/leads/bulk/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeadModel from "@/lib/models/Lead";
import { BulkActionSchema } from "@/lib/validators/lead.schema";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const parsed = BulkActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { action, leadIds, value } = parsed.data;
  const orgId = (session.user as { orgId: string }).orgId;
  const filter = { _id: { $in: leadIds }, orgId };

  let affected = 0;

  switch (action) {
    case "tag": {
      if (!value) {
        return NextResponse.json({ error: "value is required for tag action" }, { status: 400 });
      }
      const r = await LeadModel.updateMany(filter, { $addToSet: { tags: value } });
      affected = r.modifiedCount;
      break;
    }

    case "pause": {
      const r = await LeadModel.updateMany(filter, { $set: { stage: "unsubscribed" } });
      affected = r.modifiedCount;
      break;
    }

    case "delete": {
      const r = await LeadModel.deleteMany(filter);
      affected = r.deletedCount;
      break;
    }

    case "stage_change": {
      if (!value) {
        return NextResponse.json({ error: "value is required for stage_change action" }, { status: 400 });
      }
      const r = await LeadModel.updateMany(filter, { $set: { stage: value, lastTouchedAt: new Date() } });
      affected = r.modifiedCount;
      break;
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ success: true, modifiedCount: affected });
}
