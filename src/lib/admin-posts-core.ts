import {
  AuthorType,
  Prisma,
  PostStatus,
  CategoryLeaf as PrismaCategoryLeaf,
  CategoryRoot as PrismaCategoryRoot,
  PublishEventType,
  PostStatus as PrismaPostStatus,
  RevisionSourceType,
} from "@prisma/client";

import { ensureAdminUser } from "@/lib/admin-users-core";
import {
  isWorkflowActionAllowed,
  type WorkflowAction,
} from "@/lib/admin-workflow";
import type { CategoryLeaf, CategoryRoot } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export type AdminPostListItem = {
  id: string;
  title: string;
  slug: string;
  status: Lowercase<keyof typeof PrismaPostStatus>;
  categoryRoot: CategoryRoot;
  categoryLeaf: CategoryLeaf;
  updatedAt: string;
  publishedAt: string;
};

export type AdminPostEditor = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryRoot: CategoryRoot;
  categoryLeaf: CategoryLeaf;
  status: Lowercase<keyof typeof PrismaPostStatus>;
  readingTimeMinutes: number;
  tags: string[];
  thumbnailAssetId: string;
  thumbnailUrl: string;
  markdownBody: string;
  publishedMarkdownBody: string;
  approvedAt: string;
  publishedAt: string;
  publishEvents: AdminPublishEvent[];
  hasPublishedVersion: boolean;
  hasUnpublishedChanges: boolean;
  publishedRevisionTitle: string;
  publishedRevisionExcerpt: string;
};

export type AdminPublishEvent = {
  id: string;
  eventType: Lowercase<keyof typeof PublishEventType>;
  actorDisplay: string;
  actorEmail: string;
  createdAt: string;
  revisionTitle: string;
};

export type AdminDashboardStats = {
  totalPosts: number;
  draftPosts: number;
  reviewPosts: number;
  approvedPosts: number;
  publishedPosts: number;
  latestUpdatedAt: string;
};

type AdminPostFilters = {
  query?: string;
  status?: Lowercase<keyof typeof PrismaPostStatus>;
  categoryRoot?: CategoryRoot;
  sort?: "updated_desc" | "updated_asc" | "title_asc" | "title_desc";
};

export type AdminPostPage = {
  items: AdminPostListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

function toCategoryRoot(value: PrismaCategoryRoot) {
  return value.toLowerCase() as CategoryRoot;
}

function toCategoryLeaf(value: PrismaCategoryLeaf) {
  return value.toLowerCase() as CategoryLeaf;
}

function toStatus(value: PrismaPostStatus) {
  return value.toLowerCase() as Lowercase<keyof typeof PrismaPostStatus>;
}

function toPublishEventType(value: PublishEventType) {
  return value.toLowerCase() as Lowercase<keyof typeof PublishEventType>;
}

function normalizeCategoryRoot(categoryRoot: string) {
  return categoryRoot.toUpperCase() as PrismaCategoryRoot;
}

function normalizeCategoryLeaf(categoryLeaf: string) {
  return categoryLeaf.toUpperCase() as PrismaCategoryLeaf;
}

function normalizeTags(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildAdminPostWhere(
  filters: AdminPostFilters = {},
): Prisma.PostWhereInput {
  const query = filters.query?.trim();
  const status = filters.status?.trim();
  const categoryRoot = filters.categoryRoot?.trim();

  return {
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
              slug: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(status ? { status: status.toUpperCase() as PostStatus } : {}),
    ...(categoryRoot
      ? {
          categoryRoot: categoryRoot.toUpperCase() as PrismaCategoryRoot,
        }
      : {}),
  };
}

function toAdminPostListItem(post: {
  id: string;
  title: string;
  slug: string;
  status: PrismaPostStatus;
  categoryRoot: PrismaCategoryRoot;
  categoryLeaf: PrismaCategoryLeaf;
  updatedAt: Date;
  publishedAt: Date | null;
}) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: toStatus(post.status),
    categoryRoot: toCategoryRoot(post.categoryRoot),
    categoryLeaf: toCategoryLeaf(post.categoryLeaf),
    updatedAt: post.updatedAt.toISOString().slice(0, 16).replace("T", " "),
    publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? "-",
  } satisfies AdminPostListItem;
}

