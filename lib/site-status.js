import 'server-only';
import { getSetting } from '@/lib/settings';
import { SITE_STATUS_KEY, sanitizeSiteStatus } from '@/lib/site-status-defaults';

/** Maintenance banner + "site closed" switches (cached; refreshed on every save). */
export async function getSiteStatus() {
    const stored = await getSetting(SITE_STATUS_KEY);
    return sanitizeSiteStatus(stored);
}
