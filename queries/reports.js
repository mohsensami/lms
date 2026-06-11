import { replaceMongoIdInObject } from "@/lib/convertData";
import { Assessment } from "@/model/assessment-model";
import { Module } from "@/model/module.model";
import { Report } from "@/model/report-model";
import mongoose from "mongoose";

export async function getReport(filter) {
  try {
    const report = await Report.findOne(filter)
      .populate({
        path: "quizAssessment",
        model: Assessment,
      })
      .lean();
    return replaceMongoIdInObject(report);
  } catch (error) {
    throw new Error(error);
  }
}

export async function createWatchReport(data) {
  try {
    let report = await Report.findOne({
      course: data.courseId,
      student: data.userId,
    });

    if (!report) {
      report = await Report.create({
        course: data.courseId,
        student: data.userId,
      });
    }

    const foundLesson = report.totalCompletedLessons.find(
      (lessonId) => lessonId.toString() === data.lessonId,
    );

    if (!foundLesson) {
      report.totalCompletedLessons.push(
        new mongoose.Types.ObjectId(data.lessonId),
      );
    }

    const module = await Module.findById(data.moduleId);
    const lessonIdsToCheck = module.lessonIds;
    const completedLessonsIds = report.totalCompletedModeules;
  } catch (error) {}
}
