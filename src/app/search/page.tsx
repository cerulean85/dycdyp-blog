import type { Metadata } from "next";
import Link from "next/link";

import { PostListItem } from "@/components/post-list-item";
import { PublicBreadcrumbs } from "@/components/public-breadcrumbs";
import { PublicPagination } from "@/components/public-pagination";
import { SectionTitle } from "@/components/section-title";
import { getPublicSortLabel } from "@/lib/public-search-helpers";
import {
  type PublicPostSort,
  searchPublishedPostsPage,
} from "@/lib/posts";

export const metadata: Metadata = {
  title: "검색",
  description: "공개된 글 전체에서 키워드로 글을 검색합니다.",
  alternates: {
    canonical: "/search",
  },
};

type SearchPageProps = {
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = (resolvedSearchParams.q ?? "").trim();
  const requestedSort = resolvedSearchParams.sort;
  const sort: PublicPostSort =
    requestedSort === "published_asc" ? "published_asc" : "published_desc";
  const requestedPage = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const page = Number.isNaN(requestedPage) ? 1 : Math.max(1, requestedPage);
  const result = await searchPublishedPostsPage({
    query,
    page,
    pageSize: 10,
    sort,
  });
  const paginationSearchParams = new URLSearchParams();

  if (query) {
    paginationSearchParams.set("q", query);
  }
  if (sort !== "published_desc") {
    paginationSearchParams.set("sort", sort);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-6 md:py-16">
      <PublicBreadcrumbs
        items={[
          { label: "홈", href: "/" },
          { label: "검색" },
        ]}
        className="mb-6"
      />
      <SectionTitle
        eyebrow="Search"
        title="전체 글 검색"
        description="제목, 요약, 태그, 카테고리 기준으로 공개된 글을 한 번에 찾을 수 있습니다."
      />

      <form className="mt-8 rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.12)] md:mt-10 md:p-6">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone-500">
            검색어 입력
          </span>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="제목, 요약, 태그, 카테고리로 찾기"
              className="min-w-0 flex-1 rounded-[1.5rem] border border-black/10 bg-stone-50 px-5 py-4 text-[0.95rem] text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:bg-white"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch lg:flex-nowrap">
              <select
                name="sort"
                defaultValue={sort}
                className="admin-select min-h-[3.5rem] w-full rounded-[1.25rem] border border-black/10 bg-stone-50 px-5 py-4 pr-12 text-[0.95rem] text-stone-900 outline-none transition focus:border-stone-950 focus:bg-white sm:min-h-[3.75rem] sm:min-w-[9rem] sm:w-auto sm:rounded-[1.5rem]"
              >
                {publicSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex min-h-[3.5rem] w-full items-center justify-center rounded-[1.25rem] bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 sm:min-h-[3.75rem] sm:min-w-[6.5rem] sm:w-auto sm:rounded-[1.5rem]"
              >
                검색
              </button>
              {query ? (
                <Link
                  href="/search"
                  className="inline-flex min-h-[3.5rem] w-full items-center justify-center rounded-[1.25rem] border border-black/10 bg-stone-50 px-6 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:bg-white hover:text-stone-950 sm:min-h-[3.75rem] sm:min-w-[6.5rem] sm:w-auto sm:rounded-[1.5rem]"
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
            <span>{result.totalCount}개 결과</span>
            <span className="mx-2 text-stone-300">·</span>
            <span>{getPublicSortLabel(sort)}</span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-stone-500">
            검색어를 입력하면 전체 공개 글에서 바로 찾을 수 있습니다.
          </p>
        )}
      </form>

      <div className="mt-8 rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.22)] md:mt-10 md:p-6">
        {query ? (
          result.posts.length > 0 ? (
            result.posts.map((post) => (
              <PostListItem key={post.id} post={post} highlightQuery={query} />
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-sm leading-7 text-stone-600">
              현재 검색어와 일치하는 글이 없습니다. 다른 키워드로 다시 찾거나{" "}
              <Link href="/search" className="underline underline-offset-4">
                검색 초기화
              </Link>
              로 돌아갈 수 있습니다.
            </div>
          )
        ) : (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-sm leading-7 text-stone-600">
            검색어를 입력하면 공개된 글 전체에서 관련 글을 목록으로 보여드립니다.
          </div>
        )}
      </div>

      {query ? (
        <PublicPagination
          currentPage={result.currentPage}
          totalPages={result.totalPages}
          basePath="/search"
          searchParams={paginationSearchParams}
        />
      ) : null}
    </div>
  );
}
