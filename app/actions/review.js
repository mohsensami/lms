"use server";

import { prisma } from "@/lib/prisma";
import { COURSES_CACHE_TAG } from "@/queries/courses";
import { revalidateTag } from "next/cache";

export async function createReview(data, loginid, courseId) {
  const { review, rating } = data;
  try {
    const newTestimonial = await prisma.testimonial.create({
      data: {
        content: review,
        userId: loginid,
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
