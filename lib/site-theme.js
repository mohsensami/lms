import 'server-only';
import { getSetting } from '@/lib/settings';
import { DEFAULT_PRIMARY, normalizeHex } from '@/lib/theme';

/** The brand colour the admin picked in Settings (falls back to the default). */
export async function getPrimaryColor() {
    const setting = await getSetting('theme');
    return normalizeHex(setting?.primaryColor) || DEFAULT_PRIMARY;
}
