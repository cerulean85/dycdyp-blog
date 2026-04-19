"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { CopyTextButton } from "@/components/copy-text-button";
import { CollapseToggleChip } from "@/components/collapse-toggle-chip";
import { DeleteMediaAssetButton } from "@/components/delete-media-asset-button";
import { MediaUsageList } from "@/components/media-usage-list";
import type { AdminMediaAssetListItem, AdminMediaAssetPage } from "@/lib/media-assets";

type AdminAssetPickerProps = {
  initialAssets: AdminMediaAssetListItem[];
  initialPage: number;
  initialTotalPages: number;
  initialSort?: "created_desc" | "created_asc" | "alt_asc" | "size_desc";
  title: string;
  description: string;
  emptyCopy: string;
  selectLabel: string;
  kind?: "uploaded" | "load_test";
  onSelect: (asset: AdminMediaAssetListItem) => void;
};

export function AdminAssetPicker({
  initialAssets,
  initialPage,
  initialTotalPages,
  initialSort = "created_desc",
  title,
  description,
  emptyCopy,
  selectLabel,
  kind = "uploaded",
  onSelect,
}: AdminAssetPickerProps) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [sort, setSort] = useState(initialSort);
  const [hideLoadTest, setHideLoadTest] = useState(kind !== "load_test");
  const [assets, setAssets] = useState(initialAssets);
  const [previewAsset, setPreviewAsset] = useState<AdminMediaAssetListItem | null>(
    initialAssets[0] ?? null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [altTextDraft, setAltTextDraft] = useState(initialAssets[0]?.altText ?? "");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingAltText, setIsSavingAltText] = useState(false);
  const [error, setError] = useState("");

  const mimeTypeOptions = useMemo(() => {
    return Array.from(new Set(assets.map((asset) => asset.mimeType))).sort();
  }, [assets]);
  const previewAssetIndex = previewAsset
    ? assets.findIndex((asset) => asset.id === previewAsset.id)
    : -1;
  const previousPreviewAsset =
    previewAssetIndex > 0 ? assets[previewAssetIndex - 1] : null;
  const nextPreviewAsset =
    previewAssetIndex >= 0 && previewAssetIndex < assets.length - 1
      ? assets[previewAssetIndex + 1]
      : null;

  async function fetchAssets(
    page: number,
    nextQuery: string,
    nextMimeType = mimeType,
    nextSort = sort,
    nextHideLoadTest = hideLoadTest,
  ) {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      const effectiveKind =
        kind === "load_test" ? "load_test" : nextHideLoadTest ? "uploaded" : "";

      if (effectiveKind) {
        params.set("kind", effectiveKind);
      }

      params.set("page", String(page));
      params.set("pageSize", "12");

      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      }

      if (nextMimeType.trim()) {
        params.set("mime", nextMimeType.trim());
      }

      if (nextSort !== "created_desc") {
        params.set("sort", nextSort);
      }

      const response = await fetch(`/api/admin/assets?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json()) as AdminMediaAssetPage & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "자산을 불러오지 못했습니다.");
      }

      const nextPreview =
        !result.items.length
          ? null
          : result.items.find((asset) => asset.id === previewAsset?.id) ??
            result.items[0];

      setAssets(result.items);
      setPreviewAsset(nextPreview);
      setAltTextDraft(nextPreview?.altText ?? "");
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setSubmittedQuery(nextQuery.trim());
      setSort(nextSort);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "자산을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function saveAltText() {
    if (!previewAsset) {
      return;
    }

    setIsSavingAltText(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/assets/${previewAsset.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          altText: altTextDraft,
        }),
      });

      const result = (await response.json()) as AdminMediaAssetListItem & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "alt text 저장에 실패했습니다.");
      }

      setAssets((currentAssets) =>
        currentAssets.map((asset) => (asset.id === result.id ? result : asset)),
      );
      setPreviewAsset(result);
      setAltTextDraft(result.altText);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "alt text 저장에 실패했습니다.",
      );
    } finally {
      setIsSavingAltText(false);
    }
  }

  function handleAssetDeleted(assetId: string) {
    setAssets((currentAssets) => {
      const nextAssets = currentAssets.filter((asset) => asset.id !== assetId);
      const currentIndex = currentAssets.findIndex((asset) => asset.id === assetId);
      const fallbackPreview =
        nextAssets[currentIndex] ??
        nextAssets[Math.max(0, currentIndex - 1)] ??
        null;

      setPreviewAsset(fallbackPreview);
      setAltTextDraft(fallbackPreview?.altText ?? "");

      return nextAssets;
    });
    setIsImageModalOpen(false);
  }

  const movePreview = useCallback((direction: "previous" | "next") => {
    const targetAsset =
      direction === "previous" ? previousPreviewAsset : nextPreviewAsset;

    if (!targetAsset) {
      return;
    }

    setPreviewAsset(targetAsset);
    setAltTextDraft(targetAsset.altText);
  }, [nextPreviewAsset, previousPreviewAsset]);

  useEffect(() => {
    if (!isImageModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsImageModalOpen(false);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        movePreview("previous");
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        movePreview("next");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageModalOpen, movePreview]);

  return (
    <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-xs leading-6 text-stone-400">{description}</p>
        </div>
        <div className="w-full max-w-xs">
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="alt 텍스트, key, 업로더 검색"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            />
            <button
              type="button"
              onClick={() => fetchAssets(1, query)}
              disabled={isLoading}
              className="rounded-full border border-white/15 px-4 py-3 text-xs text-stone-100 transition hover:border-white/35 disabled:cursor-wait disabled:opacity-60"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex min-w-[180px] items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
            MIME
          </span>
          <select
            value={mimeType}
            onChange={(event) => setMimeType(event.target.value)}
            className="admin-select admin-select-sm w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs text-white outline-none transition focus:border-amber-300"
          >
            <option value="">전체</option>
            {mimeTypeOptions.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[220px] items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
            정렬
          </span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof initialSort)}
            className="admin-select admin-select-sm w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs text-white outline-none transition focus:border-amber-300"
          >
            <option value="created_desc">최신순</option>
            <option value="created_asc">오래된순</option>
            <option value="alt_asc">alt 텍스트순</option>
            <option value="size_desc">용량 큰 순</option>
          </select>
        </label>
        {kind !== "load_test" ? (
          <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-stone-200">
            <input
              type="checkbox"
              checked={hideLoadTest}
              onChange={(event) => {
                const checked = event.target.checked;
                setHideLoadTest(checked);
                void fetchAssets(1, query, mimeType, sort, checked);
              }}
              className="h-4 w-4 accent-amber-300"
            />
            LOAD TEST 숨기기
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => fetchAssets(1, query, mimeType, sort)}
          disabled={isLoading}
          className="rounded-full border border-white/15 px-4 py-2 text-xs text-stone-100 transition hover:border-white/35 disabled:cursor-wait disabled:opacity-60"
        >
          필터 반영
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
        <p>
          페이지 <span className="text-white">{currentPage}</span> /{" "}
          <span className="text-white">{totalPages}</span>
          {submittedQuery ? (
            <>
              {" "}
              · 검색어 <span className="text-white">{submittedQuery}</span>
            </>
          ) : null}
          {mimeType ? (
            <>
              {" "}
              · MIME <span className="text-white">{mimeType}</span>
            </>
          ) : null}
          {sort !== "created_desc" ? (
            <>
              {" "}
              · 정렬{" "}
              <span className="text-white">
                {sort === "created_asc"
                  ? "오래된순"
                  : sort === "alt_asc"
                    ? "alt 텍스트순"
                    : "용량 큰 순"}
              </span>
            </>
          ) : null}
          {kind !== "load_test" && hideLoadTest ? (
            <>
              {" "}
              · <span className="text-white">LOAD TEST 숨김</span>
            </>
          ) : null}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchAssets(currentPage - 1, submittedQuery, mimeType, sort)}
            disabled={isLoading || currentPage <= 1}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-stone-200 transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => fetchAssets(currentPage + 1, submittedQuery, mimeType, sort)}
            disabled={isLoading || currentPage >= totalPages}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-stone-200 transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-xs text-red-300">{error}</p>
      ) : null}

      {previewAsset ? (
        <section className="mt-4 max-w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
          <button
            type="button"
            onClick={() => setIsPreviewOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            aria-expanded={isPreviewOpen}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                Asset Preview
              </p>
              <p className="mt-2 text-sm text-white">
                {previewAsset.altText || previewAsset.objectKey}
              </p>
            </div>
            <CollapseToggleChip isOpen={isPreviewOpen} />
          </button>
          <div hidden={!isPreviewOpen} className="border-t border-white/10">
          <div className="grid max-w-full gap-0">
            <div className="min-w-0 overflow-hidden bg-black/30">
              {previewAsset.publicUrl ? (
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="flex h-full w-full items-center justify-center overflow-hidden"
                >
                  <div className="flex h-[280px] w-full items-center justify-center overflow-hidden px-4 py-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewAsset.publicUrl}
                      alt={previewAsset.altText || previewAsset.objectKey}
                      className="block h-auto max-h-[232px] w-auto max-w-full object-contain"
                    />
                  </div>
                </button>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-sm text-stone-500">
                  미리보기 없음
                </div>
              )}
            </div>
            <div className="min-w-0 max-w-full space-y-4 overflow-hidden border-t border-white/10 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-300">
                  {previewAsset.mimeType}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                    previewAsset.assetKind === "load_test"
                      ? "border border-amber-300/20 bg-amber-400/10 text-amber-100"
                      : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                  }`}
                >
                  {previewAsset.assetKind === "load_test" ? "LOAD TEST" : "UPLOADED"}
                </span>
                <span className="text-xs text-stone-400">{previewAsset.fileSize}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Alt Text
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={altTextDraft}
                    onChange={(event) => setAltTextDraft(event.target.value)}
                    placeholder="이미지 설명을 입력하세요"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  />
                  <button
                    type="button"
                    onClick={() => void saveAltText()}
                    disabled={isSavingAltText}
                    className="shrink-0 rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium text-stone-100 transition hover:border-white/35 hover:bg-white/5 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSavingAltText ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Object Key
                </p>
                <p className="mt-2 break-all text-xs leading-6 text-stone-400">
                  {previewAsset.objectKey}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Uploaded By
                </p>
                <p className="mt-2 text-sm text-stone-300">
                  {previewAsset.uploaderDisplay || previewAsset.uploaderEmail}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white">
                    Usage
                  </span>
                  <span className="text-xs text-stone-300">
                    썸네일 {previewAsset.thumbnailUsageCount}건
                  </span>
                  <span className="text-xs text-stone-300">
                    본문 {previewAsset.bodyUsageCount}건
                  </span>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                      썸네일 사용 글
                    </p>
                    <MediaUsageList
                      posts={previewAsset.thumbnailPosts}
                      totalCount={previewAsset.thumbnailUsageCount}
                      emptyCopy="썸네일로 연결된 글이 없습니다."
                      baseKey="thumb"
                      compact
                    />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                      본문 사용 글
                    </p>
                    <MediaUsageList
                      posts={previewAsset.bodyPosts}
                      totalCount={previewAsset.bodyUsageCount}
                      emptyCopy="본문에서 사용 중인 글이 없습니다."
                      baseKey="body"
                      compact
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton
                  value={previewAsset.publicUrl}
                  idleLabel="URL 복사"
                  copiedLabel="URL 복사됨"
                />
                <CopyTextButton
                  value={previewAsset.markdownSnippet}
                  idleLabel="Markdown 복사"
                  copiedLabel="Markdown 복사됨"
                />
                <button
                  type="button"
                  onClick={() => onSelect(previewAsset)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-medium text-stone-950 transition hover:bg-stone-200"
                >
                  {selectLabel}
                </button>
                <DeleteMediaAssetButton
                  assetId={previewAsset.id}
                  assetLabel={previewAsset.altText || previewAsset.objectKey}
                  showMessage={false}
                  disabledReason={
                    previewAsset.thumbnailUsageCount > 0 ||
                    previewAsset.bodyUsageCount > 0
                      ? `사용처가 있어서 삭제할 수 없습니다. 썸네일 ${previewAsset.thumbnailUsageCount}건, 본문 ${previewAsset.bodyUsageCount}건`
                      : undefined
                  }
                  onDeleted={handleAssetDeleted}
                />
                </div>
                {previewAsset.thumbnailUsageCount > 0 ||
                previewAsset.bodyUsageCount > 0 ? (
                  <p className="text-xs leading-5 text-stone-500">
                    사용처가 있어서 삭제할 수 없습니다. 썸네일 {previewAsset.thumbnailUsageCount}
                    건, 본문 {previewAsset.bodyUsageCount}건
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          </div>
        </section>
      ) : null}

      {previewAsset?.publicUrl && isImageModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-6"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-stone-950 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]">
            <div
              className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Image Preview
                </p>
                <p className="mt-1 text-sm text-white">
                  {previewAsset.altText || previewAsset.objectKey}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => movePreview("previous")}
                  disabled={!previousPreviewAsset}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-stone-100 transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  이전 이미지
                </button>
                <button
                  type="button"
                  onClick={() => movePreview("next")}
                  disabled={!nextPreviewAsset}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-stone-100 transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  다음 이미지
                </button>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-stone-100 transition hover:border-white/35"
                >
                  닫기
                </button>
              </div>
            </div>
            <div
              className="flex max-h-[80vh] items-center justify-center bg-black/40 p-6"
              onClick={(event) => event.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewAsset.publicUrl}
                alt={previewAsset.altText || previewAsset.objectKey}
                className="max-h-[72vh] w-auto max-w-full object-contain"
              />
            </div>
            <div
              className="border-t border-white/10 px-5 py-3 text-xs text-stone-400"
              onClick={(event) => event.stopPropagation()}
            >
              방향키 좌우로 이전/다음 이미지를 볼 수 있고, `Esc`로 모달을 닫을 수 있습니다.
            </div>
          </div>
        </div>
      ) : null}

      {assets.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <article
              key={asset.id}
              className={`overflow-hidden rounded-2xl border bg-white/5 transition ${
                previewAsset?.id === asset.id
                  ? "border-amber-300/35 ring-1 ring-amber-300/20"
                  : "border-white/10"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setPreviewAsset(asset);
                  setAltTextDraft(asset.altText);
                }}
                className="block aspect-[4/3] w-full bg-black/30 text-left"
              >
                {asset.publicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.publicUrl}
                    alt={asset.altText || asset.objectKey}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-stone-500">
                    미리보기 없음
                  </div>
                )}
              </button>
              <div className="grid min-h-[214px] grid-rows-[auto_minmax(88px,1fr)_auto] gap-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-300">
                    {asset.mimeType}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                      asset.assetKind === "load_test"
                        ? "border border-amber-300/20 bg-amber-400/10 text-amber-100"
                        : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                    }`}
                  >
                    {asset.assetKind === "load_test" ? "LOAD TEST" : "UPLOADED"}
                  </span>
                </div>
                <div>
                  <p className="line-clamp-2 text-sm font-medium text-white">
                    {asset.altText || "alt 텍스트 없음"}
                  </p>
                  <p className="mt-2 line-clamp-2 break-all text-xs leading-6 text-stone-400">
                    {asset.objectKey}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(asset)}
                  className="w-full self-end rounded-full border border-white/15 px-4 py-2 text-xs text-stone-100 transition hover:border-white/35"
                >
                  {selectLabel}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-400">
          {isLoading ? "자산을 불러오는 중입니다." : emptyCopy}
        </div>
      )}
    </div>
  );
}
