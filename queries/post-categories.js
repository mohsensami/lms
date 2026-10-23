import { replaceMongoIdInArray } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { POSTS_CACHE_TAG, getPublishedPostList } from '@/queries/posts';

// Shares the posts cache tag, so every post/category mutation that calls
// revalidateTag('posts') refreshes categories too.
const getCachedCategories = unstable_cache(
    async () => {
        return withDb(async () => {
            const categories = await prisma.postCategory.findMany({
                orderBy: { name: 'asc' },
                include: { _count: { select: { posts: true } } },
            });
            return replaceMongoIdInArray(categories);
        });
    },
    ['post-category-list'],
    { tags: [POSTS_CACHE_TAG], revalidate: 300 },
);

/** Every category with its total post count (admin panel). */
export async function getPostCategories() {
    return (await getCachedCategories()) || [];
}

/**
 * Categories that have at least one PUBLIC post, with the public post count
 * (blog filter bar). Counts only live posts, so drafts never leak.
 */
export async function getPublicPostCategories() {
    const [categories, posts] = await Promise.all([getPostCategories(), getPublishedPostList()]);
    const counts = new Map();
    for (const post of posts) {
        if (post.categoryId) counts.set(post.categoryId, (counts.get(post.categoryId) || 0) + 1);
    }
    return categories
        .map((category) => ({ ...category, publicCount: counts.get(category.id) || 0 }))
        .filter((category) => category.publicCount > 0);
}
