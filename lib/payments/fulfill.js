import 'server-only';
import { enrollForCourse, hasEnrollmentForCourse } from '@/queries/enrollments';
import { sendPurchaseEmails } from '@/lib/email/notify';

/**
 * Gives the student access to the course and e-mails them the receipt with all
 * lesson links (and the instructor a note). Safe to call more than once: it
 * skips students who are already enrolled, so refreshing a payment page never
 * re-sends e-mails. Shared by every gateway (Zarinpal's return page and Bale's
 * webhook both end up here once a payment is confirmed).
 *
 * Returns true when this call created the enrolment.
 */
export async function fulfillPurchase({ courseId, userId, customerName, customerEmail, method, amountToman, refId }) {
    if (await hasEnrollmentForCourse(courseId, userId)) return false;

    await enrollForCourse(courseId, userId, method);

    const [firstName, ...rest] = String(customerName || '').split(' ');
    await sendPurchaseEmails({
        user: { firstName, lastName: rest.join(' '), email: customerEmail },
        courseId,
        amountToman,
        refId,
        method,
    });

    return true;
}
