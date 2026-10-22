import 'server-only';
import { getLoggedInUser } from '@/lib/loggedin-user';

/** Throws unless the caller is an active admin. Returns the user otherwise. */
export async function assertAdmin() {
    const user = await getLoggedInUser();
    if (!user || user.isActive === false) {
        throw new Error('UNAUTHENTICATED');
    }
    if (user.role !== 'admin') {
        throw new Error('FORBIDDEN');
    }
    return user;
}

/** For route handlers: returns { user } or { response } to return directly. */
export async function requireAdminForRoute() {
    try {
        const user = await assertAdmin();
        return { user };
    } catch (error) {
        const status = error?.message === 'UNAUTHENTICATED' ? 401 : 403;
        return {
            response: Response.json(
                { error: status === 401 ? 'ابتدا وارد حساب کاربری شوید.' : 'فقط مدیران به این بخش دسترسی دارند.' },
                { status },
            ),
        };
    }
}
