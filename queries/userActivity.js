import { replaceMongoIdInArray } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';
import { getUserDetails } from '@/queries/users';
import { getEnrollmentsForUser } from '@/queries/enrollments';
import { getReportsForUser } from '@/queries/reports';
import { getTestimonialsForUser } from '@/queries/testimonials';
import { getPostCommentsForUser } from '@/queries/postComments';

/**
 * Everything an admin needs to know about one user: which courses they
 * bought/are enrolled in, their progress, and every comment they left
 * (course reviews + blog comments).
 */
export async function getUserActivity(userId) {
    const user = await getUserDetails(userId);
    if (!user) return null;

    const [enrollments, reports, orders, courseComments, postComments, certificateRequests] = await Promise.all([
        getEnrollmentsForUser(user.id),
        getReportsForUser(user.id),
        prisma.order.findMany({
            where: { userId: user.id },
            include: { course: true },
            orderBy: { createdAt: 'desc' },
        }),
        getTestimonialsForUser(user.id),
        getPostCommentsForUser(user.id),
        prisma.certificateRequest.findMany({
            where: { studentId: user.id },
            include: { course: true },
            orderBy: { requestedAt: 'desc' },
        }),
    ]);

    return {
        user,
        enrollments,
        reports,
        orders: replaceMongoIdInArray(orders),
        courseComments,
        postComments,
        certificateRequests: replaceMongoIdInArray(certificateRequests),
    };
}
