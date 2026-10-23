import { prisma } from '@/lib/prisma';
import { requireAdminForRoute } from '@/lib/admin-guard';
import { getStorageDriver, isKnownProvider } from '@/lib/storage';
import { lessonKeyPrefix } from '@/lib/video-upload';

export const dynamic = 'force-dynamic';

/** Cancels an unfinished multipart upload so no orphaned parts are billed. */
export async function POST(request) {
    const guard = await requireAdminForRoute();
    if (guard.response) return guard.response;

    try {
        const { lessonId, provider, key, uploadId } = await request.json();

        if (!lessonId || !key || !uploadId || !isKnownProvider(provider)) {
            return Response.json({ error: 'اطلاعات نامعتبر است.' }, { status: 400 });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { select: { courseId: true } } },
        });
        if (!lesson?.module?.courseId || !key.startsWith(lessonKeyPrefix(lesson.module.courseId, lesson._id))) {
            return Response.json({ error: 'کلید فایل نامعتبر است.' }, { status: 400 });
        }

        const driver = getStorageDriver(provider);
        // Only S3-style multipart uploads leave parts behind; Cloudinary and
        // UploadThing discard unfinished uploads on their own.
        if (driver.type === 's3') {
            await driver.abortMultipartUpload({ key, uploadId });
        }
        return Response.json({ ok: true });
    } catch (error) {
        console.error('video-upload/abort error:', error);
        return Response.json({ error: 'لغو آپلود با مشکل مواجه شد.' }, { status: 500 });
    }
}
