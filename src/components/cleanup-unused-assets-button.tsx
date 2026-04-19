"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CleanupUnusedAssetsButtonProps = {
  count: number;
  q?: string;
  mime?: string;
  kind?: "uploaded" | "load_test";
};

export function CleanupUnusedAssetsButton({
  count,
  q = "",
  mime = "",
  kind,
}: CleanupUnusedAssetsButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleClick() {
    if (!count || isLoading) {
      return;
    }

    const confirmed = window.confirm(
      `현재 필터 기준 미사용 자산 ${count}개를 정리할까요?\n삭제 후에는 되돌릴 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/assets/cleanup-unused", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q,
          mime,
          kind,
        }),
      });

      const result = (await response.json()) as {
        matchedCount?: number;
        deletedCount?: number;
        failedCount?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "미사용 자산 일괄 정리에 실패했습니다.");
      }

      setMessage(
        result.failedCount
          ? `정리 대상 ${result.matchedCount ?? count}개 중 ${result.deletedCount ?? 0}개 삭제, ${result.failedCount}개 실패`
          : `정리 대상 ${result.matchedCount ?? count}개를 모두 삭제했습니다.`,
      );
      router.refresh();
    } catch (cleanupError) {
      setError(
        cleanupError instanceof Error
          ? cleanupError.message
          : "미사용 자산 일괄 정리에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={!count || isLoading}
        className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-100 transition hover:border-red-300/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "정리 중..." : `미사용 자산 ${count}개 정리`}
      </button>
      <p className="text-xs leading-5 text-stone-500">
        현재 필터 기준의 미사용 자산만 정리합니다. 삭제 시 S3 파일과 DB
        레코드가 함께 제거됩니다.
      </p>
      {message ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs leading-5 text-emerald-200">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
