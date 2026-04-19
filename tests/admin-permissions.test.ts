import test from "node:test";
import assert from "node:assert/strict";

import {
  canManageAssets,
  canManageAudience,
  canDeletePost,
  canExportData,
  canManagePublishing,
  canTransitionWorkflowAction,
  normalizeAdminRole,
} from "@/lib/admin-permissions";

test("admin permission helpers allow privileged actions only for admin", () => {
  assert.equal(canManagePublishing("admin"), true);
  assert.equal(canManagePublishing("editor"), false);
  assert.equal(canDeletePost("admin"), true);
  assert.equal(canDeletePost("editor"), false);
  assert.equal(canExportData("admin"), true);
  assert.equal(canExportData("editor"), false);
  assert.equal(canManageAudience("admin"), true);
  assert.equal(canManageAudience("editor"), false);
  assert.equal(canManageAssets("admin"), true);
  assert.equal(canManageAssets("editor"), false);
});

test("workflow transition permission allows editors to submit for review only", () => {
  assert.equal(
    canTransitionWorkflowAction({ role: "editor", action: "submit_for_review" }),
    true,
  );
  assert.equal(
    canTransitionWorkflowAction({ role: "editor", action: "approve" }),
    false,
  );
  assert.equal(
    canTransitionWorkflowAction({ role: "admin", action: "publish" }),
    true,
  );
});

test("unknown roles normalize to editor", () => {
  assert.equal(normalizeAdminRole("admin"), "admin");
  assert.equal(normalizeAdminRole("editor"), "editor");
  assert.equal(normalizeAdminRole("something-else"), "editor");
  assert.equal(normalizeAdminRole(undefined), "editor");
});
