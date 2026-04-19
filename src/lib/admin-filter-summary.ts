import { categoryDefinitions } from "@/lib/content";

export type FilterSummaryItem = {
  label: string;
  value?: string;
  removeHref?: string;
};

type FilterSummaryResult = {
  items: FilterSummaryItem[];
  activeFilterCount: number;
  sortLabel: string;
};

function buildHref(
  basePath: string,
  values: Record<string, string | undefined>,
  skipKey?: string,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (!value || key === skipKey) {
      continue;
    }

    params.set(key, value);
  }

  return `${basePath}${params.size ? `?${params.toString()}` : ""}`;
}

export function buildAdminPostsFilterSummary(input: {
  q?: string;
  status?: string;
  category?: string;
  sort?: string;
}): FilterSummaryResult {
  const q = input.q ?? "";
  const status = input.status ?? "";
  const category = input.category ?? "";
  const sort = input.sort ?? "updated_desc";
  const categoryLabel = category
    ? categoryDefinitions.find((entry) => entry.root === category)?.label ??
      category
    : undefined;

  const items: FilterSummaryItem[] = [
    { label: "검색", value: q || undefined, removeHref: buildHref("/admin", { q, status, category, sort: sort !== "updated_desc" ? sort : undefined }, "q") },
    { label: "상태", value: status || undefined, removeHref: buildHref("/admin", { q, status, category, sort: sort !== "updated_desc" ? sort : undefined }, "status") },
    { label: "카테고리", value: categoryLabel, removeHref: buildHref("/admin", { q, status, category, sort: sort !== "updated_desc" ? sort : undefined }, "category") },
    {
      label: "정렬",
      value:
        sort === "updated_asc"
          ? "오래된순"
          : sort === "title_asc"
            ? "제목 오름차순"
            : sort === "title_desc"
              ? "제목 내림차순"
              : sort === "updated_desc"
                ? "최신순"
                : undefined,
      removeHref: buildHref("/admin", { q, status, category, sort: sort !== "updated_desc" ? sort : undefined }, "sort"),
    },
  ];

  return {
    items,
    activeFilterCount: items.filter((item) => item.value).length,
    sortLabel:
      sort === "updated_asc"
        ? "오래된순"
        : sort === "title_asc"
          ? "제목 오름차순"
          : sort === "title_desc"
            ? "제목 내림차순"
            : "최신순",
  };
}

export function buildNewsletterFilterSummary(input: {
  q?: string;
  source?: string;
  status?: "active" | "blocked" | "";
  sort?: string;
}): FilterSummaryResult {
  const q = input.q ?? "";
  const source = input.source ?? "";
  const status = input.status ?? "";
  const sort = input.sort ?? "created_desc";

  const items: FilterSummaryItem[] = [
    { label: "이메일", value: q || undefined, removeHref: buildHref("/admin/newsletter", { q, source, status: status || undefined, sort: sort !== "created_desc" ? sort : undefined }, "q") },
    { label: "유입", value: source || undefined, removeHref: buildHref("/admin/newsletter", { q, source, status: status || undefined, sort: sort !== "created_desc" ? sort : undefined }, "source") },
    {
      label: "상태",
      value: status === "active" ? "활성" : status === "blocked" ? "차단" : undefined,
      removeHref: buildHref("/admin/newsletter", { q, source, status: status || undefined, sort: sort !== "created_desc" ? sort : undefined }, "status"),
    },
    {
      label: "정렬",
      value:
        sort === "created_asc"
          ? "오래된순"
          : sort === "email_asc"
            ? "이메일 오름차순"
            : sort === "email_desc"
              ? "이메일 내림차순"
              : sort === "created_desc"
                ? "최신순"
                : undefined,
      removeHref: buildHref("/admin/newsletter", { q, source, status: status || undefined, sort: sort !== "created_desc" ? sort : undefined }, "sort"),
    },
  ];

  return {
    items,
    activeFilterCount: items.filter((item) => item.value).length,
    sortLabel:
      sort === "created_asc"
        ? "오래된순"
        : sort === "email_asc"
          ? "이메일 오름차순"
          : sort === "email_desc"
            ? "이메일 내림차순"
            : "최신순",
  };
}

export function buildAssetsFilterSummary(input: {
  q?: string;
  mime?: string;
  kind?: "uploaded" | "load_test" | "";
  usage?: "used" | "unused" | "thumbnail" | "body" | "";
  sort?: string;
}): FilterSummaryResult {
  const q = input.q ?? "";
  const mime = input.mime ?? "";
  const kind = input.kind ?? "";
  const usage = input.usage ?? "";
  const sort = input.sort ?? "created_desc";

  const items: FilterSummaryItem[] = [
    { label: "검색", value: q || undefined, removeHref: buildHref("/admin/assets", { q, mime, kind: kind || undefined, usage: usage || undefined, sort: sort !== "created_desc" ? sort : undefined }, "q") },
    { label: "MIME", value: mime || undefined, removeHref: buildHref("/admin/assets", { q, mime, kind: kind || undefined, usage: usage || undefined, sort: sort !== "created_desc" ? sort : undefined }, "mime") },
    {
      label: "종류",
      value: kind === "uploaded" ? "업로드" : kind === "load_test" ? "테스트" : undefined,
      removeHref: buildHref("/admin/assets", { q, mime, kind: kind || undefined, usage: usage || undefined, sort: sort !== "created_desc" ? sort : undefined }, "kind"),
    },
    {
      label: "사용처",
      value:
        usage === "unused"
          ? "미사용"
          : usage === "used"
            ? "사용 중"
            : usage === "thumbnail"
              ? "썸네일"
              : usage === "body"
                ? "본문"
                : undefined,
      removeHref: buildHref("/admin/assets", { q, mime, kind: kind || undefined, usage: usage || undefined, sort: sort !== "created_desc" ? sort : undefined }, "usage"),
    },
    {
      label: "정렬",
      value:
        sort === "created_asc"
          ? "오래된순"
          : sort === "alt_asc"
            ? "alt순"
            : sort === "size_desc"
              ? "용량순"
              : sort === "created_desc"
                ? "최신순"
                : undefined,
      removeHref: buildHref("/admin/assets", { q, mime, kind: kind || undefined, usage: usage || undefined, sort: sort !== "created_desc" ? sort : undefined }, "sort"),
    },
  ];

  return {
    items,
    activeFilterCount: items.filter((item) => item.value).length,
    sortLabel:
      sort === "created_asc"
        ? "오래된순"
        : sort === "alt_asc"
          ? "alt순"
          : sort === "size_desc"
            ? "용량순"
            : "최신순",
  };
}
