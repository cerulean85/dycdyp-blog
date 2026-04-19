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
      className={`rounded-full border border-white/15 px-3 py-1.5 text-xs text-stone-200 transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {copied ? copiedLabel : idleLabel}
    </button>
  );
}
