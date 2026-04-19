import test from "node:test";
import assert from "node:assert/strict";

import { getNewsletterRedirectPath } from "@/lib/newsletter-action-helpers";

test("newsletter action redirects invalid emails to invalid status", () => {
  assert.equal(
    getNewsletterRedirectPath({
      ok: false,
      code: "invalid_email",
    }),
    "/?newsletter=invalid",
  );
});

test("newsletter action redirects blocked subscribers to blocked status", () => {
  assert.equal(
    getNewsletterRedirectPath({
      ok: false,
      code: "blocked",
    }),
    "/?newsletter=blocked",
  );
});

test("newsletter action redirects duplicate subscribers to duplicate status", () => {
  assert.equal(
    getNewsletterRedirectPath({
      ok: true,
      code: "already_subscribed",
    }),
    "/?newsletter=duplicate",
  );
});

test("newsletter action redirects fresh subscribers to success status", () => {
  assert.equal(
    getNewsletterRedirectPath({
      ok: true,
      code: "subscribed",
    }),
    "/?newsletter=success",
  );
});

test("newsletter action keeps redirect target when current page is provided", () => {
  assert.equal(
    getNewsletterRedirectPath(
      {
        ok: true,
        code: "subscribed",
      },
      "/category/investment",
    ),
    "/category/investment?newsletter=success",
  );
});
