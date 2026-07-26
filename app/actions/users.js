'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import {
    getUserByEmail,
    getUserDetails,
    setUserActiveStatus,
    deleteUserById,
    countActiveAdmins,
} from '@/queries/users';

async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error('شما اجازه‌ی دسترسی به این بخش را ندارید.');
    }
    const loggedInUser = await getUserByEmail(session.user.email);
    if (loggedInUser?.role !== 'admin') {
        throw new Error('شما اجازه‌ی دسترسی به این بخش را ندارید.');
    }
    return loggedInUser;
}

export async function setUserActive(userId, isActive) {
    const admin = await requireAdmin();

    if (admin.id === userId) {
        throw new Error('شما نمی‌توانید حساب کاربری خودتان را غیرفعال کنید.');
    }

    if (!isActive) {
        const target = await getUserDetails(userId);
        if (target?.role === 'admin') {
            // Don't let the site end up with zero active admins.
            const remainingAdmins = await countActiveAdmins(userId);
            if (remainingAdmins === 0) {
                throw new Error('نمی‌توانید آخرین حساب مدیر فعال سایت را غیرفعال کنید.');
            }
        }
    }

    await setUserActiveStatus(userId, isActive);
    revalidatePath('/account/users');
}

export async function deleteUser(userId) {
    const admin = await requireAdmin();

    if (admin.id === userId) {
        throw new Error('شما نمی‌توانید حساب کاربری خودتان را حذف کنید.');
    }

    const target = await getUserDetails(userId);
    if (target?.role === 'admin') {
        const remainingAdmins = await countActiveAdmins(userId);
        if (remainingAdmins === 0) {
            throw new Error('نمی‌توانید آخرین حساب مدیر فعال سایت را حذف کنید.');
        }
    }

    await deleteUserById(userId);
    revalidatePath('/account/users');
}
