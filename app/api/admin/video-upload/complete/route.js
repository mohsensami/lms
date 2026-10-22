import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminForRoute } from '@/lib/admin-guard';
import { getStorageDriver, isKnownProvider } from '@/lib/storage';
import { COURSES_CACHE_TAG } from '@/queries/courses';
import { lessonKeyPrefix } from '@/lib/video-upload';

export const dynamic = 'force-dynamic';

/**
 * Step 3 of an upload. Stitches the uploaded parts together, then attaches
 * the finished object to the lesson (replacing and deleting any previous
 * video). Admin only.
 */
export async function POST(request) {
    const guard = await requireAdminForRoute();
    if (guard.response) return guard.response;

    try {
        const { lessonId, provider, key, uploadId, parts, filename, size, contentType, duration } =
            await request.json();

        if (!lessonId || !provider || !key || !uploadId || !Array.isArray(parts) || parts.length === 0) {
            return Response.json({ error: 'اطلاعات آپلود ناقص است.' }, { status: 400 });
        }
        if (!isKnownProvider(provider)) {
            return Response.json({ error: 'ارائه‌دهنده‌ی ذخیره‌سازی نامعتبر است.' }, { status: 400 });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { select: { courseId: true } } },
        });
        if (!lesson || !lesson.module?.courseId) {
            return Response.json({ error: 'درس پیدا نشد.' }, { status: 404 });
        }

        // The key must belong to THIS lesson — never trust the client blindly.
        if (!key.startsWith(lessonKeyPrefix(lesson.module.courseId, lesson._id))) {
            return Response.json({ error: 'کلید فایل نامعتبر است.' }, { status: 400 });
        }

        const driver = getStorageDriver(provider);
        await driver.completeMultipartUpload({ key, uploadId, parts });

        const previous = { provider: lesson.videoProvider, key: lesson.videoKey };

        const data = {
            videoProvider: provider,
            videoKey: key,
            videoName: typeof filename === 'string' ? filename.slice(0, 255) : null,
            videoSize: Number.isFinite(size) ? size : null,
            videoContentType: contentType || null,
            // A stored video replaces any legacy external link.
            video_url: null,
        };
        if (Number.isFinite(duration) && duration > 0) {
            data.duration = Math.round(duration);
        }

        await prisma.lesson.update({ where: { id: lessonId }, data });

        // Best-effort cleanup of the replaced file so we don't pay for orphans.
        if (previous.key && previous.key !== key && isKnownProvider(previous.provider)) {
            try {
                await getStorageDriver(previous.provider).deleteObject(previous.key);
            } catch (error) {
                console.warn('Could not delete previous video object:', error?.message);
            }
        }

        revalidateTag(COURSES_CACHE_TAG);

        return Response.json({ ok: true, duration: data.duration ?? null });
    } catch (error) {
        console.error('video-upload/complete error:', error);
        return Response.json({ error: 'نهایی‌سازی آپلود با مشکل مواجه شد.' }, { status: 500 });
    }
}
