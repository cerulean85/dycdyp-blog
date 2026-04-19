"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteMediaAssetButtonProps = {
  assetId: string;
  assetLabel: string;
  disabledReason?: string;
  onDeleted?: (assetId: string) => void;
  showMessage?: boolean;
};

export function DeleteMediaAssetButton({
  assetId,
  assetLabel,
  disabledReason,
  onDeleted,
  showMessage = true,
}: DeleteMediaAssetButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (disabledReason || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `정말 "${assetLabel || "이 자산"}"을(를) 삭제할까요?\n미사용 자산만 삭제할 수 있으며, 삭제 후에는 되돌릴 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/assets/${assetId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as {
        id?: string;
        error?: string;
      };

      if (!response.ok || !result.id) {
        throw new Error(result.error ?? "자산 삭제에 실패했습니다.");
      }

      if (onDeleted) {
        onDeleted(result.id);
      } else {
        router.refresh();
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "자산 삭제에 실패했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className={showMessage ? "space-y-2" : ""}>
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={Boolean(disabledReason) || isDeleting}
        title={disabledReason || undefined}
        className="rounded-full border border-red-400/35 bg-red-500/8 px-3 py-1.5 text-xs text-red-700 transition hover:border-red-500/45 hover:bg-red-500/12 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-100 dark:hover:border-red-300/40 dark:hover:bg-red-500/14"
      >
        {isDeleting ? "삭제 중..." : "자산 삭제"}
      </button>
      {showMessage && disabledReason ? (
        <p className="text-xs leading-5 text-stone-500 dark:text-stone-500">{disabledReason}</p>
      ) : null}
      {showMessage && error ? (
        <p className="text-xs leading-5 text-red-600 dark:text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
