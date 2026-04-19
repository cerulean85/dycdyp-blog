import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GiscusComments } from "@/components/giscus-comments";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { NewsletterCta } from "@/components/newsletter-cta";
import { PublicBreadcrumbs } from "@/components/public-breadcrumbs";
import { isCategoryLeaf, isCategoryRoot } from "@/lib/content";
import {
  getPostBySlug,
  getPostReadingContext,
  getPublishedPostPaths,
  type PostReadingContext,
} from "@/lib/posts";
import { absoluteUrl, siteConfig } from "@/lib/site";

type PostPageProps = {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getPublishedPostPaths();
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { category, subcategory, slug } = await params;

  if (!isCategoryRoot(category) || !isCategoryLeaf(category, subcategory)) {
    return {};
  }

  const post = await getPostBySlug(category, subcategory, slug);

  if (!post) {
    return {};
  }

  const canonicalPath = `/category/${category}/${subcategory}/${slug}`;
  const ogImagePath = `${canonicalPath}/opengraph-image`;

  return {
    title: "DYCDYP",
    description: post.excerpt,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(canonicalPath),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      tags: post.tags,
      images: [
        {
          url: absoluteUrl(ogImagePath),
          width: 1200,
          height: 630,
          alt: `${post.title} 공유 이미지`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [absoluteUrl(ogImagePath)],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { category, subcategory, slug } = await params;

  if (!isCategoryRoot(category) || !isCategoryLeaf(category, subcategory)) {
    notFound();
  }

  const [post, readingContext] = await Promise.all([
    getPostBySlug(category, subcategory, slug),
    getPostReadingContext(category, subcategory, slug),
  ]);

  if (!post) {
    notFound();
  }

  const headings = extractMarkdownHeadings(post.markdownBody);
  const canonicalPath = `/category/${category}/${subcategory}/${slug}`;
  const articleStructuredData = buildArticleStructuredData({
    post,
    canonicalPath,
  });
  const breadcrumbStructuredData = buildBreadcrumbStructuredData({
    category,
    subcategory,
    title: post.title,
    canonicalPath,
  });

  return (
    <article className="mx-auto w-full max-w-6xl px-5 py-12 md:px-6 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <PublicBreadcrumbs
            items={[
              { label: "홈", href: "/" },
              { label: "카테고리", href: "/category" },
              { label: post.categoryRoot, href: `/category/${post.categoryRoot}` },
              {
                label: post.categoryLeaf,
                href: `/category/${post.categoryRoot}/${post.categoryLeaf}`,
              },
              { label: post.title },
            ]}
            className="mb-5 md:mb-6"
          />
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.35)] md:rounded-[2.25rem] md:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
              {post.categoryRoot} / {post.categoryLeaf}
            </p>
            <h1 className="mt-4 font-serif text-[2.35rem] leading-tight text-stone-950 md:mt-5 md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-500 md:mt-6 md:gap-4">
              <span>{post.publishedAt}</span>
              <span>{post.readingTimeMinutes}분 읽기</span>
            </div>
            <p className="mt-6 text-base leading-8 text-stone-700 md:mt-8 md:text-lg md:leading-9">
              {post.excerpt}
            </p>
            <div className="mt-8 rounded-[1.5rem] bg-stone-100 p-5 md:mt-10 md:rounded-[1.75rem] md:p-6">
              <MarkdownRenderer markdown={post.markdownBody} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2 md:mt-8">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags?tag=${encodeURIComponent(tag)}`}
                  className="public-soft-panel rounded-full border px-3 py-1 text-[11px] text-stone-800 transition hover:bg-stone-200 md:text-xs"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2">
            <ReadingNavCard label="이전 글" post={readingContext.previousPost} />
            <ReadingNavCard label="다음 글" post={readingContext.nextPost} />
          </div>

          {readingContext.relatedPosts.length ? (
            <section className="mt-8">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
                  Related
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-tight text-stone-950">
                  함께 읽으면 좋은 글
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  같은 카테고리와 태그 흐름을 기준으로 이어 읽기 좋은 글을 골랐습니다.
                </p>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.18)] md:mt-6 md:rounded-[1.75rem] md:p-6">
                {readingContext.relatedPosts.map((relatedPost) => (
                  <RelatedPostListItem key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-8 md:mt-10">
            <NewsletterCta compact />
          </div>
          <GiscusComments term={post.id} />
        </div>

        <aside className="xl:sticky xl:top-8 xl:self-start">
          <div className="hidden rounded-[1.75rem] border border-black/10 bg-stone-50 p-6 xl:block">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
              On This Page
            </p>
            <h2 className="mt-3 font-serif text-2xl text-stone-950">목차</h2>
            {headings.length ? (
              <ul className="mt-4 space-y-3">
                {headings.map((heading) => (
                  <li
                    key={heading.id}
                    className={heading.level === 3 ? "pl-4" : undefined}
                  >
                    <a
                      href={`#${heading.id}`}
                      className="text-sm leading-6 text-stone-600 transition hover:text-stone-950"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-7 text-stone-500">
                제목형 섹션이 아직 없어 목차를 만들지 않았습니다.
              </p>
            )}

            <div className="mt-6 border-t border-black/10 pt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                Quick Facts
              </p>
              <div className="mt-3 space-y-2 text-sm text-stone-600">
                <p>{post.publishedAt}</p>
                <p>{post.readingTimeMinutes}분 읽기</p>
                <p>
                  {post.categoryRoot} / {post.categoryLeaf}
                </p>
              </div>
            </div>
          </div>

          <details className="rounded-[1.5rem] border border-black/10 bg-stone-50 xl:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone-500">
                  On This Page
                </p>
                <p className="mt-1 text-sm text-stone-700">목차와 빠른 정보 보기</p>
              </div>
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-stone-600"
              >
                ↓
              </span>
            </summary>
            <div className="border-t border-black/10 px-5 py-5">
              {headings.length ? (
                <ul className="space-y-3">
                  {headings.map((heading) => (
                    <li
                      key={heading.id}
                      className={heading.level === 3 ? "pl-4" : undefined}
                    >
                      <a
                        href={`#${heading.id}`}
                        className="text-sm leading-6 text-stone-600 transition hover:text-stone-950"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-7 text-stone-500">
                  제목형 섹션이 아직 없어 목차를 만들지 않았습니다.
                </p>
              )}

              <div className="mt-5 border-t border-black/10 pt-5">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Quick Facts
                </p>
                <div className="mt-3 space-y-2 text-sm text-stone-600">
                  <p>{post.publishedAt}</p>
                  <p>{post.readingTimeMinutes}분 읽기</p>
                  <p>
                    {post.categoryRoot} / {post.categoryLeaf}
                  </p>
                </div>
              </div>
            </div>
          </details>
        </aside>
      </div>
    </article>
  );
}

function buildArticleStructuredData(input: {
  post: Awaited<ReturnType<typeof getPostBySlug>>;
  canonicalPath: string;
}) {
  const post = input.post;

  if (!post) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: absoluteUrl(input.canonicalPath),
    articleSection: [post.categoryRoot, post.categoryLeaf],
    keywords: post.tags.join(", "),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/opengraph-image"),
      },
    },
    image: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
  };
}

function buildBreadcrumbStructuredData(input: {
  category: string;
  subcategory: string;
  title: string;
  canonicalPath: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "카테고리",
        item: absoluteUrl("/category"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: input.category,
        item: absoluteUrl(`/category/${input.category}`),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: input.subcategory,
        item: absoluteUrl(`/category/${input.category}/${input.subcategory}`),
      },
      {
        "@type": "ListItem",
        position: 5,
        name: input.title,
        item: absoluteUrl(input.canonicalPath),
      },
    ],
  };
}

function slugifyHeading(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_#[\]()]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

function extractMarkdownHeadings(markdown: string) {
  const usedIds = new Map<string, number>();

  return markdown
    .split(/\r?\n/)
    .map((line) => {
      const match = /^(##|###)\s+(.+)$/.exec(line.trim());

      if (!match) {
        return null;
      }

      const level = match[1] === "##" ? 2 : 3;
      const text = match[2].trim();
      const baseId = slugifyHeading(text) || `section-${level}`;
      const duplicateCount = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, duplicateCount + 1);

      return {
        level,
        text,
        id: duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`,
      };
    })
    .filter((heading): heading is { level: 2 | 3; text: string; id: string } =>
      Boolean(heading),
    );
}

type ReadingNavCardProps = {
  label: string;
  post: PostReadingContext["previousPost"];
};

function ReadingNavCard({ label, post }: ReadingNavCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.2)] md:rounded-[1.75rem] md:p-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
        {label}
      </p>
      {post ? (
        <>
          <h2 className="mt-2.5 font-serif text-[1.65rem] leading-tight text-stone-950 md:mt-3 md:text-2xl">
            <Link
              href={`/category/${post.categoryRoot}/${post.categoryLeaf}/${post.slug}`}
              className="hover:text-stone-700"
            >
              {post.title}
            </Link>
          </h2>
          <p className="mt-2.5 text-sm leading-6 text-stone-600 md:mt-3 md:leading-7">
            {post.excerpt}
          </p>
        </>
      ) : (
        <p className="mt-2.5 text-sm leading-6 text-stone-500 md:mt-3 md:leading-7">
          이어서 보여줄 글이 아직 없습니다.
        </p>
      )}
    </div>
  );
}

type RelatedPostListItemProps = {
  post: PostReadingContext["relatedPosts"][number];
};

function RelatedPostListItem({ post }: RelatedPostListItemProps) {
  return (
    <article className="border-b border-black/10 py-4 first:pt-0 last:border-b-0 last:pb-0 md:py-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 md:text-xs md:tracking-[0.22em]">
        {post.categoryRoot} / {post.categoryLeaf}
        <span className="mx-2 text-stone-300">•</span>
        {post.publishedAt}
      </p>
      <h3 className="mt-2.5 font-serif text-[1.55rem] leading-tight text-stone-950 md:mt-3 md:text-2xl">
        <Link
          href={`/category/${post.categoryRoot}/${post.categoryLeaf}/${post.slug}`}
          className="transition hover:text-stone-700"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-stone-600 md:leading-7">
        {post.excerpt}
      </p>
    </article>
  );
}
