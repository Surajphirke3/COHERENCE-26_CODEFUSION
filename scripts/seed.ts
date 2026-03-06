// scripts/seed.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Load .env manually (no dotenv dependency needed)
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

// Register all Mongoose models (tsx resolves @/ via tsconfig paths)
import "@/lib/models/User";
import "@/lib/models/Organization";
import "@/lib/models/Lead";
import "@/lib/models/Workflow";
import "@/lib/models/Campaign";
import "@/lib/models/Execution";
import "@/lib/models/OutreachMessage";
import "@/lib/models/SafetyEvent";
import "@/lib/models/Activity";
import "@/lib/models/AnalyticsSnapshot";
import "@/lib/models/WorkflowTemplate";
import "@/lib/models/Notification";

const MONGODB_URI = process.env.MONGODB_URI!;

// ─── Fake data helpers ──────────────────────────────────────────────
const COMPANIES = [
  "TechNova", "CloudSync", "DataPulse", "AIForge", "QuantumLeap",
  "NexGen Labs", "CyberVault", "StreamLine", "PivotAI", "BrightPath",
  "Acme Corp", "Globex", "Initech", "Hooli", "Pied Piper",
  "Massive Dynamic", "Umbrella Corp", "Wayne Enterprises", "Stark Industries", "Oscorp",
  "InnovateTech", "FutureScale", "DataDriven", "AgileWorks", "SmartSystems",
  "RapidGrowth", "CoreLogic", "VeloCity", "PrimeStack", "ElevateHQ",
  "SynapseAI", "BlueShift", "MetricFlow", "SignalHQ", "LaunchPad",
  "ScaleUp", "VentureSync", "GrowthEngine", "CodeCraft", "PulseMetrics",
  "ByteBridge", "CloudPeak", "DataNest", "EdgePoint", "FlowState",
  "GridIron", "HyperLoop", "IronClad", "JetStream", "KineticAI",
];

const ROLES = [
  "CEO", "CTO", "VP Sales", "VP Marketing", "Head of Growth",
  "Director of Engineering", "Product Manager", "Sales Manager",
  "Marketing Director", "COO", "SDR Manager", "Account Executive",
  "Head of Partnerships", "Revenue Operations", "Chief Revenue Officer",
  "Director of BD", "Head of Product", "Engineering Manager",
  "Growth Lead", "Demand Gen Manager",
];

const INDUSTRIES = [
  "SaaS", "FinTech", "HealthTech", "EdTech", "E-commerce",
  "Cybersecurity", "AI/ML", "DevTools", "MarTech", "HRTech",
  "PropTech", "InsurTech", "LegalTech", "CleanTech", "BioTech",
];

const PAIN_POINTS = [
  "Low response rates on cold outreach",
  "Manual follow-up process is time-consuming",
  "Struggling to scale outbound sales",
  "Poor email deliverability",
  "No visibility into campaign performance",
  "Difficulty personalizing at scale",
  "Sales team spending too much time on admin",
  "High bounce rates on email campaigns",
  "Need to automate multi-channel outreach",
  "Looking to improve lead qualification",
];

const FIRST_NAMES = [
  "James", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Amanda",
  "William", "Ashley", "John", "Megan", "Daniel", "Rachel", "Matthew", "Lauren",
  "Andrew", "Samantha", "Christopher", "Nicole", "Alex", "Taylor", "Ryan", "Morgan",
  "Kevin", "Jordan", "Brian", "Casey", "Jason", "Kelly", "Marcus", "Priya",
  "Raj", "Wei", "Hiroshi", "Fatima", "Omar", "Elena", "Carlos", "Sofia",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Moore", "Jackson",
  "Martin", "Lee", "Thompson", "White", "Harris", "Chen", "Patel", "Kumar",
  "Kim", "Nakamura", "Al-Rashid", "Santos", "Silva", "Müller", "Dubois",
];

