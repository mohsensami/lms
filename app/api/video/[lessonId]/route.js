import { resolveLessonVideoAccess } from '@/lib/video-access';
import { getStorageDriver, PLAYBACK_URL_TTL, DOWNLOAD_URL_TTL } from '@/lib/storage';

// Never cache: every response is a per-user, expiring signed link.
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0' };

/**
 * GET /api/video/:lessonId            -> { url, expiresIn }  (stream)
 * GET /api/video/:lessonId?download=1 -> { url, expiresIn }  (attachment)
 *
 * The browser never learns the bucket or object key — only a signed URL that
 * is issued after the access check below and expires on its own.
 */
export async function GET(request, { params }) {
    try {
        const { lessonId } = await params;
        const wantsDownload = new URL(request.url).searchParams.get('download') === '1';

        const access = await resolveLessonVideoAccess(lessonId);
        if (access.error) {
            return Response.json({ error: access.error }, { status: access.status, headers: NO_STORE });
        }

        const { lesson, canDownload } = access;

        if (wantsDownload && !canDownload) {
            return Response.json(
                { error: 'دانلود ویدیو فقط برای خریداران دوره امکان‌پذیر است.' },
                { status: 403, headers: NO_STORE },
            );
        }

        // Legacy lessons that still point at an external link (YouTube,
        // a plain .mp4, ...). The link is only revealed after the check.
        if (!lesson.videoKey) {
            return Response.json(
                { url: lesson.video_url, external: true },
                { headers: NO_STORE },
            );
        }

        const driver = getStorageDriver(lesson.videoProvider);
        const expiresIn = wantsDownload ? DOWNLOAD_URL_TTL : PLAYBACK_URL_TTL;
        const url = await driver.signDownload({
            key: lesson.videoKey,
            expiresIn,
            download: wantsDownload,
            filename: lesson.videoName || `${lesson.slug || 'video'}.mp4`,
            contentType: lesson.videoContentType || undefined,
        });

        return Response.json({ url, expiresIn }, { headers: NO_STORE });
    } catch (error) {
        console.error('GET /api/video error:', error);
        return Response.json(
            { error: 'خطا در دریافت لینک ویدیو. لطفاً دوباره تلاش کنید.' },
            { status: 500, headers: NO_STORE },
        );
    }
}
