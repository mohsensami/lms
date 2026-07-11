import { replaceMongoIdInArray, replaceMongoIdInObject, toIdString } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';

export async function getAllQuizSets(excludeUnPublished) {
    try {
        let quizSets = [];
        if (excludeUnPublished) {
            quizSets = await prisma.quizset.findMany({ where: { active: true }, include: { quizIds: true } });
        } else {
            quizSets = await prisma.quizset.findMany({ include: { quizIds: true } });
        }
        return replaceMongoIdInArray(quizSets);
    } catch (error) {
        throw new Error(error);
    }
}

export async function getQuizSetById(rawId) {
    try {
        const id = toIdString(rawId);
        if (!id) return null;
        const quizSet = await prisma.quizset.findUnique({
            where: { id },
            include: {
                quizIds: true,
            },
        });
        return replaceMongoIdInObject(quizSet);
    } catch (error) {
        throw new Error(error);
    }
}

export async function createQuiz(quizData) {
    try {
        const quiz = await prisma.quiz.create({ data: quizData });
        return quiz._id.toString();
    } catch (error) {
        throw new Error(error);
    }
}