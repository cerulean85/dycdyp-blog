import { savePostAction } from "@/app/admin/actions";
import { AdminPostForm } from "@/components/admin-post-form";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAdminMediaAssetPage } from "@/lib/media-assets";
import { getEmptyAdminPost } from "@/lib/admin-posts";

export default async function NewAdminPostPage() {
  const [session, availableAssetPage] = await Promise.all([
    requireAdminSession(),
    getAdminMediaAssetPage({
      filters: {
        kind: "uploaded",
      },
      page: 1,
      pageSize: 12,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-stone-300/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-400">
          New Post
        </p>
        <h2 className="mt-3 font-serif text-4xl text-stone-950 dark:text-white">새 게시물</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300">
          새 초안을 만들고 메타데이터, 본문, 썸네일까지 같은 편집 흐름 안에서
          바로 구성합니다.
        </p>
      </div>
      <AdminPostForm
        action={savePostAction}
        post={getEmptyAdminPost()}
        role={session.role}
        submitLabel="게시물 저장"
        availableAssetPage={availableAssetPage}
      />
    </div>
  );
}
