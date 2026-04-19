import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { PostCarousel } from "@/components/post-carousel";
import { categoryDefinitions } from "@/lib/content";
import { getFeaturedPosts, getPostsByCategory, getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const categorySectionStyles = {
  investment:
    "border-stone-300/80 bg-[linear-gradient(180deg,_rgba(241,239,235,0.98)_0%,_rgba(232,229,223,0.96)_100%)]",
  ai: "border-stone-300/80 bg-[linear-gradient(180deg,_rgba(241,239,235,0.98)_0%,_rgba(232,229,223,0.96)_100%)]",
  culture:
    "border-stone-300/80 bg-[linear-gradient(180deg,_rgba(241,239,235,0.98)_0%,_rgba(232,229,223,0.96)_100%)]",
  humanities:
    "border-stone-300/80 bg-[linear-gradient(180deg,_rgba(241,239,235,0.98)_0%,_rgba(232,229,223,0.96)_100%)]",
} as const;

export default async function Home() {
  const [featuredPosts, posts, categorySections] = await Promise.all([
    getFeaturedPosts(3),
    getPublishedPosts(),
    Promise.all(
      categoryDefinitions.map(async (category) => ({
        ...category,
        posts: (await getPostsByCategory(category.root)).slice(0, 5),
      })),
    ),
  ]);
  const recentPosts = posts.filter(
    (post) => !featuredPosts.some((featured) => featured.id === post.id),
  );

  return (
    <div className="home-page-shell bg-[radial-gradient(circle_at_top_left,_rgba(28,25,23,0.08),_transparent_24%),linear-gradient(180deg,_#f3f0ea_0%,_#e9e4dc_100%)]">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:px-6 md:py-10 lg:py-12">
        {featuredPosts.length > 0 ? (
          <div className="home-section home-section-featured rounded-[2rem] border border-stone-500/50 bg-[linear-gradient(180deg,_rgba(86,80,74,0.98)_0%,_rgba(60,55,50,0.98)_100%)] p-5 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.42)] md:rounded-[2.5rem] md:p-6 lg:p-8">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between md:mb-5">
              <div>
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.32em] text-stone-200/95">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-stone-200/25 bg-white/10 text-[10px] tracking-normal text-stone-100"
                  >
                    ✦
                  </span>
                  <span>Editor&apos;s Picks</span>
                </p>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-300/95 md:mt-2">
                  에디터 강추! 꼭 읽어 보세요.
                </p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {featuredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  tone="featured"
                  showThumbnail
                />
              ))}
            </div>
          </div>
        ) : null}

        <div
          className={`home-section home-section-recent rounded-[2rem] border border-stone-300/65 bg-[linear-gradient(180deg,_rgba(214,208,200,0.98)_0%,_rgba(191,184,176,0.98)_100%)] px-5 py-5 shadow-[0_26px_70px_-46px_rgba(0,0,0,0.22)] md:rounded-[2.5rem] md:px-6 md:py-6 lg:px-8 ${
            featuredPosts.length > 0 ? "mt-8 md:mt-10" : ""
          }`}
        >
          <div className="mb-1.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between md:mb-2">
            <div>
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-stone-700">
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-stone-600/20 bg-white/50 text-[10px] tracking-normal text-stone-700"
                >
                  ●
                </span>
                <span>Recently Published</span>
              </p>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-700 md:mt-2">
                이제 막 공개된 따끈따끈한 글이에요.
              </p>
            </div>
          </div>
          <PostCarousel
            posts={recentPosts.length > 0 ? recentPosts : posts}
            cardSize="compact"
            cardTone="default"
          />
        </div>

        <div className="mt-10 space-y-10 md:mt-12 md:space-y-12">
          {categorySections.map((category) =>
            category.posts.length > 0 ? (
              <section
                key={category.root}
                className={`home-section home-section-category rounded-[2rem] border p-4 shadow-[0_18px_52px_-40px_rgba(0,0,0,0.22)] md:rounded-[2.25rem] md:p-5 lg:p-6 ${categorySectionStyles[category.root]}`}
              >
                <div className="mb-1.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between md:mb-2">
                  <div>
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-stone-500">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-stone-400/20 bg-white/55 text-[10px] tracking-normal text-stone-600"
                      >
                        ◻
                      </span>
                      <span>Category: {category.root}</span>
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-stone-600 md:mt-2">
                      {category.description}
                    </p>
                  </div>
                  <Link
                    href={`/category/${category.root}`}
                    className="text-sm text-stone-500 transition hover:text-stone-800"
                  >
                    전체 보기
                  </Link>
                </div>
                <PostCarousel
                  posts={category.posts}
                  cardSize="small"
                  cardTone="subtle"
                />
              </section>
            ) : null,
          )}
        </div>
      </section>
    </div>
  );
}
