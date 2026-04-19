import assert from "node:assert/strict";
import test from "node:test";

import type { PostSummary } from "@/lib/content";
import {
  getPublicSortLabel,
  getSearchMatchReasons,
} from "@/lib/public-search-helpers";

const samplePost: PostSummary = {
  id: "post-1",
  slug: "macro-liquidity-turn",
  title: "유동성 전환 국면에서 먼저 움직이는 자산은 무엇인가",
  excerpt: "거시 유동성과 자산 회전 흐름을 짚는 글입니다.",
  categoryRoot: "investment",
  categoryLeaf: "economy",
  tags: ["유동성", "매크로", "자산배분"],
  status: "published",
  publishedAt: "2026-04-19",
  readingTimeMinutes: 5,
  thumbnailUrl: "",
};

test("public sort label reports stable Korean labels", () => {
  assert.equal(getPublicSortLabel("published_desc"), "최신순");
  assert.equal(getPublicSortLabel("published_asc"), "오래된순");
});

test("search match reasons include title, excerpt, tag, category, and slug matches", () => {
  assert.deepEqual(getSearchMatchReasons(samplePost, "유동성"), [
    "제목 일치",
    "요약 일치",
    "태그 일치",
  ]);
  assert.deepEqual(getSearchMatchReasons(samplePost, "투자"), ["카테고리 일치"]);
  assert.deepEqual(getSearchMatchReasons(samplePost, "macro"), ["슬러그 일치"]);
});

test("search match reasons are empty when there is no query", () => {
  assert.deepEqual(getSearchMatchReasons(samplePost, ""), []);
  assert.deepEqual(getSearchMatchReasons(samplePost, undefined), []);
});
