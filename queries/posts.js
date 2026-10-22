import { replaceMongoIdInArray, replaceMongoIdInObject, toIdString } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { isPostLive } from '@/lib/post-status';

// Same caching approach as queries/courses.js: public, read-heavy post data
// is cached with Next.js's Data Cache and invalidated via
// `revalidateTag('posts')` from app/actions/post.js on every mutation.
export const POSTS_CACHE_TAG = 'posts';

const getCachedPostList = unstable_cache(
    async () => {
        return withDb(async () => {
            const posts = await prisma.post.findMany({
                orderBy: { publishedAt: 'desc' },
            });
            return replaceMongoIdInArray(posts);
        });
    },
    ['post-list'],
    { tags: [POSTS_CACHE_TAG], revalidate: 300 },
);

// Every post, including drafts and scheduled ones. Only for the admin panel.
export async function getPostList() {
    return getCachedPostList();
}

// Publicly visible posts only (blog, home page, sitemap). The cached list
// holds every post, and the "is it live yet?" check runs on each call
// instead of inside the cache, so a scheduled post appears as soon as its
// time arrives without waiting for the cache to expire.
export async function getPublishedPostList() {
    const posts = await getCachedPostList();
    const now = new Date();
    return (posts || []).filter((post) => isPostLive(post, now));
}

export async function getPostListForAuthor(authorId) {
    if (!authorId) return [];
    return withDb(async () => {
        const posts = await prisma.post.findMany({
            where: { authorId },
            orderBy: { publishedAt: 'desc' },
        });
        return replaceMongoIdInArray(posts);
    }, []);
}

const getCachedPostBySlug = unstable_cache(
    async (slug) => {
        return withDb(async () => {
            const post = await prisma.post.findUnique({ where: { slug }, include: { author: true } });
            return replaceMongoIdInObject(post);
        });
    },
    ['post-by-slug'],
    { tags: [POSTS_CACHE_TAG], revalidate: 300 },
);

export async function getPostBySlug(slug) {
    if (!slug) return null;
    return getCachedPostBySlug(slug);
}

const getCachedPostById = unstable_cache(
    async (id) => {
        return withDb(async () => {
            const post = await prisma.post.findUnique({ where: { id }, include: { author: true } });
            return replaceMongoIdInObject(post);
        });
    },
    ['post-by-id'],
    { tags: [POSTS_CACHE_TAG], revalidate: 300 },
);

export async function getPostById(id) {
    const postId = toIdString(id);
    if (!postId) return null;
    return getCachedPostById(postId);
}

export async function create(postData) {
    try {
        return await withDb(async () => {
            const post = await prisma.post.create({ data: postData });
            return JSON.parse(JSON.stringify(post));
        });
    } catch (error) {
        throw new Error(error);
    }
}
