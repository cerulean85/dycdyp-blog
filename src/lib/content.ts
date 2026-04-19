export type CategoryRoot = "investment" | "ai" | "culture" | "humanities";

export type CategoryLeaf =
  | "stock"
  | "economy"
  | "news"
  | "tools"
  | "research"
  | "ethics"
  | "books"
  | "film"
  | "travel"
  | "lifestyle"
  | "philosophy"
  | "history"
  | "psychology"
  | "essay";

export type PostStatus = "draft" | "review" | "approved" | "published";

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryRoot: CategoryRoot;
  categoryLeaf: CategoryLeaf;
  tags: string[];
  status: PostStatus;
  publishedAt: string;
  readingTimeMinutes: number;
  thumbnailUrl?: string;
};

export type PostDetail = PostSummary & {
  markdownBody: string;
};

export type CategoryDefinition = {
  root: CategoryRoot;
  label: string;
  description: string;
  accent: string;
  leaves: Array<{
    slug: CategoryLeaf;
    label: string;
  }>;
};

export const categoryDefinitions: CategoryDefinition[] = [
  {
    root: "investment",
    label: "투자",
    description: "주식, 경제 등 투자 소식을 전해요.",
    accent: "from-amber-300 via-orange-200 to-stone-50",
    leaves: [
      { slug: "stock", label: "주식" },
      { slug: "economy", label: "거시경제" },
    ],
  },
  {
    root: "ai",
    label: "AI",
    description: "AI 관련 소식을 전해요.",
    accent: "from-cyan-300 via-sky-200 to-white",
    leaves: [
      { slug: "news", label: "뉴스" },
      { slug: "tools", label: "툴 리뷰" },
      { slug: "research", label: "리서치" },
      { slug: "ethics", label: "윤리" },
    ],
  },
  {
    root: "culture",
    label: "문화",
    description: "책, 영화, 여행, 라이프스타일 큐레이션!",
    accent: "from-rose-300 via-orange-100 to-white",
    leaves: [
      { slug: "books", label: "책" },
      { slug: "film", label: "영화/드라마" },
      { slug: "travel", label: "여행" },
      { slug: "lifestyle", label: "라이프스타일" },
    ],
  },
  {
    root: "humanities",
    label: "인문",
    description: "철학, 역사, 심리학, 에세이로 밀도있게 사유한 글을 전해요.",
    accent: "from-emerald-300 via-lime-100 to-white",
    leaves: [
      { slug: "philosophy", label: "철학" },
      { slug: "history", label: "역사" },
      { slug: "psychology", label: "심리학" },
      { slug: "essay", label: "에세이" },
    ],
  },
];

export function getCategoryDefinition(root: CategoryRoot) {
  return categoryDefinitions.find((category) => category.root === root);
}

export function isCategoryRoot(value: string): value is CategoryRoot {
  return categoryDefinitions.some((category) => category.root === value);
}

export function isCategoryLeaf(
  root: CategoryRoot,
  value: string,
): value is CategoryLeaf {
  const category = getCategoryDefinition(root);
  return category?.leaves.some((leaf) => leaf.slug === value) ?? false;
}
