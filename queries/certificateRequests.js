import { replaceMongoIdInArray, replaceMongoIdInObject } from '@/lib/convertData';
import { prisma } from '@/lib/prisma';

export async function getCertificateRequest(courseId, studentId) {
    if (!courseId || !studentId) return null;
    const request = await prisma.certificateRequest.findUnique({
        where: { courseId_studentId: { courseId, studentId } },
    });
    return replaceMongoIdInObject(request);
}

export async function createCertificateRequest(courseId, studentId) {
    // Upsert so re-requesting after a rejection resets it back to pending
    // instead of erroring on the unique (courseId, studentId) constraint.
    const request = await prisma.certificateRequest.upsert({
        where: { courseId_studentId: { courseId, studentId } },
        update: { status: 'pending', requestedAt: new Date(), decidedAt: null, decidedById: null },
        create: { courseId, studentId },
    });
    return replaceMongoIdInObject(request);
}

export async function getCertificateRequestsForReview(user) {
    const isAdmin = user?.role === 'admin';

    const requests = await prisma.certificateRequest.findMany({
        where: isAdmin ? {} : { course: { instructorId: user?.id } },
        include: { course: true, student: true },
        orderBy: { requestedAt: 'desc' },
    });
    return replaceMongoIdInArray(requests);
}

export async function setCertificateRequestStatus(requestId, status, decidedById) {
    return prisma.certificateRequest.update({
        where: { id: requestId },
        data: { status, decidedAt: new Date(), decidedById },
    });
}
