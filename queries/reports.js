import { replaceMongoIdInObject } from "@/lib/convertData";
import { prisma } from "@/lib/prisma";
import { getCourseDetails } from "./courses";

export async function getReportsForUser(studentId) {
  if (!studentId) return [];
  try {
    const reports = await prisma.report.findMany({
      where: { studentId },
      include: { quizAssessment: true },
    });
    return reports;
  } catch (error) {
    return [];
  }
}

export async function getReport(filter) {
  try {
    const where = {};
    if (filter?.course) where.courseId = filter.course;
    if (filter?.student) where.studentId = filter.student;

    const report = await prisma.report.findFirst({
      where,
      include: {
        quizAssessment: true,
      },
    });
    return replaceMongoIdInObject(report);
  } catch (error) {
    throw new Error(error);
  }
}

export async function createWatchReport(data) {
  try {
    let report = await prisma.report.findFirst({
      where: {
        courseId: data.courseId,
        studentId: data.userId,
      },
    });

    if (!report) {
      report = await prisma.report.create({
        data: {
          courseId: data.courseId,
          studentId: data.userId,
        },
      });
    }

    const completedLessons = new Set(report.totalCompletedLessons);
    completedLessons.add(data.lessonId);

    const foundModule = await prisma.module.findUnique({
      where: { id: data.moduleId },
      include: { lessonIds: true },
    });
    const lessonIdsToCheck = foundModule?.lessonIds?.map((l) => l._id) ?? [];

    const isModuleComplete =
      lessonIdsToCheck.length > 0 &&
      lessonIdsToCheck.every((lessonId) => completedLessons.has(lessonId));

    const completedModules = new Set(report.totalCompletedModeules);
    if (isModuleComplete) {
      completedModules.add(data.moduleId);
    }

    /// Check if the course has completed
    const course = await getCourseDetails(data.courseId);
    const moduleCount = course?.modules?.length ?? 0;
    const completedModuleCount = completedModules.size;

    const updateData = {
      totalCompletedLessons: Array.from(completedLessons),
      totalCompletedModeules: Array.from(completedModules),
    };

    if (completedModuleCount >= 1 && completedModuleCount === moduleCount) {
      updateData.completion_date = new Date();
    }

    await prisma.report.update({
      where: { id: report._id },
      data: updateData,
    });
  } catch (error) {
    throw new Error(error);
  }
}

export async function createAssessmentReport(data) {
  try {
    let report = await prisma.report.findFirst({
      where: {
        courseId: data.courseId,
        studentId: data.userId,
      },
    });
    if (!report) {
      await prisma.report.create({
        data: {
          courseId: data.courseId,
          studentId: data.userId,
          quizAssessmentId: data.quizAssessment,
        },
      });
    } else if (!report.quizAssessmentId) {
      await prisma.report.update({
        where: { id: report._id },
        data: { quizAssessmentId: data.quizAssessment },
      });
    }
  } catch (error) {
    throw new Error(error);
  }
}
