import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { SectionTitle } from "@/components/section-title";
import { getPostsByTag, getTagCounts } from "@/lib/posts";

type TagsPageProps = {
  searchParams: Promise<{
    tag?: string;
  }>;
};

export const metadata: Metadata = {
  title: "DYCDYP",
  description: "dycdyp 공개 글의 태그별 탐색 페이지입니다.",
  alternates: {
    canonical: "/tags",
  },
};

export default async function TagsPage({ searchParams }: TagsPageProps) {
  const [{ tag }, tags] = await Promise.all([searchParams, getTagCounts()]);
  const selectedTag = tag?.trim() ?? "";
  const selectedPosts = selectedTag ? await getPostsByTag(selectedTag) : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <SectionTitle
        eyebrow="Tags"
        title={
          selectedTag
            ? `#${selectedTag} 태그로 묶인 글`
            : ""
        }
        description={
          selectedTag
            ? `${selectedPosts.length}개의 공개 글이 이 태그와 연결되어 있습니다.`
            : "관심있는 태그를 선택하세요."
        }
      />

      <div className="mt-10 flex flex-wrap gap-3">
        {tags.map((item) => {
          const active = selectedTag.toLowerCase() === item.tag.toLowerCase();

          return (
            <Link
              key={item.tag}
              href={`/tags?tag=${encodeURIComponent(item.tag)}`}
              className={`rounded-full border px-4 py-2 text-sm shadow-[0_12px_30px_-25px_rgba(0,0,0,0.35)] transition ${
                active
                  ? "border-stone-950 bg-stone-950 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
              }`}
            >
              #{item.tag}{" "}
              <span className={active ? "text-stone-300" : "text-stone-400"}>
                ({item.count})
              </span>
            </Link>
          );
        })}
      </div>

      {selectedTag ? (
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-stone-500">
              #{selectedTag}와 연결된 글 {selectedPosts.length}개
            </p>
            <Link
              href="/tags"
              className="text-sm text-stone-500 transition hover:text-stone-900"
            >
              태그 선택 초기화
            </Link>
          </div>

          {selectedPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {selectedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-sm text-stone-600">
              이 태그에 연결된 공개 글이 아직 없습니다.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10 rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-sm leading-7 text-stone-600">
          태그를 하나 고르면 해당 주제와 연결된 공개 글만 모아서 볼 수 있습니다.
        </div>
      )}
    </div>
  );
}
