import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeNewsletterEmail,
  validateNewsletterEmail,
} from "@/lib/newsletter-rules";

test("newsletter email normalization trims spaces and lowercases letters", () => {
  assert.equal(
    normalizeNewsletterEmail("  TeSt.User@Example.COM  "),
    "test.user@example.com",
  );
});

test("newsletter validation rejects malformed emails", () => {
  assert.deepEqual(validateNewsletterEmail("not-an-email"), {
    ok: false,
    code: "invalid_email",
  });
  assert.deepEqual(validateNewsletterEmail("   "), {
    ok: false,
    code: "invalid_email",
  });
});

test("newsletter validation returns normalized address for valid emails", () => {
  assert.deepEqual(validateNewsletterEmail("  Reader@DYCDYP.com "), {
    ok: true,
    normalizedEmail: "reader@dycdyp.com",
  });
});
