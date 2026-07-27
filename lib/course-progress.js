import { prisma } from '@/lib/prisma';
import { getReport } from '@/queries/reports';

/**
 * Returns a plain-JSON-safe deep clone of `modules`, where every lesson gets
 * `.state = 'completed'` if the given user has a completed Watch record for
 * it. Used to show checkmarks in the curriculum accordion on both the
 * course page and the lesson page.
 */
export async function getModulesWithWatchState(course, userId) {
    if (!course?.modules || !userId) return course?.modules ?? [];

    const updatedModules = await Promise.all(
        course.modules.map(async (module) => {
            const moduleId = module._id?.toString?.() || module.id;
            const lessons = module?.lessonIds ?? [];

            const updatedLessons = await Promise.all(
                lessons.map(async (lesson) => {
                    const lessonId = lesson._id?.toString?.() || lesson.id;
                    const watch = await prisma.watch.findFirst({
                        where: { lessonId, moduleId, userId },
                    });
                    if (watch?.state === 'completed') {
                        return { ...lesson, state: 'completed' };
                    }
                    return lesson;
                }),
            );

            return { ...module, lessonIds: updatedLessons };
        }),
    );

    return sanitize(updatedModules);
}

function sanitize(data) {
    if (data == null) return data;
    return JSON.parse(
        JSON.stringify(data, (key, value) => {
            if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
                return value.toString('base64');
            }
            return value;
        }),
    );
}

/** Percentage (0-100) of modules the user has fully completed for a course. */
export async function getCourseProgressPercent(course, userId) {
    if (!userId) return 0;

    const report = await getReport({ course: course?.id, student: userId });
    const totalCompletedModules = report?.totalCompletedModeules ? report.totalCompletedModeules.length : 0;
    const totalModules = course?.modules ? course.modules.length : 0;

    return totalModules > 0 ? (totalCompletedModules / totalModules) * 100 : 0;
}
