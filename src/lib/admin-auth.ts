import "server-only";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import {
  canManageAssets,
  canManageAudience,
  canDeletePost,
  canExportData,
  canManagePublishing,
  normalizeAdminRole,
  type AdminRoleKey,
} from "@/lib/admin-permissions";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  return {
    email: session.user.email,
    role: normalizeAdminRole((session.user as { role?: string }).role),
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireAdminRole(role: AdminRoleKey) {
  const session = await requireAdminSession();

  if (session.role !== role) {
    redirect("/admin?permissionError=1");
  }

  return session;
}

export function assertCanDeletePost(role: AdminRoleKey) {
  if (!canDeletePost(role)) {
    throw new Error("게시물 삭제 권한은 admin에게만 있습니다.");
  }
}

export function assertCanManagePublishing(role: AdminRoleKey) {
  if (!canManagePublishing(role)) {
    throw new Error("승인과 게시 권한은 admin에게만 있습니다.");
  }
}

export function assertCanExportData(role: AdminRoleKey) {
  if (!canExportData(role)) {
    throw new Error("데이터 export 권한은 admin에게만 있습니다.");
  }
}

export function assertCanManageAudience(role: AdminRoleKey) {
  if (!canManageAudience(role)) {
    throw new Error("구독자 운영 권한은 admin에게만 있습니다.");
  }
}

export function assertCanManageAssets(role: AdminRoleKey) {
  if (!canManageAssets(role)) {
    throw new Error("자산 관리 권한은 admin에게만 있습니다.");
  }
}
