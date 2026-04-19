import { PostStatus as PrismaPostStatus } from "@prisma/client";

export const allowedWorkflowTransitions = {
  draft: ["submit_for_review"],
  review: ["approve"],
  approved: ["submit_for_review", "publish"],
  published: ["submit_for_review", "approve", "unpublish"],
} as const satisfies Record<
  Lowercase<keyof typeof PrismaPostStatus>,
  readonly WorkflowAction[]
>;

export type WorkflowStatus = Lowercase<keyof typeof PrismaPostStatus>;

export type WorkflowAction =
  | "submit_for_review"
  | "approve"
  | "publish"
  | "unpublish";

export function getAllowedWorkflowActions(status: WorkflowStatus) {
  return allowedWorkflowTransitions[status];
}

export function isWorkflowActionAllowed(
  status: WorkflowStatus,
  action: WorkflowAction,
) {
  return (getAllowedWorkflowActions(status) as readonly WorkflowAction[]).includes(
    action,
  );
}
