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
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-400">
          New Post
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">새 게시물</h2>
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
