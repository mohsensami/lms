import 'server-only';
import { getSetting } from '@/lib/settings';
import { DEFAULT_SITE_SETTINGS, sanitizeLike } from '@/lib/site-defaults';

/**
 * All admin-editable site content (Settings -> site info), merged over the
 * built-in defaults and sanitized. Backed by the cached `site` setting, so
 * calling this from many components in one request costs a single lookup.
 */
export async function getSiteSettings() {
    const stored = await getSetting('site');
    return sanitizeLike(DEFAULT_SITE_SETTINGS, stored || {});
}

export async function getSiteName() {
    return (await getSiteSettings()).general.name;
}
