// src/lib/services/ExecutionEngine.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import {
  CampaignModel,
  LeadModel,
  ExecutionModel,
  OutreachMessageModel,
  AnalyticsSnapshotModel,
  type ICampaign,
  type ILead,
  type IWorkflow,
  type IWorkflowNode,
} from '@/lib/models';
import { sleep } from '@/lib/utils';
import { workflowGraphEngine, type EmailNodeConfig, type ConditionNodeConfig } from './WorkflowGraphEngine';
import { messagePersonalizer, type EmailNodeConfig as MsgEmailNodeConfig } from './MessagePersonalizer';
import { emailService } from './EmailService';
import { safetyPolicyEnforcer } from './SafetyPolicyEnforcer';
import { delayCalculator } from './DelayCalculator';
import { activityLogger, ACTIONS } from './ActivityLogger';

/* ------------------------------------------------------------------ */
/*  Error                                                              */
/* ------------------------------------------------------------------ */

export class ExecutionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ExecutionError';
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ExecutionResult {
  success: boolean;
  action: string;
  executionId?: string;
  leadId: string;
  nextNodeId?: string;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class ExecutionEngine {
  /**
   * Execute the next workflow step for a specific lead within a campaign.
   *
   * @param campaignId - Campaign ID
   * @param leadId     - Lead ID
   * @returns Execution result
   */
  async processLead(
    campaignId: string,
    leadId: string,
  ): Promise<ExecutionResult> {
    await connectDB();

    try {
      // 1. Load campaign, lead, workflow
      const campaign = await CampaignModel.findById(
        new mongoose.Types.ObjectId(campaignId),
      ).lean<ICampaign>();
      if (!campaign) throw new ExecutionError(`Campaign ${campaignId} not found`);

      const lead = await LeadModel.findById(
        new mongoose.Types.ObjectId(leadId),
      );
      if (!lead) throw new ExecutionError(`Lead ${leadId} not found`);

      if (!campaign.workflowId) {
        throw new ExecutionError(`Campaign ${campaignId} has no workflow`);
      }

      const workflow = await workflowGraphEngine.loadGraph(
        campaign.workflowId.toString(),
      );

      // 2. Determine current node
      const currentNode = await this.getLeadCurrentNode(campaignId, leadId, workflow);
      if (!currentNode) {
        return {
          success: true,
          action: 'completed',
          leadId,
          error: 'No more nodes — workflow complete for this lead',
        };
      }

      // 3. Safety check
      const safety = await safetyPolicyEnforcer.check(
        campaignId,
        leadId,
        campaign.orgId.toString(),
      );

      if (!safety.allowed) {
        // Create a skipped/delayed execution record
        const exec = await ExecutionModel.create({
          campaignId: new mongoose.Types.ObjectId(campaignId),
          leadId: new mongoose.Types.ObjectId(leadId),
          nodeId: currentNode.id,
          action: this.nodeTypeToAction(currentNode.type),
          status: safety.action === 'skip_lead' ? 'skipped' : 'pending',
          error: safety.reason,
        });

        return {
          success: false,
          action: safety.action,
          executionId: exec._id.toString(),
          leadId,
          error: safety.reason,
        };
      }

      // 4. Apply send delay
      const delayMs = delayCalculator.sendDelay(
        campaign.safetyConfig ?? {
          minDelayMs: 120_000,
          maxDelayMs: 480_000,
        },
      );
      await sleep(Math.min(delayMs, 5000)); // Cap for dev purposes

      // 5. Execute by node type
      const execution = await this.executeNode(
        currentNode,
        campaign,
        lead,
        workflow,
      );

      // 6. Update lead stage
      await this.updateLeadStage(leadId, campaignId, currentNode.type);

      // 7. Update analytics
      await this.updateAnalytics(
        campaignId,
        campaign.orgId.toString(),
        currentNode.type,
      );

      // 8. Log activity
      await activityLogger.log({
        orgId: campaign.orgId.toString(),
        userId: campaign.createdBy?.toString() ?? campaign.orgId.toString(),
        action: ACTIONS.EXECUTION_COMPLETED,
        resourceType: 'execution',
        resourceId: execution._id.toString(),
        metadata: {
          campaignId,
          leadId,
          nodeId: currentNode.id,
          nodeType: currentNode.type,
        },
      });

      // 9. Determine next node
      const nextNode = workflowGraphEngine.getNextNode(workflow, currentNode.id);

      return {
        success: true,
        action: currentNode.type,
        executionId: execution._id.toString(),
        leadId,
        nextNodeId: nextNode?.id,
      };
    } catch (err) {
      // Log failure
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error';

      try {
        const campaign = await CampaignModel.findById(
          new mongoose.Types.ObjectId(campaignId),
        ).lean<ICampaign>();
        if (campaign) {
          await activityLogger.log({
            orgId: campaign.orgId.toString(),
            userId: campaign.createdBy?.toString() ?? campaign.orgId.toString(),
            action: ACTIONS.EXECUTION_FAILED,
            resourceType: 'execution',
            metadata: { campaignId, leadId, error: errorMessage },
          });
        }
      } catch {
        // Swallow logging errors
      }

      return {
        success: false,
        action: 'error',
        leadId,
        error: errorMessage,
      };
    }
  }

  /**
   * Determine which node a lead should execute next by finding their last
   * completed execution and advancing to the next graph node.
   *
   * @param campaignId - Campaign ID
   * @param leadId     - Lead ID
   * @param graph      - Workflow document
   * @returns The next node to execute, or `null` if done
   */
  async getLeadCurrentNode(
    campaignId: string,
    leadId: string,
    graph: IWorkflow,
  ): Promise<IWorkflowNode | null> {
    // Find the last completed execution for this lead in this campaign
    const lastExecution = await ExecutionModel.findOne({
      campaignId: new mongoose.Types.ObjectId(campaignId),
      leadId: new mongoose.Types.ObjectId(leadId),
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!lastExecution) {
      // No executions yet — start from the beginning
      return workflowGraphEngine.getStartNode(graph);
    }

    // Get the lead action for condition routing
    const lastMessage = await OutreachMessageModel.findOne({
      campaignId: new mongoose.Types.ObjectId(campaignId),
      leadId: new mongoose.Types.ObjectId(leadId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const leadAction = lastMessage?.status ?? undefined;

    return workflowGraphEngine.getNextNode(
      graph,
      lastExecution.nodeId,
      leadAction ?? undefined,
    );
  }

  /**
   * Update the lead's stage based on the action just performed.
   *
   * @param leadId     - Lead ID
   * @param campaignId - Campaign ID
   * @param action     - The node type that was executed
   */
  async updateLeadStage(
    leadId: string,
    _campaignId: string,
    action: string,
  ): Promise<void> {
    const stageMap: Record<string, string> = {
      email: 'contacted',
      condition: 'contacted',
      ai_generate: 'pending',
    };

    const newStage = stageMap[action] ?? 'contacted';
    await LeadModel.findByIdAndUpdate(new mongoose.Types.ObjectId(leadId), {
      stage: newStage,
      lastTouchedAt: new Date(),
    });
  }

  /* ---------------------------------------------------------------- */
  /*  Internal execution logic                                         */
  /* ---------------------------------------------------------------- */

  private async executeNode(
    node: IWorkflowNode,
    campaign: ICampaign,
    lead: ILead,
    workflow: IWorkflow,
  ) {
    const campaignId = campaign._id.toString();
    const leadId = lead._id.toString();

    switch (node.type) {
      case 'email': {
        const nodeConfig = node.config as unknown as MsgEmailNodeConfig;
        const personalised = await messagePersonalizer.personalizeForLead(
          lead,
          nodeConfig,
        );

        await emailService.sendWithTracking(
          lead,
          { subject: personalised.subject, body: personalised.body },
          campaignId,
        );

        const exec = await ExecutionModel.create({
          campaignId: new mongoose.Types.ObjectId(campaignId),
          leadId: new mongoose.Types.ObjectId(leadId),
          nodeId: node.id,
          action: 'email',
          status: 'completed',
          generatedMessage: {
            subject: personalised.subject,
            body: personalised.body,
            tone: personalised.tone,
          },
          executedAt: new Date(),
        });
        return exec;
      }

      case 'wait': {
        const exec = await ExecutionModel.create({
          campaignId: new mongoose.Types.ObjectId(campaignId),
          leadId: new mongoose.Types.ObjectId(leadId),
          nodeId: node.id,
          action: 'wait',
          status: 'completed',
          executedAt: new Date(),
        });
        return exec;
      }

      case 'condition': {
        const config = node.config as unknown as ConditionNodeConfig;
        const message = await OutreachMessageModel.findOne({
          campaignId: new mongoose.Types.ObjectId(campaignId),
          leadId: new mongoose.Types.ObjectId(leadId),
        })
          .sort({ createdAt: -1 })
          .lean();

        // Evaluate the condition
        let conditionMet = false;
        if (message) {
          switch (config.condition) {
            case 'opened':
              conditionMet = !!message.openedAt;
              break;
            case 'clicked':
              conditionMet = !!message.clickedAt;
              break;
            case 'replied':
              conditionMet = !!message.repliedAt;
              break;
          }
        }

        // Determine which branch to follow
        const branchEdgeId = conditionMet ? config.trueEdge : config.falseEdge;
        const nextNode = workflowGraphEngine.getNextNode(
          workflow,
          node.id,
          conditionMet ? config.condition : undefined,
        );

        const exec = await ExecutionModel.create({
          campaignId: new mongoose.Types.ObjectId(campaignId),
          leadId: new mongoose.Types.ObjectId(leadId),
          nodeId: node.id,
          action: 'condition_check',
          status: 'completed',
          executedAt: new Date(),
          generatedMessage: {
            subject: `Condition: ${config.condition}`,
            body: `Result: ${conditionMet}, Branch: ${branchEdgeId}, Next: ${nextNode?.id ?? 'end'}`,
            tone: 'system',
          },
        });
        return exec;
      }

      case 'ai_generate': {
        const nodeConfig = node.config as unknown as MsgEmailNodeConfig;
        const personalised = await messagePersonalizer.personalizeForLead(lead, {
          promptTemplate: nodeConfig.promptTemplate ?? 'Generate a personalized message for {{name}} at {{company}}',
          subjectTemplate: nodeConfig.subjectTemplate ?? 'Message for {{name}}',
          tone: nodeConfig.tone ?? 'formal',
        });

        // Store on lead metadata
        lead.metadata.set('ai_subject', personalised.subject);
        lead.metadata.set('ai_body', personalised.body);
        await lead.save();

        const exec = await ExecutionModel.create({
          campaignId: new mongoose.Types.ObjectId(campaignId),
          leadId: new mongoose.Types.ObjectId(leadId),
          nodeId: node.id,
          action: 'ai_generate',
          status: 'completed',
          generatedMessage: {
            subject: personalised.subject,
            body: personalised.body,
            tone: personalised.tone,
          },
          executedAt: new Date(),
        });
        return exec;
      }

      default: {
        // LinkedIn or other node types — create a completed stub
        const exec = await ExecutionModel.create({
          campaignId: new mongoose.Types.ObjectId(campaignId),
          leadId: new mongoose.Types.ObjectId(leadId),
          nodeId: node.id,
          action: 'linkedin',
          status: 'completed',
          executedAt: new Date(),
        });
        return exec;
      }
    }
  }

  private async updateAnalytics(
    campaignId: string,
    orgId: string,
    nodeType: string,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const incField: Record<string, number> = {};
    if (nodeType === 'email') incField.sends = 1;

    if (Object.keys(incField).length === 0) return;

    await AnalyticsSnapshotModel.findOneAndUpdate(
      {
        campaignId: new mongoose.Types.ObjectId(campaignId),
        date: today,
      },
      {
        $inc: incField,
        $setOnInsert: {
          orgId: new mongoose.Types.ObjectId(orgId),
          date: today,
        },
      },
      { upsert: true },
    );
  }

  private nodeTypeToAction(
    nodeType: string,
  ): 'email' | 'wait' | 'condition_check' | 'linkedin' | 'ai_generate' {
    const map: Record<string, 'email' | 'wait' | 'condition_check' | 'linkedin' | 'ai_generate'> = {
      email: 'email',
      wait: 'wait',
      condition: 'condition_check',
      linkedin: 'linkedin',
      ai_generate: 'ai_generate',
    };
    return map[nodeType] ?? 'email';
  }
}

export const executionEngine = new ExecutionEngine();
