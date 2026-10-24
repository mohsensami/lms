import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAdminForRoute } from '@/lib/admin-guard';
import {
    getActiveProviderId,
    getStorageDriver,
    MAX_VIDEO_SIZE_BYTES,
    VIDEO_PART_SIZE,
    UPLOAD_URL_TTL,
} from '@/lib/storage';
import { getExtension, lessonKeyPrefix, resolveVideoContentType } from '@/lib/video-upload';

export const dynamic = 'force-dynamic';

const MAX_PARTS = 10000; // S3 limit
const CLOUDINARY_CHUNK_SIZE = 20 * 1024 * 1024; // Cloudinary needs >= 5 MB per chunk

/**
 * Step 1 of an upload. Admin only. Prepares an upload on the ACTIVE storage
 * provider; the browser then sends the file straight to the provider (the
 * video never passes through this server — important on Vercel, which caps
 * request bodies at a few MB). The response `kind` tells the browser how:
 *
 *   s3-multipart  presigned part URLs (Tigris, S3, R2, ...)
 *   cloudinary    signed chunked upload to Cloudinary
 *   uploadthing   the UploadThing SDK (no server session needed)
 */
export async function POST(request) {
    const guard = await requireAdminForRoute();
    if (guard.response) return guard.response;

    try {
        const { lessonId, filename, contentType, size } = await request.json();

        if (!lessonId || !filename || !Number.isFinite(size) || size <= 0) {
            return Response.json({ error: 'اطلاعات فایل نامعتبر است.' }, { status: 400 });
        }

        const resolvedType = resolveVideoContentType(filename, contentType);
        if (!resolvedType) {
            return Response.json(
                { error: 'فقط فایل‌های ویدیویی (mp4, mov, webm, mkv) مجاز هستند.' },
                { status: 400 },
            );
        }

        if (size > MAX_VIDEO_SIZE_BYTES) {
            const maxGb = (MAX_VIDEO_SIZE_BYTES / 1024 ** 3).toFixed(1);
            return Response.json({ error: `حداکثر حجم مجاز ویدیو ${maxGb} گیگابایت است.` }, { status: 400 });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { select: { courseId: true } } },
        });
        if (!lesson || !lesson.module?.courseId) {
            return Response.json({ error: 'درس پیدا نشد.' }, { status: 404 });
        }

        const providerId = await getActiveProviderId();
        let driver;
        try {
            driver = getStorageDriver(providerId);
        } catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        if (driver.type === 'link') {
            return Response.json(
                { error: 'ذخیره‌سازی روی «لینک ساده» است؛ به‌جای آپلود، لینک ویدیو را وارد کنید.' },
                { status: 400 },
            );
        }

        // ---- UploadThing: the SDK handles everything client-side ----
        if (driver.type === 'uploadthing') {
            return Response.json({ kind: 'uploadthing', provider: providerId, contentType: resolvedType });
        }

        // Random, unguessable key. The original filename is only kept as
        // metadata on the lesson, never in the key.
        const ext = getExtension(filename) || 'mp4';
        const prefix = lessonKeyPrefix(lesson.module.courseId, lesson._id);

        // ---- Cloudinary: signed, chunked upload ----
        if (driver.type === 'cloudinary') {
            const publicId = `${driver.publicIdPrefix(prefix)}${randomUUID()}`;
            const session = driver.createUploadSession(publicId);
            return Response.json({
                kind: 'cloudinary',
                provider: providerId,
                publicId,
                contentType: resolvedType,
                chunkSize: CLOUDINARY_CHUNK_SIZE,
                ...session,
            });
        }

        // ---- S3-compatible: multipart with presigned part URLs ----
        const partCount = Math.ceil(size / VIDEO_PART_SIZE);
        if (partCount > MAX_PARTS) {
            return Response.json({ error: 'حجم فایل بیش از حد مجاز است.' }, { status: 400 });
        }

        const key = `${prefix}${randomUUID()}.${ext}`;
        const uploadId = await driver.createMultipartUpload({ key, contentType: resolvedType });

        const parts = await Promise.all(
            Array.from({ length: partCount }, async (_, index) => ({
                partNumber: index + 1,
                url: await driver.signUploadPart({
                    key,
                    uploadId,
                    partNumber: index + 1,
                    expiresIn: UPLOAD_URL_TTL,
                }),
            })),
        );

        return Response.json({
            kind: 's3-multipart',
            provider: providerId,
            key,
            uploadId,
            contentType: resolvedType,
            partSize: VIDEO_PART_SIZE,
            parts,
        });
    } catch (error) {
        console.error('video-upload/init error:', error);
        return Response.json({ error: 'شروع آپلود با مشکل مواجه شد.' }, { status: 500 });
    }
}
