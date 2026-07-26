'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { getUserByEmail } from '@/queries/users';
import { hasEnrollmentForCourse } from '@/queries/enrollments';
import { createCertificateRequest, setCertificateRequestStatus } from '@/queries/certificateRequests';
import { prisma } from '@/lib/prisma';

async function requireLoggedInUser() {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error('برای این کار ابتدا وارد حساب کاربری خود شوید.');
    }
    return getUserByEmail(session.user.email);
}

export async function requestCertificate(courseId) {
    const user = await requireLoggedInUser();

    const enrolled = await hasEnrollmentForCourse(courseId, user.id);
    if (!enrolled) {
        throw new Error('شما در این دوره ثبت‌نام نکرده‌اید.');
    }

    await createCertificateRequest(courseId, user.id);
    revalidatePath('/account/certificates');
}

async function requireCanReviewCertificateRequest(courseId) {
    const user = await requireLoggedInUser();
    if (user.role === 'admin') return user;

    if (user.role === 'instructor') {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (course?.instructorId === user.id) return user;
    }

    throw new Error('شما اجازه‌ی بررسی این درخواست را ندارید.');
}

export async function approveCertificateRequest(requestId, courseId) {
    const user = await requireCanReviewCertificateRequest(courseId);
    await setCertificateRequestStatus(requestId, 'approved', user.id);
    revalidatePath('/account/certificate-requests');
}

export async function rejectCertificateRequest(requestId, courseId) {
    const user = await requireCanReviewCertificateRequest(courseId);
    await setCertificateRequestStatus(requestId, 'rejected', user.id);
    revalidatePath('/account/certificate-requests');
}
