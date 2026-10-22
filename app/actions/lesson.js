"use server";

import { prisma } from "@/lib/prisma";
import { create } from "@/queries/lessons";
import { COURSES_CACHE_TAG } from "@/queries/courses";
import { revalidateTag } from "next/cache";
import { assertAdmin } from "@/lib/admin-guard";
import { deleteStoredVideos } from "@/lib/video-cleanup";

// Fields that describe the stored video are only ever written by the
// upload-complete API route (after the file really exists in the bucket).
// Strip them here so they can't be forged through this generic action.
const PROTECTED_VIDEO_FIELDS = [
  "videoProvider",
  "videoKey",
  "videoName",
  "videoSize",
  "videoContentType",
];

export async function createLesson(data) {
  try {
    await assertAdmin();

    const title = data.get("title");
    const slug = data.get("slug");
    const moduleId = data.get("moduleId");
    const order = data.get("order");

    const createdLesson = await create({
      title,
      slug,
      order: Number(order),
      moduleId,
    });

    revalidateTag(COURSES_CACHE_TAG);
    return createdLesson;
  } catch (e) {
    throw new Error(e);
  }
}

export async function reOrderLesson(data) {
  try {
    await assertAdmin();

    await Promise.all(
      data.map(async (element) => {
        await prisma.lesson.update({
          where: { id: element.id },
          data: { order: element.position },
        });
      }),
    );
    revalidateTag(COURSES_CACHE_TAG);
  } catch (e) {
    throw new Error(e);
  }
}

export async function updateLesson(lessonId, data) {
  try {
    await assertAdmin();

    const safeData = { ...data };
    for (const field of PROTECTED_VIDEO_FIELDS) {
      delete safeData[field];
    }

    await prisma.lesson.update({ where: { id: lessonId }, data: safeData });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (error) {
    throw new Error(error);
  }
}

export async function changeLessonPublishState(lessonId) {
  await assertAdmin();
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  try {
    const res = await prisma.lesson.update({
      where: { id: lessonId },
      data: { active: !lesson.active },
    });
    revalidateTag(COURSES_CACHE_TAG);
    return res.active;
  } catch (error) {
    throw new Error(error);
  }
}

/** Detaches (and deletes from the bucket) a lesson's uploaded video. */
export async function removeLessonVideo(lessonId) {
  await assertAdmin();

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    throw new Error("Lesson not found");
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      videoProvider: null,
      videoKey: null,
      videoName: null,
      videoSize: null,
      videoContentType: null,
      video_url: null,
    },
  });

  await deleteStoredVideos([lesson]);
  revalidateTag(COURSES_CACHE_TAG);
}

export async function deleteLesson(lessonId, moduleId) {
  try {
    await assertAdmin();

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    await prisma.lesson.delete({ where: { id: lessonId } });
    if (lesson) {
      await deleteStoredVideos([lesson]);
    }
    revalidateTag(COURSES_CACHE_TAG);
  } catch (err) {
    throw new Error(err);
  }
}
