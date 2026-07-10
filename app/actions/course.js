"use server";

import { getLoggedInUser } from "@/lib/loggedin-user";
import { prisma } from "@/lib/prisma";
import { create, COURSES_CACHE_TAG } from "@/queries/courses";
import { revalidateTag } from "next/cache";

// The UI still passes Mongoose-style ref field names (category, instructor,
// quizSet) — map them to the Prisma scalar FK column names before hitting
// the database.
function mapCourseRefKeys(data) {
  const mapped = { ...data };
  if ("category" in mapped) {
    mapped.categoryId = mapped.category;
    delete mapped.category;
  }
  if ("instructor" in mapped) {
    mapped.instructorId = mapped.instructor;
    delete mapped.instructor;
  }
  if ("quizSet" in mapped) {
    mapped.quizSetId = mapped.quizSet;
    delete mapped.quizSet;
  }
  return mapped;
}

export async function createCourse(data) {
  try {
    const loggedinUser = await getLoggedInUser();
    const courseData = mapCourseRefKeys({ ...data, instructor: loggedinUser?.id });
    const course = await create(courseData);
    revalidateTag(COURSES_CACHE_TAG);
    return course;
  } catch (e) {
    throw new Error(e);
  }
}

export async function updateCourse(courseId, dataToUpdate) {
  try {
    await prisma.course.update({
      where: { id: courseId },
      data: mapCourseRefKeys(dataToUpdate),
    });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (e) {
    throw new Error(e);
  }
}

export async function changeCoursePublishState(courseId) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  try {
    const res = await prisma.course.update({
      where: { id: courseId },
      data: { active: !course.active },
    });
    revalidateTag(COURSES_CACHE_TAG);
    return res.active;
  } catch (error) {
    throw new Error(error);
  }
}

export async function deleteCourse(courseId) {
  try {
    await prisma.course.delete({ where: { id: courseId } });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (err) {
    throw new Error(err);
  }
}

export async function updateQuizSetForCourse(courseId, dataUpdated) {
  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { quizSetId: dataUpdated.quizSetId },
    });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (error) {
    throw new Error(error);
  }
}
