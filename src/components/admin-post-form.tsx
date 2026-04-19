import type { ReactNode } from "react";

import type { AdminRoleKey } from "@/lib/admin-permissions";
import { categoryDefinitions } from "@/lib/content";
import type { AdminMediaAssetPage } from "@/lib/media-assets";
import type { AdminPostEditor } from "@/lib/admin-posts";
import { AdminThumbnailUpload } from "@/components/admin-thumbnail-upload";
import { CollapsibleCard } from "@/components/collapsible-card";
import { TiptapMarkdownEditor } from "@/components/tiptap-markdown-editor";

type AdminPostFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  post: AdminPostEditor;
  sidebarTop?: ReactNode;
  role: AdminRoleKey;
  submitLabel: string;
  availableAssetPage: AdminMediaAssetPage;
};

const categoryOptions = categoryDefinitions.flatMap((category) =>
  category.leaves.map((leaf) => ({
    value: `${category.root}/${leaf.slug}`,
    label: `${category.label} / ${leaf.label}`,
  })),
);

export function AdminPostForm({
  action,
  post,
  sidebarTop,
  role,
  submitLabel,
  availableAssetPage,
}: AdminPostFormProps) {
  return (
    <div className="space-y-6">
      {sidebarTop}
      <form action={action} className="space-y-6">
        <input type="hidden" name="id" value={post.id} />

        <CollapsibleCard id="basic-info" title="기본 정보">
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm text-stone-300">제목</span>
              <input
                type="text"
                name="title"
                defaultValue={post.title}
                required
                className="admin-select w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-stone-300">슬러그</span>
              <input
                type="text"
                name="slug"
                defaultValue={post.slug}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-stone-300">요약</span>
              <textarea
                name="excerpt"
                defaultValue={post.excerpt}
                rows={4}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300"
              />
            </label>
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          id="markdown-editor"
          title="Markdown 본문"
          description={
            <>
              Tiptap으로 편집하되 저장 포맷은 Markdown으로 유지합니다. 현재
              툴바는 기본 서식, 제목, 리스트, 인용, 코드 블록 중심의 최소
              구성을 제공하며, 아래에서 공개 화면 기준 미리보기를 바로 확인할
              수 있습니다.
            </>
          }
        >
          <TiptapMarkdownEditor
            name="markdownBody"
            initialMarkdown={post.markdownBody}
            availableAssetPage={availableAssetPage}
          />
        </CollapsibleCard>

        <CollapsibleCard id="publish-settings" title="게시 설정">
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm text-stone-300">카테고리</span>
              <select
                name="categoryPair"
                defaultValue={`${post.categoryRoot}/${post.categoryLeaf}`}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-sm text-stone-300">현재 상태</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                  {post.status}
                </span>
                {post.approvedAt ? (
                  <span className="text-xs text-stone-400">
                    승인: {post.approvedAt}
                  </span>
                ) : null}
                {post.publishedAt ? (
                  <span className="text-xs text-stone-400">
                    게시: {post.publishedAt}
                  </span>
                ) : null}
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm text-stone-300">읽기 시간</span>
              <input
                type="number"
                min="1"
                name="readingTimeMinutes"
                defaultValue={post.readingTimeMinutes}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-stone-300">태그</span>
              <input
                type="text"
                name="tags"
                defaultValue={post.tags.join(", ")}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300"
                placeholder="태그1, 태그2, 태그3"
              />
            </label>
            <AdminThumbnailUpload
              initialAssetId={post.thumbnailAssetId}
              initialUrl={post.thumbnailUrl}
              availableAssetPage={availableAssetPage}
            />
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          id="admin-note"
          title="안내"
          tone="warning"
          description={
            <span className="text-amber-100">
              현재 로그인 역할은 {role}입니다.
              <br />
              editor는 저장과 검토 요청까지, admin은 승인/게시/삭제/export까지
              가능합니다.
            </span>
          }
        >
          <div className="text-sm leading-7 text-amber-100">
            현재 구조는 MVP 검증을 위한 운영 골격입니다. 실제 운영 전에는 권한
            체계, 승인 규칙, 감사 로그 정책을 함께 보강하는 것을 권장합니다.
          </div>
        </CollapsibleCard>

        <button
          type="submit"
          className="w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-200"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
