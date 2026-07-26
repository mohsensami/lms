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

// Instructors and admins can reply to any blog comment anywhere on the
// site — intentionally not scoped to posts they authored.
async function requireInstructorOrAdmin() {
  const user = await requireLoggedInUser();
  if (user.role !== "admin" && user.role !== "instructor") {
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
  const user = await requireInstructorOrAdmin();
  if (!reply?.trim()) {
    throw new Error("متن پاسخ نمی‌تواند خالی باشد");
  }
  await setPostCommentReply(commentId, reply.trim(), user.id);
  revalidateTag(POSTS_CACHE_TAG);
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
