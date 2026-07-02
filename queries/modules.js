import { replaceMongoIdInObject } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { Lesson } from '@/model/lesson.model';
import { Module } from '@/model/module.model';

export async function create(mdouleData) {
    try {
        return await withDb(async () => {
            const module = await Module.create(mdouleData);
            return JSON.parse(JSON.stringify(module));
        });
    } catch (error) {
        throw new Error(error);
    }
}

export async function getModule(moduleId) {
    try {
        return await withDb(async () => {
            const module = await Module.findById(moduleId)
                .populate({
                    path: 'lessonIds',
                    model: Lesson,
                })
                .lean();
            return replaceMongoIdInObject(module);
        });
    } catch (error) {
        throw new Error(error);
    }
}

export async function getModuleBySlug(moduleSlug) {
    try {
        return await withDb(async () => {
            const module = await Module.findOne({ slug: moduleSlug }).lean();
            return replaceMongoIdInObject(module);
        });
    } catch (error) {
        throw new Error(error);
    }
}
