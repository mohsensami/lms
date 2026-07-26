"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import {
  setTestimonialStatus,
  deleteTestimonial,
  setTestimonialReply,
  getTestimonialById,
} from "@/queries/testimonials";
import { COURSES_CACHE_TAG } from "@/queries/courses";
import { revalidateTag } from "next/cache";

export async function createReview(data, loginid, courseId) {
  const { review, rating } = data;

  // Always trust the logged-in session for who the author is, never the
  // client-supplied loginid, so a comment can't be posted in someone
  // else's name.
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("برای ثبت دیدگاه ابتدا وارد حساب کاربری خود شوید");
  }
  const loggedInUser = await getUserByEmail(session.user.email);
  if (!loggedInUser) {
    throw new Error("کاربر یافت نشد");
  }

  try {
    // New comments always start as "pending" (see schema default) and only
    // become publicly visible once an admin approves them.
    const newTestimonial = await prisma.testimonial.create({
      data: {
        content: review,
        userId: loggedInUser.id,
        courseId,
        rating,
      },
    });

    if (!newTestimonial) {
      throw new Error("Failed to create a tesimonial");
    }

    revalidateTag(COURSES_CACHE_TAG);
    return newTestimonial;
  } catch (error) {
    throw new Error(error);
  }
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

// Instructors and admins can reply to any course review anywhere on the
// site — this is intentionally not scoped to "their own" courses.
async function requireInstructorOrAdmin() {
  const user = await requireLoggedInUser();
  if (user.role !== "admin" && user.role !== "instructor") {
    throw new Error("شما اجازه دسترسی ندارید");
  }
  return user;
}

export async function approveComment(testimonialId) {
  await requireAdmin();
  await setTestimonialStatus(testimonialId, "approved");
  revalidateTag(COURSES_CACHE_TAG);
}

export async function rejectComment(testimonialId) {
  await requireAdmin();
  await setTestimonialStatus(testimonialId, "rejected");
  revalidateTag(COURSES_CACHE_TAG);
}

export async function deleteComment(testimonialId) {
  await requireAdmin();
  await deleteTestimonial(testimonialId);
  revalidateTag(COURSES_CACHE_TAG);
}

export async function replyToComment(testimonialId, reply) {
  const user = await requireInstructorOrAdmin();
  if (!reply?.trim()) {
    throw new Error("متن پاسخ نمی‌تواند خالی باشد");
  }
  await setTestimonialReply(testimonialId, reply.trim(), user.id);
  revalidateTag(COURSES_CACHE_TAG);
}

// A student can delete their own comment (any status) — but nobody else's.
export async function deleteMyComment(testimonialId) {
  const user = await requireLoggedInUser();
  const testimonial = await getTestimonialById(testimonialId);

  if (!testimonial || testimonial.userId !== user.id) {
    throw new Error("شما اجازه‌ی حذف این دیدگاه را ندارید");
  }

  await deleteTestimonial(testimonialId);
  revalidateTag(COURSES_CACHE_TAG);
}
