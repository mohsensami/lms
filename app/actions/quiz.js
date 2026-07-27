"use server";
import { prisma } from "@/lib/prisma";
import { getSlug, replaceMongoIdInArray } from "./../../lib/convertData";
import { createQuiz, getQuizSetById } from "@/queries/quizzes";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { createAssessmentReport } from "@/queries/reports";
import { COURSES_CACHE_TAG } from "@/queries/courses";
import { revalidateTag } from "next/cache";

export async function updateQuizSet(quizset, dataToUpdate) {
  try {
    await prisma.quizset.update({ where: { id: quizset }, data: dataToUpdate });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (error) {
    throw new Error(error);
  }
}

export async function addQuizToQuizSet(quizSetId, quizData) {
  try {
    const transformedQuizData = {};
    transformedQuizData["title"] = quizData["title"];
    transformedQuizData["description"] = quizData["description"];
    transformedQuizData["slug"] = getSlug(quizData["title"]);
    transformedQuizData["quizsetId"] = quizSetId;
    transformedQuizData["options"] = [
      {
        text: quizData.optionA.label,
        is_correct: quizData.optionA.isTrue,
      },
      {
        text: quizData.optionB.label,
        is_correct: quizData.optionB.isTrue,
      },
      {
        text: quizData.optionC.label,
        is_correct: quizData.optionC.isTrue,
      },
      {
        text: quizData.optionD.label,
        is_correct: quizData.optionD.isTrue,
      },
    ];

    await createQuiz(transformedQuizData);
    revalidateTag(COURSES_CACHE_TAG);
  } catch (error) {
    throw new Error(error);
  }
}

export async function deleteQuiz(quizSetId, quizId) {
  try {
    await prisma.quiz.delete({ where: { id: quizId } });
    revalidateTag(COURSES_CACHE_TAG);
  } catch (error) {
    throw new Error(error);
  }
}

export async function changeQuizPublishState(quizSetId) {
  const quizset = await prisma.quizset.findUnique({ where: { id: quizSetId } });
  try {
    const res = await prisma.quizset.update({
      where: { id: quizSetId },
      data: { active: !quizset.active },
    });
    revalidateTag(COURSES_CACHE_TAG);
    return res.active;
  } catch (error) {
    throw new Error(error);
  }
}

export async function doCreateQuizSet(data) {
  try {
    const payload = { ...data, slug: getSlug(data.title) };
    const createdQuizSet = await prisma.quizset.create({ data: payload });
    revalidateTag(COURSES_CACHE_TAG);
    return createdQuizSet?._id.toString();
  } catch (error) {
    throw new Error(error);
  }
}

import { getQuizScore } from "@/lib/quiz-score";

export async function addQuizAssessment(courseId, quizSetId, answers) {
  try {
    const quizSet = await getQuizSetById(quizSetId);
    const quizzes = replaceMongoIdInArray(quizSet.quizIds);

    const assessmentRecord = quizzes.map((quiz) => {
      const obj = {};
      obj.quizId = quiz.id;
      const found = answers.find((a) => a.quizId === quiz.id);
      obj.attempted = Boolean(found);

      const mergedOptions = quiz.options.map((o) => {
        return {
          option: o.text,
          isCorrect: o.is_correct,
          isSelected: (function () {
            const found = answers.find((a) => a.options[0].option === o.text);
            return Boolean(found);
          })(),
        };
      });

      obj["options"] = mergedOptions;
      return obj;
    });

    const assessmentEntry = {
      assessments: assessmentRecord,
      otherMarks: 0,
    };

    const assessment = await prisma.assessment.create({ data: assessmentEntry });
    const loggedInUser = await getLoggedInUser();

    await createAssessmentReport({
      courseId: courseId,
      userId: loggedInUser.id,
      quizAssessment: assessment?._id,
    });

    return getQuizScore(assessment);
  } catch (error) {
    throw new Error(error);
  }
}
