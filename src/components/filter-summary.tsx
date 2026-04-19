import Link from "next/link";

type FilterSummaryItem = {
  label: string;
  value?: string | null;
  removeHref?: string;
};

type FilterSummaryProps = {
  items: FilterSummaryItem[];
  emptyLabel?: string;
};

export function FilterSummary({
  items,
  emptyLabel = "선택된 필터 없음",
}: FilterSummaryProps) {
  const activeItems = items.filter((item) => item.value && item.value.trim());
  const activeCount = activeItems.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full border border-sky-300/35 bg-sky-50 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700 dark:border-sky-300/20 dark:bg-sky-500/10 dark:text-sky-100">
          Applied Filters
        </span>
        <span className="text-stone-500 dark:text-stone-400">
          {activeCount ? `${activeCount}개 적용됨` : emptyLabel}
        </span>
      </div>
      <div className="flex min-h-12 flex-wrap items-center gap-2">
        {activeItems.length ? (
          activeItems.map((item) => (
            <span
              key={`${item.label}-${item.value}`}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-stone-100 px-3 py-1.5 text-xs text-stone-700 dark:border-white/10 dark:bg-black/20 dark:text-stone-300"
            >
              <span className="text-stone-500 dark:text-stone-500">{item.label}</span>
              <span className="mx-1 text-stone-400 dark:text-stone-600">·</span>
              <span className="text-stone-900 dark:text-stone-100">{item.value}</span>
              {item.removeHref ? (
                <Link
                  href={item.removeHref}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-stone-300/70 text-[10px] text-stone-500 transition hover:border-stone-400 hover:text-stone-900 dark:border-white/10 dark:text-stone-400 dark:hover:border-white/25 dark:hover:text-white"
                  aria-label={`${item.label} 필터 제거`}
                  title={`${item.label} 필터 제거`}
                >
                  ×
                </Link>
              ) : null}
            </span>
          ))
        ) : (
          <span className="text-xs text-stone-500 dark:text-stone-500">필터를 선택하면 이곳에 표시됩니다.</span>
        )}
      </div>
    </div>
  );
}
