import 'server-only';
import { Resend } from 'resend';

// Resend only accepts a sender on a domain you verified there, so the sender
// stays an environment setting:  EMAIL_FROM="ایزی‌لرن <support@ezylearn.ir>"
const FROM = () => process.env.EMAIL_FROM || 'noreply@ezylearn.ir';

let client = null;

export function isEmailConfigured() {
    return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Sends one e-mail through Resend. NEVER throws: an e-mail problem (missing
 * key, bad address, Resend outage) must not break signing up, buying a course
 * or sending a contact message — it is logged and reported in the result.
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
    if (!to || !subject || !html) {
        return { ok: false, error: 'گیرنده، عنوان یا متن ایمیل ناقص است.' };
    }
    if (!isEmailConfigured()) {
        console.warn('[email] RESEND_API_KEY is not set — e-mail skipped:', subject);
        return { ok: false, skipped: true, error: 'کلید Resend (RESEND_API_KEY) در فایل env تنظیم نشده است.' };
    }

    try {
        client ||= new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await client.emails.send({
            from: FROM(),
            to,
            subject,
            html,
            ...(text ? { text } : {}),
            ...((replyTo || process.env.EMAIL_REPLY_TO) ? { replyTo: replyTo || process.env.EMAIL_REPLY_TO } : {}),
        });

        if (error) {
            console.error('[email] Resend rejected the message:', error);
            return { ok: false, error: error.message || 'Resend ایمیل را نپذیرفت.' };
        }
        return { ok: true, id: data?.id };
    } catch (error) {
        console.error('[email] send failed:', error?.message);
        return { ok: false, error: error?.message || 'ارسال ایمیل ناموفق بود.' };
    }
}
