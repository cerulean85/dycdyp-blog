import Link from "next/link";

import { SectionTitle } from "@/components/section-title";
import { getArchiveGroups } from "@/lib/posts";

export default async function ArchivePage() {
  const groups = await getArchiveGroups();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <SectionTitle
        eyebrow="Archive"
        title=""
        description="시간 순서로 정리된 글 모음입니다."
      />
      <div className="mt-10 space-y-8">
        {groups.map((group) => (
          <section
            key={group.month}
            className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.35)]"
          >
            <h2 className="font-serif text-3xl text-stone-950">{group.month}</h2>
            <ul className="mt-6 space-y-4">
              {group.posts.map((post) => (
                <li
                  key={post.slug}
                  className="flex flex-col gap-2 border-t border-stone-200 pt-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      href={`/category/${post.categoryRoot}/${post.categoryLeaf}/${post.slug}`}
                      className="font-medium text-stone-900 hover:text-stone-700"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 text-sm text-stone-500">
                      {post.categoryRoot} / {post.categoryLeaf}
                    </p>
                  </div>
                  <span className="text-sm text-stone-500">{post.publishedAt}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
