import { replaceMongoIdInArray, replaceMongoIdInObject } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { Lesson } from '@/model/lesson.model';

export async function getLesson(lessonId) {
    return withDb(async () => {
        const lesson = await Lesson.findById(lessonId).lean();
        return replaceMongoIdInObject(lesson);
    });
}

export async function create(lessonData) {
    try {
        return await withDb(async () => {
            const lesson = await Lesson.create(lessonData);
            return JSON.parse(JSON.stringify(lesson));
        });
    } catch (error) {
        throw new Error(error);
    }
}

export async function getLessonBySlug(slug) {
    try {
        return await withDb(async () => {
            const lesson = await Lesson.findOne({ slug: slug }).lean();
            return replaceMongoIdInObject(lesson);
        });
    } catch (error) {
        throw new Error(error);
    }
}
