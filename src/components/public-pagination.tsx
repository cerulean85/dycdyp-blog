import Link from "next/link";

type PublicPaginationProps = {
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

export function PublicPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: PublicPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="public-panel mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-black/10 bg-white px-5 py-4 text-sm text-stone-600 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.12)]">
      <p>
        페이지 <span className="font-medium text-stone-950">{currentPage}</span> /{" "}
        <span className="font-medium text-stone-950">{totalPages}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={getPageHref(basePath, searchParams, currentPage - 1)}
          aria-disabled={currentPage <= 1}
          className="public-button-secondary rounded-full border border-black/10 px-4 py-2 transition hover:border-stone-950 hover:text-stone-950 aria-disabled:pointer-events-none aria-disabled:opacity-40"
        >
          이전
        </Link>
        {pages.map((page) => (
          <Link
            key={page}
            href={getPageHref(basePath, searchParams, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className="public-button-secondary rounded-full border border-black/10 px-4 py-2 transition hover:border-stone-950 hover:text-stone-950 aria-[current=page]:border-stone-950 aria-[current=page]:bg-stone-950 aria-[current=page]:text-white"
          >
            {page}
          </Link>
        ))}
        <Link
          href={getPageHref(basePath, searchParams, currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          className="public-button-secondary rounded-full border border-black/10 px-4 py-2 transition hover:border-stone-950 hover:text-stone-950 aria-disabled:pointer-events-none aria-disabled:opacity-40"
        >
          다음
        </Link>
      </div>
    </div>
  );
}
