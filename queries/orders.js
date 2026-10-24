import { replaceMongoIdInArray, replaceMongoIdInObject, mapScalarRefsInArray } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function createOrder({ courseId, userId, amount, authority, method = 'zarinpal' }) {
    return withDb(async () => {
        const order = await prisma.order.create({
            data: {
                courseId,
                userId,
                amount,
                authority,
                method,
                status: 'pending',
            },
        });
        return replaceMongoIdInObject(order);
    });
}

export async function markOrderPaid(authority, refId) {
    return withDb(async () => {
        const order = await prisma.order.update({
            where: { authority },
            data: { status: 'paid', refId: refId ? String(refId) : null, paidAt: new Date() },
        });
        return replaceMongoIdInObject(order);
    }, null);
}

export async function markOrderFailed(authority) {
    return withDb(async () => {
        const order = await prisma.order.update({
            where: { authority },
            data: { status: 'failed' },
        });
        return replaceMongoIdInObject(order);
    }, null);
}

export async function getOrderByAuthority(authority) {
    if (!authority) return null;
    return withDb(async () => {
        const order = await prisma.order.findUnique({ where: { authority } });
        return replaceMongoIdInObject(order);
    }, null);
}

export async function getOrdersForUser(userId) {
    if (!userId) return [];
    return withDb(async () => {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { course: true },
            orderBy: { createdAt: 'desc' },
        });
        return replaceMongoIdInArray(orders);
    }, []);
}

export async function getAllOrders() {
    return withDb(async () => {
        const orders = await prisma.order.findMany({
            include: { course: true, user: true },
            orderBy: { createdAt: 'desc' },
        });
        return replaceMongoIdInArray(orders);
    }, []);
}

/**
 * Moves an order pending -> paid exactly once. Returns true only for the
 * caller that actually performed the transition, so when the Bale webhook and
 * the customer's return page race each other, only one of them fulfils the
 * order (enrols the student, sends the e-mails).
 */
export async function markOrderPaidOnce(authority, refId) {
    return withDb(async () => {
        const result = await prisma.order.updateMany({
            where: { authority, status: 'pending' },
            data: { status: 'paid', refId: refId ? String(refId) : null, paidAt: new Date() },
        });
        return result.count === 1;
    }, false);
}

export async function updateOrderBale(authority, data) {
    return withDb(async () => {
        const result = await prisma.order.updateMany({ where: { authority }, data });
        return result.count === 1;
    }, false);
}

/** Order + its course + its user, in the shape the payment code needs. */
export async function getOrderForPayment(authority) {
    if (!authority) return null;
    return withDb(async () => {
        const order = await prisma.order.findUnique({
            where: { authority },
            include: { course: true, user: true },
        });
        return replaceMongoIdInObject(order);
    }, null);
}
