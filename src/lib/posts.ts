import "server-only";

import {
  CategoryLeaf as PrismaCategoryLeaf,
  CategoryRoot as PrismaCategoryRoot,
  PostStatus as PrismaPostStatus,
  Prisma,
} from "@prisma/client";

import type {
  CategoryLeaf,
  CategoryRoot,
  PostDetail,
  PostSummary,
} from "@/lib/content";
import { categoryDefinitions } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export type PostReadingContext = {
  previousPost: PostSummary | null;
  nextPost: PostSummary | null;
  relatedPosts: PostSummary[];
};

export type PostPageResult = {
  posts: PostSummary[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type PublicPostSort = "published_desc" | "published_asc";

const postSummaryInclude = {
  tags: {
    include: {
      tag: true,
    },
  },
  thumbnailAsset: true,
} as const;

type PostWithTags = Prisma.PostGetPayload<{
  include: typeof postSummaryInclude;
}>;

function toIsoDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function mapPostSummary(post: PostWithTags): PostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    categoryRoot: post.categoryRoot.toLowerCase() as CategoryRoot,
    categoryLeaf: post.categoryLeaf.toLowerCase() as CategoryLeaf,
    tags: post.tags.map((item) => item.tag.name),
    status: post.status.toLowerCase() as PostSummary["status"],
    publishedAt: toIsoDate(post.publishedAt),
    readingTimeMinutes: post.readingTimeMinutes,
    thumbnailUrl: post.thumbnailAsset?.publicUrl ?? "",
  };
}

export async function getPublishedPosts() {
  const posts = await prisma.post.findMany({
    where: {
      status: PrismaPostStatus.PUBLISHED,
    },
    include: postSummaryInclude,
    orderBy: {
      publishedAt: "desc",
    },
  });

  return posts.map(mapPostSummary);
}

export async function getFeaturedPosts(limit = 3) {
  const posts = await getPublishedPosts();
  return posts.slice(0, limit);
}

export async function getPostsByCategory(root: CategoryRoot, leaf?: CategoryLeaf) {
  const result = await getPostsByCategoryPage(root, leaf, {
    page: 1,
    pageSize: 1000,
  });

  return result.posts;
}

