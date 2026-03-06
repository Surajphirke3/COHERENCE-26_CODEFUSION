// src/app/api/leads/import/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeadModel from "@/lib/models/Lead";
import { LeadImportRowSchema } from "@/lib/validators/lead.schema";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const { rows, campaignId } = body as { rows: unknown[]; campaignId?: string };

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "rows must be a non-empty array" }, { status: 400 });
  }

  const orgId = (session.user as { orgId: string }).orgId;
  const inserted: unknown[] = [];
  const skipped: { row: number; email: string; reason: string }[] = [];
  const errors: { row: number; errors: unknown }[] = [];

  const existingEmails = new Set(
    (await LeadModel.find({ orgId }, { email: 1 }).lean()).map((l) => l.email)
  );

  const seenEmails = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const parsed = LeadImportRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push({ row: i, errors: parsed.error.flatten() });
      continue;
    }

    const email = parsed.data.email;

    if (existingEmails.has(email) || seenEmails.has(email)) {
      skipped.push({ row: i, email, reason: "Duplicate email" });
      continue;
    }

    seenEmails.add(email);
    inserted.push({
      ...parsed.data,
      orgId,
      ...(campaignId ? { campaignId } : {}),
      stage: "imported",
      importedAt: new Date(),
    });
  }

  if (inserted.length > 0) {
    await LeadModel.insertMany(inserted, { ordered: false });
  }

  return NextResponse.json({
    inserted: inserted.length,
    skipped: skipped.length,
    errors: errors.length,
    details: { skipped, errors },
  });
}
