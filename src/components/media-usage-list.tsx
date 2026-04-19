"use client";

import { useState } from "react";

import { CollapseToggleChip } from "@/components/collapse-toggle-chip";
import type { AdminMediaAssetUsagePost } from "@/lib/media-assets";

type MediaUsageListProps = {
  posts: AdminMediaAssetUsagePost[];
  totalCount?: number;
  emptyCopy: string;
  baseKey: string;
  initiallyVisibleCount?: number;
  compact?: boolean;
};

export function MediaUsageList({
  posts,
  totalCount,
  emptyCopy,
  baseKey,
  initiallyVisibleCount = 3,
  compact = false,
}: MediaUsageListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!posts.length) {
    return <p className="mt-2 text-sm text-stone-500">{emptyCopy}</p>;
  }

  const visiblePosts = isExpanded ? posts : posts.slice(0, initiallyVisibleCount);
  const effectiveTotalCount = Math.max(totalCount ?? posts.length, posts.length);

  return (
    <div className="mt-2">
      <ul
        className={`divide-y divide-stone-200 border-t border-stone-200 text-sm text-stone-700 dark:divide-white/5 dark:border-white/5 dark:text-stone-300 ${
          compact ? "" : "mt-1"
        }`}
      >
        {visiblePosts.map((post) => (
          <li key={`${baseKey}-${post.id}`} className="py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <a
                href={post.href}
                target="_blank"
                rel="noreferrer"
                className="block truncate transition hover:text-stone-950 dark:hover:text-white"
              >
                {post.title}
              </a>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <a
                href={post.adminHref}
                className="text-xs text-stone-500 transition hover:text-stone-950 dark:hover:text-white"
              >
                관리자에서 열기
              </a>
              <span className="text-xs text-stone-400 dark:text-stone-600">·</span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-stone-500 dark:text-stone-500">
                {post.status}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {effectiveTotalCount > initiallyVisibleCount ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-3 inline-flex items-center gap-2 text-xs text-stone-500 transition hover:text-stone-950 dark:hover:text-white"
        >
          <span>
            {isExpanded
              ? `${posts.length}건 불러옴 / 전체 ${effectiveTotalCount}건`
              : `${visiblePosts.length}건 표시 중 / 전체 ${effectiveTotalCount}건`}
          </span>
          <CollapseToggleChip
            isOpen={isExpanded}
            closedLabel="펼치기"
            openLabel="접기"
          />
        </button>
      ) : null}
    </div>
  );
}
