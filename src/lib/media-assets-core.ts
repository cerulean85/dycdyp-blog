import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { deleteImageFromS3 } from "@/lib/s3";

export type AdminMediaAssetListItem = {
  id: string;
  publicUrl: string;
  objectKey: string;
  bucketName: string;
  mimeType: string;
  altText: string;
  markdownSnippet: string;
  fileSize: string;
  createdAt: string;
  uploaderEmail: string;
  uploaderDisplay: string;
  thumbnailPostTitle: string;
  thumbnailUsageCount: number;
  bodyUsageCount: number;
  thumbnailPosts: AdminMediaAssetUsagePost[];
  bodyPosts: AdminMediaAssetUsagePost[];
  assetKind: "uploaded" | "load_test";
};

export type AdminMediaAssetUsagePost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  categoryRoot: string;
  categoryLeaf: string;
  href: string;
  adminHref: string;
};

export type AdminMediaAssetPage = {
  items: AdminMediaAssetListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

export type AdminMediaAssetDashboardStats = {
  totalAssets: number;
  totalStorage: string;
  latestUploadedAt: string;
  assetsWithAltText: number;
};

type AdminMediaAssetFilters = {
  query?: string;
  mimeType?: string;
  kind?: "uploaded" | "load_test";
  usage?: "used" | "unused" | "thumbnail" | "body";
};

export type AdminMediaAssetFilterInput = AdminMediaAssetFilters;
export type AdminMediaAssetSort =
  | "created_desc"
  | "created_asc"
  | "alt_asc"
  | "size_desc";

function normalizeAdminMediaAssetSort(
  sort?: string,
): AdminMediaAssetSort {
  switch (sort) {
    case "created_asc":
    case "alt_asc":
    case "size_desc":
      return sort;
    default:
      return "created_desc";
  }
}

function buildMediaAssetOrderBy(sort?: string): Prisma.MediaAssetOrderByWithRelationInput[] {
  const normalizedSort = normalizeAdminMediaAssetSort(sort);

  switch (normalizedSort) {
    case "created_asc":
      return [{ createdAt: "asc" }];
    case "alt_asc":
      return [
        {
          altText: {
            sort: "asc",
            nulls: "last",
          },
        },
        {
          createdAt: "desc",
        },
      ];
    case "size_desc":
      return [
        {
          fileSizeBytes: {
            sort: "desc",
            nulls: "last",
          },
        },
        {
          createdAt: "desc",
        },
      ];
    default:
      return [{ createdAt: "desc" }];
  }
}

function formatBytes(value?: bigint | number | null) {
  const bytes =
    typeof value === "bigint" ? Number(value) : typeof value === "number" ? value : 0;

  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`;
}

function buildMediaAssetWhere(
  filters: AdminMediaAssetFilters = {},
): Prisma.MediaAssetWhereInput {
  const query = filters.query?.trim();
  const mimeType = filters.mimeType?.trim();

  return {
    ...(filters.kind === "load_test"
      ? {
          objectKey: {
            startsWith: "fixtures/admin-assets-load-test/",
          },
        }
      : {}),
    ...(filters.kind === "uploaded"
      ? {
          NOT: {
            objectKey: {
              startsWith: "fixtures/admin-assets-load-test/",
            },
          },
        }
      : {}),
    ...(mimeType ? { mimeType } : {}),
    ...(query
      ? {
          OR: [
            {
              altText: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              objectKey: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              publicUrl: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              uploadedBy: {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };
}

function matchesUsageFilter(
  asset: Pick<AdminMediaAssetListItem, "thumbnailUsageCount" | "bodyUsageCount">,
  usage?: AdminMediaAssetFilters["usage"],
) {
  if (!usage) {
    return true;
  }

  const totalUsage = asset.thumbnailUsageCount + asset.bodyUsageCount;

  switch (usage) {
    case "used":
      return totalUsage > 0;
    case "unused":
      return totalUsage === 0;
    case "thumbnail":
      return asset.thumbnailUsageCount > 0;
    case "body":
      return asset.bodyUsageCount > 0;
    default:
      return true;
  }
}

function toUsagePost(post: {
  id: string;
  title: string;
  slug: string;
  status: { toLowerCase(): string } | string;
  categoryRoot: { toLowerCase(): string } | string;
  categoryLeaf: { toLowerCase(): string } | string;
}) {
  const categoryRoot = String(post.categoryRoot).toLowerCase();
  const categoryLeaf = String(post.categoryLeaf).toLowerCase();

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: String(post.status).toLowerCase(),
    categoryRoot,
    categoryLeaf,
    href: `/category/${categoryRoot}/${categoryLeaf}/${post.slug}`,
    adminHref: `/admin/posts/${post.id}/edit`,
  } satisfies AdminMediaAssetUsagePost;
}

function toMediaAssetListItem(asset: {
  id: string;
  publicUrl: string | null;
  objectKey: string;
  bucketName: string;
  mimeType: string;
  altText: string | null;
  fileSizeBytes: bigint | null;
  createdAt: Date;
  uploadedBy: {
    email: string;
    displayName: string | null;
  } | null;
  thumbnailsForPosts: {
    id: string;
    title: string;
    slug: string;
    status: { toLowerCase(): string } | string;
    categoryRoot: { toLowerCase(): string } | string;
    categoryLeaf: { toLowerCase(): string } | string;
  }[];
  _count?: {
    thumbnailsForPosts: number;
  };
  bodyPosts?: AdminMediaAssetUsagePost[];
  bodyUsageCount?: number;
}) {
  const publicUrl = asset.publicUrl ?? "";
  const altText = asset.altText?.trim() || "image";
  const thumbnailPosts = asset.thumbnailsForPosts.map(toUsagePost);
  const bodyPosts = asset.bodyPosts ?? [];

  return {
    id: asset.id,
    publicUrl,
    objectKey: asset.objectKey,
    bucketName: asset.bucketName,
    mimeType: asset.mimeType,
    altText: asset.altText?.trim() || "",
    markdownSnippet: publicUrl ? `![${altText}](${publicUrl})` : "",
    fileSize: formatBytes(asset.fileSizeBytes),
    createdAt: asset.createdAt.toISOString().slice(0, 16).replace("T", " "),
    uploaderEmail: asset.uploadedBy?.email ?? "-",
    uploaderDisplay: asset.uploadedBy?.displayName?.trim() || "",
    thumbnailPostTitle: thumbnailPosts[0]?.title ?? "",
    thumbnailUsageCount: asset._count?.thumbnailsForPosts ?? thumbnailPosts.length,
    bodyUsageCount: asset.bodyUsageCount ?? bodyPosts.length,
    thumbnailPosts,
    bodyPosts,
    assetKind: asset.objectKey.startsWith("fixtures/admin-assets-load-test/")
      ? "load_test"
      : "uploaded",
  } satisfies AdminMediaAssetListItem;
}

async function getBodyUsageSummary(publicUrl: string) {
  if (!publicUrl) {
    return {
      count: 0,
      posts: [],
    };
  }

  const where = {
    OR: [
      {
        currentRevision: {
          is: {
            markdownBody: {
              contains: publicUrl,
            },
          },
        },
      },
      {
        publishedRevision: {
          is: {
            markdownBody: {
              contains: publicUrl,
            },
          },
        },
      },
    ],
  } satisfies Prisma.PostWhereInput;

  const [count, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        categoryRoot: true,
        categoryLeaf: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    }),
  ]);

  return {
    count,
    posts: posts.map(toUsagePost),
  };
}

async function toMediaAssetListItems(
  assets: Array<{
    id: string;
    publicUrl: string | null;
    objectKey: string;
    bucketName: string;
    mimeType: string;
    altText: string | null;
    fileSizeBytes: bigint | null;
    createdAt: Date;
    uploadedBy: {
      email: string;
      displayName: string | null;
    } | null;
    thumbnailsForPosts: {
      id: string;
      title: string;
      slug: string;
      status: { toLowerCase(): string } | string;
      categoryRoot: { toLowerCase(): string } | string;
      categoryLeaf: { toLowerCase(): string } | string;
    }[];
    _count?: {
      thumbnailsForPosts: number;
    };
  }>,
) {
  const bodyUsageSummaries = await Promise.all(
    assets.map((asset) => getBodyUsageSummary(asset.publicUrl ?? "")),
  );

  return assets.map((asset, index) =>
    toMediaAssetListItem({
      ...asset,
      bodyPosts: bodyUsageSummaries[index]?.posts ?? [],
      bodyUsageCount: bodyUsageSummaries[index]?.count ?? 0,
    }),
  );
}

export async function getAdminMediaAssetById(id: string) {
  const asset = await prisma.mediaAsset.findUnique({
    where: {
      id,
    },
    include: {
      uploadedBy: {
        select: {
          email: true,
          displayName: true,
        },
      },
      thumbnailsForPosts: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          categoryRoot: true,
          categoryLeaf: true,
        },
        take: 5,
      },
      _count: {
        select: {
          thumbnailsForPosts: true,
        },
      },
    },
  });

  if (!asset) {
    return null;
  }

  const [item] = await toMediaAssetListItems([asset]);

  return item ?? null;
}

export async function getAdminMediaAssetPage(input: {
  filters?: AdminMediaAssetFilters;
  page?: number;
  pageSize?: number;
  sort?: AdminMediaAssetSort;
}) {
  const filters = input.filters ?? {};
  const pageSize = Math.max(1, input.pageSize ?? 24);
  const currentPage = Math.max(1, input.page ?? 1);
  const where = buildMediaAssetWhere(filters);
  const orderBy = buildMediaAssetOrderBy(input.sort);
  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy,
    include: {
      uploadedBy: {
        select: {
          email: true,
          displayName: true,
        },
      },
      thumbnailsForPosts: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          categoryRoot: true,
          categoryLeaf: true,
        },
        take: 10,
      },
      _count: {
        select: {
          thumbnailsForPosts: true,
        },
      },
    },
  });

  const listItems = await toMediaAssetListItems(assets);
  const filteredItems = filters.usage
    ? listItems.filter((asset) => matchesUsageFilter(asset, filters.usage))
    : listItems;
  const totalCount = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return {
    items: pagedItems,
    totalCount,
    currentPage: safePage,
    totalPages,
  } satisfies AdminMediaAssetPage;
}

export async function getRecentAdminMediaAssets(input?: {
  limit?: number;
  kind?: "uploaded" | "load_test";
  sort?: AdminMediaAssetSort;
}) {
  const limit = Math.max(1, input?.limit ?? 18);
  const where = buildMediaAssetWhere({
    kind: input?.kind,
  });
  const orderBy = buildMediaAssetOrderBy(input?.sort);

  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy,
    take: limit,
    include: {
      uploadedBy: {
        select: {
          email: true,
          displayName: true,
        },
      },
      thumbnailsForPosts: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          categoryRoot: true,
          categoryLeaf: true,
        },
        take: 10,
      },
      _count: {
        select: {
          thumbnailsForPosts: true,
        },
      },
    },
  });

  return toMediaAssetListItems(assets);
}

export async function getAdminMediaAssetDashboardStats() {
  const [totalAssets, latestAsset, assetsWithAltText, aggregate] = await Promise.all(
    [
      prisma.mediaAsset.count(),
      prisma.mediaAsset.findFirst({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.mediaAsset.count({
        where: {
          altText: {
            not: null,
          },
        },
      }),
      prisma.mediaAsset.aggregate({
        _sum: {
          fileSizeBytes: true,
        },
      }),
    ],
  );

  return {
    totalAssets,
    totalStorage: formatBytes(aggregate._sum.fileSizeBytes),
    latestUploadedAt:
      latestAsset?.createdAt.toISOString().slice(0, 16).replace("T", " ") ?? "-",
    assetsWithAltText,
  } satisfies AdminMediaAssetDashboardStats;
}

export async function getAdminMediaAssetMimeTypes() {
  const mimeTypes = await prisma.mediaAsset.findMany({
    distinct: ["mimeType"],
    select: {
      mimeType: true,
    },
    orderBy: {
      mimeType: "asc",
    },
  });

  return mimeTypes.map((entry) => entry.mimeType);
}

export async function getAdminMediaAssetKindStats() {
  const [uploadedAssets, loadTestAssets] = await Promise.all([
    prisma.mediaAsset.count({
      where: {
        NOT: {
          objectKey: {
            startsWith: "fixtures/admin-assets-load-test/",
          },
        },
      },
    }),
    prisma.mediaAsset.count({
      where: {
        objectKey: {
          startsWith: "fixtures/admin-assets-load-test/",
        },
      },
    }),
  ]);

  return {
    uploadedAssets,
    loadTestAssets,
  };
}

export async function updateAdminMediaAssetAltText(input: {
  id: string;
  altText: string;
}) {
  const asset = await prisma.mediaAsset.update({
    where: {
      id: input.id,
    },
    data: {
      altText: input.altText.trim() || null,
    },
    include: {
      uploadedBy: {
        select: {
          email: true,
          displayName: true,
        },
      },
      thumbnailsForPosts: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          categoryRoot: true,
          categoryLeaf: true,
        },
        take: 5,
      },
      _count: {
        select: {
          thumbnailsForPosts: true,
        },
      },
    },
  });

  const [item] = await toMediaAssetListItems([asset]);

  return item;
}

export async function deleteAdminMediaAsset(id: string) {
  const asset = await getAdminMediaAssetById(id);

  if (!asset) {
    throw new Error("자산을 찾을 수 없습니다.");
  }

  if (asset.thumbnailUsageCount > 0 || asset.bodyUsageCount > 0) {
    throw new Error(
      `사용 중인 자산은 삭제할 수 없습니다. 썸네일 ${asset.thumbnailUsageCount}건, 본문 ${asset.bodyUsageCount}건에서 사용 중입니다.`,
    );
  }

  await deleteImageFromS3({
    bucket: asset.bucketName,
    objectKey: asset.objectKey,
  });

  await prisma.mediaAsset.delete({
    where: {
      id,
    },
  });

  return {
    id: asset.id,
  };
}

export async function deleteUnusedAdminMediaAssets(input?: {
  filters?: AdminMediaAssetFilterInput;
}) {
  const filters = input?.filters ?? {};
  const where = buildMediaAssetWhere(filters);

  const assets = await prisma.mediaAsset.findMany({
    where,
    include: {
      uploadedBy: {
        select: {
          email: true,
          displayName: true,
        },
      },
      thumbnailsForPosts: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          categoryRoot: true,
          categoryLeaf: true,
        },
        take: 10,
      },
      _count: {
        select: {
          thumbnailsForPosts: true,
        },
      },
    },
  });

  const listItems = await toMediaAssetListItems(assets);
  const unusedAssets = listItems.filter((asset) =>
    matchesUsageFilter(asset, "unused"),
  );

  let deletedCount = 0;
  const failedAssetIds: string[] = [];

  for (const asset of unusedAssets) {
    try {
      await deleteImageFromS3({
        bucket: asset.bucketName,
        objectKey: asset.objectKey,
      });

      await prisma.mediaAsset.delete({
        where: {
          id: asset.id,
        },
      });

      deletedCount += 1;
    } catch {
      failedAssetIds.push(asset.id);
    }
  }

  return {
    matchedCount: unusedAssets.length,
    deletedCount,
    failedCount: failedAssetIds.length,
    failedAssetIds,
  };
}
