import 'server-only';
import { S3Driver } from './s3-driver';
import { CloudinaryDriver } from './cloudinary-driver';
import { UploadThingDriver } from './uploadthing-driver';
import { LinkDriver } from './link-driver';
import { PROVIDERS, DEFAULT_PROVIDER, isKnownProvider, getMissingEnv } from './providers';
import { getSetting } from '@/lib/settings';

export { PROVIDERS, DEFAULT_PROVIDER, isKnownProvider, getMissingEnv, isProviderConfigured } from './providers';

const drivers = new Map();

/**
 * Returns the storage driver for a specific provider id. Used both for new
 * uploads (active provider) and for reading/deleting existing videos (the
 * provider recorded on the lesson — which may differ from the active one if
 * the admin switched clouds later).
 */
export function getStorageDriver(providerId) {
    if (!isKnownProvider(providerId)) {
        throw new Error(`Unknown storage provider: ${providerId}`);
    }

    const missing = getMissingEnv(providerId);
    if (missing.length > 0) {
        throw new Error(`Storage provider "${providerId}" is not configured. Missing env: ${missing.join(', ')}`);
    }

    if (!drivers.has(providerId)) {
        const meta = PROVIDERS[providerId];
        const config = { id: providerId, ...meta.read(process.env) };
        const driver =
            meta.type === 'cloudinary'
                ? new CloudinaryDriver(config)
                : meta.type === 'uploadthing'
                  ? new UploadThingDriver(config)
                  : meta.type === 'link'
                    ? new LinkDriver(config)
                    : new S3Driver(config);
        drivers.set(providerId, driver);
    }
    return drivers.get(providerId);
}

/** The provider the admin picked in Settings for NEW uploads. */
export async function getActiveProviderId() {
    const setting = await getSetting('storage');
    const fromDb = setting?.activeProvider;
    if (fromDb && isKnownProvider(fromDb)) return fromDb;

    const fromEnv = process.env.STORAGE_PROVIDER;
    if (fromEnv && isKnownProvider(fromEnv)) return fromEnv;

    return DEFAULT_PROVIDER;
}

export async function getActiveStorageDriver() {
    return getStorageDriver(await getActiveProviderId());
}

// Signed URL lifetimes (seconds). Playback URLs must outlive a whole viewing
// session because the browser re-uses the same URL for every range request,
// so the default is 2h; the player silently asks for a fresh one on expiry.
export const PLAYBACK_URL_TTL = Number(process.env.VIDEO_URL_TTL_SECONDS) || 2 * 60 * 60;
export const DOWNLOAD_URL_TTL = 5 * 60;
export const UPLOAD_URL_TTL = 6 * 60 * 60;

export const MAX_VIDEO_SIZE_BYTES = (Number(process.env.MAX_VIDEO_SIZE_MB) || 5 * 1024) * 1024 * 1024;
export const VIDEO_PART_SIZE = 16 * 1024 * 1024; // 16 MB (S3 minimum part size is 5 MB)
