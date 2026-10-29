import { prisma } from '@/lib/prisma';
import { getExamStateForStudent } from '@/lib/exam';

/**
 * Returns one entry per distinct student who has any activity on one of the
 * course (admins see everything) — enrolled OR simply has
 * an order/invoice for it. We union both sources (not just Enrollment)
 * because a paid order can exist without a matching Enrollment row if that
 * step ever failed silently, and admins/instructors should still see that
 * customer rather than have them silently disappear.
 */
export async function getStudentsOverview() {
    const courses = await prisma.course.findMany({
        
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
                const [student, order, certificateRequest, commentCount, examState] = await Promise.all([
                    prisma.user.findUnique({ where: { id: studentId } }),
                    prisma.order.findFirst({
                        where: { courseId: course.id, userId: studentId },
                        orderBy: { createdAt: 'desc' },
                    }),
                    prisma.certificateRequest
                        .findUnique({
                            where: { courseId_studentId: { courseId: course.id, studentId } },
                        })
                        .catch(() => null),
                    prisma.testimonial.count({ where: { courseId: course.id, userId: studentId } }),
                    getExamStateForStudent(course.id, studentId),
                ]);

                if (!student) return;

                const isEnrolled = enrollments.some((e) => e.studentId === studentId);

                const courseEntry = {
                    courseId: course.id,
                    courseTitle: course.title,
                    orderStatus: order?.status || null,
                    isEnrolled,
                    examState: examState.state,
                    examScore: examState.state === 'passed' ? examState.attempt : null,
                    examLockedUntil: examState.lockedUntil || null,
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
