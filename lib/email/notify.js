import 'server-only';
import { getSiteSettings } from '@/lib/site-settings';
import { getPrimaryColor } from '@/lib/site-theme';
import { readableTextColor } from '@/lib/theme';
import { SITE_URL } from '@/lib/seo';
import { formatPrice } from '@/lib/formatPrice';
import { getCourseDetails } from '@/queries/courses';
import { sendMail } from '@/lib/email/send';
import {
    adminContactEmail,
    adminTicketEmail,
    commentReplyEmail,
    ticketClosedEmail,
    ticketCreatedEmail,
    ticketReplyEmail,
    contactConfirmationEmail,
    fill,
    instructorSaleEmail,
    messageEmail,
    purchaseEmail,
    testEmail,
    welcomeEmail,
} from '@/lib/email/templates';

// High-level "send this e-mail now" functions used by the rest of the app.
// Every one of them is safe to await: it never throws (see sendMail), and
// each respects the on/off switches in Settings -> e-mails.

const METHOD_LABELS = { zarinpal: 'زرین‌پال', bale: 'کیف پول بله' };

async function getContext() {
    const [settings, color] = await Promise.all([getSiteSettings(), getPrimaryColor()]);
    const { name, logoUrl } = settings.general;

    // Mail clients need an absolute https image address.
    const absoluteLogo = logoUrl ? (logoUrl.startsWith('/') ? `${SITE_URL}${logoUrl}` : logoUrl) : '';

    return {
        settings,
        site: { name, url: SITE_URL, logoUrl: /^https?:\/\//.test(absoluteLogo) ? absoluteLogo : '' },
        theme: { color, onColor: readableTextColor(color) },
    };
}

const copyFor = (settings, vars, prefix) => ({
    subject: fill(settings.email[`${prefix}Subject`], vars),
    text: fill(settings.email[`${prefix}Text`], vars),
    signature: fill(settings.email.signature, vars),
});

/** After a new account is created (e-mail sign-up or first Google sign-in). */
export async function sendWelcomeEmail(user) {
    try {
        if (!user?.email) return { ok: false };
        const { settings, site, theme } = await getContext();
        if (!settings.email.welcomeEnabled) return { ok: false, skipped: true };

        const vars = { siteName: site.name };
        const mail = welcomeEmail({ site, theme, copy: copyFor(settings, vars, 'welcome'), user });
        return await sendMail({ to: user.email, ...mail });
    } catch (error) {
        console.error('[email] sendWelcomeEmail failed:', error?.message);
        return { ok: false };
    }
}

/** After a contact-form message is saved: thank the sender, tell the admin. */
export async function sendContactEmails(message) {
    try {
        const { settings, site, theme } = await getContext();
        const vars = { siteName: site.name };

        if (settings.email.contactEnabled) {
            const mail = contactConfirmationEmail({ site, theme, copy: copyFor(settings, vars, 'contact'), message });
            await sendMail({ to: message.email, ...mail });
        }

        const adminTo = settings.email.adminEmail || process.env.ADMIN_NOTIFY_EMAIL;
        if (settings.email.adminNotifyEnabled && adminTo) {
            const mail = adminContactEmail({ site, theme, message });
            await sendMail({ to: adminTo, replyTo: message.email, ...mail });
        }
    } catch (error) {
        console.error('[email] sendContactEmails failed:', error?.message);
    }
}

/**
 * After a successful purchase: the student gets a receipt plus the full list
 * of the course's modules and lessons with direct links; the instructor gets a
 * short "new student" note.
 */
export async function sendPurchaseEmails({ user, courseId, amountToman, refId, method }) {
    try {
        const { settings, site, theme } = await getContext();
        const details = await getCourseDetails(courseId);
        if (!details) return;

        const vars = { siteName: site.name, courseTitle: details.title };
        const customerName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

        // Only published modules/lessons, in their teaching order.
        const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
        const course = {
            id: details.id,
            title: details.title,
            modules: [...(details.modules || [])]
                .filter((module) => module.active !== false)
                .sort(byOrder)
                .map((module) => ({
                    title: module.title,
                    lessons: [...(module.lessonIds || [])]
                        .filter((lesson) => lesson.active !== false)
                        .sort(byOrder)
                        .map((lesson) => ({
                            title: lesson.title,
                            slug: lesson.slug,
                            duration: lesson.duration,
                            access: lesson.access,
                        })),
                })),
        };

        if (settings.email.purchaseEnabled && user.email) {
            const receipt = {
                amountText: amountToman != null ? formatPrice(amountToman) : '',
                methodLabel: METHOD_LABELS[method] || '',
                refId: refId ? String(refId) : '',
                dateText: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date()),
            };
            const mail = purchaseEmail({ site, theme, copy: copyFor(settings, vars, 'purchase'), user, course, receipt });
            await sendMail({ to: user.email, ...mail });
        }

        const instructor = details.instructor;
        if (instructor?.email) {
            const mail = instructorSaleEmail({
                site,
                theme,
                instructor: `${instructor.firstName ?? ''} ${instructor.lastName ?? ''}`.trim() || 'مدرس',
                customerName,
                courseTitle: details.title,
            });
            await sendMail({ to: instructor.email, ...mail });
        }
    } catch (error) {
        console.error('[email] sendPurchaseEmails failed:', error?.message);
    }
}