function buildAdminPostOrderBy(
  sort: AdminPostFilters["sort"],
): Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[] {
  switch (sort) {
    case "updated_asc":
      return {
        updatedAt: "asc",
      };
    case "title_asc":
      return {
        title: "asc",
      };
    case "title_desc":
      return {
        title: "desc",
      };
    case "updated_desc":
    default:
      return {
        updatedAt: "desc",
      };
  }
}

export async function getAdminPosts(filters: AdminPostFilters = {}) {
  const posts = await prisma.post.findMany({
    where: buildAdminPostWhere(filters),
    orderBy: buildAdminPostOrderBy(filters.sort),
  });

  return posts.map(toAdminPostListItem);
}

export async function getAdminPostsPage(input: {
  filters?: AdminPostFilters;
  page?: number;
  pageSize?: number;
}) {
  const filters = input.filters ?? {};
  const pageSize = Math.max(1, input.pageSize ?? 20);
  const currentPage = Math.max(1, input.page ?? 1);
  const where = buildAdminPostWhere(filters);
  const totalCount = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const posts = await prisma.post.findMany({
    where,
    orderBy: buildAdminPostOrderBy(filters.sort),
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  });

  return {
    items: posts.map(toAdminPostListItem),
    totalCount,
    currentPage: safePage,
    totalPages,
  } satisfies AdminPostPage;
}

export async function getAdminDashboardStats() {
  const [totalPosts, draftPosts, reviewPosts, approvedPosts, publishedPosts, latestPost] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: PrismaPostStatus.DRAFT } }),
      prisma.post.count({ where: { status: PrismaPostStatus.REVIEW } }),
      prisma.post.count({ where: { status: PrismaPostStatus.APPROVED } }),
      prisma.post.count({ where: { status: PrismaPostStatus.PUBLISHED } }),
      prisma.post.findFirst({
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          updatedAt: true,
        },
      }),
    ]);

  return {
    totalPosts,
    draftPosts,
    reviewPosts,
    approvedPosts,
    publishedPosts,
    latestUpdatedAt:
      latestPost?.updatedAt.toISOString().slice(0, 16).replace("T", " ") ?? "-",
  } satisfies AdminDashboardStats;
}

export async function getAdminPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      currentRevision: true,
      publishedRevision: true,
      thumbnailAsset: true,
      publishEvents: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          actor: true,
          revision: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post || !post.currentRevision) {
    return null;
  }

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    categoryRoot: toCategoryRoot(post.categoryRoot),
    categoryLeaf: toCategoryLeaf(post.categoryLeaf),
    status: toStatus(post.status),
    readingTimeMinutes: post.readingTimeMinutes,
    tags: post.tags.map((tag) => tag.tag.name),
    thumbnailAssetId: post.thumbnailAssetId ?? "",
    thumbnailUrl: post.thumbnailAsset?.publicUrl ?? "",
    markdownBody: post.currentRevision.markdownBody,
    publishedMarkdownBody: post.publishedRevision?.markdownBody ?? "",
    approvedAt: post.approvedAt?.toISOString().slice(0, 16).replace("T", " ") ?? "",
    publishedAt:
      post.publishedAt?.toISOString().slice(0, 16).replace("T", " ") ?? "",
    hasPublishedVersion: Boolean(post.publishedRevision),
    hasUnpublishedChanges:
      Boolean(post.publishedRevisionId) &&
      post.currentRevisionId !== post.publishedRevisionId,
    publishedRevisionTitle: post.publishedRevision?.title ?? "",
    publishedRevisionExcerpt: post.publishedRevision?.excerpt ?? "",
    publishEvents: post.publishEvents.map((event) => ({
      id: event.id,
      eventType: toPublishEventType(event.eventType),
      actorDisplay:
        event.actor?.displayName?.trim() ||
        event.actor?.email ||
        "시스템",
      actorEmail: event.actor?.email ?? "",
      createdAt: event.createdAt.toISOString().slice(0, 16).replace("T", " "),
      revisionTitle: event.revision?.title ?? post.title,
    })),
  } satisfies AdminPostEditor;
}