export async function getPostsByCategoryPage(
  root: CategoryRoot,
  leaf?: CategoryLeaf,
  options?: {
    page?: number;
    pageSize?: number;
    query?: string;
    sort?: PublicPostSort;
  },
) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? 10);
  const query = options?.query?.trim() ?? "";
  const sort = options?.sort ?? "published_desc";
  const where: Prisma.PostWhereInput = {
    status: PrismaPostStatus.PUBLISHED,
    categoryRoot: root.toUpperCase() as PrismaCategoryRoot,
    ...(leaf
      ? { categoryLeaf: leaf.toUpperCase() as PrismaCategoryLeaf }
      : {}),
  };

  if (query) {
    where.OR = [
      {
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        excerpt: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        tags: {
          some: {
            tag: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ];
  }

  const totalCount = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const posts = await prisma.post.findMany({
    where,
    include: postSummaryInclude,
    orderBy: {
      publishedAt: sort === "published_asc" ? "asc" : "desc",
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return {
    posts: posts.map(mapPostSummary),
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  } satisfies PostPageResult;
}

export async function getPublishedPostPaths() {
  const posts = await prisma.post.findMany({
    where: {
      status: PrismaPostStatus.PUBLISHED,
    },
    select: {
      slug: true,
      categoryRoot: true,
      categoryLeaf: true,
    },
  });

  return posts.map((post) => ({
    slug: post.slug,
    category: post.categoryRoot.toLowerCase() as CategoryRoot,
    subcategory: post.categoryLeaf.toLowerCase() as CategoryLeaf,
  }));
}

export async function getPostBySlug(
  root: CategoryRoot,
  leaf: CategoryLeaf,
  slug: string,
) {
  const post = await prisma.post.findFirst({
    where: {
      status: PrismaPostStatus.PUBLISHED,
      slug,
      categoryRoot: root.toUpperCase() as PrismaCategoryRoot,
      categoryLeaf: leaf.toUpperCase() as PrismaCategoryLeaf,
    },
    include: {
      ...postSummaryInclude,
      publishedRevision: true,
    },
  });

  if (!post || !post.publishedRevision) {
    return null;
  }

  const summary = mapPostSummary(post);

  return {
    ...summary,
    markdownBody: post.publishedRevision.markdownBody,
    thumbnailUrl: post.thumbnailAsset?.publicUrl ?? "",
  } satisfies PostDetail;
}

export async function getPostReadingContext(
  root: CategoryRoot,
  leaf: CategoryLeaf,
  slug: string,
) {
  const posts = await getPublishedPosts();
  const currentIndex = posts.findIndex(
    (post) =>
      post.slug === slug &&
      post.categoryRoot === root &&
      post.categoryLeaf === leaf,
  );

  if (currentIndex === -1) {
    return {
      previousPost: null,
      nextPost: null,
      relatedPosts: [],
    } satisfies PostReadingContext;
  }

  const currentPost = posts[currentIndex];
  const previousPost = posts[currentIndex + 1] ?? null;
  const nextPost = posts[currentIndex - 1] ?? null;
  const relatedPosts = posts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const sharedTagCount = post.tags.filter((tag) =>
        currentPost.tags.includes(tag),
      ).length;
      const sameLeaf =
        post.categoryRoot === currentPost.categoryRoot &&
        post.categoryLeaf === currentPost.categoryLeaf;
      const sameRoot = post.categoryRoot === currentPost.categoryRoot;

      return {
        post,
        score:
          (sameLeaf ? 6 : 0) +
          (sameRoot ? 3 : 0) +
          sharedTagCount * 2,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.post.publishedAt.localeCompare(left.post.publishedAt);
    })
    .slice(0, 3)
    .map((entry) => entry.post);

  return {
    previousPost,
    nextPost,
    relatedPosts,
  } satisfies PostReadingContext;
}

export async function getTagCounts() {
  const tags = await prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      posts: {
        where: {
          post: {
            status: "PUBLISHED",
          },
        },
      },
    },
  });

  return tags
    .map((tag) => ({
      tag: tag.name,
      count: tag.posts.length,
    }))
    .filter((tag) => tag.count > 0);
}

export async function getPostsByTag(tag: string) {
  const posts = await prisma.post.findMany({
    where: {
      status: PrismaPostStatus.PUBLISHED,
      tags: {
        some: {
          tag: {
            name: {
              equals: tag,
              mode: "insensitive",
            },
          },
        },
      },
    },
    include: postSummaryInclude,
    orderBy: {
      publishedAt: "desc",
    },
  });

  return posts.map(mapPostSummary);
}

export async function searchPublishedPostsPage(input?: {
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: PublicPostSort;
}) {
  const query = input?.query?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const page = Math.max(1, input?.page ?? 1);
  const pageSize = Math.max(1, input?.pageSize ?? 10);
  const sort = input?.sort ?? "published_desc";
  const categoryRootConditions: Prisma.PostWhereInput[] = categoryDefinitions
    .filter((category) => category.root === normalizedQuery)
    .map((category) => ({
      categoryRoot: category.root.toUpperCase() as PrismaCategoryRoot,
    }));
  const categoryLeafConditions: Prisma.PostWhereInput[] = categoryDefinitions
    .flatMap((category) => category.leaves)
    .filter((leaf) => leaf.slug === normalizedQuery)
    .map((leaf) => ({
      categoryLeaf: leaf.slug.toUpperCase() as PrismaCategoryLeaf,
    }));
  const where: Prisma.PostWhereInput = {
    status: PrismaPostStatus.PUBLISHED,
    ...(query
      ? {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              excerpt: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              tags: {
                some: {
                  tag: {
                    name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
            ...categoryRootConditions,
            ...categoryLeafConditions,
          ],
        }
      : {}),
  };

  const totalCount = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const posts = await prisma.post.findMany({
    where,
    include: postSummaryInclude,
    orderBy: {
      publishedAt: sort === "published_asc" ? "asc" : "desc",
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return {
    posts: posts.map(mapPostSummary),
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  } satisfies PostPageResult;
}

export async function getArchiveGroups() {
  const posts = await getPublishedPosts();
  const groups = new Map<string, PostSummary[]>();

  for (const post of posts) {
    const key = post.publishedAt.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }

  return Array.from(groups.entries()).map(([month, groupedPosts]) => ({
    month,
    posts: groupedPosts,
  }));
}
