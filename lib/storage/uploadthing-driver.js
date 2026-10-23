import 'server-only';
import { UTApi } from 'uploadthing/server';

/**
 * UploadThing video storage. The browser uploads through the UploadThing SDK
 * (see `lessonVideoUploader` in app/api/uploadthing/core.js). Links are public
 * (not protected) and are only handed out by /api/video/[lessonId] after the
 * access check.
 */
export class UploadThingDriver {
    constructor(config) {
        this.id = config.id;
        this.type = 'uploadthing';
        this.api = new UTApi({ token: config.token });
    }

    /** UploadThing serves files from *.ufs.sh (or the legacy utfs.io). */
    isOwnUrl(url) {
        try {
            const { protocol, hostname } = new URL(url);
            return protocol === 'https:' && (hostname.endsWith('.ufs.sh') || hostname === 'utfs.io');
        } catch {
            return false;
        }
    }

    async deleteObject(key) {
        await this.api.deleteFiles(key);
    }

    async testConnection() {
        await this.api.listFiles({ limit: 1 });
        return true;
    }
}
