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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-stone-300">
      <p>
        페이지 <span className="font-medium text-white">{currentPage}</span> /{" "}
        <span className="font-medium text-white">{totalPages}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={getPageHref(basePath, searchParams, currentPage - 1)}
          aria-disabled={currentPage <= 1}
          className="rounded-full border border-white/15 px-4 py-2 text-stone-200 transition hover:border-white/35 aria-disabled:pointer-events-none aria-disabled:opacity-40"
        >
          이전
        </Link>
        {pages.map((page) => (
          <Link
            key={page}
            href={getPageHref(basePath, searchParams, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className="rounded-full border border-white/15 px-4 py-2 text-stone-200 transition hover:border-white/35 aria-[current=page]:border-white aria-[current=page]:bg-white aria-[current=page]:text-stone-950"
          >
            {page}
          </Link>
        ))}
        <Link
          href={getPageHref(basePath, searchParams, currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          className="rounded-full border border-white/15 px-4 py-2 text-stone-200 transition hover:border-white/35 aria-disabled:pointer-events-none aria-disabled:opacity-40"
        >
          다음
        </Link>
      </div>
    </div>
  );
}
