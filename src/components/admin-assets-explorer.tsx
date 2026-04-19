"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CopyTextButton } from "@/components/copy-text-button";
import { CollapseToggleChip } from "@/components/collapse-toggle-chip";
import { DeleteMediaAssetButton } from "@/components/delete-media-asset-button";
import { MediaUsageList } from "@/components/media-usage-list";
import type { AdminMediaAssetListItem } from "@/lib/media-assets";

type AdminAssetsExplorerProps = {
  items: AdminMediaAssetListItem[];
};

export function AdminAssetsExplorer({ items }: AdminAssetsExplorerProps) {
  const router = useRouter();
  const [deletedAssetIds, setDeletedAssetIds] = useState<string[]>([]);
  const [previewAssetId, setPreviewAssetId] = useState(items[0]?.id ?? null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [usageFilter, setUsageFilter] = useState<"all" | "used" | "unused" | "thumbnail" | "body">("all");
  const [kindFilter, setKindFilter] = useState<"all" | "uploaded" | "load_test">("all");
  const [mimeFilter, setMimeFilter] = useState<string>("all");
  const [updatedAssets, setUpdatedAssets] = useState<Record<string, AdminMediaAssetListItem>>(
    {},
  );
  const [altTextDraft, setAltTextDraft] = useState(items[0]?.altText ?? "");
  const [isSavingAltText, setIsSavingAltText] = useState(false);
  const [error, setError] = useState("");
  const assets = useMemo(
    () =>
      items
        .map((asset) => updatedAssets[asset.id] ?? asset)
        .filter((asset) => !deletedAssetIds.includes(asset.id)),
    [deletedAssetIds, items, updatedAssets],
  );
  const mimeFilterOptions = useMemo(
    () =>
      Array.from(new Set(assets.map((asset) => asset.mimeType)))
        .sort()
        .slice(0, 6),
    [assets],
  );
  const filteredAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const matchesKind = kindFilter === "all" || asset.assetKind === kindFilter;
        const matchesMime = mimeFilter === "all" || asset.mimeType === mimeFilter;
        const matchesUsage =
          usageFilter === "all"
            ? true
            : usageFilter === "used"
              ? asset.thumbnailUsageCount + asset.bodyUsageCount > 0
              : usageFilter === "unused"
                ? asset.thumbnailUsageCount + asset.bodyUsageCount === 0
                : usageFilter === "thumbnail"
                  ? asset.thumbnailUsageCount > 0
                  : asset.bodyUsageCount > 0;

        return matchesKind && matchesMime && matchesUsage;
      }),
    [assets, kindFilter, mimeFilter, usageFilter],
  );
  const previewAsset =
    filteredAssets.find((asset) => asset.id === previewAssetId) ??
    filteredAssets[0] ??
    null;

  const previewAssetIndex = previewAsset
    ? filteredAssets.findIndex((asset) => asset.id === previewAsset.id)
    : -1;
  const previousPreviewAsset =
    previewAssetIndex > 0 ? filteredAssets[previewAssetIndex - 1] : null;
  const nextPreviewAsset =
    previewAssetIndex >= 0 && previewAssetIndex < filteredAssets.length - 1
      ? filteredAssets[previewAssetIndex + 1]
      : null;

  const movePreview = useCallback(
    (direction: "previous" | "next") => {
      const target =
        direction === "previous" ? previousPreviewAsset : nextPreviewAsset;

      if (!target) {
        return;
      }

      setPreviewAssetId(target.id);
      setAltTextDraft(target.altText);
    },
    [nextPreviewAsset, previousPreviewAsset],
  );

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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImageModalOpen, movePreview]);

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

      setUpdatedAssets((current) => ({
        ...current,
        [result.id]: result,
      }));
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

  function handleDeleted(assetId: string) {
    const currentIndex = filteredAssets.findIndex((asset) => asset.id === assetId);
    const nextAssets = filteredAssets.filter((asset) => asset.id !== assetId);
    const fallbackPreview =
      nextAssets[currentIndex] ?? nextAssets[Math.max(0, currentIndex - 1)] ?? null;

    setDeletedAssetIds((current) => [...current, assetId]);
    setPreviewAssetId(fallbackPreview?.id ?? null);
    setAltTextDraft(fallbackPreview?.altText ?? "");
    setIsImageModalOpen(false);
    router.refresh();
  }

  function resetExplorerFilters() {
    setKindFilter("all");
    setUsageFilter("all");
    setMimeFilter("all");
  }

  if (!assets.length) {
    return null;
  }

  return (
    <>
      <div className="rounded-[1.75rem] border border-stone-300/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">종류</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: `전체 ${assets.length}` },
                {
                  key: "uploaded",
                  label: `업로드 ${assets.filter((asset) => asset.assetKind === "uploaded").length}`,
                },
                {
                  key: "load_test",
                  label: `LOAD TEST ${assets.filter((asset) => asset.assetKind === "load_test").length}`,
                },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    setKindFilter(option.key as "all" | "uploaded" | "load_test")
                  }
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    kindFilter === option.key
                      ? "border-amber-300/60 bg-amber-100/80 text-amber-900 dark:border-amber-300/40 dark:bg-amber-400/10 dark:text-amber-100"
                      : "border-stone-300/70 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-100 dark:border-white/10 dark:bg-black/20 dark:text-stone-300 dark:hover:border-white/20"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">사용처</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: `전체 ${assets.length}` },
                {
                  key: "used",
                  label: `사용 중 ${assets.filter((asset) => asset.thumbnailUsageCount + asset.bodyUsageCount > 0).length}`,
                },
                {
                  key: "unused",
                  label: `미사용 ${assets.filter((asset) => asset.thumbnailUsageCount + asset.bodyUsageCount === 0).length}`,
                },
                {
                  key: "thumbnail",
                  label: `썸네일 ${assets.filter((asset) => asset.thumbnailUsageCount > 0).length}`,
                },
                {
                  key: "body",
                  label: `본문 ${assets.filter((asset) => asset.bodyUsageCount > 0).length}`,
                },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    setUsageFilter(
                      option.key as "all" | "used" | "unused" | "thumbnail" | "body",
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    usageFilter === option.key
                      ? "border-emerald-400/35 bg-emerald-500/8 text-emerald-700 dark:border-emerald-300/40 dark:bg-emerald-500/10 dark:text-emerald-100"
                      : "border-stone-300/70 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-100 dark:border-white/10 dark:bg-black/20 dark:text-stone-300 dark:hover:border-white/20"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">MIME</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMimeFilter("all")}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  mimeFilter === "all"
                    ? "border-sky-300/35 bg-sky-50 text-sky-700 dark:border-sky-300/40 dark:bg-sky-500/10 dark:text-sky-100"
                    : "border-stone-300/70 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-100 dark:border-white/10 dark:bg-black/20 dark:text-stone-300 dark:hover:border-white/20"
                }`}
              >
                전체
              </button>
              {mimeFilterOptions.map((mime) => (
                <button
                  key={mime}
                  type="button"
                  onClick={() => setMimeFilter(mime)}
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    mimeFilter === mime
                      ? "border-sky-300/35 bg-sky-50 text-sky-700 dark:border-sky-300/40 dark:bg-sky-500/10 dark:text-sky-100"
                      : "border-stone-300/70 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-100 dark:border-white/10 dark:bg-black/20 dark:text-stone-300 dark:hover:border-white/20"
                  }`}
                >
                  {mime}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
          현재 페이지 자산 <span className="text-stone-950 dark:text-white">{filteredAssets.length}</span>개를
          빠르게 탐색 중입니다.
        </p>
      </div>

      {previewAsset ? (
        <section className="max-w-full overflow-hidden rounded-[1.75rem] border border-stone-300/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
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
              <p className="mt-2 text-sm text-stone-950 dark:text-white">
                {previewAsset.altText || previewAsset.objectKey}
              </p>
            </div>
            <CollapseToggleChip isOpen={isPreviewOpen} />
          </button>
          <div hidden={!isPreviewOpen} className="border-t border-stone-300/70 dark:border-white/10">
          <div className="grid max-w-full gap-0">
            <div className="min-w-0 overflow-hidden bg-stone-100 dark:bg-black/30">
              {previewAsset.publicUrl ? (
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="flex h-full w-full items-center justify-center overflow-hidden"
                >
                  <div className="flex h-[320px] w-full items-center justify-center overflow-hidden px-4 py-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewAsset.publicUrl}
                      alt={previewAsset.altText || previewAsset.objectKey}
                      className="block h-auto max-h-[272px] w-auto max-w-full object-contain"
                    />
                  </div>
                </button>
              ) : (
                <div className="flex h-[320px] items-center justify-center text-sm text-stone-500">
                  미리보기 없음
                </div>
              )}
            </div>
            <div className="min-w-0 max-w-full space-y-5 overflow-hidden border-t border-stone-300/70 p-5 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-stone-300/70 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
                  {previewAsset.mimeType}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                    previewAsset.assetKind === "load_test"
                      ? "border border-amber-300/60 bg-amber-100/80 text-amber-900 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-100"
                      : "border border-emerald-400/35 bg-emerald-500/8 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100"
                  }`}
                >
                  {previewAsset.assetKind === "load_test" ? "LOAD TEST" : "UPLOADED"}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">{previewAsset.fileSize}</span>
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
                    className="w-full rounded-2xl border border-stone-300/70 bg-stone-100 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => void saveAltText()}
                    disabled={isSavingAltText}
                    className="shrink-0 rounded-2xl border border-stone-300/70 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 disabled:cursor-wait disabled:opacity-60 dark:border-white/15 dark:bg-transparent dark:text-stone-100 dark:hover:border-white/35 dark:hover:bg-white/5"
                  >
                    {isSavingAltText ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Object Key
                </p>
                <p className="mt-2 break-all text-xs leading-6 text-stone-500 dark:text-stone-400">
                  {previewAsset.objectKey}
                </p>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    업로더
                  </dt>
                  <dd className="mt-2 text-sm text-stone-700 dark:text-stone-300">
                    {previewAsset.uploaderDisplay || previewAsset.uploaderEmail}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    업로드 시각
                  </dt>
                  <dd className="mt-2 text-sm text-stone-700 dark:text-stone-300">
                    {previewAsset.createdAt}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    썸네일 사용
                  </dt>
                  <dd className="mt-2 text-sm text-stone-700 dark:text-stone-300">
                    {previewAsset.thumbnailUsageCount}건
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    본문 사용
                  </dt>
                  <dd className="mt-2 text-sm text-stone-700 dark:text-stone-300">
                    {previewAsset.bodyUsageCount}건
                  </dd>
                </div>
              </dl>

              <div className="space-y-4">
                <div className="rounded-2xl border border-stone-300/70 bg-white p-4 dark:border-white/10 dark:bg-black/20">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                    썸네일 사용 글
                  </p>
                  <MediaUsageList
                    posts={previewAsset.thumbnailPosts}
                    totalCount={previewAsset.thumbnailUsageCount}
                    emptyCopy="썸네일로 연결된 글이 없습니다."
                    baseKey="preview-thumb"
                  />
                </div>
                <div className="rounded-2xl border border-stone-300/70 bg-white p-4 dark:border-white/10 dark:bg-black/20">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                    본문 사용 글
                  </p>
                  <MediaUsageList
                    posts={previewAsset.bodyPosts}
                    totalCount={previewAsset.bodyUsageCount}
                    emptyCopy="본문에서 사용 중인 글이 없습니다."
                    baseKey="preview-body"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-stone-300/70 bg-white p-4 dark:border-white/10 dark:bg-black/20">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  Markdown Snippet
                </p>
                <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-xs leading-6 text-stone-700 dark:text-stone-300">
                  {previewAsset.markdownSnippet ||
                    "공개 URL이 없어 Markdown 문법을 만들 수 없습니다."}
                </pre>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton
                  value={previewAsset.objectKey}
                  idleLabel="Key 복사"
                  copiedLabel="Key 복사됨"
                />
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
                {previewAsset.publicUrl ? (
                  <a
                    href={previewAsset.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-stone-300/70 bg-white px-3 py-1.5 text-xs text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 dark:border-white/15 dark:bg-transparent dark:text-stone-200 dark:hover:border-white/35 dark:hover:bg-white/5"
                  >
                    원본 보기
                  </a>
                ) : null}
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
                  onDeleted={handleDeleted}
                />
                </div>
                {previewAsset.thumbnailUsageCount > 0 ||
                previewAsset.bodyUsageCount > 0 ? (
                  <p className="text-xs leading-5 text-stone-500 dark:text-stone-500">
                    사용처가 있어서 삭제할 수 없습니다. 썸네일 {previewAsset.thumbnailUsageCount}
                    건, 본문 {previewAsset.bodyUsageCount}건
                  </p>
                ) : null}
              </div>
              {error ? <p className="text-xs text-red-600 dark:text-red-300">{error}</p> : null}
            </div>
          </div>
          </div>
        </section>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-stone-300/70 bg-white px-5 py-10 text-center shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <p className="text-sm font-medium text-stone-950 dark:text-white">
            탐색기 필터와 일치하는 자산이 없습니다.
          </p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            종류, 사용처, MIME 필터를 해제하면 현재 페이지 자산을 다시 볼 수 있습니다.
          </p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={resetExplorerFilters}
              className="rounded-full border border-stone-300/70 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 dark:border-white/15 dark:bg-transparent dark:text-stone-200 dark:hover:border-white/35 dark:hover:bg-white/5"
            >
              탐색기 필터 해제
            </button>
          </div>
        </div>
      )}

      {filteredAssets.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredAssets.map((asset) => {
          const isActive = previewAsset?.id === asset.id;

          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => {
                setPreviewAssetId(asset.id);
                setAltTextDraft(asset.altText);
              }}
              className={`overflow-hidden rounded-[1.75rem] border text-left transition ${
                isActive
                  ? "border-amber-300/60 bg-white ring-1 ring-amber-300/20 dark:border-amber-300/40 dark:bg-amber-400/10"
                  : "border-stone-300/70 bg-white hover:border-stone-400 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
              }`}
            >
              <div className="aspect-[4/3] bg-stone-100 dark:bg-black/30">
                {asset.publicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.publicUrl}
                    alt={asset.altText || asset.objectKey}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-stone-500">
                    미리보기 없음
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-stone-300/70 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
                    {asset.mimeType}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                      asset.assetKind === "load_test"
                        ? "border border-amber-300/60 bg-amber-100/80 text-amber-900 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-100"
                        : "border border-emerald-400/35 bg-emerald-500/8 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100"
                    }`}
                  >
                    {asset.assetKind === "load_test" ? "LOAD TEST" : "UPLOADED"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-stone-950 dark:text-white">
                    {asset.altText || "alt 텍스트 없음"}
                  </p>
                  <p className="mt-2 line-clamp-2 break-all text-xs leading-6 text-stone-500 dark:text-stone-400">
                    {asset.objectKey}
                  </p>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  썸네일 {asset.thumbnailUsageCount}건 · 본문 {asset.bodyUsageCount}건
                </p>
              </div>
            </button>
          );
          })}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-stone-300/70 bg-white px-5 py-12 text-center text-sm text-stone-500 shadow-sm dark:border-white/10 dark:bg-black/20 dark:text-stone-400 dark:shadow-none">
          현재 빠른 필터 조건에 맞는 자산이 없습니다.
        </div>
      )}

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
                  Asset Preview
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
              className="max-h-[80vh] overflow-auto bg-black/30 p-6"
              onClick={(event) => event.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewAsset.publicUrl}
                alt={previewAsset.altText || previewAsset.objectKey}
                className="mx-auto max-h-[72vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
