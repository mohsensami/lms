import 'server-only';
import { getCourseDetails } from '@/queries/courses';
import { enrollForCourse, hasEnrollmentForCourse } from '@/queries/enrollments';

/**
 * Gives the student access to the course and e-mails the instructor and the
 * student. Safe to call more than once (it skips students who are already
 * enrolled) and shared by every gateway: Zarinpal's return page and Bale's
 * webhook both end up here once a payment is confirmed.
 *
 * Returns true when this call created the enrollment.
 */
export async function fulfillPurchase({ courseId, userId, customerName, customerEmail, method }) {
    if (await hasEnrollmentForCourse(courseId, userId)) return false;

    await enrollForCourse(courseId, userId, method);

    try {
        const course = await getCourseDetails(courseId);
        const productName = course?.title || '';
        const instructor = course?.instructor;
        const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : '';

        // Loaded lazily so a missing e-mail key can never block the enrolment.
        const { sendEmails } = await import('@/lib/emails');
        await sendEmails([
            {
                to: instructor?.email,
                subject: `ثبت‌نام جدید در دوره ${productName}`,
                message: `${instructorName} عزیز، تبریک! ${customerName} در دوره‌ی «${productName}» ثبت‌نام کرد.`,
            },
            {
                to: customerEmail,
                subject: `ثبت‌نام شما در دوره ${productName} انجام شد`,
                message: `${customerName} عزیز، ثبت‌نام شما در دوره‌ی «${productName}» با موفقیت انجام شد. برای شروع یادگیری وارد حساب کاربری خود شوید.`,
            },
        ]);
    } catch (error) {
        console.error('fulfillPurchase: e-mail step failed:', error?.message);
    }

    return true;
}
