import { AdminPagination } from "@/components/admin-pagination";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { FilterSummary } from "@/components/filter-summary";
import {
  blockNewsletterSubscriberAction,
  deleteNewsletterSubscriberAction,
  unblockNewsletterSubscriberAction,
} from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin-auth";
import { buildNewsletterFilterSummary } from "@/lib/admin-filter-summary";
import { canExportData, canManageAudience } from "@/lib/admin-permissions";
import {
  getNewsletterSources,
  getNewsletterSubscriberCount,
  getNewsletterSubscriberPage,
} from "@/lib/newsletter";

type AdminNewsletterPageProps = {
  searchParams: Promise<{
    q?: string;
    source?: string;
    status?: "active" | "blocked";
    sort?: "created_desc" | "created_asc" | "email_asc" | "email_desc";
    page?: string;
    audience?: string;
  }>;
};

export default async function AdminNewsletterPage({
  searchParams,
}: AdminNewsletterPageProps) {
  const session = await requireAdminSession();
  const getFilterFieldClass = (active: boolean) =>
    [
      "w-full rounded-2xl border bg-stone-100 px-4 py-3 text-[0.95rem] text-stone-900 outline-none transition dark:bg-black/20 dark:text-white",
      active
        ? "border-amber-300/70 bg-amber-50 shadow-[0_0_0_1px_rgba(252,211,77,0.08)] dark:bg-amber-300/10"
        : "border-stone-300/70 dark:border-white/10",
      "focus:border-amber-300",
    ].join(" ");
  const {
    q = "",
    source = "",
    status = "",
    sort = "created_desc",
    page = "1",
    audience = "",
  } = await searchParams;
  const currentPageInput = Number(page) || 1;
  const normalizedStatus =
    status === "active" || status === "blocked" ? status : undefined;
  const csvSearchParams = new URLSearchParams();
  const paginationSearchParams = new URLSearchParams();

  if (q) {
    csvSearchParams.set("q", q);
    paginationSearchParams.set("q", q);
  }

  if (source) {
    csvSearchParams.set("source", source);
    paginationSearchParams.set("source", source);
  }

  if (normalizedStatus) {
    csvSearchParams.set("status", normalizedStatus);
    paginationSearchParams.set("status", normalizedStatus);
  }

  if (sort && sort !== "created_desc") {
    csvSearchParams.set("sort", sort);
    paginationSearchParams.set("sort", sort);
  }

  const exportHref = `/admin/newsletter/export${
    csvSearchParams.size ? `?${csvSearchParams.toString()}` : ""
  }`;
  const [subscriberPage, sources, totalCount] = await Promise.all([
    getNewsletterSubscriberPage({
      filters: {
        query: q,
        source,
        status: normalizedStatus,
        sort,
      },
      page: currentPageInput,
      pageSize: 20,
    }),
    getNewsletterSources(),
    getNewsletterSubscriberCount(),
  ]);
  const subscribers = subscriberPage.items;
  const {
    items: selectedFilterItems,
    activeFilterCount,
    sortLabel,
  } = buildNewsletterFilterSummary({
    q,
    source,
    status: normalizedStatus ?? "",
    sort,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-stone-300/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-400">
          Audience
        </p>
        <h2 className="mt-3 font-serif text-4xl text-stone-950 dark:text-white">뉴스레터 구독자</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300">
          현재 수집된 뉴스레터 구독자 목록입니다. 최신 등록 순으로 확인할 수
          있고, 어떤 경로에서 유입되었는지도 함께 봅니다.
        </p>
      </div>

      <form className="space-y-4 rounded-[1.75rem] border border-stone-300/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[1.35fr_1.05fr_0.8fr_0.95fr]">
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                q ? "text-amber-700 dark:text-amber-200" : "text-stone-500 dark:text-stone-400"
              }`}
            >
              이메일 검색
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="subscriber@example.com"
              className={`${getFilterFieldClass(Boolean(q))} placeholder:text-stone-500`}
            />
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                source ? "text-amber-700 dark:text-amber-200" : "text-stone-500 dark:text-stone-400"
              }`}
            >
              유입 경로
            </span>
            <AutoSubmitSelect
              name="source"
              defaultValue={source}
              className={`admin-select ${getFilterFieldClass(Boolean(source))}`}
            >
              <option value="">전체</option>
              {sources.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                normalizedStatus ? "text-amber-700 dark:text-amber-200" : "text-stone-500 dark:text-stone-400"
              }`}
            >
              상태
            </span>
            <AutoSubmitSelect
              name="status"
              defaultValue={normalizedStatus ?? ""}
              className={`admin-select ${getFilterFieldClass(
                Boolean(normalizedStatus),
              )}`}
            >
              <option value="">전체</option>
              <option value="active">활성</option>
              <option value="blocked">차단</option>
            </AutoSubmitSelect>
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                sort !== "created_desc" ? "text-amber-700 dark:text-amber-200" : "text-stone-500 dark:text-stone-400"
              }`}
            >
              정렬
            </span>
            <AutoSubmitSelect
              name="sort"
              defaultValue={sort}
              className={`admin-select ${getFilterFieldClass(
                sort !== "created_desc",
              )}`}
            >
              <option value="created_desc">최신순</option>
              <option value="created_asc">오래된순</option>
              <option value="email_asc">이메일 오름차순</option>
              <option value="email_desc">이메일 내림차순</option>
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
              href="/admin/newsletter"
              className="rounded-full border border-stone-300/70 bg-white px-5 py-3 text-sm text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 dark:border-white/15 dark:bg-transparent dark:text-stone-200 dark:hover:border-white/35 dark:hover:bg-white/5"
            >
              초기화
            </a>
            {canExportData(session.role) ? (
              <a
                href={exportHref}
                className="rounded-full border border-emerald-400/35 bg-emerald-500/8 px-5 py-3 text-sm text-emerald-700 transition hover:border-emerald-500/45 hover:bg-emerald-500/12 dark:border-emerald-400/25 dark:bg-transparent dark:text-emerald-200 dark:hover:border-emerald-300/40 dark:hover:bg-transparent"
              >
                CSV 내보내기
              </a>
            ) : null}
          </div>
        </div>
      </form>
      {audience ? (
        <div className="rounded-2xl border border-sky-300/35 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100">
          {audience === "blocked"
            ? "구독자를 차단했습니다."
            : audience === "unblocked"
              ? "구독자 차단을 해제했습니다."
              : audience === "deleted"
                ? "구독자를 삭제했습니다."
                : "구독자 상태가 업데이트되었습니다."}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-stone-300/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Total
          </p>
          <p className="mt-3 text-3xl font-semibold text-stone-950 dark:text-white">
            {totalCount}
          </p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">현재 저장된 전체 구독자 수</p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-300/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Latest Source
          </p>
          <p className="mt-3 text-lg font-medium text-stone-950 dark:text-white">
            {subscribers[0]?.source ?? "-"}
          </p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">가장 최근 구독 유입 경로</p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-300/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Latest Signup
          </p>
          <p className="mt-3 text-lg font-medium text-stone-950 dark:text-white">
            {subscribers[0]?.createdAt ?? "-"}
          </p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">가장 최근 등록 시각</p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-stone-300/70 bg-white px-5 py-4 text-sm text-stone-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:shadow-none">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            결과 <span className="font-medium text-stone-950 dark:text-white">{subscriberPage.totalCount}</span>명
          </span>
          <span className="text-stone-400 dark:text-stone-600">·</span>
          <span>
            정렬 <span className="font-medium text-stone-950 dark:text-white">{sortLabel}</span>
          </span>
          <span className="text-stone-400 dark:text-stone-600">·</span>
          <span>
            필터 <span className="font-medium text-stone-950 dark:text-white">{activeFilterCount}</span>개 적용
          </span>
          <span className="text-stone-400 dark:text-stone-600">·</span>
          <span>
            현재 페이지 <span className="font-medium text-stone-950 dark:text-white">{subscribers.length}</span>명 표시
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-stone-300/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <table className="min-w-full text-left text-sm text-stone-700 dark:text-stone-200">
          <thead className="bg-stone-100/90 text-stone-500 dark:bg-white/5 dark:text-stone-400">
            <tr>
              <th className="px-5 py-4 font-medium">이메일</th>
              <th className="px-5 py-4 font-medium">상태</th>
              <th className="px-5 py-4 font-medium">유입 경로</th>
              <th className="px-5 py-4 font-medium">등록일</th>
              <th className="px-5 py-4 font-medium">최근 변경</th>
              <th className="px-5 py-4 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length ? (
              subscribers.map((subscriber) => (
                <tr
                  key={subscriber.id}
                  className="border-t border-stone-300/70 text-stone-700 dark:border-white/10 dark:text-stone-200"
                >
                  <td className="px-5 py-4 font-medium text-stone-950 dark:text-white">
                    {subscriber.email}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                        subscriber.status === "blocked"
                          ? "border border-red-400/35 bg-red-500/8 text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-100"
                          : "border border-emerald-400/35 bg-emerald-500/8 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100"
                      }`}
                    >
                      {subscriber.status === "blocked" ? "차단" : "활성"}
                    </span>
                    {subscriber.blockedReason ? (
                      <p className="mt-2 text-xs leading-6 text-stone-500 dark:text-stone-400">
                        {subscriber.blockedReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-stone-600 dark:text-stone-300">
                    {subscriber.source}
                  </td>
                  <td className="px-5 py-4 text-stone-600 dark:text-stone-300">
                    {subscriber.createdAt}
                  </td>
                  <td className="px-5 py-4 text-stone-600 dark:text-stone-300">
                    {subscriber.blockedAt ?? subscriber.updatedAt}
                  </td>
                  <td className="px-5 py-4">
                    {canManageAudience(session.role) ? (
                      <div className="flex flex-wrap gap-2">
                        {subscriber.status === "blocked" ? (
                          <form action={unblockNewsletterSubscriberAction}>
                            <input type="hidden" name="id" value={subscriber.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-emerald-400/35 bg-emerald-500/8 px-3 py-1.5 text-xs text-emerald-700 transition hover:border-emerald-500/45 hover:bg-emerald-500/12 dark:border-emerald-400/20 dark:bg-transparent dark:text-emerald-100 dark:hover:border-emerald-300/35"
                            >
                              차단 해제
                            </button>
                          </form>
                        ) : (
                          <form action={blockNewsletterSubscriberAction}>
                            <input type="hidden" name="id" value={subscriber.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-amber-300/60 bg-amber-100/80 px-3 py-1.5 text-xs text-amber-900 transition hover:border-amber-400 hover:bg-amber-200/80 dark:border-amber-300/20 dark:bg-transparent dark:text-amber-100 dark:hover:border-amber-200/35"
                            >
                              차단
                            </button>
                          </form>
                        )}
                        <form action={deleteNewsletterSubscriberAction}>
                          <input type="hidden" name="id" value={subscriber.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-400/35 bg-red-500/8 px-3 py-1.5 text-xs text-red-700 transition hover:border-red-500/45 hover:bg-red-500/12 dark:border-red-400/20 dark:bg-transparent dark:text-red-100 dark:hover:border-red-300/35"
                          >
                            삭제
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-500 dark:text-stone-500">권한 없음</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-stone-300/70 dark:border-white/10">
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-stone-500 dark:text-stone-400"
                >
                  아직 저장된 구독자가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={subscriberPage.currentPage}
        totalPages={subscriberPage.totalPages}
        basePath="/admin/newsletter"
        searchParams={paginationSearchParams}
      />
    </div>
  );
}
