"use client";

type CollapseToggleChipProps = {
  isOpen: boolean;
  closedLabel?: string;
  openLabel?: string;
  className?: string;
};

export function CollapseToggleChip({
  isOpen,
  closedLabel = "펼치기",
  openLabel = "접기",
  className = "",
}: CollapseToggleChipProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-stone-300/70 bg-white px-4 py-1.5 text-xs text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 ${className}`}
    >
      <span>{isOpen ? openLabel : closedLabel}</span>
      <span className={`transition ${isOpen ? "rotate-180" : ""}`}>∨</span>
    </span>
  );
}
