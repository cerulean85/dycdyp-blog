"use client";

import { useEffect, useRef, useState } from "react";

import { PostCard } from "@/components/post-card";
import type { PostSummary } from "@/lib/content";

type PostCarouselProps = {
  posts: PostSummary[];
  cardSize?: "default" | "compact" | "small";
  cardTone?: "default" | "featured" | "subtle";
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export function PostCarousel({
  posts,
  cardSize = "default",
  cardTone = "default",
}: PostCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const element = trackRef.current;

    if (!element) {
      return;
    }

    const updateScrollState = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      setCanScrollLeft(element.scrollLeft > 8);
      setCanScrollRight(element.scrollLeft < maxScrollLeft - 8);
    };

    updateScrollState();

    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [posts.length]);

  const scrollByPage = (direction: "left" | "right") => {
    const element = trackRef.current;

    if (!element) {
      return;
    }

    const distance = Math.max(element.clientWidth * 0.88, 320);

    element.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const buttonClassName =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300/90 bg-stone-100/95 text-stone-700 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.28)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-stone-400 hover:bg-stone-200/95 hover:text-stone-900 hover:shadow-[0_18px_30px_-18px_rgba(0,0,0,0.34)] disabled:pointer-events-none disabled:opacity-45 md:h-11 md:w-11";
  const itemClassName =
    cardSize === "small"
      ? "min-w-0 shrink-0 basis-[74%] snap-start sm:basis-[52%] lg:basis-[34%] xl:basis-[26%]"
      : cardSize === "compact"
      ? "min-w-0 shrink-0 basis-[82%] snap-start sm:basis-[58%] lg:basis-[38%] xl:basis-[30%]"
      : "min-w-0 shrink-0 basis-[90%] snap-start sm:basis-[72%] lg:basis-[48%] xl:basis-[36%]";

  return (
    <div className="relative mt-3">
      <div className="pointer-events-none absolute right-2 top-2 z-10 hidden items-center gap-2 md:right-3 md:top-3 md:gap-3 sm:flex">
        <button
          type="button"
          aria-label="이전 글 보기"
          onClick={() => scrollByPage("left")}
          disabled={!canScrollLeft}
          className={`pointer-events-auto ${buttonClassName}`}
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          aria-label="다음 글 보기"
          onClick={() => scrollByPage("right")}
          disabled={!canScrollRight}
          className={`pointer-events-auto ${buttonClassName}`}
        >
          <ArrowIcon direction="right" />
        </button>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6 md:pb-4"
      >
        {posts.map((post) => (
          <div key={post.slug} className={itemClassName}>
            <PostCard post={post} size={cardSize} tone={cardTone} />
          </div>
        ))}
      </div>
    </div>
  );
}
