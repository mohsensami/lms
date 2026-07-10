import { replaceMongoIdInArray, mapScalarRefsInArray } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function getEnrollmentsForCourse(courseId) {
    return withDb(async () => {
        const enrollments = await prisma.enrollment.findMany({ where: { courseId } });
        const mapped = mapScalarRefsInArray(enrollments, { courseId: 'course', studentId: 'student' });
        return replaceMongoIdInArray(mapped);
    });
}

export async function enrollForCourse(courseId, userId, paymentMethod) {
    try {
        return await withDb(async () => {
            const response = await prisma.enrollment.create({
                data: {
                    courseId,
                    studentId: userId,
                    method: paymentMethod,
                    enrollment_date: new Date(),
                    status: 'not-started',
                },
            });
            return response;
        });
    } catch (error) {
        throw new Error(error);
    }
}

export async function getEnrollmentsForUser(userId) {
    try {
        return await withDb(async () => {
            const enrollments = await prisma.enrollment.findMany({
                where: { studentId: userId },
                include: {
                    course: {
                        include: {
                            category: true,
                            modules: true,
                        },
                    },
                },
            });
            return replaceMongoIdInArray(enrollments);
        });
    } catch (err) {
        throw new Error(err);
    }
}

export async function hasEnrollmentForCourse(courseId, studentId) {
    if (!courseId || !studentId) {
        return false;
    }

    try {
        return await withDb(async () => {
            const enrollment = await prisma.enrollment.findFirst({
                where: {
                    courseId,
                    studentId,
                },
                include: {
                    course: true,
                },
            });

            return Boolean(enrollment);
        });
    } catch (error) {
        throw new Error(error);
    }
}
