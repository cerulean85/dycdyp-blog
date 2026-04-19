import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PublicBreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function PublicBreadcrumbs({
  items,
  className,
}: PublicBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={className}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-stone-500 md:text-xs md:tracking-[0.22em]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition hover:text-stone-950"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-stone-800" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span className="text-stone-300">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
