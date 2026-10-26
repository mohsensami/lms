import { prisma } from '@/lib/prisma';

// Plain, serializable objects (dates as ISO strings, `id` instead of `_id`),
// so the results can be handed straight to client components.

const iso = (d) => (d ? new Date(d).toISOString() : null);

const person = (u) =>
    u ? { id: u._id ?? u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role } : null;

const toTicket = (t) => ({
    id: t._id ?? t.id,
    number: t.number,
    subject: t.subject,
    priority: t.priority,
    status: t.status,
    userId: t.userId,
    user: person(t.user),
    createdAt: iso(t.createdAt),
    updatedAt: iso(t.updatedAt),
    messageCount: t._count?.messages,
    messages: t.messages?.map((m) => ({
        id: m._id ?? m.id,
        body: m.body,
        isStaff: m.isStaff,
        createdAt: iso(m.createdAt),
        author: person(m.author),
    })),
});

const STATUS_RANK = { open: 0, answered: 1, closed: 2 };
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

/** Needs-attention first: open before answered before closed, then urgent first, then newest. */
export const byAttention = (a, b) =>
    STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    new Date(b.updatedAt) - new Date(a.updatedAt);

export async function getAllTickets() {
    const rows = await prisma.ticket.findMany({
        include: { user: true, _count: { select: { messages: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 500,
    });
    return rows.map(toTicket).sort(byAttention);
}

export async function getTicketsForUser(userId) {
    const rows = await prisma.ticket.findMany({
        where: { userId },
        include: { user: true, _count: { select: { messages: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 200,
    });
    return rows.map(toTicket);
}

export async function getTicketWithMessages(id) {
    const row = await prisma.ticket.findUnique({
        where: { id },
        include: { user: true, messages: { include: { author: true }, orderBy: { createdAt: 'asc' } } },
    });
    return row ? toTicket(row) : null;
}

/** Admin badge: tickets waiting for staff. Student badge: tickets support answered. */
export async function countTicketsNeedingAttention({ isAdmin, userId }) {
    try {
        return await prisma.ticket.count({
            where: isAdmin ? { status: 'open' } : { userId, status: 'answered' },
        });
    } catch {
        return 0; // table not created yet (before `prisma db push`)
    }
}
