import { replaceMongoIdInObject, toIdString } from '@/lib/convertData';
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
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
}
