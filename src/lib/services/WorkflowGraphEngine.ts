// src/lib/services/WorkflowGraphEngine.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { WorkflowModel, type IWorkflow, type IWorkflowNode, type IWorkflowEdge } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EmailNodeConfig {
  promptTemplate: string;
  subjectTemplate: string;
  tone: 'formal' | 'casual' | 'consultative' | 'discovery' | 'urgency';
}

export interface WaitNodeConfig {
  duration: number;
  unit: 'minutes' | 'hours' | 'days';
}

export interface ConditionNodeConfig {
  condition: 'opened' | 'clicked' | 'replied';
  trueEdge: string;
  falseEdge: string;
}

export interface LinkedInNodeConfig {
  action: string;
  message?: string;
}

export type NodeConfig = EmailNodeConfig | WaitNodeConfig | ConditionNodeConfig | LinkedInNodeConfig;

export interface GraphValidation {
  valid: boolean;
  errors: string[];
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class WorkflowGraphEngine {
  /**
   * Load a workflow document from the database.
   *
   * @param workflowId - Workflow document ID
   * @returns The workflow document
   * @throws Error if not found
   */
  async loadGraph(workflowId: string): Promise<IWorkflow> {
    await connectDB();
    const workflow = await WorkflowModel.findById(
      new mongoose.Types.ObjectId(workflowId),
    );
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
    return workflow;
  }

  /**
   * Find the start node — the node with no incoming edges.
   *
   * @param graph - The workflow document
   * @returns The start node
   * @throws Error if no start node exists
   */
  getStartNode(graph: IWorkflow): IWorkflowNode {
    const targetIds = new Set(graph.graph.edges.map((e) => e.target));
    const startNodes = graph.graph.nodes.filter((n) => !targetIds.has(n.id));

    if (startNodes.length === 0) {
      throw new Error('Workflow has no start node (all nodes have incoming edges)');
    }
    return startNodes[0];
  }

  /**
   * Given the current node, determine the next node in the workflow.
   *
   * @param graph         - The workflow document
   * @param currentNodeId - ID of the current node
   * @param leadAction    - Action from the lead (used for condition node branching)
   * @returns The next node, or `null` if at end of workflow
   */
  getNextNode(
    graph: IWorkflow,
    currentNodeId: string,
    leadAction?: string,
  ): IWorkflowNode | null {
    const currentNode = graph.graph.nodes.find((n) => n.id === currentNodeId);
    if (!currentNode) return null;

    // Condition node: evaluate and branch
    if (currentNode.type === 'condition') {
      const config = currentNode.config as unknown as ConditionNodeConfig;
      const edgeId = leadAction === config.condition ? config.trueEdge : config.falseEdge;
      const edge = graph.graph.edges.find((e) => e.id === edgeId);
      if (!edge) {
        // Try matching by condition field on edges
        const matchEdge = graph.graph.edges.find(
          (e) => e.source === currentNodeId && e.condition === (leadAction === config.condition ? 'true' : 'false'),
        );
        if (matchEdge) {
          return graph.graph.nodes.find((n) => n.id === matchEdge.target) ?? null;
        }
        return null;
      }
      return graph.graph.nodes.find((n) => n.id === edge.target) ?? null;
    }

    // Linear node: follow the single outgoing edge
    const outgoingEdges = graph.graph.edges.filter((e) => e.source === currentNodeId);
    if (outgoingEdges.length === 0) return null;

    return graph.graph.nodes.find((n) => n.id === outgoingEdges[0].target) ?? null;
  }

  /**
   * Extract and cast the config object from a workflow node.
   *
   * @param node - The workflow node
   * @returns The typed node configuration
   */
  getNodeConfig(node: IWorkflowNode): NodeConfig {
    return node.config as unknown as NodeConfig;
  }

  /**
   * Check whether a node is at the end of the workflow (has no outgoing edges).
   *
   * @param graph  - The workflow document
   * @param nodeId - Node ID to check
   * @returns `true` if the node has no outgoing connections
   */
  isEndOfWorkflow(graph: IWorkflow, nodeId: string): boolean {
    return !graph.graph.edges.some((e) => e.source === nodeId);
  }

  /**
   * Validate the entire workflow graph for structural integrity.
   *
   * @param graph - The workflow document
   * @returns Validation result with error messages
   */
  validateGraph(graph: IWorkflow): GraphValidation {
    const errors: string[] = [];
    const nodeIds = new Set(graph.graph.nodes.map((n) => n.id));
    const targetIds = new Set(graph.graph.edges.map((e) => e.target));

    // 1. Must have at least one start node
    const startNodes = graph.graph.nodes.filter((n) => !targetIds.has(n.id));
    if (startNodes.length === 0) {
      errors.push('No start node found — all nodes have incoming edges');
    }

    // 2. All edges reference valid nodes
    for (const edge of graph.graph.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge "${edge.id}" references unknown source node "${edge.source}"`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge "${edge.id}" references unknown target node "${edge.target}"`);
      }
    }

    // 3. No orphaned nodes (every non-start node should be reachable)
    const reachable = new Set<string>();
    const queue = startNodes.map((n) => n.id);
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      reachable.add(current);
      const outgoing = graph.graph.edges.filter((e) => e.source === current);
      for (const e of outgoing) {
        if (!reachable.has(e.target)) queue.push(e.target);
      }
    }
    for (const node of graph.graph.nodes) {
      if (!reachable.has(node.id)) {
        errors.push(`Node "${node.id}" is orphaned — not reachable from any start node`);
      }
    }

    // 4. Detect infinite loops (simple cycle detection via DFS)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = graph.graph.edges
        .filter((e) => e.source === nodeId)
        .map((e) => e.target);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of graph.graph.nodes) {
      if (!visited.has(node.id) && hasCycle(node.id)) {
        errors.push('Workflow contains a cycle — possible infinite loop detected');
        break;
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

export const workflowGraphEngine = new WorkflowGraphEngine();
