'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { getSlug } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';
import { POSTS_CACHE_TAG } from '@/queries/posts';

// Returns { ok, message } instead of throwing: Next.js hides the text of
// thrown server-action errors in production.

async function ensureAdmin() {
    const user = await getLoggedInUser();
    if (user?.role !== 'admin') {
        throw new Error('FORBIDDEN');
    }
}

function clean({ name, slug, description }) {
    const cleanName = String(name || '').trim();
    const cleanSlug = getSlug(slug || cleanName);
    if (!cleanName) return { error: 'نام دسته‌بندی الزامی است.' };
    if (!cleanSlug) return { error: 'نامک (slug) معتبر نیست.' };
    return {
        data: {
            name: cleanName.slice(0, 80),
            slug: cleanSlug,
            description: String(description || '').trim().slice(0, 300) || null,
        },
    };
}

function failure(error) {
    if (error?.message === 'FORBIDDEN') return { ok: false, message: 'شما اجازه‌ی دسترسی به این بخش را ندارید.' };
    if (String(error?.message || '').includes('Unique constraint')) {
        return { ok: false, message: 'این نامک قبلاً برای دسته‌بندی دیگری استفاده شده است.' };
    }
    console.error('post-category action error:', error);
    return { ok: false, message: 'مشکلی پیش آمد.' };
}

function refresh() {
    revalidateTag(POSTS_CACHE_TAG);
    revalidatePath('/blog');
    revalidatePath('/account/posts/categories');
}

export async function createPostCategory(input) {
    try {
        await ensureAdmin();
        const { data, error } = clean(input);
        if (error) return { ok: false, message: error };

        await prisma.postCategory.create({ data });
        refresh();
        return { ok: true, message: 'دسته‌بندی ایجاد شد.' };
    } catch (error) {
        return failure(error);
    }
}

export async function updatePostCategory(id, input) {
    try {
        await ensureAdmin();
        const { data, error } = clean(input);
        if (error) return { ok: false, message: error };

        await prisma.postCategory.update({ where: { id }, data });
        refresh();
        return { ok: true, message: 'دسته‌بندی به‌روزرسانی شد.' };
    } catch (error) {
        return failure(error);
    }
}

export async function deletePostCategory(id) {
    try {
        await ensureAdmin();
        // Posts in this category simply become uncategorised (onDelete: SetNull).
        await prisma.postCategory.delete({ where: { id } });
        refresh();
        return { ok: true, message: 'دسته‌بندی حذف شد. مقالات آن بدون دسته‌بندی ماندند.' };
    } catch (error) {
        return failure(error);
    }
}
