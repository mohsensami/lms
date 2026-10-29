'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { getUserByEmail } from '@/queries/users';
import { hasEnrollmentForCourse } from '@/queries/enrollments';
import { createCertificateRequest, getCertificateRequest, setCertificateRequestStatus } from '@/queries/certificateRequests';
import { getExamStateForStudent } from '@/lib/exam';
import { formatFaDate } from '@/lib/date';

async function requireLoggedInUser() {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error('برای این کار ابتدا وارد حساب کاربری خود شوید.');
    }
    return getUserByEmail(session.user.email);
}

// Returns { ok, error } instead of throwing: in production Next.js hides the
// message of thrown server-action errors from the browser.
export async function requestCertificate(courseId) {
    let user;
    try {
        user = await requireLoggedInUser();
    } catch (error) {
        return { ok: false, error: error.message };
    }

    const enrolled = await hasEnrollmentForCourse(courseId, user.id);
    if (!enrolled) {
        return { ok: false, error: 'شما در این دوره ثبت‌نام نکرده‌اید.' };
    }

    // The requirement for a certificate is passing the course exam.
    const exam = await getExamStateForStudent(courseId, user.id);
    if (exam.state === 'no_exam') {
        return { ok: false, error: 'برای این دوره آزمونی منتشر نشده است.' };
    }
    if (exam.state === 'locked') {
        return {
            ok: false,
            error: `شما در آزمون قبول نشدید؛ ارسال درخواست مدرک تا ${formatFaDate(exam.lockedUntil)} قفل است.`,
        };
    }
    if (exam.state !== 'passed') {
        return { ok: false, error: 'برای درخواست مدرک ابتدا باید در آزمون دوره قبول شوید.' };
    }

    const existing = await getCertificateRequest(courseId, user.id);
    if (existing && existing.status !== 'rejected') {
        return { ok: false, error: 'درخواست مدرک شما قبلاً ثبت شده است.' };
    }

    await createCertificateRequest(courseId, user.id);
    revalidatePath('/account/certificates');
    return { ok: true };
}

async function requireCanReviewCertificateRequest(courseId) {
    const user = await requireLoggedInUser();
    if (user.role === 'admin') return user;

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
