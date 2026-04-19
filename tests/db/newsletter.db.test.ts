import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { subscribeToNewsletter } from "@/lib/newsletter-core";

test("newsletter subscription persists once and returns duplicate on retry", async () => {
  const email = `test-newsletter-${randomUUID()}@example.com`;

  try {
    const firstAttempt = await subscribeToNewsletter({
      email,
      source: "db_smoke_test",
    });

    assert.deepEqual(firstAttempt, {
      ok: true,
      code: "subscribed",
    });

    const savedSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    assert.ok(savedSubscriber);
    assert.equal(savedSubscriber?.source, "db_smoke_test");

    const secondAttempt = await subscribeToNewsletter({
      email,
      source: "db_smoke_test",
    });

    assert.deepEqual(secondAttempt, {
      ok: true,
      code: "already_subscribed",
    });
  } finally {
    await prisma.newsletterSubscriber.deleteMany({
      where: { email },
    });
  }
});
