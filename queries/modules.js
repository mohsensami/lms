import { replaceMongoIdInObject, toIdString } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function create(moduleData) {
    try {
        return await withDb(async () => {
            const createdModule = await prisma.module.create({ data: moduleData });
            return JSON.parse(JSON.stringify(createdModule));
        });
    } catch (error) {
        throw new Error(error);
    }
}

export async function getModule(moduleId) {
    try {
        return await withDb(async () => {
            const id = toIdString(moduleId);
            if (!id) return null;
            const foundModule = await prisma.module.findUnique({
                where: { id },
                include: {
                    lessonIds: { orderBy: { order: 'asc' } },
                },
            });
            return replaceMongoIdInObject(foundModule);
        });
    } catch (error) {
        throw new Error(error);
    }
}

export async function getModuleBySlug(moduleSlug) {
    try {
        return await withDb(async () => {
            const foundModule = await prisma.module.findFirst({ where: { slug: moduleSlug } });
            return replaceMongoIdInObject(foundModule);
        });
    } catch (error) {
        throw new Error(error);
    }
}
