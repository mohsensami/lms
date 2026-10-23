import 'server-only';
import { createHash } from 'crypto';

/**
 * Cloudinary video storage.
 *
 * Uploads go straight from the browser to Cloudinary with a SIGNED request
 * (the API secret never leaves the server). Playback uses the public
 * `secure_url` Cloudinary returns — the link is NOT protected (anyone who has
 * it can watch), but it is only handed out by /api/video/[lessonId] after the
 * access check and is never embedded in the page.
 */
export class CloudinaryDriver {
    constructor(config) {
        this.id = config.id;
        this.type = 'cloudinary';
        this.cloudName = config.cloudName;
        this.apiKey = config.apiKey;
        this.apiSecret = config.apiSecret;
        this.folder = (config.folder || 'lms').replace(/^\/+|\/+$/g, '');
    }

    get apiBase() {
        return `https://api.cloudinary.com/v1_1/${this.cloudName}`;
    }

    /** Cloudinary signature: sha1 of the sorted "k=v&k=v" params + secret. */
    sign(params) {
        const toSign = Object.keys(params)
            .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
            .sort()
            .map((k) => `${k}=${params[k]}`)
            .join('&');
        return createHash('sha1').update(toSign + this.apiSecret).digest('hex');
    }

    /** Public ids of every lesson video live under this prefix. */
    publicIdPrefix(lessonPrefix) {
        return `${this.folder}/${lessonPrefix}`;
    }

    /** What the browser needs to upload one video directly to Cloudinary. */
    createUploadSession(publicId) {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = this.sign({ public_id: publicId, timestamp });
        return {
            uploadUrl: `${this.apiBase}/video/upload`,
            fields: {
                api_key: this.apiKey,
                timestamp: String(timestamp),
                public_id: publicId,
                signature,
            },
        };
    }

    /** Only trust URLs that really point at OUR Cloudinary account. */
    isOwnUrl(url) {
        return typeof url === 'string' && url.startsWith(`https://res.cloudinary.com/${this.cloudName}/video/upload/`);
    }

    async deleteObject(publicId) {
        const timestamp = Math.floor(Date.now() / 1000);
        const params = { public_id: publicId, timestamp, invalidate: 'true' };
        const body = new URLSearchParams({
            ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
            api_key: this.apiKey,
            signature: this.sign(params),
        });

        const res = await fetch(`${this.apiBase}/video/destroy`, { method: 'POST', body });
        if (!res.ok) {
            throw new Error(`Cloudinary destroy failed (${res.status})`);
        }
    }

    async testConnection() {
        const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
        const res = await fetch(`${this.apiBase}/ping`, { headers: { Authorization: `Basic ${auth}` } });
        if (!res.ok) {
            throw new Error(
                res.status === 401 || res.status === 403
                    ? 'کلید یا Secret کلودینری نادرست است.'
                    : `پاسخ نامعتبر از Cloudinary (${res.status})`,
            );
        }
        return true;
    }
}
