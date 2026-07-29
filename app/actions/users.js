'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import {
    getUserByEmail,
    getUserDetails,
    setUserActiveStatus,
    setUserRole,
    deleteUserById,
    countActiveAdmins,
} from '@/queries/users';
import { hasEnrollmentForCourse, enrollForCourse } from '@/queries/enrollments';

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

const VALID_ROLES = ['student', 'instructor', 'admin'];

export async function changeUserRole(userId, newRole) {
    const admin = await requireAdmin();

    if (!VALID_ROLES.includes(newRole)) {
        throw new Error('نقش انتخاب‌شده معتبر نیست.');
    }

    if (admin.id === userId) {
        throw new Error('شما نمی‌توانید نقش حساب کاربری خودتان را تغییر دهید.');
    }

    const target = await getUserDetails(userId);
    if (target?.role === 'admin' && newRole !== 'admin') {
        // Don't let the site end up with zero admins.
        const remainingAdmins = await countActiveAdmins(userId);
        if (remainingAdmins === 0) {
            throw new Error('نمی‌توانید نقش آخرین مدیر سایت را تغییر دهید.');
        }
    }

    await setUserRole(userId, newRole);
    revalidatePath('/account/users');
}

// Fixes the exact edge case where a student paid for a course (an Order
// exists) but the Enrollment row was never created — e.g. if the
// enroll-success flow errored out after marking the order paid but before
// creating the enrollment. Grants access retroactively.
export async function grantCourseAccess(courseId, studentId) {
    await requireAdmin();

    const alreadyEnrolled = await hasEnrollmentForCourse(courseId, studentId);
    if (!alreadyEnrolled) {
        await enrollForCourse(courseId, studentId, 'manual-admin-grant');
    }

    revalidatePath('/account/users');
    revalidatePath('/account/students');
}
