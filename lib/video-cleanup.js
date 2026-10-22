import 'server-only';
import { prisma } from '@/lib/prisma';
import { getStorageDriver, isKnownProvider } from '@/lib/storage';

/**
 * Best-effort removal of stored video objects (never throws — a storage
 * hiccup must not block deleting a lesson/module/course in the database).
 */
export async function deleteStoredVideos(lessons = []) {
    await Promise.all(
        lessons
            .filter((lesson) => lesson?.videoKey && isKnownProvider(lesson.videoProvider))
            .map(async (lesson) => {
                try {
                    await getStorageDriver(lesson.videoProvider).deleteObject(lesson.videoKey);
                } catch (error) {
                    console.warn(`Could not delete video object ${lesson.videoKey}:`, error?.message);
                }
            }),
    );
}

export async function getLessonsOfModule(moduleId) {
    return prisma.lesson.findMany({
        where: { moduleId },
        select: { videoProvider: true, videoKey: true },
    });
}

export async function getLessonsOfCourse(courseId) {
    return prisma.lesson.findMany({
        where: { module: { courseId } },
        select: { videoProvider: true, videoKey: true },
    });
}
