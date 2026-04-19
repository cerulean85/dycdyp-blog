import type { WorkflowAction } from "@/lib/admin-workflow";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function parseSavePostFormData(formData: FormData) {
  const id = getString(formData, "id");
  const categoryPair = getString(formData, "categoryPair");
  const [categoryRoot = "", categoryLeaf = ""] = categoryPair.split("/");
  const readingTimeMinutes = Number(
    getString(formData, "readingTimeMinutes") || "0",
  );

  return {
    id: id || undefined,
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    excerpt: getString(formData, "excerpt"),
    categoryRoot,
    categoryLeaf,
    readingTimeMinutes,
    tags: getString(formData, "tags"),
    thumbnailAssetId: getString(formData, "thumbnailAssetId"),
    markdownBody: String(formData.get("markdownBody") ?? ""),
  };
}

export function parseWorkflowFormData(formData: FormData) {
  const id = getString(formData, "id");
  const workflowAction = getString(formData, "workflowAction") as WorkflowAction;

  return {
    id,
    workflowAction,
  };
}

export function getSavePostRedirectPath(savedId: string) {
  return `/admin/posts/${savedId}/edit?saved=1`;
}

export function getDeletePostRedirectPath() {
  return "/admin?deleted=1";
}

export function getWorkflowSuccessRedirectPath(
  id: string,
  workflowAction: WorkflowAction,
) {
  return `/admin/posts/${id}/edit?workflow=${workflowAction}`;
}

export function getWorkflowErrorRedirectPath(id: string, message: string) {
  return `/admin/posts/${id}/edit?workflowError=${encodeURIComponent(message)}`;
}
