import 'server-only';
import { prisma } from '@/lib/prisma';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { hasEnrollmentForCourse } from '@/queries/enrollments';

/**
 * Single source of truth for "may this visitor watch/download this lesson's
 * video?". Used by the signed-URL API; nothing else ever hands out a video
 * location.
 *
 *  - admin                       -> can watch + download
 *  - lesson marked free/public   -> anyone (even guests) can WATCH
 *  - student who bought course   -> can watch + download
 *  - everyone else               -> denied
 */
export async function resolveLessonVideoAccess(lessonId) {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: { select: { courseId: true } } },
    });

    if (!lesson) {
        return { status: 404, error: 'درس پیدا نشد.' };
    }

    const hasVideo = Boolean(lesson.videoKey || lesson.video_url);
    if (!hasVideo) {
        return { status: 404, error: 'برای این درس ویدیویی ثبت نشده است.' };
    }

    const user = await getLoggedInUser();
    const isAdmin = Boolean(user && user.isActive !== false && user.role === 'admin');
    const isFree = lesson.access === 'public';

    let isEnrolled = false;
    if (user && !isAdmin && !isFree && lesson.module?.courseId) {
        isEnrolled = await hasEnrollmentForCourse(lesson.module.courseId, user.id);
    }

    const canWatch = isAdmin || isFree || isEnrolled;
    if (!canWatch) {
        return user
            ? { status: 403, error: 'برای مشاهده‌ی این درس باید دوره را خریداری کنید.' }
            : { status: 401, error: 'برای مشاهده‌ی این درس ابتدا وارد حساب کاربری شوید.' };
    }

    // Free-preview viewers can stream, but downloading is a purchase perk.
    const canDownload = isAdmin || isEnrolled;

    return { lesson, user, canWatch, canDownload };
}
