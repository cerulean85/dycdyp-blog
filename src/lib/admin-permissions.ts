import { AdminRole } from "@prisma/client";

export type AdminRoleKey = Lowercase<keyof typeof AdminRole>;

export function normalizeAdminRole(role?: string | null): AdminRoleKey {
  return role === "admin" ? "admin" : "editor";
}

export function canManagePublishing(role: AdminRoleKey) {
  return role === "admin";
}

export function canDeletePost(role: AdminRoleKey) {
  return role === "admin";
}

export function canExportData(role: AdminRoleKey) {
  return role === "admin";
}

export function canManageAudience(role: AdminRoleKey) {
  return role === "admin";
}

export function canManageAssets(role: AdminRoleKey) {
  return role === "admin";
}

export function canTransitionWorkflowAction(input: {
  role: AdminRoleKey;
  action: "submit_for_review" | "approve" | "publish" | "unpublish";
}) {
  if (input.action === "submit_for_review") {
    return true;
  }

  return canManagePublishing(input.role);
}
