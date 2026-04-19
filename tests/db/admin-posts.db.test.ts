import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { PostStatus, PublishEventType } from "@prisma/client";

import {
  deleteAdminPost,
  saveAdminPost,
  transitionAdminPostStatus,
} from "@/lib/admin-posts-core";
import { prisma } from "@/lib/prisma";

const editorEmail = process.env.ADMIN_LOGIN_EMAIL ?? "editor@dycdyp.com";

test("admin post save and workflow transition smoke test", async () => {
  const token = randomUUID().slice(0, 8);
  const slug = `db-smoke-${token}`;
  const title = `DB Smoke ${token}`;
  let postId = "";

  try {
    postId = await saveAdminPost({
      title,
      slug,
      excerpt: "DB smoke excerpt",
      categoryRoot: "ai",
      categoryLeaf: "news",
      readingTimeMinutes: 4,
      tags: "",
      thumbnailAssetId: "",
      markdownBody: "## DB smoke\n\nbody",
      editorEmail,
    });

    let post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        currentRevision: true,
        publishEvents: true,
      },
    });

    assert.ok(post);
    assert.equal(post?.status, PostStatus.DRAFT);
    assert.equal(post?.slug, slug);
    assert.ok(post?.currentRevision);
    assert.equal(post?.publishEvents[0]?.eventType, PublishEventType.CREATED);

    await transitionAdminPostStatus({
      id: postId,
      action: "submit_for_review",
      editorEmail,
    });

    post = await prisma.post.findUnique({
      where: { id: postId },
    });
    assert.equal(post?.status, PostStatus.REVIEW);
    assert.equal(post?.publishedRevisionId, null);

    await transitionAdminPostStatus({
      id: postId,
      action: "approve",
      editorEmail,
    });

    post = await prisma.post.findUnique({
      where: { id: postId },
    });
    assert.equal(post?.status, PostStatus.APPROVED);
    assert.ok(post?.approvedAt);

    await transitionAdminPostStatus({
      id: postId,
      action: "publish",
      editorEmail,
    });

    post = await prisma.post.findUnique({
      where: { id: postId },
    });
    assert.equal(post?.status, PostStatus.PUBLISHED);
    assert.ok(post?.publishedRevisionId);
    assert.ok(post?.publishedAt);

    await transitionAdminPostStatus({
      id: postId,
      action: "unpublish",
      editorEmail,
    });

    post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        publishEvents: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    assert.equal(post?.status, PostStatus.APPROVED);
    assert.equal(post?.publishedRevisionId, null);
    assert.equal(post?.publishedAt, null);
    assert.deepEqual(
      post?.publishEvents.map((event) => event.eventType),
      [
        PublishEventType.CREATED,
        PublishEventType.SUBMITTED_FOR_REVIEW,
        PublishEventType.APPROVED,
        PublishEventType.PUBLISHED,
        PublishEventType.UNPUBLISHED,
      ],
    );
  } finally {
    if (postId) {
      await deleteAdminPost(postId);
    }
  }
});
