// Registry of the storage clouds the admin can pick from.
//
// Secrets (access keys, bucket names) deliberately live in environment
// variables — never in the database or the admin UI. The admin only chooses
// WHICH configured provider receives new uploads (Settings -> storage).
//
// Adding another S3-compatible cloud = add one entry below + its env vars.

export const PROVIDERS = {
    tigris: {
        id: 'tigris',
        label: 'Tigris',
        description: 'ذخیره‌ساز S3-سازگار با توزیع جهانی (Tigris Object Storage)',
        envVars: ['TIGRIS_STORAGE_ACCESS_KEY_ID', 'TIGRIS_STORAGE_SECRET_ACCESS_KEY', 'TIGRIS_STORAGE_BUCKET'],
        read: (env) => ({
            endpoint: env.TIGRIS_STORAGE_ENDPOINT || 'https://t3.storage.dev',
            region: 'auto',
            bucket: env.TIGRIS_STORAGE_BUCKET,
            accessKeyId: env.TIGRIS_STORAGE_ACCESS_KEY_ID,
            secretAccessKey: env.TIGRIS_STORAGE_SECRET_ACCESS_KEY,
        }),
    },

    s3: {
        id: 's3',
        label: 'Amazon S3',
        description: 'Amazon Web Services S3',
        envVars: ['AWS_S3_ACCESS_KEY_ID', 'AWS_S3_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET', 'AWS_S3_REGION'],
        read: (env) => ({
            endpoint: undefined, // AWS default endpoint for the region
            region: env.AWS_S3_REGION,
            bucket: env.AWS_S3_BUCKET,
            accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
        }),
    },

    r2: {
        id: 'r2',
        label: 'Cloudflare R2',
        description: 'Cloudflare R2 (بدون هزینه‌ی ترافیک خروجی)',
        envVars: ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'],
        read: (env) => ({
            endpoint: env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined,
            region: 'auto',
            bucket: env.R2_BUCKET,
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        }),
    },

    // Any other S3-compatible service (ArvanCloud, Backblaze B2, Wasabi,
    // MinIO, ...). Just point it at the right endpoint.
    custom: {
        id: 'custom',
        label: 'S3-سازگار (سفارشی)',
        description: 'هر سرویس S3-سازگار دیگر مثل آروان‌کلاد، Backblaze، Wasabi یا MinIO',
        envVars: [
            'CUSTOM_S3_ENDPOINT',
            'CUSTOM_S3_REGION',
            'CUSTOM_S3_ACCESS_KEY_ID',
            'CUSTOM_S3_SECRET_ACCESS_KEY',
            'CUSTOM_S3_BUCKET',
        ],
        read: (env) => ({
            endpoint: env.CUSTOM_S3_ENDPOINT,
            region: env.CUSTOM_S3_REGION || 'auto',
            bucket: env.CUSTOM_S3_BUCKET,
            accessKeyId: env.CUSTOM_S3_ACCESS_KEY_ID,
            secretAccessKey: env.CUSTOM_S3_SECRET_ACCESS_KEY,
            forcePathStyle: env.CUSTOM_S3_FORCE_PATH_STYLE === 'true',
        }),
    },
};

export const DEFAULT_PROVIDER = 'tigris';

export function isKnownProvider(id) {
    return Object.prototype.hasOwnProperty.call(PROVIDERS, id);
}

/** Which env vars are still missing for this provider (empty = ready). */
export function getMissingEnv(id, env = process.env) {
    const provider = PROVIDERS[id];
    if (!provider) return [];
    return provider.envVars.filter((name) => {
        // These have sensible defaults or are optional.
        if (name === 'CUSTOM_S3_REGION') return false;
        return !env[name];
    });
}

export function isProviderConfigured(id, env = process.env) {
    return isKnownProvider(id) && getMissingEnv(id, env).length === 0;
}
