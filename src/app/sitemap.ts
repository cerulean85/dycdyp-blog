import type { MetadataRoute } from "next";

import { categoryDefinitions } from "@/lib/content";
import { getPublishedPostPaths } from "@/lib/posts";
import { absoluteUrl, siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const postPaths = await getPublishedPostPaths();
  const staticRoutes = [
    "/",
    "/about",
    "/category",
    "/search",
    "/archive",
    "/tags",
  ];

  const categoryRoutes = categoryDefinitions.flatMap((category) => [
    `/category/${category.root}`,
    ...category.leaves.map((leaf) => `/category/${category.root}/${leaf.slug}`),
  ]);

  const entries = [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: new Date(),
    })),
    ...categoryRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: new Date(),
    })),
    ...postPaths.map((post) => ({
      url: absoluteUrl(
        `/category/${post.category}/${post.subcategory}/${post.slug}`,
      ),
      lastModified: new Date(),
    })),
  ];

  return entries.map((entry) => ({
    ...entry,
    changeFrequency: "weekly",
    priority: entry.url === siteConfig.siteUrl ? 1 : 0.7,
  }));
}
