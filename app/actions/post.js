'use server';

import { getLoggedInUser } from '@/lib/loggedin-user';
import { getSlug } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';
import { create, POSTS_CACHE_TAG } from '@/queries/posts';
import { revalidateTag } from 'next/cache';

// Only admins are allowed to create, edit, or delete posts. Posts have no
// author/instructor relation — every admin manages the same shared list of
// articles.
async function assertIsAdmin() {
    const loggedinUser = await getLoggedInUser();
    if (loggedinUser?.role !== 'admin') {
        throw new Error('شما اجازه‌ی دسترسی به این بخش را ندارید.');
    }
    return loggedinUser;
}

export async function createPost(data) {
    await assertIsAdmin();
    try {
        const postData = {
            title: data.title,
            slug: data.slug || getSlug(data.title),
            content: data.content,
            thumbnail: data.thumbnail,
        };
        const post = await create(postData);
        revalidateTag(POSTS_CACHE_TAG);
        return post;
    } catch (e) {
        throw new Error(e);
    }
}

export async function updatePost(postId, dataToUpdate) {
    await assertIsAdmin();
    try {
        const post = await prisma.post.update({
            where: { id: postId },
            data: dataToUpdate,
        });
        revalidateTag(POSTS_CACHE_TAG);
        return post;
    } catch (e) {
        throw new Error(e);
    }
}

export async function deletePost(postId) {
    await assertIsAdmin();
    try {
        await prisma.post.delete({ where: { id: postId } });
        revalidateTag(POSTS_CACHE_TAG);
    } catch (e) {
        throw new Error(e);
    }
}
