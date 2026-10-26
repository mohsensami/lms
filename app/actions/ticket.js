'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getLoggedInUser } from '@/lib/loggedin-user';
import {
    sendTicketClosedEmail,
    sendTicketCreatedEmails,
    sendTicketStaffReplyEmail,
    sendTicketStudentReplyAdminEmail,
} from '@/lib/email/notify';

// Returns { ok, message, ... } instead of throwing: Next.js hides the text of
// thrown server-action errors in production.

const PRIORITIES = ['low', 'medium', 'high'];

const createSchema = z.object({
    subject: z.string().trim().min(3, 'موضوع تیکت را وارد کنید (حداقل ۳ کاراکتر).').max(120, 'موضوع حداکثر ۱۲۰ کاراکتر است.'),
    priority: z.enum(['low', 'medium', 'high'], { message: 'اولویت نامعتبر است.' }),
    message: z.string().trim().min(5, 'متن تیکت خیلی کوتاه است.').max(5000, 'متن تیکت حداکثر ۵۰۰۰ کاراکتر است.'),
});
const bodySchema = z.string().trim().min(2, 'متن پیام خیلی کوتاه است.').max(5000, 'پیام حداکثر ۵۰۰۰ کاراکتر است.');

const TICKETS_PER_HOUR = 5;

async function requireUser() {
    const user = await getLoggedInUser();
    if (!user || user.isActive === false) throw new Error('UNAUTHENTICATED');
    return user;
}

/** The ticket, but only if this user may see it (their own, or any for admins). */
async function loadAccessibleTicket(id, user) {
    const ticket = await prisma.ticket.findUnique({ where: { id }, include: { user: true } });
    if (!ticket) throw new Error('NOT_FOUND');
    if (user.role !== 'admin' && ticket.userId !== user.id) throw new Error('NOT_FOUND'); // don't reveal it exists
    return toView(ticket);
}

// Our Prisma client returns `_id`; the e-mail code wants plain `id`.
const toView = (ticket) => ({
    id: ticket._id ?? ticket.id,
    number: ticket.number,
    subject: ticket.subject,
    priority: ticket.priority,
    status: ticket.status,
    userId: ticket.userId,
    user: ticket.user,
});

function failure(error) {
    switch (error?.message) {
        case 'UNAUTHENTICATED':
            return { ok: false, message: 'برای این کار ابتدا وارد حساب کاربری خود شوید.' };
        case 'NOT_FOUND':
            return { ok: false, message: 'تیکت پیدا نشد.' };
        case 'FORBIDDEN':
            return { ok: false, message: 'شما اجازه‌ی این کار را ندارید.' };
        default:
            console.error('ticket action error:', error);
            return { ok: false, message: 'مشکلی پیش آمد. دوباره تلاش کنید.' };
    }
}

const refresh = (id) => {
    revalidatePath('/account/tickets');
    if (id) revalidatePath(`/account/tickets/${id}`);
};

// ------------------------------------------------------------------- student

export async function createTicket(input) {
    try {
        const user = await requireUser();

        const parsed = createSchema.safeParse({
            subject: input?.subject,
            priority: input?.priority,
            message: input?.message,
        });
        if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || 'اطلاعات نامعتبر است.' };
        const { subject, priority, message } = parsed.data;

        const recent = await prisma.ticket.count({
            where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
        });
        if (recent >= TICKETS_PER_HOUR) {
            return { ok: false, message: 'در یک ساعت گذشته تیکت‌های زیادی ثبت کرده‌اید. کمی بعد دوباره تلاش کنید.' };
        }

        const ticket = await prisma.ticket.create({
            data: {
                subject,
                priority,
                userId: user.id,
                messages: { create: { body: message, isStaff: false, authorId: user.id } },
            },
        });

        refresh();
        const view = toView(ticket);
        await sendTicketCreatedEmails({ ticket: view, user, message });

        return { ok: true, message: 'تیکت شما ثبت شد.', id: view.id };
    } catch (error) {
        return failure(error);
    }
}

// ------------------------------------------------------------ student + admin

/**
 * Adds a message to the conversation. Students write as themselves; an admin's
 * message is marked as staff, flips the ticket to "answered" and e-mails the
 * student. A student's message puts it back to "open". Closed tickets don't
 * accept messages until they are reopened.
 */
export async function replyToTicket(id, body) {
    try {
        const user = await requireUser();
        const ticket = await loadAccessibleTicket(id, user);

        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message };
        const text = parsed.data;

        if (ticket.status === 'closed') {
            return { ok: false, message: 'این تیکت بسته شده است. برای ادامه‌ی گفتگو ابتدا آن را دوباره باز کنید.' };
        }

        const isStaff = user.role === 'admin';
        await prisma.$transaction([
            prisma.ticketMessage.create({ data: { ticketId: id, body: text, isStaff, authorId: user.id } }),
            prisma.ticket.update({ where: { id }, data: { status: isStaff ? 'answered' : 'open' } }),
        ]);

        refresh(id);

        const view = ticket;
        if (isStaff) {
            await sendTicketStaffReplyEmail({
                ticket: view,
                user: ticket.user,
                message: text,
                staffName: `${user.firstName} ${user.lastName}`.trim(),
            });
        } else {
            await sendTicketStudentReplyAdminEmail({ ticket: view, user: ticket.user, message: text });
        }

        return { ok: true, message: 'پیام ارسال شد.' };
    } catch (error) {
        return failure(error);
    }
}

/**
 * Close or reopen a ticket. Admins can do both for any ticket; a student can
 * do both for their own.
 */
export async function setTicketStatus(id, status) {
    try {
        const user = await requireUser();
        const ticket = await loadAccessibleTicket(id, user);

        if (!['open', 'closed'].includes(status)) return { ok: false, message: 'وضعیت نامعتبر است.' };
        if (ticket.status === status) return { ok: true, message: 'وضعیت تغییری نکرد.' };

        await prisma.ticket.update({ where: { id }, data: { status } });
        refresh(id);

        // Tell the student when SUPPORT closes their ticket.
        if (status === 'closed' && user.role === 'admin' && ticket.userId !== user.id) {
            await sendTicketClosedEmail({ ticket, user: ticket.user });
        }

        return { ok: true, message: status === 'closed' ? 'تیکت بسته شد.' : 'تیکت دوباره باز شد.' };
    } catch (error) {
        return failure(error);
    }
}

// --------------------------------------------------------------------- admin

export async function setTicketPriority(id, priority) {
    try {
        const user = await requireUser();
        if (user.role !== 'admin') throw new Error('FORBIDDEN');
        if (!PRIORITIES.includes(priority)) return { ok: false, message: 'اولویت نامعتبر است.' };

        await prisma.ticket.update({ where: { id }, data: { priority } });
        refresh(id);
        return { ok: true, message: 'اولویت تغییر کرد.' };
    } catch (error) {
        return failure(error);
    }
}

export async function deleteTicket(id) {
    try {
        const user = await requireUser();
        if (user.role !== 'admin') throw new Error('FORBIDDEN');

        await prisma.ticket.delete({ where: { id } });
        refresh();
        return { ok: true, message: 'تیکت حذف شد.' };
    } catch (error) {
        return failure(error);
    }
}
