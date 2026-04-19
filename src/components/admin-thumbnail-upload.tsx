"use client";

import { useRef, useState } from "react";

import { AdminAssetPicker } from "@/components/admin-asset-picker";
import type { AdminMediaAssetPage } from "@/lib/media-assets";

type AdminThumbnailUploadProps = {
  initialAssetId: string;
  initialUrl: string;
  availableAssetPage: AdminMediaAssetPage;
};

export function AdminThumbnailUpload({
  initialAssetId,
  initialUrl,
  availableAssetPage,
}: AdminThumbnailUploadProps) {
  const [assetId, setAssetId] = useState(initialAssetId);
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", file.name.replace(/\.[^.]+$/, ""));

      const response = await fetch("/api/admin/uploads/image", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        assetId?: string;
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.assetId || !result.url) {
        throw new Error(result.error ?? "썸네일 업로드에 실패했습니다.");
      }

      setAssetId(result.assetId);
      setImageUrl(result.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "썸네일 업로드에 실패했습니다.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="mt-5 rounded-[1.5rem] border border-stone-300/70 bg-white p-4 dark:border-white/10 dark:bg-black/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-950 dark:text-white">썸네일 업로드</p>
          <p className="mt-1 text-xs leading-6 text-stone-500 dark:text-stone-400">
            S3에 업로드한 뒤 `media_assets`에 메타데이터를 저장합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-full border border-stone-300/70 bg-white px-4 py-2 text-xs text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 disabled:cursor-wait disabled:opacity-60 dark:border-white/15 dark:bg-transparent dark:text-stone-100 dark:hover:border-white/35 dark:hover:bg-white/5"
        >
          {isUploading ? "업로드 중..." : "썸네일 업로드"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={handleChange}
      />
      <input type="hidden" name="thumbnailAssetId" value={assetId} readOnly />
      {imageUrl ? (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="썸네일 미리보기"
            className="max-h-48 rounded-2xl border border-white/10 bg-stone-50"
          />
        </div>
      ) : null}
      {error ? (
        <p className="mt-3 text-xs text-red-600 dark:text-red-300">{error}</p>
      ) : null}
      <AdminAssetPicker
        initialAssets={availableAssetPage.items}
        initialPage={availableAssetPage.currentPage}
        initialTotalPages={availableAssetPage.totalPages}
        title="기존 자산에서 썸네일 선택"
        description="최근 업로드된 자산 중 하나를 바로 썸네일로 연결합니다."
        emptyCopy="선택할 수 있는 자산이 없습니다."
        selectLabel="이 자산을 썸네일로 사용"
        kind="uploaded"
        onSelect={(asset) => {
          setAssetId(asset.id);
          setImageUrl(asset.publicUrl);
          setError("");
        }}
      />
    </div>
  );
}
