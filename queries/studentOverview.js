import { prisma } from '@/lib/prisma';
import { getQuizScore } from '@/lib/quiz-score';

/**
 * Returns one entry per distinct student who has any activity on one of the
 * given user's courses (all courses, for an admin) — enrolled OR simply has
 * an order/invoice for it. We union both sources (not just Enrollment)
 * because a paid order can exist without a matching Enrollment row if that
 * step ever failed silently, and admins/instructors should still see that
 * customer rather than have them silently disappear.
 */
export async function getStudentsOverview(user) {
    const isAdmin = user?.role === 'admin';

    const courses = await prisma.course.findMany({
        where: isAdmin ? {} : { instructorId: user?.id },
        include: { _count: { select: { modules: true } } },
    });

    const studentsMap = new Map();

    for (const course of courses) {
        const [enrollments, orders] = await Promise.all([
            prisma.enrollment.findMany({ where: { courseId: course.id } }),
            prisma.order.findMany({ where: { courseId: course.id } }),
        ]);

        const studentIds = new Set(
            [...enrollments.map((e) => e.studentId), ...orders.map((o) => o.userId)].filter(Boolean),
        );

        await Promise.all(
            Array.from(studentIds).map(async (studentId) => {
                const [student, order, report, certificateRequest, commentCount] = await Promise.all([
                    prisma.user.findUnique({ where: { id: studentId } }),
                    prisma.order.findFirst({
                        where: { courseId: course.id, userId: studentId },
                        orderBy: { createdAt: 'desc' },
                    }),
                    prisma.report.findFirst({
                        where: { courseId: course.id, studentId },
                        include: { quizAssessment: true },
                    }),
                    prisma.certificateRequest
                        .findUnique({
                            where: { courseId_studentId: { courseId: course.id, studentId } },
                        })
                        .catch(() => null),
                    prisma.testimonial.count({ where: { courseId: course.id, userId: studentId } }),
                ]);

                if (!student) return;

                const totalModules = course._count?.modules || 0;
                const completedModules = report?.totalCompletedModeules?.length || 0;
                const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
                const quizScore = report?.quizAssessment ? getQuizScore(report.quizAssessment) : null;
                const isEnrolled = enrollments.some((e) => e.studentId === studentId);

                const courseEntry = {
                    courseId: course.id,
                    courseTitle: course.title,
                    orderStatus: order?.status || null,
                    isEnrolled,
                    progressPercent,
                    quizTaken: Boolean(report?.quizAssessment),
                    quizScore,
                    certificateStatus: certificateRequest?.status || 'none',
                    commentCount,
                };

                if (!studentsMap.has(student.id)) {
                    studentsMap.set(student.id, {
                        student: {
                            id: student.id,
                            firstName: student.firstName,
                            lastName: student.lastName,
                            email: student.email,
                            profilePicture: student.profilePicture,
                            isActive: student.isActive,
                        },
                        courses: [],
                    });
                }
                studentsMap.get(student.id).courses.push(courseEntry);
            }),
        );
    }

    return Array.from(studentsMap.values());
}
