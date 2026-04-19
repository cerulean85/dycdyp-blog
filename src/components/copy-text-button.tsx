"use client";

import { useState } from "react";

type CopyTextButtonProps = {
  value: string;
  idleLabel: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyTextButton({
  value,
  idleLabel,
  copiedLabel = "복사됨",
  className = "",
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!value}
      className={`rounded-full border border-stone-300/70 bg-white px-3 py-1.5 text-xs text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-transparent dark:text-stone-200 dark:hover:border-white/35 dark:hover:bg-white/5 ${className}`}
    >
      {copied ? copiedLabel : idleLabel}
    </button>
  );
}
