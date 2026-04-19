import type { Metadata } from "next";
import Link from "next/link";

import { PublicBreadcrumbs } from "@/components/public-breadcrumbs";
import { SectionTitle } from "@/components/section-title";
import { categoryDefinitions } from "@/lib/content";
import { getPostsByCategory } from "@/lib/posts";

export const metadata: Metadata = {
  title: "DYCDYP",
  description:
    "투자, AI, 문화, 인문 카테고리별 공개 게시물을 탐색하고 태그와 아카이브로 다시 발견합니다.",
  alternates: {
    canonical: "/category",
  },
};

export default async function CategoryHubPage() {
  const categories = await Promise.all(
    categoryDefinitions.map(async (category) => {
      const posts = await getPostsByCategory(category.root);

      return {
        ...category,
        count: posts.length,
      };
    }),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <PublicBreadcrumbs
        items={[
          { label: "홈", href: "/" },
          { label: "카테고리" },
        ]}
        className="mb-6"
      />
      <SectionTitle
        eyebrow="Category"
        title="카테고리별 흐름으로 읽기"
        description="관심 있는 주제부터 들어가서 공개된 글을 묶음으로 탐색할 수 있습니다."
      />
      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-stone-500">
        <span>{categories.length}개 카테고리</span>
        <span>·</span>
        <span>전체 공개 글 {categories.reduce((sum, category) => sum + category.count, 0)}개</span>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.root}
            href={`/category/${category.root}`}
            className="rounded-[1.75rem] border border-black/10 bg-stone-50 p-5 transition hover:border-stone-950 hover:bg-white"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
                {category.root}
              </p>
              <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-stone-600">
                {category.count} posts
              </span>
            </div>
            <h3 className="mt-3 font-serif text-2xl text-stone-950">
              {category.label}
            </h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              {category.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {category.leaves.map((leaf) => (
                <span
                  key={leaf.slug}
                  className="rounded-full bg-stone-200 px-3 py-1 text-xs text-stone-700"
                >
                  {leaf.label}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-10 rounded-[2rem] border border-black/10 bg-white p-6 text-sm leading-7 text-stone-600 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.22)]">
        각 카테고리 안에서는 하위 주제별 글 목록으로 바로 이동할 수 있고,
        카테고리 페이지에서는 최신 공개 순으로 정리된 글 리스트를 확인할 수
        있습니다.
      </div>
    </div>
  );
}
