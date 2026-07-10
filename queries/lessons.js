import { replaceMongoIdInObject, toIdString } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function getLesson(lessonId) {
    return withDb(async () => {
        const id = toIdString(lessonId);
        if (!id) return null;
        const lesson = await prisma.lesson.findUnique({ where: { id } });
        return replaceMongoIdInObject(lesson);
    });
}

export async function create(lessonData) {
    try {
        return await withDb(async () => {
            const lesson = await prisma.lesson.create({ data: lessonData });
            return JSON.parse(JSON.stringify(lesson));
        });
    } catch (error) {
        throw new Error(error);
    }
}

export async function getLessonBySlug(slug) {
    try {
        return await withDb(async () => {
            const lesson = await prisma.lesson.findFirst({ where: { slug } });
            return replaceMongoIdInObject(lesson);
        });
    } catch (error) {
        throw new Error(error);
    }
}
