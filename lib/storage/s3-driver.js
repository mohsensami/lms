import 'server-only';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadBucketCommand,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
    PutBucketCorsCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Generic driver for any S3-compatible object storage (Tigris, AWS S3,
 * Cloudflare R2, Backblaze B2, Wasabi, MinIO, ...). Providers differ only in
 * their config (endpoint / region / credentials / bucket), so adding a new
 * cloud is a few lines in `providers.js` — no new driver code needed.
 *
 * Every method here works with plain object *keys*; nothing in the app ever
 * stores or exposes a bucket URL, so videos can't be fetched without a
 * freshly signed, expiring link.
 */
export class S3Driver {
    constructor(config) {
        this.id = config.id;
        this.type = 's3';
        this.config = config;
        this.bucket = config.bucket;
        this.client = new S3Client({
            region: config.region || 'auto',
            endpoint: config.endpoint,
            forcePathStyle: Boolean(config.forcePathStyle),
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            // Newer AWS SDK versions add CRC checksums to presigned URLs by
            // default, which many S3-compatible providers reject. Only add
            // them when an operation actually requires it.
            requestChecksumCalculation: 'WHEN_REQUIRED',
            responseChecksumValidation: 'WHEN_REQUIRED',
        });
    }

    // ---- Multipart upload (browser -> bucket directly) -------------------

    async createMultipartUpload({ key, contentType }) {
        const res = await this.client.send(
            new CreateMultipartUploadCommand({
                Bucket: this.bucket,
                Key: key,
                ContentType: contentType,
            }),
        );
        return res.UploadId;
    }

    /** Presigned PUT URL for a single part. */
    async signUploadPart({ key, uploadId, partNumber, expiresIn }) {
        return getSignedUrl(
            this.client,
            new UploadPartCommand({
                Bucket: this.bucket,
                Key: key,
                UploadId: uploadId,
                PartNumber: partNumber,
            }),
            { expiresIn },
        );
    }

    async completeMultipartUpload({ key, uploadId, parts }) {
        const sorted = [...parts]
            .map((p) => ({ PartNumber: Number(p.PartNumber), ETag: p.ETag }))
            .sort((a, b) => a.PartNumber - b.PartNumber);

        await this.client.send(
            new CompleteMultipartUploadCommand({
                Bucket: this.bucket,
                Key: key,
                UploadId: uploadId,
                MultipartUpload: { Parts: sorted },
            }),
        );
    }

    async abortMultipartUpload({ key, uploadId }) {
        await this.client.send(
            new AbortMultipartUploadCommand({ Bucket: this.bucket, Key: key, UploadId: uploadId }),
        );
    }

    // ---- Simple (non-multipart) upload, used for small files / tests -----

    async signUpload({ key, contentType, expiresIn }) {
        return getSignedUrl(
            this.client,
            new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }),
            { expiresIn },
        );
    }

    // ---- Playback / download --------------------------------------------

    /**
     * Short-lived signed GET URL. `download` forces the browser to save the
     * file instead of playing it inline.
     */
    async signDownload({ key, expiresIn, download = false, filename, contentType }) {
        const params = { Bucket: this.bucket, Key: key };
        if (download) {
            const safeName = (filename || key.split('/').pop() || 'video').replace(/["\r\n]/g, '');
            params.ResponseContentDisposition = `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`;
        }
        if (contentType) {
            params.ResponseContentType = contentType;
        }
        return getSignedUrl(this.client, new GetObjectCommand(params), { expiresIn });
    }

    async exists(key) {
        try {
            await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
            return true;
        } catch (error) {
            if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') return false;
            throw error;
        }
    }

    async deleteObject(key) {
        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }

    // ---- Admin helpers ---------------------------------------------------

    /** Cheap connectivity + permission check used by the settings page. */
    async testConnection() {
        await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
        return true;
    }

    /**
     * Browsers upload parts straight to the bucket, so the bucket must allow
     * PUT from the site's origin and expose the `ETag` header (needed to
     * finish a multipart upload).
     */
    async applyCors(origins) {
        await this.client.send(
            new PutBucketCorsCommand({
                Bucket: this.bucket,
                CORSConfiguration: {
                    CORSRules: [
                        {
                            AllowedOrigins: origins,
                            AllowedMethods: ['PUT', 'GET', 'HEAD'],
                            AllowedHeaders: ['*'],
                            ExposeHeaders: ['ETag'],
                            MaxAgeSeconds: 3600,
                        },
                    ],
                },
            }),
        );
    }
}
