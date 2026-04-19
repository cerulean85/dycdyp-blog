import { Prisma } from "@prisma/client";

import { validateNewsletterEmail } from "@/lib/newsletter-rules";
import { prisma } from "@/lib/prisma";

export type NewsletterSubscriberListItem = {
  id: string;
  email: string;
  source: string;
  status: "active" | "blocked";
  blockedAt: string | null;
  blockedReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewsletterDashboardStats = {
  totalSubscribers: number;
  subscribersLast7Days: number;
  latestSource: string;
  latestSignupAt: string;
};

type NewsletterSubscriberFilters = {
  query?: string;
  source?: string;
  status?: "active" | "blocked";
  sort?: "created_desc" | "created_asc" | "email_asc" | "email_desc";
};

export type NewsletterSubscriberPage = {
  items: NewsletterSubscriberListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

function toSubscriberListItem(subscriber: {
  id: string;
  email: string;
  source: string;
  blockedAt: Date | null;
  blockedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: subscriber.id,
    email: subscriber.email,
    source: subscriber.source,
    status: subscriber.blockedAt ? "blocked" : "active",
    blockedAt: subscriber.blockedAt
      ? subscriber.blockedAt.toISOString().slice(0, 16).replace("T", " ")
      : null,
    blockedReason: subscriber.blockedReason,
    createdAt: subscriber.createdAt.toISOString().slice(0, 16).replace("T", " "),
    updatedAt: subscriber.updatedAt.toISOString().slice(0, 16).replace("T", " "),
  } satisfies NewsletterSubscriberListItem;
}

function buildNewsletterSubscriberWhere(
  filters: NewsletterSubscriberFilters = {},
): Prisma.NewsletterSubscriberWhereInput {
  const query = filters.query?.trim();
  const source = filters.source?.trim();

  return {
    ...(query
      ? {
          email: {
            contains: query,
            mode: "insensitive",
          },
        }
      : {}),
    ...(source ? { source } : {}),
    ...(filters.status === "active"
      ? {
          blockedAt: null,
        }
      : {}),
    ...(filters.status === "blocked"
      ? {
          blockedAt: {
            not: null,
          },
        }
      : {}),
  };
}

function buildNewsletterSubscriberOrderBy(
  sort: NewsletterSubscriberFilters["sort"],
):
  | Prisma.NewsletterSubscriberOrderByWithRelationInput
  | Prisma.NewsletterSubscriberOrderByWithRelationInput[] {
  switch (sort) {
    case "created_asc":
      return {
        createdAt: "asc",
      };
    case "email_asc":
      return {
        email: "asc",
      };
    case "email_desc":
      return {
        email: "desc",
      };
    case "created_desc":
    default:
      return {
        createdAt: "desc",
      };
  }
}

export async function getNewsletterSubscribers(filters: NewsletterSubscriberFilters = {}) {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: buildNewsletterSubscriberWhere(filters),
    orderBy: buildNewsletterSubscriberOrderBy(filters.sort),
  });

  return subscribers.map(toSubscriberListItem);
}

export async function getNewsletterSubscriberPage(input: {
  filters?: NewsletterSubscriberFilters;
  page?: number;
  pageSize?: number;
}) {
  const filters = input.filters ?? {};
  const pageSize = Math.max(1, input.pageSize ?? 20);
  const currentPage = Math.max(1, input.page ?? 1);
  const where = buildNewsletterSubscriberWhere(filters);
  const totalCount = await prisma.newsletterSubscriber.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where,
    orderBy: buildNewsletterSubscriberOrderBy(filters.sort),
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  });

  return {
    items: subscribers.map(toSubscriberListItem),
    totalCount,
    currentPage: safePage,
    totalPages,
  } satisfies NewsletterSubscriberPage;
}

export async function getNewsletterSources() {
  const sources = await prisma.newsletterSubscriber.findMany({
    distinct: ["source"],
    select: {
      source: true,
    },
    orderBy: {
      source: "asc",
    },
  });

  return sources.map((entry) => entry.source);
}

export async function getNewsletterSubscriberCount() {
  return prisma.newsletterSubscriber.count();
}

export async function getNewsletterDashboardStats() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalSubscribers, subscribersLast7Days, latestSubscriber] =
    await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.newsletterSubscriber.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

  return {
    totalSubscribers,
    subscribersLast7Days,
    latestSource: latestSubscriber?.source ?? "-",
    latestSignupAt:
      latestSubscriber?.createdAt.toISOString().slice(0, 16).replace("T", " ") ??
      "-",
  } satisfies NewsletterDashboardStats;
}

export async function blockNewsletterSubscriber(input: {
  id: string;
  reason?: string;
}) {
  await prisma.newsletterSubscriber.update({
    where: {
      id: input.id,
    },
    data: {
      blockedAt: new Date(),
      blockedReason: input.reason?.trim() || "관리자 차단",
    },
  });
}

export async function unblockNewsletterSubscriber(id: string) {
  await prisma.newsletterSubscriber.update({
    where: {
      id,
    },
    data: {
      blockedAt: null,
      blockedReason: null,
    },
  });
}

export async function deleteNewsletterSubscriber(id: string) {
  await prisma.newsletterSubscriber.delete({
    where: {
      id,
    },
  });
}

export async function subscribeToNewsletter(input: {
  email: string;
  source?: string;
}) {
  const validation = validateNewsletterEmail(input.email);

  if (!validation.ok) {
    return {
      ok: false as const,
      code: "invalid_email" as const,
    };
  }

  const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
    where: {
      email: validation.normalizedEmail,
    },
    select: {
      id: true,
      blockedAt: true,
    },
  });

  if (existingSubscriber?.blockedAt) {
    return {
      ok: false as const,
      code: "blocked" as const,
    };
  }

  if (existingSubscriber) {
    return {
      ok: true as const,
      code: "already_subscribed" as const,
    };
  }

  try {
    await prisma.newsletterSubscriber.create({
      data: {
        email: validation.normalizedEmail,
        source: input.source ?? "site_newsletter",
      },
    });

    return {
      ok: true as const,
      code: "subscribed" as const,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: true as const,
        code: "already_subscribed" as const,
      };
    }

    throw error;
  }
}