export function getEmptyAdminPost(): AdminPostEditor {
  return {
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    categoryRoot: "investment",
    categoryLeaf: "stock",
    status: "draft",
    readingTimeMinutes: 5,
    tags: [],
    thumbnailAssetId: "",
    thumbnailUrl: "",
    markdownBody: "## 들어가며\n\n",
    publishedMarkdownBody: "",
    approvedAt: "",
    publishedAt: "",
    publishEvents: [],
    hasPublishedVersion: false,
    hasUnpublishedChanges: false,
    publishedRevisionTitle: "",
    publishedRevisionExcerpt: "",
  };
}

export async function saveAdminPost(input: {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryRoot: string;
  categoryLeaf: string;
  readingTimeMinutes: number;
  tags: string;
  thumbnailAssetId?: string;
  markdownBody: string;
  editorEmail: string;
}) {
  const adminUser = await ensureAdminUser(input.editorEmail);

  const tagNames = normalizeTags(input.tags);

  return prisma.$transaction(async (tx) => {
    const isNew = !input.id;
    const post = input.id
      ? await tx.post.update({
          where: { id: input.id },
          data: {
            title: input.title,
            slug: input.slug,
            excerpt: input.excerpt,
            categoryRoot: normalizeCategoryRoot(input.categoryRoot),
            categoryLeaf: normalizeCategoryLeaf(input.categoryLeaf),
            readingTimeMinutes: input.readingTimeMinutes,
            thumbnailAssetId: input.thumbnailAssetId || null,
            updatedById: adminUser.id,
            authorType: AuthorType.HUMAN_EDITED,
          },
        })
      : await tx.post.create({
          data: {
            title: input.title,
            slug: input.slug,
            excerpt: input.excerpt,
            categoryRoot: normalizeCategoryRoot(input.categoryRoot),
            categoryLeaf: normalizeCategoryLeaf(input.categoryLeaf),
            status: PrismaPostStatus.DRAFT,
            readingTimeMinutes: input.readingTimeMinutes,
            thumbnailAssetId: input.thumbnailAssetId || null,
            createdById: adminUser.id,
            updatedById: adminUser.id,
            authorType: AuthorType.HUMAN_EDITED,
          },
        });

    const revision = await tx.postRevision.create({
      data: {
        postId: post.id,
        title: input.title,
        excerpt: input.excerpt,
        markdownBody: input.markdownBody,
        sourceType: RevisionSourceType.HUMAN_EDIT,
        sourceModel: "admin-manual",
        editorId: adminUser.id,
      },
    });

    await tx.post.update({
      where: { id: post.id },
      data: {
        currentRevisionId: revision.id,
      },
    });

    await tx.postTag.deleteMany({
      where: { postId: post.id },
    });

    for (const tagName of tagNames) {
      const tag = await tx.tag.upsert({
        where: { name: tagName },
        update: { slug: tagName },
        create: { name: tagName, slug: tagName },
      });

      await tx.postTag.create({
        data: {
          postId: post.id,
          tagId: tag.id,
        },
      });
    }

    if (isNew) {
      await tx.publishEvent.create({
        data: {
          postId: post.id,
          revisionId: revision.id,
          actorId: adminUser.id,
          eventType: PublishEventType.CREATED,
          payload: {
            source: "admin-save",
          },
        },
      });
    }

    return post.id;
  });
}

export async function deleteAdminPost(id: string) {
  await prisma.post.delete({
    where: { id },
  });
}

