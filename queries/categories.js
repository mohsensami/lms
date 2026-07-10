import { replaceMongoIdInArray, replaceMongoIdInObject, toIdString } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const CATEGORIES_CACHE_TAG = 'categories';

const getCachedCategories = unstable_cache(
    async () => {
        return withDb(async () => {
            const categories = await prisma.category.findMany();
            return replaceMongoIdInArray(categories);
        });
    },
    ['category-list'],
    { tags: [CATEGORIES_CACHE_TAG], revalidate: 300 },
);

export async function getCategories() {
    return getCachedCategories();
}

const getCachedCategoryDetails = unstable_cache(
    async (id) => {
        return withDb(async () => {
            const category = await prisma.category.findUnique({ where: { id } });
            return replaceMongoIdInObject(category);
        });
    },
    ['category-details'],
    { tags: [CATEGORIES_CACHE_TAG], revalidate: 300 },
);

export async function getCategoryDetails(categoryId) {
    try {
        const id = toIdString(categoryId);
        if (!id) return null;
        return await getCachedCategoryDetails(id);
    } catch (error) {
        throw new Error(error);
    }
}
