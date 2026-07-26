import { replaceMongoIdInArray, replaceMongoIdInObject, toIdString } from '@/lib/convertData';
import { withDb } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function getUserByEmail(email) {
    if (!email) {
        return null;
    }
    return withDb(async () => {
        const user = await prisma.user.findUnique({ where: { email } });
        return replaceMongoIdInObject(user);
    });
}

export async function getUserDetails(userId) {
    return withDb(async () => {
        const id = toIdString(userId);
        if (!id) return null;
        const user = await prisma.user.findUnique({ where: { id } });
        return replaceMongoIdInObject(user);
    });
}

export async function validatePassword(email, password) {
    const user = await getUserByEmail(email);
    if (!user) return false;
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
}

export async function getAllUsers() {
    return withDb(async () => {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        return replaceMongoIdInArray(users);
    }, []);
}

export async function countActiveAdmins(excludeUserId) {
    return withDb(async () => {
        return prisma.user.count({
            where: {
                role: 'admin',
                isActive: true,
                ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
            },
        });
    }, 0);
}

export async function setUserActiveStatus(userId, isActive) {
    return withDb(async () => {
        const user = await prisma.user.update({ where: { id: userId }, data: { isActive } });
        return replaceMongoIdInObject(user);
    });
}

export async function deleteUserById(userId) {
    return withDb(async () => {
        return prisma.user.delete({ where: { id: userId } });
    });
}
