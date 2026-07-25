"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import { setPostCommentStatus, deletePostComment } from "@/queries/postComments";
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

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("شما اجازه دسترسی ندارید");
  }
  const loggedInUser = await getUserByEmail(session.user.email);
  if (loggedInUser?.role !== "admin") {
    throw new Error("شما اجازه دسترسی ندارید");
  }
  return loggedInUser;
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
