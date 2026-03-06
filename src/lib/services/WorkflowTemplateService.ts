// src/lib/services/WorkflowTemplateService.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import {
  WorkflowTemplateModel,
  WorkflowModel,
  type IWorkflowTemplate,
  type IWorkflow,
} from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Default template data                                              */
/* ------------------------------------------------------------------ */

const DEFAULT_TEMPLATES: Array<{
  name: string;
  description: string;
  category: IWorkflowTemplate['category'];
  tags: string[];
  graph: IWorkflowTemplate['graph'];
}> = [
  {
    name: "Cold Outreach Sequence",
    description: "A 4-step cold outreach flow with email, wait, condition, and follow-up.",
    category: "cold_outreach",
    tags: ["sales", "cold", "outbound"],
    graph: {
      nodes: [
        { id: "n1", type: "email", position: { x: 0, y: 0 }, config: { promptTemplate: "Hi {{name}}, I noticed {{company}} is growing fast in the {{industry}} space. I'd love to share how we help teams like yours...", subjectTemplate: "Quick idea for {{company}}", tone: "consultative" } },
        { id: "n2", type: "wait", position: { x: 0, y: 150 }, config: { duration: 3, unit: "days" } },
        { id: "n3", type: "condition", position: { x: 0, y: 300 }, config: { condition: "opened", trueEdge: "e3", falseEdge: "e4" } },
        { id: "n4", type: "email", position: { x: -150, y: 450 }, config: { promptTemplate: "Hi {{name}}, I saw you checked out my last email. Would love to set up a quick 15-min chat…", subjectTemplate: "Re: Quick idea for {{company}}", tone: "casual" } },
        { id: "n5", type: "email", position: { x: 150, y: 450 }, config: { promptTemplate: "Hi {{name}}, just bumping this to the top of your inbox. Happy to share a brief case study relevant to {{industry}}…", subjectTemplate: "Following up — {{name}}", tone: "formal" } },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
        { id: "e3", source: "n3", target: "n4", condition: "true" },
        { id: "e4", source: "n3", target: "n5", condition: "false" },
      ],
    },
  },
  {
    name: "Follow-Up Nurture",
    description: "A 3-step follow-up sequence for warm leads.",
    category: "follow_up",
    tags: ["nurture", "follow-up"],
    graph: {
      nodes: [
        { id: "n1", type: "email", position: { x: 0, y: 0 }, config: { promptTemplate: "Hi {{name}}, following up on our previous conversation. I had a few more thoughts about how we could help {{company}}…", subjectTemplate: "Following up, {{name}}", tone: "consultative" } },
        { id: "n2", type: "wait", position: { x: 0, y: 150 }, config: { duration: 5, unit: "days" } },
        { id: "n3", type: "email", position: { x: 0, y: 300 }, config: { promptTemplate: "Hi {{name}}, wanted to share a relevant case study from the {{industry}} space that might interest you…", subjectTemplate: "Thought you'd find this useful", tone: "casual" } },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
      ],
    },
  },
  {
    name: "Re-Engagement Campaign",
    description: "Win back cold leads who haven't responded.",
    category: "re_engagement",
    tags: ["win-back", "re-engage"],
    graph: {
      nodes: [
        { id: "n1", type: "email", position: { x: 0, y: 0 }, config: { promptTemplate: "Hi {{name}}, it's been a while since we last connected. {{company}} has been on my radar and I wanted to re-introduce a new initiative we have…", subjectTemplate: "Been a while, {{name}}", tone: "casual" } },
        { id: "n2", type: "wait", position: { x: 0, y: 150 }, config: { duration: 7, unit: "days" } },
        { id: "n3", type: "condition", position: { x: 0, y: 300 }, config: { condition: "replied", trueEdge: "e3", falseEdge: "e4" } },
        { id: "n4", type: "email", position: { x: 150, y: 450 }, config: { promptTemplate: "Hi {{name}}, no worries if the timing isn't right. Just wanted to leave the door open — feel free to reach out whenever…", subjectTemplate: "Last note from me", tone: "formal" } },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
        { id: "e3", source: "n3", target: "n4", condition: "false" },
      ],
    },
  },
  {
    name: "Event Follow-Up",
    description: "Post-conference or webinar follow-up sequence.",
    category: "event_follow_up",
    tags: ["event", "conference", "webinar"],
    graph: {
      nodes: [
        { id: "n1", type: "email", position: { x: 0, y: 0 }, config: { promptTemplate: "Hi {{name}}, great connecting at the event! I noticed you're working on interesting things at {{company}} in the {{industry}} space…", subjectTemplate: "Great meeting you!", tone: "casual" } },
        { id: "n2", type: "wait", position: { x: 0, y: 150 }, config: { duration: 2, unit: "days" } },
        { id: "n3", type: "email", position: { x: 0, y: 300 }, config: { promptTemplate: "Hi {{name}}, sharing the resource I mentioned. Hope it's helpful for the {{painPoint}} you described…", subjectTemplate: "As promised — resource for you", tone: "consultative" } },
        { id: "n4", type: "wait", position: { x: 0, y: 450 }, config: { duration: 4, unit: "days" } },
        { id: "n5", type: "email", position: { x: 0, y: 600 }, config: { promptTemplate: "Hi {{name}}, would love to continue our conversation. Would a 15-minute call next week work?", subjectTemplate: "Shall we connect?", tone: "discovery" } },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
        { id: "e3", source: "n3", target: "n4" },
        { id: "e4", source: "n4", target: "n5" },
      ],
    },
  },
  {
    name: "Investor Outreach",
    description: "A targeted outreach flow for fundraising.",
    category: "investor_outreach",
    tags: ["fundraising", "investor", "vc"],
    graph: {
      nodes: [
        { id: "n1", type: "email", position: { x: 0, y: 0 }, config: { promptTemplate: "Hi {{name}}, I'm reaching out because {{company}} aligns closely with our vision. We're building in the {{industry}} space and recently hit some exciting milestones…", subjectTemplate: "{{company}} — Exciting milestones", tone: "formal" } },
        { id: "n2", type: "wait", position: { x: 0, y: 150 }, config: { duration: 5, unit: "days" } },
        { id: "n3", type: "condition", position: { x: 0, y: 300 }, config: { condition: "opened", trueEdge: "e3", falseEdge: "e4" } },
        { id: "n4", type: "email", position: { x: -150, y: 450 }, config: { promptTemplate: "Hi {{name}}, noticed you took a look — happy to share our deck or jump on a brief call. What works best?", subjectTemplate: "Re: {{company}} — Exciting milestones", tone: "consultative" } },
        { id: "n5", type: "wait", position: { x: 150, y: 450 }, config: { duration: 7, unit: "days" } },
        { id: "n6", type: "email", position: { x: 150, y: 600 }, config: { promptTemplate: "Hi {{name}}, just a friendly follow-up. Would love to share what we're building if you have 15 minutes…", subjectTemplate: "Quick follow-up", tone: "casual" } },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
        { id: "e3", source: "n3", target: "n4", condition: "true" },
        { id: "e4", source: "n3", target: "n5", condition: "false" },
        { id: "e5", source: "n5", target: "n6" },
      ],
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class WorkflowTemplateService {
  /**
   * Seed the default system templates if they don't already exist.
   */
  async seedDefaultTemplates(): Promise<void> {
    await connectDB();

    for (const template of DEFAULT_TEMPLATES) {
      const exists = await WorkflowTemplateModel.findOne({
        name: template.name,
        isPublic: true,
        createdBy: null,
      }).lean();

      if (!exists) {
        await WorkflowTemplateModel.create({
          ...template,
          isPublic: true,
          createdBy: null,
          usageCount: 0,
        });
      }
    }
  }

  /**
   * Fetch all public templates, optionally filtered by category.
   *
   * @param category - Optional category filter
   * @returns Sorted array of templates (popular first)
   */
  async getTemplates(category?: string): Promise<IWorkflowTemplate[]> {
    await connectDB();
    const filter: Record<string, unknown> = { isPublic: true };
    if (category) filter.category = category;

    return WorkflowTemplateModel.find(filter)
      .sort({ usageCount: -1 })
      .lean<IWorkflowTemplate[]>();
  }

  /**
   * Get a single template by ID.
   *
   * @param id - Template document ID
   * @returns The template document
   * @throws Error if not found
   */
  async getTemplateById(id: string): Promise<IWorkflowTemplate> {
    await connectDB();
    const template = await WorkflowTemplateModel.findById(
      new mongoose.Types.ObjectId(id),
    ).lean<IWorkflowTemplate>();
    if (!template) throw new Error(`Template ${id} not found`);
    return template;
  }

  /**
   * Clone a template into a new Workflow for an org.
   *
   * @param templateId - Source template ID
   * @param orgId      - Organisation ID
   * @param userId     - User ID creating the workflow
   * @param name       - Optional custom name override
   * @returns The newly created Workflow document
   */
  async cloneToWorkflow(
    templateId: string,
    orgId: string,
    userId: string,
    name?: string,
  ): Promise<IWorkflow> {
    await connectDB();

    const template = await this.getTemplateById(templateId);

    const workflow = await WorkflowModel.create({
      orgId: new mongoose.Types.ObjectId(orgId),
      name: name ?? template.name,
      description: template.description,
      graph: template.graph,
      version: 1,
      isTemplate: false,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    // Increment usage count
    await WorkflowTemplateModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(templateId),
      { $inc: { usageCount: 1 } },
    );

    return workflow;
  }
}

export const workflowTemplateService = new WorkflowTemplateService();
