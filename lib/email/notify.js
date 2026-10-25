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
