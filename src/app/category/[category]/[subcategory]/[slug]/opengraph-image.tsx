import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import {
  getCategoryDefinition,
  isCategoryLeaf,
  isCategoryRoot,
} from "@/lib/content";
import { getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type OgImageProps = {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
  }>;
};

export default async function PostOpenGraphImage({ params }: OgImageProps) {
  const { category, subcategory, slug } = await params;

  if (!isCategoryRoot(category) || !isCategoryLeaf(category, subcategory)) {
    notFound();
  }

  const post = await getPostBySlug(category, subcategory, slug);

  if (!post) {
    notFound();
  }

  const categoryDefinition = getCategoryDefinition(post.categoryRoot);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(145deg, #111827 0%, #1f2937 38%, #0f766e 100%)",
          color: "#f5f5f4",
          padding: "64px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 24,
              color: "#d6d3d1",
            }}
          >
            <span
              style={{
                display: "flex",
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#f5f5f4",
              }}
            >
              {categoryDefinition?.label ?? post.categoryRoot}
            </span>
            <span>{post.categoryLeaf}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              maxWidth: 980,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
              }}
            >
              {post.title}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.45,
                color: "#d6d3d1",
              }}
            >
              {post.excerpt}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: 22,
              color: "#e7e5e4",
            }}
          >
            <span>{post.publishedAt}</span>
            <span>•</span>
            <span>{post.readingTimeMinutes}분 읽기</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#d6d3d1",
            }}
          >
            {siteConfig.name}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
