import type { PostSummary } from "@/lib/content";
import { getCategoryDefinition } from "@/lib/content";
import type { PublicPostSort } from "@/lib/posts";

export function getPublicSortLabel(sort: PublicPostSort) {
  return sort === "published_asc" ? "오래된순" : "최신순";
}

export function getSearchMatchReasons(post: PostSummary, query?: string) {
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const categoryDefinition = getCategoryDefinition(post.categoryRoot);
  const leafLabel =
    categoryDefinition?.leaves.find((leaf) => leaf.slug === post.categoryLeaf)?.label ?? "";
  const reasons: string[] = [];

  if (post.title.toLowerCase().includes(normalizedQuery)) {
    reasons.push("제목 일치");
  }

  if (post.excerpt.toLowerCase().includes(normalizedQuery)) {
    reasons.push("요약 일치");
  }

  if (post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))) {
    reasons.push("태그 일치");
  }

  if (
    post.categoryRoot.toLowerCase().includes(normalizedQuery) ||
    categoryDefinition?.label.toLowerCase().includes(normalizedQuery) ||
    post.categoryLeaf.toLowerCase().includes(normalizedQuery) ||
    leafLabel.toLowerCase().includes(normalizedQuery)
  ) {
    reasons.push("카테고리 일치");
  }

  if (post.slug.toLowerCase().includes(normalizedQuery)) {
    reasons.push("슬러그 일치");
  }

  return reasons;
}
