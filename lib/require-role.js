import 'server-only';
import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/lib/loggedin-user';

// Higher number = more access. Admin is the superset of every other role,
// so any page that requires "instructor" access must also let admins in.
const ROLE_LEVEL = { student: 0, instructor: 1, admin: 2 };

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
