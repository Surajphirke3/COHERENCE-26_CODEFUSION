// src/app/api/ai/personalize/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeadModel from "@/lib/models/Lead";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const { leadId, nodePrompt, tone } = body as {
    leadId: string;
    nodePrompt: string;
    tone?: string;
  };

  if (!leadId || !nodePrompt) {
    return NextResponse.json({ error: "leadId and nodePrompt are required" }, { status: 400 });
  }

  const orgId = (session.user as { orgId: string }).orgId;
  const lead = await LeadModel.findOne({ _id: leadId, orgId }).lean();
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const systemPrompt = `You are an expert sales copywriter. Generate a personalized outreach email.
Return ONLY valid JSON with exactly two fields: "subject" and "body".
The body should be HTML formatted.

Lead context:
- Name: ${lead.name}
- Email: ${lead.email}
- Company: ${lead.company || "Unknown"}
- Role: ${lead.role || "Unknown"}
- Industry: ${lead.industry || "Unknown"}
- Pain Point: ${lead.painPoint || "Not specified"}
- LinkedIn: ${lead.linkedinUrl || "N/A"}

Tone: ${tone || "professional"}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: nodePrompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json({
      subject: parsed.subject || "",
      body: parsed.body || "",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: content },
      { status: 500 }
    );
  }
}
