// src/lib/models/index.ts
export { default as UserModel } from "./User";
export type { IUser } from "./User";

export { default as OrganizationModel } from "./Organization";
export type { IOrganization, ISafetyConfig, ISmtpConfig, IOrgMember } from "./Organization";

export { default as LeadModel } from "./Lead";
export type { ILead } from "./Lead";

export { default as WorkflowModel } from "./Workflow";
export type { IWorkflow, IWorkflowNode, IWorkflowEdge } from "./Workflow";

export { default as CampaignModel } from "./Campaign";
export type { ICampaign, ICampaignStats } from "./Campaign";

export { default as ExecutionModel } from "./Execution";
export type { IExecution, IGeneratedMessage } from "./Execution";

export { default as OutreachMessageModel } from "./OutreachMessage";
export type { IOutreachMessage } from "./OutreachMessage";

export { default as SafetyEventModel } from "./SafetyEvent";
export type { ISafetyEvent } from "./SafetyEvent";

export { default as ActivityModel } from "./Activity";
export type { IActivity } from "./Activity";

export { default as AnalyticsSnapshotModel } from "./AnalyticsSnapshot";
export type { IAnalyticsSnapshot } from "./AnalyticsSnapshot";

export { default as WorkflowTemplateModel } from "./WorkflowTemplate";
export type { IWorkflowTemplate } from "./WorkflowTemplate";

export { default as NotificationModel } from "./Notification";
export type { INotification } from "./Notification";