export async function transitionAdminPostStatus(input: {
  id: string;
  action: WorkflowAction;
  editorEmail: string;
}) {
  const adminUser = await ensureAdminUser(input.editorEmail);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: input.id },
      include: {
        currentRevision: true,
      },
    });

    if (!post || !post.currentRevision) {
      throw new Error("상태를 변경할 게시물을 찾을 수 없습니다.");
    }

    const currentStatus = toStatus(post.status);
    if (!isWorkflowActionAllowed(currentStatus, input.action)) {
      throw new Error(
        `"${currentStatus}" 상태에서는 "${input.action}" 전환을 실행할 수 없습니다.`,
      );
    }

    if (input.action === "submit_for_review") {
      await tx.post.update({
        where: { id: post.id },
        data: {
          status: PrismaPostStatus.REVIEW,
          approvedById: null,
          approvedAt: null,
          publishedRevisionId: null,
          publishedAt: null,
          updatedById: adminUser.id,
        },
      });

      await tx.publishEvent.create({
        data: {
          postId: post.id,
          revisionId: post.currentRevision.id,
          actorId: adminUser.id,
          eventType: PublishEventType.SUBMITTED_FOR_REVIEW,
          payload: {
            source: "admin-workflow",
          },
        },
      });

      return {
        id: post.id,
        slug: post.slug,
        categoryRoot: toCategoryRoot(post.categoryRoot),
        categoryLeaf: toCategoryLeaf(post.categoryLeaf),
      };
    }

    if (input.action === "approve") {
      await tx.post.update({
        where: { id: post.id },
        data: {
          status: PrismaPostStatus.APPROVED,
          approvedById: adminUser.id,
          approvedAt: now,
          publishedRevisionId: null,
          publishedAt: null,
          updatedById: adminUser.id,
        },
      });

      await tx.publishEvent.create({
        data: {
          postId: post.id,
          revisionId: post.currentRevision.id,
          actorId: adminUser.id,
          eventType: PublishEventType.APPROVED,
          payload: {
            source: "admin-workflow",
          },
        },
      });

      return {
        id: post.id,
        slug: post.slug,
        categoryRoot: toCategoryRoot(post.categoryRoot),
        categoryLeaf: toCategoryLeaf(post.categoryLeaf),
      };
    }

    if (input.action === "publish") {
      await tx.post.update({
        where: { id: post.id },
        data: {
          status: PrismaPostStatus.PUBLISHED,
          approvedById: post.approvedById ?? adminUser.id,
          approvedAt: post.approvedAt ?? now,
          publishedRevisionId: post.currentRevision.id,
          publishedAt: now,
          updatedById: adminUser.id,
        },
      });

      await tx.publishEvent.create({
        data: {
          postId: post.id,
          revisionId: post.currentRevision.id,
          actorId: adminUser.id,
          eventType: PublishEventType.PUBLISHED,
          payload: {
            source: "admin-workflow",
          },
        },
      });

      return {
        id: post.id,
        slug: post.slug,
        categoryRoot: toCategoryRoot(post.categoryRoot),
        categoryLeaf: toCategoryLeaf(post.categoryLeaf),
      };
    }

    await tx.post.update({
      where: { id: post.id },
      data: {
        status: PrismaPostStatus.APPROVED,
        publishedRevisionId: null,
        publishedAt: null,
        updatedById: adminUser.id,
      },
    });

    await tx.publishEvent.create({
      data: {
        postId: post.id,
        revisionId: post.currentRevision.id,
        actorId: adminUser.id,
        eventType: PublishEventType.UNPUBLISHED,
        payload: {
          source: "admin-workflow",
        },
      },
    });

    return {
      id: post.id,
      slug: post.slug,
      categoryRoot: toCategoryRoot(post.categoryRoot),
      categoryLeaf: toCategoryLeaf(post.categoryLeaf),
    };
  });
}
