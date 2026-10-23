import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminForRoute } from '@/lib/admin-guard';
import { getStorageDriver, isKnownProvider } from '@/lib/storage';
import { COURSES_CACHE_TAG } from '@/queries/courses';
import { lessonKeyPrefix } from '@/lib/video-upload';
import { deleteStoredVideos } from '@/lib/video-cleanup';

export const dynamic = 'force-dynamic';

const bad = (error, status = 400) => Response.json({ error }, { status });

/**
 * Last step of an upload. Verifies what the browser reports, then attaches
 * the finished video to the lesson (replacing and deleting any previous one).
 * Admin only. What is verified depends on the provider type:
 *
 *   s3          finishes the multipart upload, key must belong to this lesson
 *   cloudinary  public id must be under this lesson's folder, URL must be ours
 *   uploadthing URL must be an UploadThing URL
 */
export async function POST(request) {
    const guard = await requireAdminForRoute();
    if (guard.response) return guard.response;

    try {
        const body = await request.json();
        const { lessonId, provider, filename, size, contentType, duration } = body;

        if (!lessonId || !provider) return bad('اطلاعات آپلود ناقص است.');
        if (!isKnownProvider(provider)) return bad('ارائه‌دهنده‌ی ذخیره‌سازی نامعتبر است.');

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { select: { courseId: true } } },
        });
        if (!lesson || !lesson.module?.courseId) return bad('درس پیدا نشد.', 404);

        const prefix = lessonKeyPrefix(lesson.module.courseId, lesson._id);
        const driver = getStorageDriver(provider);

        let videoKey;
        let videoUrl = null;
        let reportedDuration = null;

        if (driver.type === 's3') {
            const { key, uploadId, parts } = body;
            if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0) return bad('اطلاعات آپلود ناقص است.');
            if (!key.startsWith(prefix)) return bad('کلید فایل نامعتبر است.');

            await driver.completeMultipartUpload({ key, uploadId, parts });
            videoKey = key;
        } else if (driver.type === 'cloudinary') {
            const { publicId, url } = body;
            if (!publicId || !url) return bad('اطلاعات آپلود ناقص است.');
            if (!publicId.startsWith(driver.publicIdPrefix(prefix))) return bad('شناسه‌ی فایل نامعتبر است.');
            if (!driver.isOwnUrl(url)) return bad('آدرس ویدیو نامعتبر است.');

            videoKey = publicId;
            videoUrl = url;
            reportedDuration = Number(body.cloudDuration) || null;
        } else if (driver.type === 'uploadthing') {
            const { key, url } = body;
            if (!key || !url) return bad('اطلاعات آپلود ناقص است.');
            if (!driver.isOwnUrl(url)) return bad('آدرس ویدیو نامعتبر است.');

            videoKey = key;
            videoUrl = url;
        } else {
            return bad('نوع ذخیره‌ساز پشتیبانی نمی‌شود.');
        }

        const previous = { videoProvider: lesson.videoProvider, videoKey: lesson.videoKey };

        const data = {
            videoProvider: provider,
            videoKey,
            videoUrl,
            videoName: typeof filename === 'string' ? filename.slice(0, 255) : null,
            videoSize: Number.isFinite(size) ? size : null,
            videoContentType: contentType || null,
            // A stored video replaces any legacy external link.
            video_url: null,
        };
        const bestDuration = Number.isFinite(duration) && duration > 0 ? duration : reportedDuration;
        if (bestDuration) data.duration = Math.round(bestDuration);

        await prisma.lesson.update({ where: { id: lessonId }, data });

        // Best-effort cleanup of the replaced file so we don't pay for orphans.
        if (previous.videoKey && !(previous.videoKey === videoKey && previous.videoProvider === provider)) {
            await deleteStoredVideos([previous]);
        }

        revalidateTag(COURSES_CACHE_TAG);

        return Response.json({ ok: true, duration: data.duration ?? null });
    } catch (error) {
        console.error('video-upload/complete error:', error);
        return bad('نهایی‌سازی آپلود با مشکل مواجه شد.', 500);
    }
}
