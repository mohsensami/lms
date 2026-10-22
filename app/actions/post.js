'use server';

import { getLoggedInUser } from '@/lib/loggedin-user';
import { getSlug } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';
import { create, POSTS_CACHE_TAG } from '@/queries/posts';
import { revalidateTag } from 'next/cache';
import { POST_STATUS } from '@/lib/post-status';
import { renderPostContent } from '@/lib/sanitize-post-html';

// Instructors and admins can write posts. Instructors may only manage posts
// they personally authored; admins can manage every post on the site.
async function requireInstructorOrAdmin() {
    const loggedinUser = await getLoggedInUser();
    if (loggedinUser?.role !== 'admin' && loggedinUser?.role !== 'instructor') {
        throw new Error('شما اجازه‌ی دسترسی به این بخش را ندارید.');
    }
    return loggedinUser;
}

async function requireOwnershipOrAdmin(postId, user) {
    if (user.role === 'admin') return;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.authorId !== user.id) {
        throw new Error('شما فقط به مقالات خودتان دسترسی دارید.');
    }
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
    const author = await requireInstructorOrAdmin();
    try {
        const postData = {
            title: data.title,
            slug: data.slug || getSlug(data.title),
            content: data.content,
            thumbnail: data.thumbnail,
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            focusKeyword: data.focusKeyword || null,
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
    const user = await requireInstructorOrAdmin();
    await requireOwnershipOrAdmin(postId, user);
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
    const user = await requireInstructorOrAdmin();
    await requireOwnershipOrAdmin(postId, user);
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
    await requireInstructorOrAdmin();
    return renderPostContent(content || '');
}
