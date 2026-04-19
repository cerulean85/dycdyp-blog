import Image from "next/image";
import Link from "next/link";

import type { PostSummary } from "@/lib/content";

type PostCardProps = {
  post: PostSummary;
  size?: "default" | "compact" | "small";
  tone?: "default" | "featured" | "subtle";
  showThumbnail?: boolean;
};

export function PostCard({
  post,
  size = "default",
  tone = "default",
  showThumbnail = false,
}: PostCardProps) {
  const isCompact = size === "compact";
  const isSmall = size === "small";
  const isReduced = isCompact || isSmall;
  const visibleTags = isReduced ? post.tags.slice(0, 2) : post.tags;
  const isFeatured = tone === "featured";
  const isSubtle = tone === "subtle";
  const articleToneClassName = isFeatured
    ? "border-stone-300/90 bg-[linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(244,240,234,0.99)_100%)]"
    : isSubtle
      ? "border-stone-300/85 bg-[linear-gradient(180deg,_rgba(242,240,236,0.98)_0%,_rgba(232,228,222,0.96)_100%)]"
      : "border-stone-300/85 bg-[linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(246,242,236,0.98)_100%)]";
  const articleShadowClassName = isFeatured
    ? "shadow-[0_28px_78px_-34px_rgba(0,0,0,0.38)]"
    : isSubtle
      ? "shadow-[0_14px_34px_-24px_rgba(0,0,0,0.16)]"
      : "shadow-[0_22px_64px_-35px_rgba(0,0,0,0.28)]";
  const thumbToneClassName = isFeatured
    ? "border-b border-stone-300/70 bg-stone-300/30"
    : isSubtle
      ? "border-b border-stone-300/70 bg-stone-300/45"
      : "border-b border-stone-300/70 bg-stone-200/55";
  const metaToneClassName = isFeatured
    ? "text-stone-600"
    : isSubtle
      ? "text-stone-400"
      : "text-stone-500";
  const titleToneClassName = isFeatured
    ? "text-stone-950"
    : isSubtle
      ? "text-stone-800"
      : "text-stone-950";
  const excerptToneClassName = isFeatured
    ? "text-stone-700"
    : isSubtle
      ? "text-stone-500"
      : "text-stone-600";
  const chipToneClassName = isFeatured
    ? "bg-stone-300/75 text-stone-950"
    : isSubtle
      ? "bg-stone-300/60 text-stone-700"
      : "bg-stone-200/75 text-stone-800";
  const overflowChipToneClassName = isFeatured
    ? "bg-stone-300/75 text-stone-800"
    : isSubtle
      ? "bg-stone-300/60 text-stone-600"
      : "bg-stone-200/75 text-stone-600";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[2rem] border ${
        isSmall ? "h-[15.5rem]" : isCompact ? "h-[17rem]" : "min-h-[20rem]"
      } ${articleToneClassName} ${articleShadowClassName}`}
    >
      {showThumbnail && post.thumbnailUrl ? (
        <Link
          href={`/category/${post.categoryRoot}/${post.categoryLeaf}/${post.slug}`}
          className={`block ${thumbToneClassName}`}
        >
          <div
            className={`relative overflow-hidden ${
              isSmall
                ? "aspect-[16/7.8]"
                : isCompact
                  ? "aspect-[16/8.5]"
                  : "aspect-[16/10]"
            }`}
          >
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
              className="object-cover transition duration-300 hover:scale-[1.02]"
            />
          </div>
        </Link>
      ) : null}
      <div
        className={`flex flex-1 flex-col ${
          isSmall ? "p-4" : isCompact ? "p-5" : "p-6"
        }`}
      >
        <div
          className={`flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] ${
            metaToneClassName
          } ${
            isSmall ? "mb-2" : isCompact ? "mb-3" : "mb-4"
          }`}
        >
          <span>{post.categoryRoot}</span>
          <span>/</span>
          <span>{post.categoryLeaf}</span>
        </div>
        <h3
          className={`font-serif leading-tight ${titleToneClassName} ${
            isSmall ? "text-[1.2rem]" : isCompact ? "text-[1.45rem]" : "text-2xl"
          }`}
        >
          <Link
            href={`/category/${post.categoryRoot}/${post.categoryLeaf}/${post.slug}`}
            className={`hover:text-stone-700 ${isReduced ? "line-clamp-2" : ""}`}
          >
            {post.title}
          </Link>
        </h3>
        <p
          className={`line-clamp-3 ${excerptToneClassName} ${
            isSmall
              ? "mt-1.5 line-clamp-2 text-[11px] leading-5"
              : isCompact
              ? "mt-2 line-clamp-2 text-[12px] leading-5"
              : "mt-3 text-sm leading-7"
          }`}
        >
          {post.excerpt}
        </p>
        <div
          className={`flex flex-wrap items-center gap-3 ${metaToneClassName} ${
            isSmall ? "mt-3 text-[11px]" : isCompact ? "mt-4 text-[12px]" : "mt-5 text-sm"
          }`}
        >
          <span>{post.publishedAt}</span>
          <span>{post.readingTimeMinutes}분 읽기</span>
        </div>
        <div
          className={`mt-auto flex flex-wrap gap-2 ${
            isSmall ? "pt-3" : isCompact ? "pt-4" : "pt-5"
          }`}
        >
          {visibleTags.map((tag) => (
            <Link
              key={tag}
              href={`/tags?tag=${encodeURIComponent(tag)}`}
              className={`rounded-full ${chipToneClassName} ${
                isSmall
                  ? "px-2 py-1 text-[9px]"
                  : isCompact
                    ? "px-2.5 py-1 text-[10px]"
                    : "px-3 py-1 text-xs"
              }`}
            >
              #{tag}
            </Link>
          ))}
          {isReduced && post.tags.length > visibleTags.length ? (
            <span
              className={`rounded-full ${overflowChipToneClassName} ${
                isSmall ? "px-2 py-1 text-[9px]" : "px-2.5 py-1 text-[10px]"
              }`}
            >
              +{post.tags.length - visibleTags.length}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
