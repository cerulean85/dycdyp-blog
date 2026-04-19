import { AdminPagination } from "@/components/admin-pagination";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { FilterSummary } from "@/components/filter-summary";
import Link from "next/link";

import { deletePostAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin-auth";
import { buildAdminPostsFilterSummary } from "@/lib/admin-filter-summary";
import { getAdminDashboardStats, getAdminPostsPage } from "@/lib/admin-posts";
import { canDeletePost, canExportData } from "@/lib/admin-permissions";
import { categoryDefinitions } from "@/lib/content";
import { getNewsletterDashboardStats } from "@/lib/newsletter";

type AdminDashboardPageProps = {
  searchParams: Promise<{
    deleted?: string;
    q?: string;
    status?: "draft" | "review" | "approved" | "published";
    category?: "investment" | "ai" | "culture" | "humanities";
    sort?: "updated_desc" | "updated_asc" | "title_asc" | "title_desc";
    page?: string;
  }>;
};

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const session = await requireAdminSession();
  const getFilterFieldClass = (active: boolean) =>
    [
      "w-full rounded-2xl border bg-black/20 px-4 py-3 text-[0.95rem] text-white outline-none transition",
      active
        ? "border-amber-300/70 bg-amber-300/10 shadow-[0_0_0_1px_rgba(252,211,77,0.08)]"
        : "border-white/10",
      "focus:border-amber-300",
    ].join(" ");
  const {
    deleted,
    q = "",
    status = "",
    category = "",
    sort = "updated_desc",
    page = "1",
  } =
    await searchParams;
  const currentPageInput = Number(page) || 1;
  const csvSearchParams = new URLSearchParams();
  const paginationSearchParams = new URLSearchParams();

  if (q) {
    csvSearchParams.set("q", q);
    paginationSearchParams.set("q", q);
  }

  if (status) {
    csvSearchParams.set("status", status);
    paginationSearchParams.set("status", status);
  }

  if (category) {
    csvSearchParams.set("category", category);
    paginationSearchParams.set("category", category);
  }

  if (sort && sort !== "updated_desc") {
    csvSearchParams.set("sort", sort);
    paginationSearchParams.set("sort", sort);
  }

  const exportHref = `/admin/export${
    csvSearchParams.size ? `?${csvSearchParams.toString()}` : ""
  }`;
  const [postsPage, postStats, newsletterStats] = await Promise.all([
    getAdminPostsPage({
      filters: {
        query: q,
        status: status || undefined,
        categoryRoot: category || undefined,
        sort,
      },
      page: currentPageInput,
      pageSize: 12,
    }),
    getAdminDashboardStats(),
    getNewsletterDashboardStats(),
  ]);
  const posts = postsPage.items;
  const {
    items: selectedFilterItems,
    activeFilterCount,
    sortLabel,
  } = buildAdminPostsFilterSummary({ q, status, category, sort });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-400">
            Editorial Queue
          </p>
          <h2 className="mt-3 font-serif text-4xl text-white">게시물 관리</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
            상태별 게시물을 보고, 새 글을 만들고, 저장된 Markdown 본문을 수정할
            수 있는 관리자 골격입니다.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-200"
        >
          새 게시물 만들기
        </Link>
      </div>

      {deleted ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          게시물이 삭제되었습니다.
        </div>
      ) : null}

      <form className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[1.45fr_0.95fr_0.95fr_1.1fr]">
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                q ? "text-amber-200" : "text-stone-400"
              }`}
            >
              검색
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="제목 또는 slug"
              className={`${getFilterFieldClass(Boolean(q))} placeholder:text-stone-500`}
            />
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                status ? "text-amber-200" : "text-stone-400"
              }`}
            >
              상태
            </span>
            <AutoSubmitSelect
              name="status"
              defaultValue={status}
              className={`admin-select ${getFilterFieldClass(Boolean(status))}`}
            >
              <option value="">전체</option>
              <option value="draft">draft</option>
              <option value="review">review</option>
              <option value="approved">approved</option>
              <option value="published">published</option>
            </AutoSubmitSelect>
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                category ? "text-amber-200" : "text-stone-400"
              }`}
            >
              카테고리
            </span>
            <AutoSubmitSelect
              name="category"
              defaultValue={category}
              className={`admin-select ${getFilterFieldClass(Boolean(category))}`}
            >
              <option value="">전체</option>
              {categoryDefinitions.map((entry) => (
                <option key={entry.root} value={entry.root}>
                  {entry.label}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                sort !== "updated_desc" ? "text-amber-200" : "text-stone-400"
              }`}
            >
              정렬
            </span>
            <AutoSubmitSelect
              name="sort"
              defaultValue={sort}
              className={`admin-select ${getFilterFieldClass(
                sort !== "updated_desc",
              )}`}
            >
              <option value="updated_desc">최신순</option>
              <option value="updated_asc">오래된순</option>
              <option value="title_asc">제목 오름차순</option>
              <option value="title_desc">제목 내림차순</option>
            </AutoSubmitSelect>
          </label>
        </div>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <FilterSummary items={selectedFilterItems} />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="submit"
              className="rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-200"
            >
              필터 적용
            </button>
            <a
              href="/admin"
              className="rounded-full border border-white/15 px-5 py-3 text-sm text-stone-200 transition hover:border-white/35"
            >
              초기화
            </a>
            {canExportData(session.role) ? (
              <a
                href={exportHref}
                className="rounded-full border border-emerald-400/25 px-5 py-3 text-sm text-emerald-200 transition hover:border-emerald-300/40"
              >
                CSV 내보내기
              </a>
            ) : null}
          </div>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Posts
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {postStats.totalPosts}
          </p>
          <p className="mt-2 text-sm text-stone-400">
            전체 게시물 수
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Workflow
          </p>
          <p className="mt-3 text-lg font-medium text-white">
            draft {postStats.draftPosts} / review {postStats.reviewPosts}
          </p>
          <p className="mt-2 text-sm text-stone-400">
            approved {postStats.approvedPosts} / published {postStats.publishedPosts}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Subscribers
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {newsletterStats.totalSubscribers}
          </p>
          <p className="mt-2 text-sm text-stone-400">
            최근 7일 신규 {newsletterStats.subscribersLast7Days}명
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Latest Activity
          </p>
          <p className="mt-3 text-lg font-medium text-white">
            {postStats.latestUpdatedAt}
          </p>
          <p className="mt-2 text-sm text-stone-400">
            최근 글 수정 / 최신 구독 {newsletterStats.latestSignupAt}
          </p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-stone-300">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            결과 <span className="font-medium text-white">{postsPage.totalCount}</span>개
          </span>
          <span className="text-stone-600">·</span>
          <span>
            정렬 <span className="font-medium text-white">{sortLabel}</span>
          </span>
          <span className="text-stone-600">·</span>
          <span>
            필터 <span className="font-medium text-white">{activeFilterCount}</span>개 적용
          </span>
          <span className="text-stone-600">·</span>
          <span>
            현재 페이지 <span className="font-medium text-white">{posts.length}</span>개 표시
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-stone-400">
            <tr>
              <th className="px-5 py-4 font-medium">제목</th>
              <th className="px-5 py-4 font-medium">상태</th>
              <th className="px-5 py-4 font-medium">카테고리</th>
              <th className="px-5 py-4 font-medium">수정일</th>
              <th className="px-5 py-4 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-white/10 text-stone-200">
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-white">{post.title}</p>
                    <p className="mt-1 text-xs text-stone-400">{post.slug}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-200">
                    {post.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-stone-300">
                  {post.categoryRoot} / {post.categoryLeaf}
                </td>
                <td className="px-5 py-4 text-stone-300">{post.updatedAt}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-stone-100 transition hover:border-white/35"
                    >
                      수정
                    </Link>
                    {canDeletePost(session.role) ? (
                      <form action={deletePostAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-400/25 px-3 py-1.5 text-xs text-red-200 transition hover:border-red-300/40"
                        >
                          삭제
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={postsPage.currentPage}
        totalPages={postsPage.totalPages}
        basePath="/admin"
        searchParams={paginationSearchParams}
      />
    </div>
  );
}
