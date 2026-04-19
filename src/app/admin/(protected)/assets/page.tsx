import { AdminAssetsExplorer } from "@/components/admin-assets-explorer";
import { AdminPagination } from "@/components/admin-pagination";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { CleanupUnusedAssetsButton } from "@/components/cleanup-unused-assets-button";
import { FilterSummary } from "@/components/filter-summary";
import {
  getAdminMediaAssetDashboardStats,
  getAdminMediaAssetKindStats,
  getAdminMediaAssetMimeTypes,
  getAdminMediaAssetPage,
} from "@/lib/media-assets";
import { requireAdminSession } from "@/lib/admin-auth";
import { buildAssetsFilterSummary } from "@/lib/admin-filter-summary";

type AdminAssetsPageProps = {
  searchParams: Promise<{
    q?: string;
    mime?: string;
    kind?: "uploaded" | "load_test";
    usage?: "used" | "unused" | "thumbnail" | "body";
    sort?: "created_desc" | "created_asc" | "alt_asc" | "size_desc";
    page?: string;
  }>;
};

export default async function AdminAssetsPage({
  searchParams,
}: AdminAssetsPageProps) {
  await requireAdminSession();
  const getFilterFieldClass = (active: boolean) =>
    [
      "w-full rounded-2xl border bg-black/20 px-4 py-3 text-[0.95rem] text-white outline-none transition",
      active
        ? "border-amber-300/70 bg-amber-300/10 shadow-[0_0_0_1px_rgba(252,211,77,0.08)]"
        : "border-white/10",
      "focus:border-amber-300",
    ].join(" ");

  const {
    q = "",
    mime = "",
    kind = "",
    usage = "",
    sort = "created_desc",
    page = "1",
  } =
    await searchParams;
  const currentPageInput = Number(page) || 1;
  const paginationSearchParams = new URLSearchParams();
  const normalizedKind =
    kind === "uploaded" || kind === "load_test" ? kind : undefined;
  const normalizedUsage =
    usage === "used" ||
    usage === "unused" ||
    usage === "thumbnail" ||
    usage === "body"
      ? usage
      : undefined;
  const normalizedSort =
    sort === "created_asc" || sort === "alt_asc" || sort === "size_desc"
      ? sort
      : "created_desc";

  if (q) {
    paginationSearchParams.set("q", q);
  }

  if (mime) {
    paginationSearchParams.set("mime", mime);
  }

  if (normalizedKind) {
    paginationSearchParams.set("kind", normalizedKind);
  }

  if (normalizedUsage) {
    paginationSearchParams.set("usage", normalizedUsage);
  }

  if (normalizedSort !== "created_desc") {
    paginationSearchParams.set("sort", normalizedSort);
  }
  const [assetPage, stats, mimeTypes, kindStats] = await Promise.all([
    getAdminMediaAssetPage({
      filters: {
        query: q,
        mimeType: mime,
        kind: normalizedKind,
        usage: normalizedUsage,
      },
      page: currentPageInput,
      pageSize: 24,
      sort: normalizedSort,
    }),
    getAdminMediaAssetDashboardStats(),
    getAdminMediaAssetMimeTypes(),
    getAdminMediaAssetKindStats(),
  ]);
  const {
    items: selectedFilterItems,
    activeFilterCount,
    sortLabel,
  } = buildAssetsFilterSummary({
    q,
    mime,
    kind: normalizedKind ?? "",
    usage: normalizedUsage ?? "",
    sort: normalizedSort,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-400">
          Assets
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">이미지 자산</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
          S3에 업로드된 이미지 자산을 한 곳에서 보고, URL이나 Markdown 문법을
          바로 복사해 재사용합니다.
        </p>
      </div>

      <form className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[1.2fr_0.85fr_0.85fr_0.85fr_1fr]">
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                q ? "text-amber-200" : "text-stone-400"
              }`}
            >
              자산 검색
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="alt 텍스트, key, 업로더"
              title="alt 텍스트, object key, 업로더 이메일"
              className={`${getFilterFieldClass(Boolean(q))} placeholder:text-stone-500`}
            />
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                mime ? "text-amber-200" : "text-stone-400"
              }`}
            >
              MIME 타입
            </span>
            <AutoSubmitSelect
              name="mime"
              defaultValue={mime}
              className={`admin-select ${getFilterFieldClass(Boolean(mime))}`}
            >
              <option value="">전체</option>
              {mimeTypes.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                normalizedKind ? "text-amber-200" : "text-stone-400"
              }`}
            >
              자산 종류
            </span>
            <AutoSubmitSelect
              name="kind"
              defaultValue={normalizedKind ?? ""}
              className={`admin-select ${getFilterFieldClass(
                Boolean(normalizedKind),
              )}`}
            >
              <option value="">전체</option>
              <option value="uploaded">업로드</option>
              <option value="load_test">테스트</option>
            </AutoSubmitSelect>
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                normalizedUsage ? "text-amber-200" : "text-stone-400"
              }`}
            >
              사용처
            </span>
            <AutoSubmitSelect
              name="usage"
              defaultValue={normalizedUsage ?? ""}
              className={`admin-select ${getFilterFieldClass(
                Boolean(normalizedUsage),
              )}`}
            >
              <option value="">전체</option>
              <option value="unused">미사용</option>
              <option value="used">사용 중</option>
              <option value="thumbnail">썸네일</option>
              <option value="body">본문</option>
            </AutoSubmitSelect>
          </label>
          <label className="block min-w-0">
            <span
              className={`mb-2 block text-[11px] uppercase tracking-[0.18em] ${
                normalizedSort !== "created_desc"
                  ? "text-amber-200"
                  : "text-stone-400"
              }`}
            >
              정렬
            </span>
            <AutoSubmitSelect
              name="sort"
              defaultValue={normalizedSort}
              className={`admin-select ${getFilterFieldClass(
                normalizedSort !== "created_desc",
              )}`}
            >
              <option value="created_desc">최신순</option>
              <option value="created_asc">오래된순</option>
              <option value="alt_asc">alt순</option>
              <option value="size_desc">용량순</option>
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
              href="/admin/assets"
              className="rounded-full border border-white/15 px-5 py-3 text-sm text-stone-200 transition hover:border-white/35"
            >
              초기화
            </a>
          </div>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Total Assets
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {stats.totalAssets}
          </p>
          <p className="mt-2 text-sm text-stone-400">저장된 전체 이미지 자산 수</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Storage
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {stats.totalStorage}
          </p>
          <p className="mt-2 text-sm text-stone-400">누적 파일 용량</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Latest Upload
          </p>
          <p className="mt-3 text-lg font-medium text-white">
            {stats.latestUploadedAt}
          </p>
          <p className="mt-2 text-sm text-stone-400">가장 최근 업로드 시각</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Alt Text
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {stats.assetsWithAltText}
          </p>
          <p className="mt-2 text-sm text-stone-400">alt 텍스트가 채워진 자산 수</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="/admin/assets?kind=uploaded"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:border-white/35"
        >
          실제 업로드 {kindStats.uploadedAssets}
        </a>
        <a
          href="/admin/assets?kind=load_test"
          className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100 transition hover:border-amber-200/35"
        >
          LOAD TEST {kindStats.loadTestAssets}
        </a>
        <a
          href="/admin/assets?usage=unused"
          className="rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-100 transition hover:border-sky-200/35"
        >
          미사용 자산만 보기
        </a>
        {normalizedUsage === "unused" && assetPage.totalCount > 0 ? (
          <CleanupUnusedAssetsButton
            count={assetPage.totalCount}
            q={q}
            mime={mime}
            kind={normalizedKind}
          />
        ) : null}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-stone-300">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            결과 <span className="font-medium text-white">{assetPage.totalCount}</span>개
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
            현재 페이지 <span className="font-medium text-white">{assetPage.items.length}</span>개 표시
          </span>
        </div>
      </div>

      {assetPage.items.length ? (
        <AdminAssetsExplorer items={assetPage.items} />
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 px-5 py-12 text-center">
          <p className="text-sm font-medium text-white">
            {activeFilterCount
              ? "현재 필터와 일치하는 자산이 없습니다."
              : "아직 저장된 이미지 자산이 없습니다."}
          </p>
          <p className="mt-2 text-sm text-stone-400">
            {activeFilterCount
              ? "필터를 일부 해제하거나 초기화해서 다른 자산을 확인해보세요."
              : "관리자 편집 화면에서 이미지를 업로드하면 이곳에서 자산을 관리할 수 있습니다."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {activeFilterCount ? (
              <a
                href="/admin/assets"
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-stone-200 transition hover:border-white/35"
              >
                필터 초기화
              </a>
            ) : null}
            <a
              href="/admin/posts/new"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-950 transition hover:bg-stone-200"
            >
              새 글에서 이미지 업로드
            </a>
          </div>
        </div>
      )}

      <AdminPagination
        currentPage={assetPage.currentPage}
        totalPages={assetPage.totalPages}
        basePath="/admin/assets"
        searchParams={paginationSearchParams}
      />
    </div>
  );
}