/** Settings -> e-mails -> "send a test". */
export async function sendTestEmail(to) {
    const { site, theme } = await getContext();
    return sendMail({ to, ...testEmail({ site, theme }) });
}

/** Generic one-off message (kept for the old sendEmails() API). */
export async function sendSimpleMessage({ to, subject, message }) {
    const { site, theme } = await getContext();
    return sendMail({ to, ...messageEmail({ site, theme, subject, message }) });
}

// ------------------------------------------------------- comment replies

/**
 * A reply was written to someone's comment (blog comment or course review):
 * tell the author. `target` is { title, path } of the post/course.
 */
export async function sendCommentReplyEmail({ author, comment, reply, replier, target }) {
    try {
        if (!author?.email) return { ok: false };
        const { settings, site, theme } = await getContext();
        if (!settings.email.commentReplyEnabled) return { ok: false, skipped: true };

        const vars = { siteName: site.name };
        const mail = commentReplyEmail({
            site,
            theme,
            copy: copyFor(settings, vars, 'commentReply'),
            recipient: author,
            targetTitle: target?.title,
            targetUrl: target?.path ? `${site.url}${target.path}` : site.url,
            comment,
            reply,
            replier,
        });
        return await sendMail({ to: author.email, ...mail });
    } catch (error) {
        console.error('[email] sendCommentReplyEmail failed:', error?.message);
        return { ok: false };
    }
}

// ------------------------------------------------------------------ tickets

const ticketVars = (site, ticket) => ({ siteName: site.name, ticketNumber: String(ticket.number) });
const adminTarget = (settings) => (settings.email.adminNotifyEnabled ? settings.email.adminEmail || process.env.ADMIN_NOTIFY_EMAIL : '');

/** New ticket: confirmation to the student (+ note to the admin when enabled). */
export async function sendTicketCreatedEmails({ ticket, user, message }) {
    try {
        const { settings, site, theme } = await getContext();
        const vars = ticketVars(site, ticket);

        if (settings.email.ticketEnabled && user.email) {
            const mail = ticketCreatedEmail({ site, theme, copy: copyFor(settings, vars, 'ticketCreated'), user, ticket, message });
            await sendMail({ to: user.email, ...mail });
        }

        const adminTo = adminTarget(settings);
        if (adminTo) {
            const mail = adminTicketEmail({ site, theme, user, ticket, message, kind: 'new' });
            await sendMail({ to: adminTo, replyTo: user.email, ...mail });
        }
    } catch (error) {
        console.error('[email] sendTicketCreatedEmails failed:', error?.message);
    }
}

/** Support answered: e-mail the student. */
export async function sendTicketStaffReplyEmail({ ticket, user, message, staffName }) {
    try {
        const { settings, site, theme } = await getContext();
        if (!settings.email.ticketEnabled || !user?.email) return { ok: false, skipped: true };

        const mail = ticketReplyEmail({
            site,
            theme,
            copy: copyFor(settings, ticketVars(site, ticket), 'ticketReply'),
            user,
            ticket,
            message,
            staffName,
        });
        return await sendMail({ to: user.email, ...mail });
    } catch (error) {
        console.error('[email] sendTicketStaffReplyEmail failed:', error?.message);
        return { ok: false };
    }
}

/** Support closed the ticket: e-mail the student. */
export async function sendTicketClosedEmail({ ticket, user }) {
    try {
        const { settings, site, theme } = await getContext();
        if (!settings.email.ticketEnabled || !user?.email) return { ok: false, skipped: true };

        const mail = ticketClosedEmail({
            site,
            theme,
            copy: copyFor(settings, ticketVars(site, ticket), 'ticketReply'),
            user,
            ticket,
        });
        return await sendMail({ to: user.email, ...mail });
    } catch (error) {
        console.error('[email] sendTicketClosedEmail failed:', error?.message);
        return { ok: false };
    }
}

/** The student wrote back: tell the admin (only when admin notifications are on). */
export async function sendTicketStudentReplyAdminEmail({ ticket, user, message }) {
    try {
        const { settings, site, theme } = await getContext();
        const adminTo = adminTarget(settings);
        if (!adminTo) return { ok: false, skipped: true };

        const mail = adminTicketEmail({ site, theme, user, ticket, message, kind: 'reply' });
        return await sendMail({ to: adminTo, replyTo: user.email, ...mail });
    } catch (error) {
        console.error('[email] sendTicketStudentReplyAdminEmail failed:', error?.message);
        return { ok: false };
    }
}