const LEAD_STAGES = [
  "imported", "pending", "contacted", "opened", "clicked",
  "replied", "interested", "converted", "unsubscribed", "bounced",
] as const;

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Workflow graph builders ────────────────────────────────────────
function coldOutreachGraph() {
  return {
    nodes: [
      { id: "n1", type: "ai_generate", position: { x: 250, y: 50 }, config: { prompt: "Write a cold intro email", tone: "professional" } },
      { id: "n2", type: "email", position: { x: 250, y: 150 }, config: { subject: "Quick question about {{company}}", useAI: true } },
      { id: "n3", type: "wait", position: { x: 250, y: 250 }, config: { days: 3 } },
      { id: "n4", type: "condition", position: { x: 250, y: 350 }, config: { field: "opened", operator: "eq", value: true } },
      { id: "n5", type: "email", position: { x: 100, y: 450 }, config: { subject: "Following up — {{firstName}}", template: "follow_up_opened" } },
      { id: "n6", type: "wait", position: { x: 400, y: 450 }, config: { days: 5 } },
      { id: "n7", type: "email", position: { x: 400, y: 550 }, config: { subject: "Last chance to connect", template: "breakup" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", condition: "opened" },
      { id: "e5", source: "n4", target: "n6", condition: "not_opened" },
      { id: "e6", source: "n6", target: "n7" },
    ],
  };
}

function investorOutreachGraph() {
  return {
    nodes: [
      { id: "n1", type: "ai_generate", position: { x: 250, y: 50 }, config: { prompt: "Write warm investor intro", tone: "confident" } },
      { id: "n2", type: "email", position: { x: 250, y: 150 }, config: { subject: "{{company}} — Raising Series A", useAI: true } },
      { id: "n3", type: "wait", position: { x: 250, y: 250 }, config: { days: 4 } },
      { id: "n4", type: "linkedin", position: { x: 250, y: 350 }, config: { action: "connect", message: "Hi {{firstName}}, following up on my email" } },
      { id: "n5", type: "wait", position: { x: 250, y: 450 }, config: { days: 7 } },
      { id: "n6", type: "email", position: { x: 250, y: 550 }, config: { subject: "Quick follow-up — deck attached", template: "investor_follow_up" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5" },
      { id: "e5", source: "n5", target: "n6" },
    ],
  };
}

function eventFollowUpGraph() {
  return {
    nodes: [
      { id: "n1", type: "ai_generate", position: { x: 250, y: 50 }, config: { prompt: "Write post-event follow-up", tone: "friendly" } },
      { id: "n2", type: "email", position: { x: 250, y: 150 }, config: { subject: "Great meeting you at {{event}}", useAI: true } },
      { id: "n3", type: "wait", position: { x: 250, y: 250 }, config: { days: 2 } },
      { id: "n4", type: "condition", position: { x: 250, y: 350 }, config: { field: "replied", operator: "eq", value: true } },
      { id: "n5", type: "email", position: { x: 250, y: 450 }, config: { subject: "Resource I mentioned — {{topic}}", template: "event_value_add" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", condition: "not_replied" },
    ],
  };
}

function followUpGraph() {
  return {
    nodes: [
      { id: "n1", type: "email", position: { x: 250, y: 50 }, config: { subject: "Following up on our conversation", template: "gentle_follow_up" } },
      { id: "n2", type: "wait", position: { x: 250, y: 150 }, config: { days: 3 } },
      { id: "n3", type: "email", position: { x: 250, y: 250 }, config: { subject: "Quick check-in", template: "check_in" } },
      { id: "n4", type: "wait", position: { x: 250, y: 350 }, config: { days: 5 } },
      { id: "n5", type: "email", position: { x: 250, y: 450 }, config: { subject: "Closing the loop", template: "breakup_soft" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5" },
    ],
  };
}

function reEngagementGraph() {
  return {
    nodes: [
      { id: "n1", type: "ai_generate", position: { x: 250, y: 50 }, config: { prompt: "Write re-engagement email for dormant lead", tone: "casual" } },
      { id: "n2", type: "email", position: { x: 250, y: 150 }, config: { subject: "It's been a while, {{firstName}}", useAI: true } },
      { id: "n3", type: "wait", position: { x: 250, y: 250 }, config: { days: 7 } },
      { id: "n4", type: "condition", position: { x: 250, y: 350 }, config: { field: "opened", operator: "eq", value: true } },
      { id: "n5", type: "email", position: { x: 100, y: 450 }, config: { subject: "New features you might like", template: "re_engage_opened" } },
      { id: "n6", type: "email", position: { x: 400, y: 450 }, config: { subject: "Should I close your file?", template: "breakup_final" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", condition: "opened" },
      { id: "e5", source: "n4", target: "n6", condition: "not_opened" },
    ],
  };
}

// ─── Main seed function ─────────────────────────────────────────────
async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  // Clear existing data
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
  console.log("🗑️  Cleared all collections\n");

  // ── 1. Create Organization ──────────────────────────────────────
  const Organization = mongoose.model("Organization");
  const org = await Organization.create({
    name: "Acme Corp",
    slug: "acme-corp",
    plan: "growth",
    members: [],
    safetyConfig: {
      dailyLimit: 80,
      minDelayMs: 120000,
      maxDelayMs: 480000,
      timeWindowStart: 9,
      timeWindowEnd: 18,
      pauseOnBounceRate: 0.05,
    },
  });
  console.log(`🏢 Organization created: ${org.name} (${org._id})`);

  // ── 2. Create Users ─────────────────────────────────────────────
  const User = mongoose.model("User");
  const passwordHash = await bcrypt.hash("password123", 12);

  const owner = await User.create({
    name: "Admin User",
    email: "admin@acme.com",
    passwordHash,
    role: "owner",
    orgId: org._id,
    isActive: true,
  });

  const sdr1 = await User.create({
    name: "Sarah Chen",
    email: "sarah@acme.com",
    passwordHash,
    role: "sdr",
    orgId: org._id,
    isActive: true,
  });

  const sdr2 = await User.create({
    name: "Marcus Johnson",
    email: "marcus@acme.com",
    passwordHash,
    role: "sdr",
    orgId: org._id,
    isActive: true,
  });

  // Update org members
  await Organization.updateOne(
    { _id: org._id },
    {
      $set: {
        members: [
          { userId: owner._id, role: "owner", joinedAt: new Date() },
          { userId: sdr1._id, role: "sdr", joinedAt: new Date() },
          { userId: sdr2._id, role: "sdr", joinedAt: new Date() },
        ],
      },
    }
  );

  console.log(`👤 Users created: admin@acme.com, sarah@acme.com, marcus@acme.com`);

  // ── 3. Create Workflows ─────────────────────────────────────────
  const Workflow = mongoose.model("Workflow");

  const wf1 = await Workflow.create({
    orgId: org._id,
    name: "Cold Outreach 5-Step",
    description: "A comprehensive cold outreach sequence with AI personalization, conditional branching, and multi-touch follow-ups.",
    graph: coldOutreachGraph(),
    version: 1,
    isTemplate: false,
    createdBy: owner._id,
  });

  const wf2 = await Workflow.create({
    orgId: org._id,
    name: "Investor Outreach",
    description: "Multi-channel investor outreach combining email and LinkedIn for fundraising campaigns.",
    graph: investorOutreachGraph(),
    version: 1,
    isTemplate: false,
    createdBy: owner._id,
  });

  const wf3 = await Workflow.create({
    orgId: org._id,
    name: "Event Follow-up",
    description: "Automated post-event follow-up sequence with personalized messaging and conditional logic.",
    graph: eventFollowUpGraph(),
    version: 1,
    isTemplate: false,
    createdBy: sdr1._id,
  });

  console.log(`🔧 Workflows created: ${wf1.name}, ${wf2.name}, ${wf3.name}`);

  // ── 4. Create 500 Leads ─────────────────────────────────────────
  const Lead = mongoose.model("Lead");
  const leads = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < 500; i++) {
    const firstName = randomPick(FIRST_NAMES);
    const lastName = randomPick(LAST_NAMES);
    const company = randomPick(COMPANIES);
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, "");

    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companySlug}.com`;
    let attempt = 0;
    while (usedEmails.has(email)) {
      attempt++;
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${attempt}@${companySlug}.com`;
    }
    usedEmails.add(email);

    const stageWeights = [30, 15, 20, 10, 5, 5, 5, 3, 4, 3]; // distribution
    let stageIndex = 0;
    let r = Math.random() * 100;
    for (let s = 0; s < stageWeights.length; s++) {
      r -= stageWeights[s];
      if (r <= 0) { stageIndex = s; break; }
    }

    leads.push({
      orgId: org._id,
      name: `${firstName} ${lastName}`,
      email,
      company,
      role: randomPick(ROLES),
      industry: randomPick(INDUSTRIES),
      painPoint: randomPick(PAIN_POINTS),
      linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randomInt(10000, 99999)}`,
      website: `https://${companySlug}.com`,
      stage: LEAD_STAGES[stageIndex],
      score: randomInt(0, 100),
      tags: [randomPick(["hot", "warm", "cold", "priority", "enterprise", "smb", "mid-market"])],
      importedAt: new Date(Date.now() - randomInt(1, 30) * 86400000),
      lastTouchedAt: stageIndex > 0 ? new Date(Date.now() - randomInt(0, 14) * 86400000) : undefined,
    });
  }

  await Lead.insertMany(leads);
  console.log(`📋 500 leads created`);

  // ── 5. Create Campaign ──────────────────────────────────────────
  const Campaign = mongoose.model("Campaign");
  const campaignLeads = await Lead.find({ orgId: org._id }).limit(100).lean();
  const campaignLeadIds = campaignLeads.map((l) => (l as unknown as { _id: mongoose.Types.ObjectId })._id);

  const campaign = await Campaign.create({
    orgId: org._id,
    name: "Q1 Outreach",
    workflowId: wf1._id,
    leadIds: campaignLeadIds,
    status: "active",
    safetyConfig: {
      dailyLimit: 80,
      minDelayMs: 120000,
      maxDelayMs: 480000,
      timeWindowStart: 9,
      timeWindowEnd: 18,
      pauseOnBounceRate: 0.05,
    },
    stats: {
      totalLeads: 100,
      contacted: 72,
      opened: 45,
      clicked: 18,
      replied: 12,
      bounced: 3,
      converted: 5,
    },
    launchedAt: new Date(Date.now() - 14 * 86400000),
    createdBy: owner._id,
  });

  // Update campaign leads to have campaignId
  await Lead.updateMany(
    { _id: { $in: campaignLeadIds } },
    { $set: { campaignId: campaign._id } }
  );

  console.log(`🚀 Campaign created: ${campaign.name} with 100 leads`);

  // ── 6. Seed WorkflowTemplates ───────────────────────────────────
  const WorkflowTemplate = mongoose.model("WorkflowTemplate");

  await WorkflowTemplate.insertMany([
    {
      name: "Cold Outreach Pro",
      description: "Battle-tested 5-step cold outreach sequence with AI personalization and smart branching.",
      category: "cold_outreach",
      graph: coldOutreachGraph(),
      isPublic: true,
      usageCount: 142,
      tags: ["cold", "ai", "multi-step"],
    },
    {
      name: "Gentle Follow-Up",
      description: "A soft 3-touch follow-up sequence for leads who showed initial interest.",
      category: "follow_up",
      graph: followUpGraph(),
      isPublic: true,
      usageCount: 89,
      tags: ["follow-up", "nurture"],
    },
    {
      name: "Win-Back Campaign",
      description: "Re-engage dormant leads with personalized messaging and a clear call-to-action.",
      category: "re_engagement",
      graph: reEngagementGraph(),
      isPublic: true,
      usageCount: 56,
      tags: ["re-engagement", "win-back"],
    },
    {
      name: "Post-Event Outreach",
      description: "Automated follow-up for leads collected at conferences, webinars, or meetups.",
      category: "event_follow_up",
      graph: eventFollowUpGraph(),
      isPublic: true,
      usageCount: 37,
      tags: ["event", "conference", "webinar"],
    },
    {
      name: "Investor Pipeline",
      description: "Multi-channel investor outreach combining personalized emails with LinkedIn touches.",
      category: "investor_outreach",
      graph: investorOutreachGraph(),
      isPublic: true,
      usageCount: 23,
      tags: ["investor", "fundraising", "linkedin"],
    },
  ]);

  console.log(`📦 5 WorkflowTemplates seeded`);

  // ── 7. Seed AnalyticsSnapshots (14 days) ────────────────────────
  const AnalyticsSnapshot = mongoose.model("AnalyticsSnapshot");
  const snapshots = [];

  let cumulativeSends = 0;
  let cumulativeOpens = 0;
  let cumulativeClicks = 0;
  let cumulativeReplies = 0;
  let cumulativeBounces = 0;
  let cumulativeConversions = 0;

  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    date.setUTCHours(0, 0, 0, 0);

    const daySends = randomInt(3, 8);
    const dayOpens = Math.min(daySends, randomInt(1, daySends));
    const dayClicks = Math.min(dayOpens, randomInt(0, Math.ceil(dayOpens * 0.5)));
    const dayReplies = Math.min(dayClicks, randomInt(0, Math.ceil(dayClicks * 0.7)));
    const dayBounces = Math.random() < 0.3 ? randomInt(0, 1) : 0;
    const dayConversions = Math.random() < 0.25 ? randomInt(0, 1) : 0;

    cumulativeSends += daySends;
    cumulativeOpens += dayOpens;
    cumulativeClicks += dayClicks;
    cumulativeReplies += dayReplies;
    cumulativeBounces += dayBounces;
    cumulativeConversions += dayConversions;

    snapshots.push({
      campaignId: campaign._id,
      orgId: org._id,
      date,
      sends: daySends,
      opens: dayOpens,
      clicks: dayClicks,
      replies: dayReplies,
      bounces: dayBounces,
      conversions: dayConversions,
    });
  }

  await AnalyticsSnapshot.insertMany(snapshots);
  console.log(`📊 14 days of AnalyticsSnapshots seeded (total: ${cumulativeSends} sends, ${cumulativeOpens} opens, ${cumulativeClicks} clicks, ${cumulativeReplies} replies, ${cumulativeBounces} bounces, ${cumulativeConversions} conversions)`);

  // ── Done ────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("✅ Seed completed successfully!");
  console.log("═".repeat(50));
  console.log("\n🔐 Login Credentials:");
  console.log("─".repeat(40));
  console.log("  Owner:  admin@acme.com  / password123");
  console.log("  SDR 1:  sarah@acme.com  / password123");
  console.log("  SDR 2:  marcus@acme.com / password123");
  console.log("─".repeat(40));
  console.log(`\n📊 Seeded Data Summary:`);
  console.log(`  • 1 Organization (Acme Corp)`);
  console.log(`  • 3 Users`);
  console.log(`  • 3 Workflows`);
  console.log(`  • 500 Leads`);
  console.log(`  • 1 Active Campaign (Q1 Outreach, 100 leads)`);
  console.log(`  • 5 Workflow Templates`);
  console.log(`  • 14 Analytics Snapshots`);
  console.log("");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
