import 'server-only';
import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/loggedin-user';

// The site has exactly two roles: student and admin (the superset). Any
// other/legacy role value is treated like a student (level 0).
const ROLE_LEVEL = { student: 0, admin: 1 };

/**
 * Redirects to /login if not authenticated, or to /account if the logged-in
 * user's role doesn't meet the minimum required level. Returns the user
 * otherwise, so callers can use it right away (e.g. for ownership checks).
 */
export async function requireRole(minRole) {
    const user = await getLoggedInUser();
    if (!user) {
        redirect('/login');
    }

    const userLevel = ROLE_LEVEL[user.role] ?? 0;
    const requiredLevel = ROLE_LEVEL[minRole] ?? 0;

    if (userLevel < requiredLevel) {
        redirect('/account');
    }

    return user;
}
