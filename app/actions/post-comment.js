"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import {
  setPostCommentStatus,
  deletePostComment,
  setPostCommentReply,
  getPostCommentById,
} from "@/queries/postComments";
import { POSTS_CACHE_TAG } from "@/queries/posts";
import { revalidateTag } from "next/cache";
import { isPostLive } from "@/lib/post-status";
import { sendCommentReplyEmail } from "@/lib/email/notify";

export async function createPostComment(content, postId) {
  // Always trust the logged-in session for who the author is, never a
  // client-supplied id, so a comment can't be posted in someone else's name.
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("برای ثبت دیدگاه ابتدا وارد حساب کاربری خود شوید");
  }
  const loggedInUser = await getUserByEmail(session.user.email);
  if (!loggedInUser) {
    throw new Error("کاربر یافت نشد");
  }
  if (!content?.trim()) {
    throw new Error("متن دیدگاه الزامی است");
  }

  // Drafts and still-scheduled posts aren't public, so they can't be commented on.
  const targetPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { status: true, publishedAt: true },
  });
  if (!isPostLive(targetPost)) {
    throw new Error("این مقاله هنوز منتشر نشده است");
  }

  // New comments always start as "pending" (see schema default) and only
  // become publicly visible once an admin approves them.
  const newComment = await prisma.postComment.create({
    data: {
      content: content.trim(),
      userId: loggedInUser.id,
      postId,
    },
  });

  revalidateTag(POSTS_CACHE_TAG);
  return newComment;
}

async function requireLoggedInUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("شما اجازه دسترسی ندارید");
  }
  const loggedInUser = await getUserByEmail(session.user.email);
  if (!loggedInUser) {
    throw new Error("شما اجازه دسترسی ندارید");
  }
  return loggedInUser;
}

async function requireAdmin() {
  const user = await requireLoggedInUser();
  if (user.role !== "admin") {
    throw new Error("شما اجازه دسترسی ندارید");
  }
  return user;
}

export async function approvePostComment(commentId) {
  await requireAdmin();
  await setPostCommentStatus(commentId, "approved");
  revalidateTag(POSTS_CACHE_TAG);
}

export async function rejectPostComment(commentId) {
  await requireAdmin();
  await setPostCommentStatus(commentId, "rejected");
  revalidateTag(POSTS_CACHE_TAG);
}

export async function deletePostCommentAction(commentId) {
  await requireAdmin();
  await deletePostComment(commentId);
  revalidateTag(POSTS_CACHE_TAG);
}

export async function replyToPostComment(commentId, reply) {
  const user = await requireAdmin();
  if (!reply?.trim()) {
    throw new Error("متن پاسخ نمی‌تواند خالی باشد");
  }
  const existing = await prisma.postComment.findUnique({
    where: { id: commentId },
    include: { user: true, post: true },
  });

  await setPostCommentReply(commentId, reply.trim(), user.id);
  revalidateTag(POSTS_CACHE_TAG);

  // E-mail the commenter about a NEW reply (editing an old reply stays quiet),
  // unless they are the one answering. Never blocks or fails the reply.
  if (existing?.user && !existing.reply && existing.userId !== user.id) {
    await sendCommentReplyEmail({
      author: existing.user,
      comment: existing.content,
      reply: reply.trim(),
      replier: `${user.firstName} ${user.lastName}`.trim(),
      target: existing.post ? { title: existing.post.title, path: `/blog/${existing.post.slug}` } : null,
    });
  }
}

// A student can delete their own comment (any status) — but nobody else's.
export async function deleteMyPostComment(commentId) {
  const user = await requireLoggedInUser();
  const comment = await getPostCommentById(commentId);

  if (!comment || comment.userId !== user.id) {
    throw new Error("شما اجازه‌ی حذف این دیدگاه را ندارید");
  }

  await deletePostComment(commentId);
  revalidateTag(POSTS_CACHE_TAG);
}
