import { replaceMongoIdInArray, replaceMongoIdInObject } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { Category } from '@/model/category-model';

export async function getCategories() {
    return withDb(async () => {
        const categories = await Category.find({}).lean();
        return replaceMongoIdInArray(categories);
    });
}

export async function getCategoryDetails(categoryId) {
    try {
        return await withDb(async () => {
            const category = await Category.findById(categoryId).lean();
            return replaceMongoIdInObject(category);
        });
    } catch (error) {
        throw new Error(error);
    }
}
