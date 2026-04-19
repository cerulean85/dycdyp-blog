import test from "node:test";
import assert from "node:assert/strict";

import {
  getDeletePostRedirectPath,
  getSavePostRedirectPath,
  getWorkflowErrorRedirectPath,
  getWorkflowSuccessRedirectPath,
  parseSavePostFormData,
  parseWorkflowFormData,
} from "@/lib/admin-action-helpers";

test("save post form parsing returns normalized payload for server action", () => {
  const formData = new FormData();
  formData.set("id", "post-123");
  formData.set("title", "테스트 글");
  formData.set("slug", "test-post");
  formData.set("excerpt", "요약");
  formData.set("categoryPair", "ai/news");
  formData.set("readingTimeMinutes", "7");
  formData.set("tags", "ai, news");
  formData.set("thumbnailAssetId", "asset-1");
  formData.set("markdownBody", "## hello");

  assert.deepEqual(parseSavePostFormData(formData), {
    id: "post-123",
    title: "테스트 글",
    slug: "test-post",
    excerpt: "요약",
    categoryRoot: "ai",
    categoryLeaf: "news",
    readingTimeMinutes: 7,
    tags: "ai, news",
    thumbnailAssetId: "asset-1",
    markdownBody: "## hello",
  });
});

test("save post parsing falls back safely when category pair is missing", () => {
  const formData = new FormData();
  formData.set("title", "초안");

  assert.deepEqual(parseSavePostFormData(formData), {
    id: undefined,
    title: "초안",
    slug: "",
    excerpt: "",
    categoryRoot: "",
    categoryLeaf: "",
    readingTimeMinutes: 0,
    tags: "",
    thumbnailAssetId: "",
    markdownBody: "",
  });
});

test("workflow parsing extracts id and action from form data", () => {
  const formData = new FormData();
  formData.set("id", "post-1");
  formData.set("workflowAction", "publish");

  assert.deepEqual(parseWorkflowFormData(formData), {
    id: "post-1",
    workflowAction: "publish",
  });
});

test("admin action redirect helpers build stable target urls", () => {
  assert.equal(
    getSavePostRedirectPath("post-1"),
    "/admin/posts/post-1/edit?saved=1",
  );
  assert.equal(getDeletePostRedirectPath(), "/admin?deleted=1");
  assert.equal(
    getWorkflowSuccessRedirectPath("post-1", "approve"),
    "/admin/posts/post-1/edit?workflow=approve",
  );
  assert.equal(
    getWorkflowErrorRedirectPath("post-1", 'draft 상태에서는 "publish" 불가'),
    "/admin/posts/post-1/edit?workflowError=draft%20%EC%83%81%ED%83%9C%EC%97%90%EC%84%9C%EB%8A%94%20%22publish%22%20%EB%B6%88%EA%B0%80",
  );
});
