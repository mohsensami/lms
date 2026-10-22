// Helpers that turn a student's enrollments + progress reports into the
// numbers shown on the "پیشرفت من" pie chart (and on the admin's per-user
// detail page). Pure functions, no DB access.

export const PROGRESS_STATUS = {
    COMPLETED: 'completed', // گذرانده‌شده
    IN_PROGRESS: 'in-progress', // در حال یادگیری
    NOT_STARTED: 'not-started', // شروع‌نشده
};

export const PROGRESS_STATUS_LABEL = {
    [PROGRESS_STATUS.COMPLETED]: 'گذرانده‌شده',
    [PROGRESS_STATUS.IN_PROGRESS]: 'در حال یادگیری',
    [PROGRESS_STATUS.NOT_STARTED]: 'شروع‌نشده',
};

/**
 * enrollments: from getEnrollmentsForUser (each has `.course` with `.modules`)
 * reports:     from getReportsForUser (each has `.courseId`)
 */
export function summarizeCourseProgress(enrollments = [], reports = []) {
    const reportByCourse = new Map(reports.map((r) => [r.courseId, r]));
    const seen = new Set();
    const courses = [];

    for (const enrollment of enrollments) {
        const course = enrollment?.course;
        const courseId = course?.id || course?._id?.toString?.();
        if (!courseId || seen.has(courseId)) continue;
        seen.add(courseId);

        const report = reportByCourse.get(courseId);
        const totalModules = course?.modules?.length || 0;
        const completedModules = Math.min(report?.totalCompletedModeules?.length || 0, totalModules || Infinity);
        const rawPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        // A course counts as "passed" once the completion date was recorded
        // (set when every module is done) or every module is complete.
        const isCompleted = Boolean(report?.completion_date) || (totalModules > 0 && rawPercent >= 100);
        const percent = isCompleted ? 100 : rawPercent;
        const status = isCompleted
            ? PROGRESS_STATUS.COMPLETED
            : percent > 0
              ? PROGRESS_STATUS.IN_PROGRESS
              : PROGRESS_STATUS.NOT_STARTED;

        courses.push({
            courseId,
            title: course?.title || 'دوره',
            percent,
            status,
            totalModules,
            completedModules: isCompleted ? totalModules : completedModules,
            completionDate: report?.completion_date || null,
        });
    }

    const counts = {
        [PROGRESS_STATUS.COMPLETED]: courses.filter((c) => c.status === PROGRESS_STATUS.COMPLETED).length,
        [PROGRESS_STATUS.IN_PROGRESS]: courses.filter((c) => c.status === PROGRESS_STATUS.IN_PROGRESS).length,
        [PROGRESS_STATUS.NOT_STARTED]: courses.filter((c) => c.status === PROGRESS_STATUS.NOT_STARTED).length,
    };
    const averagePercent = courses.length
        ? Math.round(courses.reduce((sum, c) => sum + c.percent, 0) / courses.length)
        : 0;

    return { courses, counts, total: courses.length, averagePercent };
}
