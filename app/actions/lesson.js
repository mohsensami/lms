"use server";

import { prisma } from "@/lib/prisma";
import { create } from "@/queries/lessons";
import { COURSES_CACHE_TAG } from "@/queries/courses";
import { revalidateTag } from "next/cache";

export async function createLesson(data) {
  try {
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
    await prisma.lesson.update({ where: { id: lessonId }, data });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (error) {
    throw new Error(error);
  }
}

export async function changeLessonPublishState(lessonId) {
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

export async function deleteLesson(lessonId, moduleId) {
  try {
    await prisma.lesson.delete({ where: { id: lessonId } });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (err) {
    throw new Error(err);
  }
}
