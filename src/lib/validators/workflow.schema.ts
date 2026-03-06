// src/lib/validators/workflow.schema.ts
import { z } from "zod";

const NODE_TYPES = [
  "email",
  "wait",
  "condition",
  "linkedin",
  "ai_generate",
] as const;

export const WorkflowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(NODE_TYPES),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  config: z.record(z.unknown()).default({}),
});

export const WorkflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  condition: z.string().optional(),
});

export const WorkflowGraphSchema = z.object({
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
});

export const WorkflowCreateSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().optional(),
  graph: WorkflowGraphSchema.optional().default({ nodes: [], edges: [] }),
});

export type WorkflowNodeInput = z.infer<typeof WorkflowNodeSchema>;
export type WorkflowEdgeInput = z.infer<typeof WorkflowEdgeSchema>;
export type WorkflowGraphInput = z.infer<typeof WorkflowGraphSchema>;
export type WorkflowCreateInput = z.infer<typeof WorkflowCreateSchema>;
