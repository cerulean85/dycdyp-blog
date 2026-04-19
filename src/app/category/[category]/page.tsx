import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostListItem } from "@/components/post-list-item";
import { PublicBreadcrumbs } from "@/components/public-breadcrumbs";
import { PublicPagination } from "@/components/public-pagination";
import { SectionTitle } from "@/components/section-title";
import {
  categoryDefinitions,
  getCategoryDefinition,
  isCategoryRoot,
} from "@/lib/content";
import { getPublicSortLabel } from "@/lib/public-search-helpers";
import {
  getPostsByCategoryPage,
  type PublicPostSort,
} from "@/lib/posts";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
  searchParams?: Promise<{
    q?: string;
    page?: string;
    sort?: string;
  }>;
};

const publicSortOptions: { value: PublicPostSort; label: string }[] = [
  { value: "published_desc", label: "최신순" },
  { value: "published_asc", label: "오래된순" },
];

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isCategoryRoot(category)) {
    return {};
  }

  const definition = getCategoryDefinition(category);

  if (!definition) {
    return {};
  }

  return {
    title: "DYCDYP",
    description: definition.description,
    alternates: {
      canonical: `/category/${definition.root}`,
    },
  };
}

export function generateStaticParams() {
  return categoryDefinitions.map((category) => ({
    category: category.root,
  }));
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = (resolvedSearchParams.q ?? "").trim();
  const requestedSort = resolvedSearchParams.sort;
  const sort: PublicPostSort =
    requestedSort === "published_asc" ? "published_asc" : "published_desc";
  const requestedPage = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const page = Number.isNaN(requestedPage) ? 1 : Math.max(1, requestedPage);

  if (!isCategoryRoot(category)) {
    notFound();
  }

  const definition = getCategoryDefinition(category);

  if (!definition) {
    notFound();
  }

  const [allPostsResult, filteredPostsResult] = await Promise.all([
    getPostsByCategoryPage(category, undefined, {
      page: 1,
      pageSize: 1,
    }),
    getPostsByCategoryPage(category, undefined, {
      page,
      pageSize: 10,
      query,
      sort,
    }),
  ]);
  const posts = filteredPostsResult.posts;
  const totalPostsCount = allPostsResult.totalCount;
  const categorySearchParams = new URLSearchParams();

  if (query) {
    categorySearchParams.set("q", query);
  }
  if (sort !== "published_desc") {
    categorySearchParams.set("sort", sort);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-6 md:py-16">
      <PublicBreadcrumbs
        items={[
          { label: "홈", href: "/" },
          { label: "카테고리", href: "/category" },
          { label: definition.label },
        ]}
        className="mb-5 md:mb-6"
      />
      <div className="mb-5 md:mb-6">
        <Link
          href="/category"
          className="public-button-secondary inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
        >
          <span aria-hidden="true">←</span>
          <span>전체 카테고리로 돌아가기</span>
        </Link>
      </div>
      <SectionTitle
        eyebrow={definition.root}
        title={`${definition.label} 카테고리`}
        description={`${definition.description} 현재 공개된 글 ${totalPostsCount}개를 최신 순으로 볼 수 있습니다.`}
      />
      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-stone-500">
        <Link href="/category" className="public-link-strong hover:text-stone-950">
          카테고리 전체
        </Link>
        <span>·</span>
        <span>{totalPostsCount}개 공개 글</span>
        {query ? (
          <>
            <span>·</span>
            <span>검색 결과 {filteredPostsResult.totalCount}개</span>
          </>
        ) : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5 md:mt-6 md:gap-3">
        {definition.leaves.map((leaf) => (
          <Link
            key={leaf.slug}
            href={`/category/${definition.root}/${leaf.slug}`}
            className="public-button-secondary rounded-full border border-stone-300 px-3.5 py-2 text-sm text-stone-700 transition hover:border-stone-950 hover:text-stone-950 md:px-4"
          >
            {leaf.label}
          </Link>
        ))}
      </div>
      <form className="public-panel mt-8 rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.12)] md:p-6">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone-500">
            이 카테고리 안에서 검색
          </span>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="제목, 요약, 태그로 찾기"
              className="public-input min-w-0 flex-1 rounded-[1.5rem] border border-black/10 bg-stone-50 px-5 py-4 text-[0.95rem] text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:bg-white"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch lg:flex-nowrap">
              <select
                name="sort"
                defaultValue={sort}
                className="admin-select public-select min-h-[3.5rem] w-full rounded-[1.25rem] border border-black/10 bg-stone-50 px-5 py-4 pr-12 text-[0.95rem] text-stone-900 outline-none transition focus:border-stone-950 focus:bg-white sm:min-h-[3.75rem] sm:min-w-[9rem] sm:w-auto sm:rounded-[1.5rem]"
              >
                {publicSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="public-button-primary inline-flex min-h-[3.5rem] w-full items-center justify-center rounded-[1.25rem] bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 sm:min-h-[3.75rem] sm:min-w-[6.5rem] sm:w-auto sm:rounded-[1.5rem]"
              >
                검색
              </button>
              {query ? (
                <Link
                  href={`/category/${definition.root}`}
                  className="public-button-secondary inline-flex min-h-[3.5rem] w-full items-center justify-center rounded-[1.25rem] border border-black/10 bg-stone-50 px-6 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:bg-white hover:text-stone-950 sm:min-h-[3.75rem] sm:min-w-[6.5rem] sm:w-auto sm:rounded-[1.5rem]"
                >
                  초기화
                </Link>
              ) : null}
            </div>
          </div>
        </label>
        {query ? (
          <p className="mt-4 text-sm text-stone-500">
            <span className="text-stone-700">검색어:</span> {query}
            <span className="mx-2 text-stone-300">·</span>
            <span>{filteredPostsResult.totalCount}개 결과</span>
            <span className="mx-2 text-stone-300">·</span>
            <span>{getPublicSortLabel(sort)}</span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-stone-500">
            {getPublicSortLabel(sort)}으로 정렬 중입니다.
          </p>
        )}
      </form>
      <div className="public-panel mt-8 rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.22)] md:mt-10 md:p-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostListItem
              key={post.slug}
              post={post}
              highlightQuery={query || undefined}
            />
          ))
        ) : (
          <div className="public-empty-state rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-sm leading-7 text-stone-600">
            현재 검색어와 일치하는 글이 없습니다. 다른 키워드로 다시 찾거나{" "}
            <Link
              href={`/category/${definition.root}`}
              className="underline underline-offset-4"
            >
              전체 글 보기
            </Link>
            로 돌아갈 수 있습니다.
          </div>
        )}
      </div>
      <PublicPagination
        currentPage={filteredPostsResult.currentPage}
        totalPages={filteredPostsResult.totalPages}
        basePath={`/category/${definition.root}`}
        searchParams={categorySearchParams}
      />
    </div>
  );
}
