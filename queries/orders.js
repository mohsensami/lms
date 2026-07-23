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
