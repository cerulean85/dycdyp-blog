import test from "node:test";
import assert from "node:assert/strict";

import {
  getAllowedWorkflowActions,
  isWorkflowActionAllowed,
} from "@/lib/admin-workflow";

test("draft posts can only be submitted for review", () => {
  assert.deepEqual(getAllowedWorkflowActions("draft"), ["submit_for_review"]);
  assert.equal(isWorkflowActionAllowed("draft", "submit_for_review"), true);
  assert.equal(isWorkflowActionAllowed("draft", "publish"), false);
});

test("review posts can only be approved", () => {
  assert.deepEqual(getAllowedWorkflowActions("review"), ["approve"]);
  assert.equal(isWorkflowActionAllowed("review", "approve"), true);
  assert.equal(isWorkflowActionAllowed("review", "unpublish"), false);
});

test("approved posts can be republished or returned to review", () => {
  assert.deepEqual(getAllowedWorkflowActions("approved"), [
    "submit_for_review",
    "publish",
  ]);
  assert.equal(isWorkflowActionAllowed("approved", "publish"), true);
  assert.equal(isWorkflowActionAllowed("approved", "approve"), false);
});

test("published posts can be reviewed, approved again, or unpublished", () => {
  assert.deepEqual(getAllowedWorkflowActions("published"), [
    "submit_for_review",
    "approve",
    "unpublish",
  ]);
  assert.equal(isWorkflowActionAllowed("published", "unpublish"), true);
  assert.equal(isWorkflowActionAllowed("published", "publish"), false);
});
