'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/admin-guard';
import { sendContactEmails } from '@/lib/email/notify';

// ---------------------------------------------------------------- public form

const schema = z.object({
    name: z.string().trim().min(2, 'نام را وارد کنید.').max(80, 'نام خیلی طولانی است.'),
    email: z.string().trim().toLowerCase().email('ایمیل معتبر نیست.').max(120),
    subject: z.string().trim().min(2, 'موضوع را وارد کنید.').max(120, 'موضوع خیلی طولانی است.'),
    message: z.string().trim().min(5, 'پیام خیلی کوتاه است.').max(3000, 'پیام حداکثر ۳۰۰۰ کاراکتر می‌تواند باشد.'),
});

const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 3 };

/**
 * Called by the public contact form. Saves the message for the dashboard and
 * then sends the e-mails (confirmation to the sender, optional note to the
 * admin). Returns { ok, message } so the form can show a readable result.
 */
export async function sendContactMessage(input) {
    try {
        // Honeypot: real visitors never fill this hidden field, bots do.
        if (input?.website) {
            return { ok: true, message: 'پیام شما ارسال شد.' };
        }

        const parsed = schema.safeParse({
            name: input?.name,
            email: input?.email,
            subject: input?.subject,
            message: input?.message,
        });
        if (!parsed.success) {
            return { ok: false, message: parsed.error.issues[0]?.message || 'اطلاعات واردشده معتبر نیست.' };
        }
        const data = parsed.data;

        // Simple flood protection per e-mail address.
        const recent = await prisma.contactMessage.count({
            where: { email: data.email, createdAt: { gt: new Date(Date.now() - RATE_LIMIT.windowMs) } },
        });
        if (recent >= RATE_LIMIT.max) {
            return { ok: false, message: 'پیام‌های زیادی در مدت کوتاه ارسال کرده‌اید. چند دقیقه بعد دوباره تلاش کنید.' };
        }

        const saved = await prisma.contactMessage.create({ data });
        revalidatePath('/account/messages');

        await sendContactEmails(saved);

        return { ok: true, message: 'پیام شما با موفقیت ارسال شد. به‌زودی پاسخ می‌دهیم.' };
    } catch (error) {
        console.error('sendContactMessage error:', error);
        return { ok: false, message: 'ارسال پیام با مشکل مواجه شد. لطفاً دوباره تلاش کنید.' };
    }
}

// ------------------------------------------------------------ admin dashboard

function failure(error) {
    if (error?.message === 'FORBIDDEN' || error?.message === 'UNAUTHENTICATED') {
        return { ok: false, message: 'شما اجازه‌ی دسترسی به این بخش را ندارید.' };
    }
    console.error('contact admin action error:', error);
    return { ok: false, message: 'مشکلی پیش آمد.' };
}

export async function setContactMessageStatus(id, status) {
    try {
        await assertAdmin();
        if (!['new', 'read'].includes(status)) return { ok: false, message: 'وضعیت نامعتبر است.' };

        await prisma.contactMessage.update({ where: { id }, data: { status } });
        revalidatePath('/account/messages');
        return { ok: true };
    } catch (error) {
        return failure(error);
    }
}

export async function deleteContactMessage(id) {
    try {
        await assertAdmin();
        await prisma.contactMessage.delete({ where: { id } });
        revalidatePath('/account/messages');
        return { ok: true, message: 'پیام حذف شد.' };
    } catch (error) {
        return failure(error);
    }
}

export async function deleteReadContactMessages() {
    try {
        await assertAdmin();
        const result = await prisma.contactMessage.deleteMany({ where: { status: 'read' } });
        revalidatePath('/account/messages');
        return { ok: true, message: `${result.count} پیام خوانده‌شده حذف شد.` };
    } catch (error) {
        return failure(error);
    }
}
