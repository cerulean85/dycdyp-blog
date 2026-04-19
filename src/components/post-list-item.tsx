import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { PostSummary } from "@/lib/content";
import { getSearchMatchReasons } from "@/lib/public-search-helpers";

type PostListItemProps = {
  post: PostSummary;
  highlightQuery?: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query?: string): ReactNode {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return text;
  }

  const pattern = new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi");
  const parts = text.split(pattern);

  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) =>
    part.toLowerCase() === normalizedQuery.toLowerCase() ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-sm bg-stone-200 px-0.5 text-inherit"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

export function PostListItem({ post, highlightQuery }: PostListItemProps) {
  const matchReasons = getSearchMatchReasons(post, highlightQuery);

  return (
    <article className="border-b border-black/10 py-5 first:pt-0 last:border-b-0 last:pb-0 md:py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
        {post.thumbnailUrl ? (
          <Link
            href={`/category/${post.categoryRoot}/${post.categoryLeaf}/${post.slug}`}
            className="block shrink-0"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-stone-100 md:w-56 md:rounded-[1.5rem]">
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                sizes="(min-width: 768px) 224px, 100vw"
                className="object-cover transition duration-300 hover:scale-[1.02]"
              />
            </div>
          </Link>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-stone-500 md:text-xs md:tracking-[0.22em]">
            <span>{post.categoryRoot}</span>
            <span>/</span>
            <span>{post.categoryLeaf}</span>
            <span className="text-stone-300">•</span>
            <span>{post.publishedAt}</span>
            <span>{post.readingTimeMinutes}분 읽기</span>
          </div>

          <h3 className="mt-3 font-serif text-[1.9rem] leading-tight text-stone-950 md:mt-4 md:text-[2rem]">
            <Link
              href={`/category/${post.categoryRoot}/${post.categoryLeaf}/${post.slug}`}
              className="transition hover:text-stone-700"
            >
              {highlightText(post.title, highlightQuery)}
            </Link>
          </h3>

          {matchReasons.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {matchReasons.map((reason) => (
                <span
                  key={reason}
                  className="public-soft-panel rounded-full border px-2.5 py-1 text-[11px] text-stone-600 md:text-xs"
                >
                  {reason}
                </span>
              ))}
            </div>
          ) : null}

          <p className="mt-2.5 max-w-3xl text-sm leading-6 text-stone-600 md:mt-3 md:text-base md:leading-7">
            {highlightText(post.excerpt, highlightQuery)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 md:mt-5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags?tag=${encodeURIComponent(tag)}`}
                className="public-soft-panel rounded-full border px-2.5 py-1 text-[11px] text-stone-700 transition hover:bg-stone-200 md:px-3 md:text-xs"
              >
                #{highlightText(tag, highlightQuery)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
