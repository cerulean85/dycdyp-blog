import { notFound } from "next/navigation";

import {
  savePostAction,
  transitionPostStatusAction,
} from "@/app/admin/actions";
import { AdminPostForm } from "@/components/admin-post-form";
import { CollapseToggleChip } from "@/components/collapse-toggle-chip";
import { CollapsibleCard } from "@/components/collapsible-card";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAdminMediaAssetPage } from "@/lib/media-assets";
import { canManagePublishing, canTransitionWorkflowAction } from "@/lib/admin-permissions";
import type { AdminPublishEvent } from "@/lib/admin-posts";
import { getAdminPostById } from "@/lib/admin-posts";

type EditAdminPostPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    saved?: string;
    workflow?: string;
    workflowError?: string;
  }>;
};

export default async function EditAdminPostPage({
  params,
  searchParams,
}: EditAdminPostPageProps) {
  const [session, { id }, { saved, workflow, workflowError }] = await Promise.all([
    requireAdminSession(),
    params,
    searchParams,
  ]);
  const [post, availableAssetPage] = await Promise.all([
    getAdminPostById(id),
    getAdminMediaAssetPage({
      filters: {
        kind: "uploaded",
      },
      page: 1,
      pageSize: 12,
    }),
  ]);

  if (!post) {
    notFound();
  }

  const statusCopy = {
    draft: "초안",
    review: "검토 중",
    approved: "승인됨",
    published: "게시됨",
  } as const;

  const statusDescription = {
    draft: "아직 공개되지 않은 초안입니다. 검토 요청을 보내면 리뷰 단계로 넘어갑니다.",
    review:
      "검토 중인 글입니다. 내용 확인이 끝나면 승인해서 게시 준비 상태로 올릴 수 있습니다.",
    approved:
      "승인된 글입니다. 바로 게시하거나, 다시 검토 단계로 돌려 추가 확인을 진행할 수 있습니다.",
    published:
      "현재 공개 중인 글입니다. 게시를 해제하거나, 다시 검토 단계로 돌려 수정 흐름을 이어갈 수 있습니다.",
  } as const;

  const workflowButtonCopy = {
    submit_for_review: "검토 요청",
    approve: "승인",
    publish: "게시",
    unpublish: "게시 해제",
  } as const;

  const isReviewActive = post.status === "review";
  const isApprovedActive = post.status === "approved";
  const isPublishedActive = post.status === "published";

  const workflowButtonsByStatus = {
    draft: ["submit_for_review"],
    review: ["approve"],
    approved: ["submit_for_review", "publish"],
    published: ["submit_for_review", "approve", "unpublish"],
  } as const satisfies Record<
    keyof typeof statusCopy,
    readonly ("submit_for_review" | "approve" | "publish" | "unpublish")[]
  >;

  const visibleWorkflowButtons = workflowButtonsByStatus[post.status].filter((action) =>
    canTransitionWorkflowAction({
      role: session.role,
      action,
    }),
  );
  const eventCopy = {
    created: "생성",
    submitted_for_review: "검토 요청",
    approved: "승인",
    published: "게시",
    unpublished: "게시 해제",
  } as const;
  const recentEvents = post.publishEvents.slice(0, 3);
  const olderEvents = post.publishEvents.slice(3);
  const releaseBadge = post.hasUnpublishedChanges
    ? "미게시 변경사항 있음"
    : post.hasPublishedVersion
      ? "공개본과 동기화됨"
      : "아직 공개본 없음";
  const currentSnapshot = {
    title: post.title,
    excerpt: post.excerpt,
    category: `${post.categoryRoot} / ${post.categoryLeaf}`,
    readingTime: `${post.readingTimeMinutes}분`,
    tags: post.tags.length ? post.tags.join(", ") : "태그 없음",
  };
  const publishedSnapshot = {
    title: post.publishedRevisionTitle || "아직 공개본 없음",
    excerpt: post.publishedRevisionExcerpt || "공개된 요약이 없습니다.",
  };
  const markdownDiff = getMarkdownDiffSummary(
    post.markdownBody,
    post.publishedMarkdownBody,
  );

  function renderHistoryEvent(event: AdminPublishEvent) {
    return (
      <div
        key={event.id}
        className="rounded-[1.5rem] border border-stone-300/70 bg-white px-4 py-4 dark:border-white/10 dark:bg-black/20"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-stone-300/70 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
            {eventCopy[event.eventType]}
          </span>
          <span className="text-xs text-stone-400">{event.createdAt}</span>
        </div>
        <p className="mt-3 text-sm text-stone-700 dark:text-stone-200">
          {event.actorDisplay}
          {event.actorEmail ? (
            <span className="text-stone-400"> · {event.actorEmail}</span>
          ) : null}
        </p>
        <p className="mt-2 text-sm text-stone-400">
          대상 리비전: {event.revisionTitle}
        </p>
      </div>
    );
  }

  const workflowCard = (
    <CollapsibleCard
      id="workflow"
      title="게시 상태를 관리합니다"
      eyebrow="Workflow"
        description={
        <>
          현재 상태는 {statusCopy[post.status]}입니다.{" "}
          {statusDescription[post.status]}
          {!canManagePublishing(session.role) ? (
            <>
              {" "}
              현재 역할은 editor라서 승인과 게시는 할 수 없고, 검토 요청까지만
              가능합니다.
            </>
          ) : null}
        </>
      }
    >
      <div className="mb-5 rounded-[1.5rem] border border-stone-300/70 bg-white px-4 py-4 dark:border-white/10 dark:bg-black/20">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-stone-300/70 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
            Release
          </span>
          <span className="text-sm text-stone-800 dark:text-stone-100">{releaseBadge}</span>
        </div>
        <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
          {post.hasUnpublishedChanges
            ? "현재 작업본이 마지막 공개본과 다릅니다. 저장한 변경사항은 아직 방문자에게 보이지 않습니다."
            : post.hasPublishedVersion
              ? "현재 작업본이 공개본과 같습니다. 지금 보는 내용이 공개 페이지와 동일합니다."
              : "이 글은 아직 한 번도 게시되지 않았습니다. 게시 전까지는 관리자 화면에서만 확인할 수 있습니다."}
        </p>
        {post.hasPublishedVersion ? (
          <div className="mt-3 rounded-2xl border border-stone-300/70 bg-white px-4 py-3 text-sm text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
            마지막 공개본: {post.publishedRevisionTitle || post.title}
            {post.publishedRevisionExcerpt ? (
              <p className="mt-2 text-sm leading-7 text-stone-400">
                {post.publishedRevisionExcerpt}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        {visibleWorkflowButtons.map((workflowAction) => {
          const buttonConfig =
            workflowAction === "approve"
              ? {
                  active: isApprovedActive,
                  tone: "amber" as const,
                  label: isApprovedActive ? "승인됨" : workflowButtonCopy.approve,
                }
              : workflowAction === "publish"
                ? {
                    active: isPublishedActive,
                    tone: "solid" as const,
                    label: isPublishedActive ? "게시됨" : workflowButtonCopy.publish,
                  }
                : workflowAction === "unpublish"
                  ? {
                      active: false,
                      tone: "danger" as const,
                      label: workflowButtonCopy.unpublish,
                    }
                  : {
                      active: isReviewActive,
                      tone: "neutral" as const,
                      label: isReviewActive
                        ? "검토 중"
                        : workflowButtonCopy.submit_for_review,
                    };

          return (
            <form key={workflowAction} action={transitionPostStatusAction}>
              <input type="hidden" name="id" value={post.id} />
              <input
                type="hidden"
                name="workflowAction"
                value={workflowAction}
              />
              <button
                type="submit"
                disabled={buttonConfig.active}
                className={getWorkflowButtonClass({
                  active: buttonConfig.active,
                  tone: buttonConfig.tone,
                })}
              >
                {buttonConfig.label}
              </button>
            </form>
          );
        })}
      </div>
    </CollapsibleCard>
  );

  const reviewCard = (
    <CollapsibleCard
      id="review-check"
      title="게시 전 검토"
      eyebrow="Review"
      defaultOpen
      description={
        <>
          공개본과 작업본의 핵심 차이를 빠르게 확인하고, 게시 전 체크 포인트를
          점검합니다.
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[1.5rem] border border-stone-300/70 bg-white px-4 py-4 dark:border-white/10 dark:bg-black/20">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-stone-300/70 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
              Status
            </span>
            <span className="text-sm text-stone-800 dark:text-stone-100">{releaseBadge}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-stone-700 dark:text-stone-300">
            <li>현재 제목: {currentSnapshot.title}</li>
            <li>현재 요약: {currentSnapshot.excerpt}</li>
            <li>카테고리: {currentSnapshot.category}</li>
            <li>읽기 시간: {currentSnapshot.readingTime}</li>
            <li>태그: {currentSnapshot.tags}</li>
          </ul>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[1.5rem] border border-stone-300/70 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
              작업본
            </p>
            <h4 className="mt-3 font-serif text-xl text-stone-950 dark:text-white">
              {currentSnapshot.title}
            </h4>
            <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
              {currentSnapshot.excerpt}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-300/70 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
              공개본
            </p>
            <h4 className="mt-3 font-serif text-xl text-stone-950 dark:text-white">
              {publishedSnapshot.title}
            </h4>
            <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
              {publishedSnapshot.excerpt}
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-amber-300/60 bg-amber-100/80 px-4 py-4 text-sm leading-7 text-amber-900 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-100">
          {post.hasUnpublishedChanges
            ? "현재 변경사항은 아직 공개되지 않았습니다. 게시 버튼을 누르기 전 제목, 요약, 태그가 의도한 공개 내용과 일치하는지 확인하세요."
            : "현재 작업본과 공개본이 같거나 아직 공개본이 없습니다. 바로 게시하더라도 공개 내용 차이는 크지 않습니다."}
        </div>

        <div className="rounded-[1.5rem] border border-stone-300/70 bg-white px-4 py-4 dark:border-white/10 dark:bg-black/20">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-stone-300/70 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
              Diff
            </span>
            <span className="text-sm text-stone-800 dark:text-stone-100">
              추가 {markdownDiff.addedCount}줄 / 삭제 {markdownDiff.removedCount}줄 / 변경 {markdownDiff.changedCount}줄
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/8 px-4 py-3 dark:border-emerald-400/20 dark:bg-emerald-500/10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
                Added
              </p>
              <p className="mt-2 font-serif text-2xl text-emerald-900 dark:text-emerald-50">
                {markdownDiff.addedCount}
              </p>
              <p className="mt-1 text-xs leading-6 text-emerald-800/80 dark:text-emerald-100/80">
                새로 추가된 라인
              </p>
            </div>
            <div className="rounded-2xl border border-red-400/35 bg-red-500/8 px-4 py-3 dark:border-red-400/20 dark:bg-red-500/10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-red-700 dark:text-red-200">
                Removed
              </p>
              <p className="mt-2 font-serif text-2xl text-red-900 dark:text-red-50">
                {markdownDiff.removedCount}
              </p>
              <p className="mt-1 text-xs leading-6 text-red-800/80 dark:text-red-100/80">
                공개본에서 빠지는 라인
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/60 bg-amber-100/80 px-4 py-3 dark:border-amber-300/20 dark:bg-amber-400/10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-100">
                Changed
              </p>
              <p className="mt-2 font-serif text-2xl text-amber-900 dark:text-amber-50">
                {markdownDiff.changedCount}
              </p>
              <p className="mt-1 text-xs leading-6 text-amber-800/80 dark:text-amber-100/80">
                같은 위치에서 수정된 라인
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-7 text-stone-400">
            {post.hasPublishedVersion
              ? post.hasUnpublishedChanges
                ? "아래는 공개본과 비교했을 때 달라진 대표 라인입니다. 초록은 새 작업본, 붉은색은 현재 공개본에만 있는 내용입니다."
                : "현재 작업본과 공개본 본문이 같습니다."
              : "아직 공개본이 없어서 본문 diff는 생성되지 않았습니다."}
          </p>
          {markdownDiff.blocks.length ? (
            <div className="mt-4 space-y-4">
              {markdownDiff.blocks.map((block, index) => (
                <div
                  key={`${block.type}-${index}`}
                  className={`rounded-2xl border p-4 ${
                    block.type === "added"
                      ? "border-emerald-400/35 bg-emerald-500/8 dark:border-emerald-400/20 dark:bg-emerald-500/5"
                      : block.type === "removed"
                        ? "border-red-400/35 bg-red-500/8 dark:border-red-400/20 dark:bg-red-500/5"
                        : "border-amber-300/60 bg-amber-100/80 dark:border-amber-300/20 dark:bg-amber-400/5"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p
                      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                        block.type === "added"
                          ? "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100"
                          : block.type === "removed"
                            ? "bg-red-500/12 text-red-700 dark:bg-red-500/15 dark:text-red-100"
                            : "bg-amber-300/30 text-amber-800 dark:bg-amber-400/15 dark:text-amber-100"
                      }`}
                    >
                      {block.type === "added"
                        ? "추가"
                        : block.type === "removed"
                          ? "삭제"
                          : "변경"}
                    </p>
                    <p className="text-xs text-stone-400">
                      {block.type === "changed"
                        ? "공개본과 작업본이 같은 위치에서 달라진 내용입니다."
                        : block.type === "added"
                          ? "작업본에 새로 들어간 내용입니다."
                          : "공개본에는 있지만 작업본에서는 제거된 내용입니다."}
                    </p>
                  </div>
                  {block.before.length ? (
                    <div className="mt-3 rounded-xl border border-red-400/35 bg-red-500/8 px-3 py-3 dark:border-red-400/20 dark:bg-red-500/10">
                      <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-red-700 dark:text-red-200">
                        공개본
                      </p>
                      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-red-900 dark:text-red-100">
                        {block.before.join("\n")}
                      </pre>
                    </div>
                  ) : null}
                  {block.after.length ? (
                    <div className="mt-3 rounded-xl border border-emerald-400/35 bg-emerald-500/8 px-3 py-3 dark:border-emerald-400/20 dark:bg-emerald-500/10">
                      <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
                        작업본
                      </p>
                      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-emerald-900 dark:text-emerald-100">
                        {block.after.join("\n")}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </CollapsibleCard>
  );

  const historyCard = (
    <CollapsibleCard
      id="history"
      title="상태 이력"
      eyebrow="History"
      description={
        <>
          이 글에서 발생한 생성, 검토 요청, 승인, 게시 이력을 최신순으로
          확인합니다.
        </>
      }
    >
      <div className="space-y-4">
        {recentEvents.map(renderHistoryEvent)}
        {olderEvents.length ? (
          <details className="group rounded-[1.5rem] border border-stone-300/70 bg-white px-4 py-4 dark:border-white/10 dark:bg-black/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm text-stone-700 marker:hidden dark:text-stone-300">
              <span className="inline-flex items-center gap-2">
                <span className="rounded-full border border-stone-300/70 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300">
                  Archive
                </span>
                이전 이력 {olderEvents.length}건 표시
              </span>
              <span className="group-open:hidden">
                <CollapseToggleChip isOpen={false} />
              </span>
              <span className="hidden group-open:inline-flex">
                <CollapseToggleChip isOpen />
              </span>
            </summary>
            <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
              {olderEvents.map(renderHistoryEvent)}
            </div>
          </details>
        ) : null}
      </div>
    </CollapsibleCard>
  );

  function getWorkflowButtonClass(options: {
    active?: boolean;
    tone: "neutral" | "amber" | "solid" | "danger";
  }) {
    if (options.active) {
      if (options.tone === "solid") {
        return "rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-950 ring-2 ring-white/70";
      }

      if (options.tone === "amber") {
        return "rounded-full border border-amber-300/60 bg-amber-100/80 px-4 py-2 text-sm text-amber-900 dark:border-amber-200 dark:bg-amber-300/20 dark:text-amber-50";
      }

      if (options.tone === "danger") {
        return "rounded-full border border-red-400/35 bg-red-500/8 px-4 py-2 text-sm text-red-700 dark:border-red-300/60 dark:bg-red-500/15 dark:text-red-100";
      }

      return "rounded-full border border-stone-300/70 bg-stone-100 px-4 py-2 text-sm text-stone-800 dark:border-white/40 dark:bg-white/10 dark:text-white";
    }

    if (options.tone === "solid") {
      return "rounded-full border border-stone-300/70 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-200 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400 dark:border-white/20 dark:bg-white/8 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/14 dark:disabled:border-white/10 dark:disabled:bg-white/6 dark:disabled:text-white/45";
    }

    if (options.tone === "amber") {
      return "rounded-full border border-amber-300/60 bg-amber-50 px-4 py-2 text-sm text-amber-800 transition hover:border-amber-400 hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-amber-200 disabled:bg-amber-50 disabled:text-amber-400 dark:border-amber-300/25 dark:bg-transparent dark:text-amber-100 dark:hover:border-amber-200/45 dark:hover:bg-transparent dark:disabled:border-amber-300/10 dark:disabled:text-amber-100/40";
    }

    if (options.tone === "danger") {
      return "rounded-full border border-red-400/35 bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:border-red-500/45 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-red-200 disabled:bg-red-50 disabled:text-red-400 dark:border-red-400/25 dark:bg-transparent dark:text-red-200 dark:hover:border-red-300/40 dark:hover:bg-transparent dark:disabled:border-red-400/10 dark:disabled:text-red-200/40";
    }

    return "rounded-full border border-stone-300/70 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-white disabled:text-stone-400 dark:border-white/15 dark:bg-transparent dark:text-stone-100 dark:hover:border-white/35 dark:hover:bg-transparent dark:disabled:border-white/10 dark:disabled:text-stone-100/40";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-stone-300/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-400">
          Edit Post
        </p>
        <h2 className="mt-3 font-serif text-4xl text-stone-950 dark:text-white">{post.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300">
          공개 전 검토, 워크플로우 전환, 본문 수정까지 한 흐름 안에서 관리합니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full border border-stone-300/70 bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
            {statusCopy[post.status]}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
              post.hasUnpublishedChanges
                ? "border border-amber-300/60 bg-amber-100/80 text-amber-900 dark:border-amber-300/25 dark:bg-amber-300/15 dark:text-amber-100"
                : post.hasPublishedVersion
                  ? "border border-emerald-400/35 bg-emerald-500/8 text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                  : "border border-stone-300/70 bg-white text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
            }`}
          >
            {releaseBadge}
          </span>
        </div>
      </div>
      {saved ? (
        <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
          게시물이 저장되었습니다.
        </div>
      ) : null}
      {workflow ? (
        <div className="rounded-2xl border border-sky-400/35 bg-sky-500/8 px-4 py-3 text-sm text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100">
          워크플로우 상태가 업데이트되었습니다: {workflow}
        </div>
      ) : null}
      {workflowError ? (
        <div className="rounded-2xl border border-red-400/35 bg-red-500/8 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-100">
          {workflowError}
        </div>
      ) : null}
      <AdminPostForm
        action={savePostAction}
        post={post}
        role={session.role}
        availableAssetPage={availableAssetPage}
        sidebarTop={
          <>
            {reviewCard}
            {workflowCard}
            {historyCard}
          </>
        }
        submitLabel="변경사항 저장"
      />
    </div>
  );
}

type MarkdownDiffBlock = {
  type: "added" | "removed" | "changed";
  before: string[];
  after: string[];
};

function getMarkdownDiffSummary(current: string, published: string) {
  const currentLines = current.split("\n");
  const publishedLines = published.split("\n");
  const maxLength = Math.max(currentLines.length, publishedLines.length);
  const blocks: MarkdownDiffBlock[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let changedCount = 0;
  let activeBlock: MarkdownDiffBlock | null = null;

  function flushActiveBlock() {
    if (!activeBlock) {
      return;
    }

    if (blocks.length < 6) {
      blocks.push(activeBlock);
    }

    activeBlock = null;
  }

  for (let index = 0; index < maxLength; index += 1) {
    const before = publishedLines[index] ?? "";
    const after = currentLines[index] ?? "";

    if (before === after) {
      continue;
    }

    if (!before && after) {
      addedCount += 1;

      if (activeBlock?.type === "added") {
        activeBlock.after.push(after);
      } else {
        flushActiveBlock();
        activeBlock = {
          type: "added",
          before: [],
          after: [after],
        };
      }
      continue;
    }

    if (before && !after) {
      removedCount += 1;

      if (activeBlock?.type === "removed") {
        activeBlock.before.push(before);
      } else {
        flushActiveBlock();
        activeBlock = {
          type: "removed",
          before: [before],
          after: [],
        };
      }
      continue;
    }

    changedCount += 1;

    if (activeBlock?.type === "changed") {
      activeBlock.before.push(before);
      activeBlock.after.push(after);
    } else {
      flushActiveBlock();
      activeBlock = {
        type: "changed",
        before: [before],
        after: [after],
      };
    }
  }

  flushActiveBlock();

  return {
    addedCount,
    removedCount,
    changedCount,
    blocks,
  };
}
