import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAdminPostsFilterSummary,
  buildAssetsFilterSummary,
  buildNewsletterFilterSummary,
} from "@/lib/admin-filter-summary";

test("post filter summary reports active filters and removal links", () => {
  const summary = buildAdminPostsFilterSummary({
    q: "agent",
    status: "review",
    category: "ai",
    sort: "title_desc",
  });

  assert.equal(summary.activeFilterCount, 4);
  assert.equal(summary.sortLabel, "제목 내림차순");
  assert.equal(summary.items[0]?.removeHref, "/admin?status=review&category=ai&sort=title_desc");
  assert.equal(summary.items[2]?.value, "AI");
  assert.equal(summary.items[3]?.removeHref, "/admin?q=agent&status=review&category=ai");
});

test("newsletter filter summary omits default sort from removal links", () => {
  const summary = buildNewsletterFilterSummary({
    q: "hello@example.com",
    source: "newsletter_page",
    status: "blocked",
    sort: "created_desc",
  });

  assert.equal(summary.activeFilterCount, 4);
  assert.equal(summary.sortLabel, "최신순");
  assert.equal(summary.items[3]?.value, "최신순");
  assert.equal(summary.items[1]?.removeHref, "/admin/newsletter?q=hello%40example.com&status=blocked");
});

test("asset filter summary compresses labels and builds focused remove links", () => {
  const summary = buildAssetsFilterSummary({
    q: "banner",
    mime: "image/png",
    kind: "load_test",
    usage: "unused",
    sort: "size_desc",
  });

  assert.equal(summary.activeFilterCount, 5);
  assert.equal(summary.sortLabel, "용량순");
  assert.equal(summary.items[2]?.value, "테스트");
  assert.equal(
    summary.items[4]?.removeHref,
    "/admin/assets?q=banner&mime=image%2Fpng&kind=load_test&usage=unused",
  );
});
