import Link from "next/link";

type AdminPaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: URLSearchParams;
};

function getPageHref(
  basePath: string,
  searchParams: URLSearchParams,
  page: number,
) {
  const nextParams = new URLSearchParams(searchParams);

  if (page <= 1) {
    nextParams.delete("page");
  } else {
    nextParams.set("page", String(page));
  }

  const query = nextParams.toString();

  return `${basePath}${query ? `?${query}` : ""}`;
}

export function AdminPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-stone-300/70 bg-white px-5 py-4 text-sm text-stone-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:shadow-none">
      <p>
        페이지 <span className="font-medium text-stone-950 dark:text-white">{currentPage}</span> /{" "}
        <span className="font-medium text-stone-950 dark:text-white">{totalPages}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={getPageHref(basePath, searchParams, currentPage - 1)}
          aria-disabled={currentPage <= 1}
          className="rounded-full border border-stone-300/70 bg-white px-4 py-2 text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-white/15 dark:bg-transparent dark:text-stone-200 dark:hover:border-white/35 dark:hover:bg-white/5"
        >
          이전
        </Link>
        {pages.map((page) => (
          <Link
            key={page}
            href={getPageHref(basePath, searchParams, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className="rounded-full border border-stone-300/70 bg-white px-4 py-2 text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 aria-[current=page]:border-stone-950 aria-[current=page]:bg-stone-950 aria-[current=page]:text-white dark:border-white/15 dark:bg-transparent dark:text-stone-200 dark:hover:border-white/35 dark:hover:bg-white/5 dark:aria-[current=page]:border-white dark:aria-[current=page]:bg-white dark:aria-[current=page]:text-stone-950"
          >
            {page}
          </Link>
        ))}
        <Link
          href={getPageHref(basePath, searchParams, currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          className="rounded-full border border-stone-300/70 bg-white px-4 py-2 text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-white/15 dark:bg-transparent dark:text-stone-200 dark:hover:border-white/35 dark:hover:bg-white/5"
        >
          다음
        </Link>
      </div>
    </div>
  );
}
