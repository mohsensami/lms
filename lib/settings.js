import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { withDb } from '@/lib/db';

// Admin-editable site settings, stored as JSON values in the SiteSetting
// table and cached with the Next.js Data Cache (invalidated on every write).
export const SETTINGS_CACHE_TAG = 'site-settings';

const getCachedSetting = unstable_cache(
    async (key) => {
        return withDb(async () => {
            const row = await prisma.siteSetting.findUnique({ where: { key } });
            return row ? { value: row.value } : { value: null };
        });
    },
    ['site-setting'],
    { tags: [SETTINGS_CACHE_TAG], revalidate: 300 },
);

export async function getSetting(key) {
    try {
        const { value } = await getCachedSetting(key);
        return value;
    } catch (error) {
        // The settings table may not exist yet (migration not applied) —
        // callers fall back to env/defaults instead of crashing the page.
        console.error(`getSetting("${key}") failed:`, error?.message);
        return null;
    }
}

export async function setSetting(key, value) {
    await withDb(async () => {
        await prisma.siteSetting.upsert({
            where: { key },
            create: { key, value },
            update: { value },
        });
    });
    revalidateTag(SETTINGS_CACHE_TAG);
}
