"use server";

import { prisma } from "@/lib/prisma";
import { create } from "@/queries/modules";
import { COURSES_CACHE_TAG } from "@/queries/courses";
import { revalidateTag } from "next/cache";

export async function createModule(data) {
  try {
    const title = data.get("title");
    const slug = data.get("slug");
    const courseId = data.get("courseId");
    const order = data.get("order");

    const createdModule = await create({
      title,
      slug,
      courseId,
      order: Number(order),
    });

    revalidateTag(COURSES_CACHE_TAG);
    return createdModule;
  } catch (e) {
    throw new Error(e);
  }
}

export async function reOrderModules(data) {
  try {
    await Promise.all(
      data.map(async (element) => {
        await prisma.module.update({
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

export async function updateModule(moduleId, data) {
  try {
    await prisma.module.update({ where: { id: moduleId }, data });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (error) {
    throw new Error(error);
  }
}

export async function changeModulePublishState(moduleId) {
  const foundModule = await prisma.module.findUnique({ where: { id: moduleId } });
  try {
    const res = await prisma.module.update({
      where: { id: moduleId },
      data: { active: !foundModule.active },
    });
    revalidateTag(COURSES_CACHE_TAG);
    return res.active;
  } catch (error) {
    throw new Error(error);
  }
}

export async function deleteModule(moduleId, courseId) {
  try {
    await prisma.module.delete({ where: { id: moduleId } });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (err) {
    throw new Error(err);
  }
}
