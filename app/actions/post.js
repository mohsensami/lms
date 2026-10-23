'use server';

import { getLoggedInUser } from '@/lib/loggedin-user';
import { getSlug } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';
import { create, POSTS_CACHE_TAG } from '@/queries/posts';
import { revalidateTag } from 'next/cache';
import { POST_STATUS } from '@/lib/post-status';
import { renderPostContent } from '@/lib/sanitize-post-html';

// Only admins manage posts (and they can manage every post on the site).
async function requireAdmin() {
    const loggedinUser = await getLoggedInUser();
    if (loggedinUser?.role !== 'admin') {
        throw new Error('شما اجازه‌ی دسترسی به این بخش را ندارید.');
    }
    return loggedinUser;
}

// Validates the publishing fields coming from the client. A draft keeps a
// date too (it becomes the default when the draft is later published).
function normalizePublishing({ status, publishedAt }) {
    const normalizedStatus = status === POST_STATUS.DRAFT ? POST_STATUS.DRAFT : POST_STATUS.PUBLISHED;
    const date = publishedAt ? new Date(publishedAt) : new Date();
    if (Number.isNaN(date.getTime())) {
        throw new Error('تاریخ انتشار معتبر نیست.');
    }
    return { status: normalizedStatus, publishedAt: date };
}

export async function createPost(data) {
    const author = await requireAdmin();
    try {
        const postData = {
            title: data.title,
            slug: data.slug || getSlug(data.title),
            content: data.content,
            thumbnail: data.thumbnail,
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            focusKeyword: data.focusKeyword || null,
            categoryId: data.categoryId || null,
            authorId: author.id,
            ...normalizePublishing(data),
        };
        const post = await create(postData);
        revalidateTag(POSTS_CACHE_TAG);
        return post;
    } catch (e) {
        throw new Error(e);
    }
}

export async function updatePost(postId, dataToUpdate) {
    await requireAdmin();
    try {
        const data = { ...dataToUpdate };
        if ('status' in data || 'publishedAt' in data) {
            Object.assign(data, normalizePublishing(data));
        }
        const post = await prisma.post.update({
            where: { id: postId },
            data,
        });
        revalidateTag(POSTS_CACHE_TAG);
        return post;
    } catch (e) {
        throw new Error(e);
    }
}

export async function deletePost(postId) {
    await requireAdmin();
    try {
        await prisma.post.delete({ where: { id: postId } });
        revalidateTag(POSTS_CACHE_TAG);
    } catch (e) {
        throw new Error(e);
    }
}

// Server-side render of a body for the editor's live preview, so the preview
// goes through exactly the same sanitizer + Prism highlighting as the blog.
export async function previewPostContent(content) {
    await requireAdmin();
    return renderPostContent(content || '');
}
