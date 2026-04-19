"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getDeletePostRedirectPath,
  getSavePostRedirectPath,
  getWorkflowErrorRedirectPath,
  getWorkflowSuccessRedirectPath,
  parseSavePostFormData,
  parseWorkflowFormData,
} from "@/lib/admin-action-helpers";
import {
  deleteAdminPost,
  saveAdminPost,
  transitionAdminPostStatus,
} from "@/lib/admin-posts";
import {
  blockNewsletterSubscriber,
  deleteNewsletterSubscriber,
  unblockNewsletterSubscriber,
} from "@/lib/newsletter";
import {
  assertCanDeletePost,
  assertCanManageAudience,
  assertCanManagePublishing,
  requireAdminSession,
} from "@/lib/admin-auth";

function revalidateAdminPaths(id?: string) {
  revalidatePath("/admin");

  if (id) {
    revalidatePath(`/admin/posts/${id}/edit`);
  }
}

function revalidatePublicPaths(input: {
  slug: string;
  categoryRoot: string;
  categoryLeaf: string;
}) {
  revalidatePath("/");
  revalidatePath("/category");
  revalidatePath("/archive");
  revalidatePath("/tags");
  revalidatePath(`/category/${input.categoryRoot}`);
  revalidatePath(`/category/${input.categoryRoot}/${input.categoryLeaf}`);
  revalidatePath(
    `/category/${input.categoryRoot}/${input.categoryLeaf}/${input.slug}`,
  );
}

export async function savePostAction(formData: FormData) {
  const session = await requireAdminSession();
  const input = parseSavePostFormData(formData);

  const savedId = await saveAdminPost({
    ...input,
    editorEmail: session.email,
  });

  revalidateAdminPaths(savedId);
  redirect(getSavePostRedirectPath(savedId));
}

export async function deletePostAction(formData: FormData) {
  const session = await requireAdminSession();
  assertCanDeletePost(session.role);
  const id = String(formData.get("id") ?? "").trim();

  if (id) {
    await deleteAdminPost(id);
  }

  revalidateAdminPaths();
  revalidatePath("/");
  revalidatePath("/category");
  revalidatePath("/archive");
  revalidatePath("/tags");
  redirect(getDeletePostRedirectPath());
}

export async function transitionPostStatusAction(formData: FormData) {
  const session = await requireAdminSession();
  const { id, workflowAction } = parseWorkflowFormData(formData);

  if (!id || !workflowAction) {
    redirect("/admin");
  }

  try {
    if (workflowAction !== "submit_for_review") {
      assertCanManagePublishing(session.role);
    }

    const updatedPost = await transitionAdminPostStatus({
      id,
      action: workflowAction,
      editorEmail: session.email,
    });

    revalidateAdminPaths(id);
    revalidatePublicPaths(updatedPost);
    redirect(getWorkflowSuccessRedirectPath(id, workflowAction));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "상태 전환에 실패했습니다.";

    redirect(getWorkflowErrorRedirectPath(id, message));
  }
}

export async function blockNewsletterSubscriberAction(formData: FormData) {
  const session = await requireAdminSession();
  assertCanManageAudience(session.role);
  const id = String(formData.get("id") ?? "").trim();

  if (id) {
    await blockNewsletterSubscriber({ id });
  }

  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?audience=blocked");
}

export async function unblockNewsletterSubscriberAction(formData: FormData) {
  const session = await requireAdminSession();
  assertCanManageAudience(session.role);
  const id = String(formData.get("id") ?? "").trim();

  if (id) {
    await unblockNewsletterSubscriber(id);
  }

  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?audience=unblocked");
}

export async function deleteNewsletterSubscriberAction(formData: FormData) {
  const session = await requireAdminSession();
  assertCanManageAudience(session.role);
  const id = String(formData.get("id") ?? "").trim();

  if (id) {
    await deleteNewsletterSubscriber(id);
  }

  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?audience=deleted");
}
