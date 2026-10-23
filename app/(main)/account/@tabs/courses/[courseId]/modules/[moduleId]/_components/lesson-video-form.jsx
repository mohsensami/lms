'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Film, Loader2, Trash2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SecureVideo from '@/components/secure-video';
import { removeLessonVideo } from '@/app/actions/lesson';
import { useUploadThing } from '@/lib/uploadthing';

const PART_CONCURRENCY = 3;
const PART_RETRIES = 3;

function formatBytes(bytes) {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatClock(seconds) {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Reads the video length from the local file before uploading. */
function readDuration(file) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        const done = (value) => {
            URL.revokeObjectURL(url);
            resolve(value);
        };
        video.preload = 'metadata';
        video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
        video.onerror = () => done(null);
        video.src = url;
    });
}

/** PUT one chunk straight to the bucket; resolves with the part's ETag. */
function putPart(url, blob, onProgress, registerXhr) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        registerXhr(xhr);
        xhr.open('PUT', url);
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) onProgress(event.loaded);
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const etag = xhr.getResponseHeader('ETag');
                if (!etag) {
                    reject(
                        new Error(
                            'پاسخ ذخیره‌ساز ETag ندارد. در تنظیمات سایت «اعمال تنظیمات CORS» را بزنید و دوباره تلاش کنید.',
                        ),
                    );
                    return;
                }
                resolve(etag);
            } else {
                reject(new Error(`خطای ذخیره‌ساز (${xhr.status})`));
            }
        };
        xhr.onerror = () =>
            reject(new Error('ارتباط با ذخیره‌ساز برقرار نشد. اتصال اینترنت و تنظیمات CORS باکت را بررسی کنید.'));
        xhr.onabort = () => reject(new Error('CANCELLED'));
        xhr.send(blob);
    });
}


/** POST one Cloudinary chunk (multipart form). Resolves with the parsed JSON reply. */
function postChunk({ url, fields, blob, filename, headers, onProgress, registerXhr }) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        registerXhr(xhr);
        xhr.open('POST', url);
        Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, value));
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) onProgress(event.loaded);
        };
        xhr.onload = () => {
            let json = null;
            try {
                json = JSON.parse(xhr.responseText);
            } catch {
                // fall through to the status check
            }
            if (xhr.status >= 200 && xhr.status < 300) resolve(json);
            else reject(new Error(json?.error?.message || `خطای Cloudinary (${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error('ارتباط با Cloudinary برقرار نشد. اتصال اینترنت را بررسی کنید.'));
        xhr.onabort = () => reject(new Error('CANCELLED'));

        const form = new FormData();
        Object.entries(fields).forEach(([name, value]) => form.append(name, value));
        form.append('file', blob, filename);
        xhr.send(form);
    });
}

async function postJson(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'خطای ناشناخته');
    return data;
}

export const LessonVideoForm = ({ initialData, lessonId }) => {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const cancelledRef = useRef(false);
    const xhrsRef = useRef(new Set());

    const [video, setVideo] = useState({
        hasStored: Boolean(initialData?.videoKey),
        hasExternal: Boolean(initialData?.video_url),
        name: initialData?.videoName || null,
        size: initialData?.videoSize || null,
        duration: initialData?.duration || null,
    });
    const [previewKey, setPreviewKey] = useState(0);
    const [phase, setPhase] = useState('idle'); // idle | preparing | uploading | finishing
    const [progress, setProgress] = useState(0);
    const [removing, setRemoving] = useState(false);
    const [canCancel, setCanCancel] = useState(true);

    // UploadThing uploads go through its own SDK; progress is reported here.
    const { startUpload: startUploadThing } = useUploadThing('lessonVideoUploader', {
        onUploadProgress: (value) => setProgress(Math.min(99, Math.round(value))),
    });

    const isBusy = phase !== 'idle';
    const hasVideo = video.hasStored || video.hasExternal;

    function cancelUpload() {
        cancelledRef.current = true;
        xhrsRef.current.forEach((xhr) => xhr.abort());
    }

    // ---- one upload strategy per storage provider type ---------------------

    async function uploadS3(file, session) {
        setPhase('uploading');

        const { parts, partSize, key, uploadId } = session;
        const loadedPerPart = new Array(parts.length).fill(0);
        const etags = new Array(parts.length);
        let nextIndex = 0;

        const refreshProgress = () => {
            const loaded = loadedPerPart.reduce((sum, value) => sum + value, 0);
            setProgress(Math.min(99, Math.round((loaded / file.size) * 100)));
        };

        async function worker() {
            while (!cancelledRef.current) {
                const index = nextIndex++;
                if (index >= parts.length) return;

                const start = index * partSize;
                const blob = file.slice(start, Math.min(start + partSize, file.size));

                let attempt = 0;
                // Retry flaky chunks without restarting the whole upload.
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    try {
                        etags[index] = await putPart(
                            parts[index].url,
                            blob,
                            (loaded) => {
                                loadedPerPart[index] = loaded;
                                refreshProgress();
                            },
                            (xhr) => xhrsRef.current.add(xhr),
                        );
                        loadedPerPart[index] = blob.size;
                        refreshProgress();
                        break;
                    } catch (error) {
                        loadedPerPart[index] = 0;
                        if (cancelledRef.current || error.message === 'CANCELLED') throw new Error('CANCELLED');
                        attempt += 1;
                        if (attempt >= PART_RETRIES) throw error;
                        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
                    }
                }
            }
        }

        await Promise.all(Array.from({ length: Math.min(PART_CONCURRENCY, parts.length) }, worker));
        if (cancelledRef.current) throw new Error('CANCELLED');

        return {
            key,
            uploadId,
            parts: etags.map((ETag, index) => ({ PartNumber: index + 1, ETag })),
        };
    }

    async function uploadCloudinary(file, session) {
        setPhase('uploading');

        const { uploadUrl, fields, chunkSize, publicId } = session;
        const uniqueId = crypto.randomUUID();
        const chunked = file.size > chunkSize;
        let sent = 0;
        let last = null;

        for (let start = 0; start < file.size; start += chunkSize) {
            if (cancelledRef.current) throw new Error('CANCELLED');

            const end = Math.min(start + chunkSize, file.size);
            const blob = file.slice(start, end);
            const headers = chunked
                ? { 'X-Unique-Upload-Id': uniqueId, 'Content-Range': `bytes ${start}-${end - 1}/${file.size}` }
                : {};

            let attempt = 0;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                try {
                    last = await postChunk({
                        url: uploadUrl,
                        fields,
                        blob,
                        filename: file.name,
                        headers,
                        onProgress: (loaded) =>
                            setProgress(Math.min(99, Math.round(((sent + loaded) / file.size) * 100))),
                        registerXhr: (xhr) => xhrsRef.current.add(xhr),
                    });
                    break;
                } catch (error) {
                    if (cancelledRef.current || error.message === 'CANCELLED') throw new Error('CANCELLED');
                    attempt += 1;
                    if (attempt >= PART_RETRIES) throw error;
                    await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
                }
            }
            sent += blob.size;
        }

        if (!last?.secure_url) throw new Error('پاسخ Cloudinary کامل نیست. دوباره تلاش کنید.');

        return { publicId: last.public_id || publicId, url: last.secure_url, cloudDuration: last.duration };
    }

    async function uploadUploadThing(file) {
        setPhase('uploading');
        setCanCancel(false);

        const result = await startUploadThing([file]);
        const uploaded = result?.[0];
        const url = uploaded?.ufsUrl ?? uploaded?.url;
        if (!uploaded?.key || !url) throw new Error('آپلود در UploadThing ناموفق بود.');

        return { key: uploaded.key, url };
    }

    async function uploadFile(file) {
        cancelledRef.current = false;
        setCanCancel(true);
        setPhase('preparing');
        setProgress(0);

        let session = null;

        try {
            const duration = await readDuration(file);

            session = await postJson('/api/admin/video-upload/init', {
                lessonId,
                filename: file.name,
                contentType: file.type,
                size: file.size,
            });

            const uploaded =
                session.kind === 'cloudinary'
                    ? await uploadCloudinary(file, session)
                    : session.kind === 'uploadthing'
                      ? await uploadUploadThing(file)
                      : await uploadS3(file, session);

            setPhase('finishing');
            setProgress(100);

            const result = await postJson('/api/admin/video-upload/complete', {
                lessonId,
                provider: session.provider,
                filename: file.name,
                size: file.size,
                contentType: session.contentType,
                duration,
                ...uploaded,
            });

            setVideo({
                hasStored: true,
                hasExternal: false,
                name: file.name,
                size: file.size,
                duration: result.duration || duration || null,
            });
            setPreviewKey((value) => value + 1);
            toast.success('ویدیو با موفقیت آپلود شد');
            router.refresh();
        } catch (error) {
            // Free the half-uploaded parts in the bucket (S3-style only).
            if (session?.kind === 's3-multipart') {
                postJson('/api/admin/video-upload/abort', {
                    lessonId,
                    provider: session.provider,
                    key: session.key,
                    uploadId: session.uploadId,
                }).catch(() => {});
            }

            if (error.message === 'CANCELLED') {
                toast.info('آپلود لغو شد');
            } else {
                toast.error(error.message || 'آپلود ویدیو ناموفق بود');
            }
        } finally {
            xhrsRef.current.clear();
            setPhase('idle');
            setProgress(0);
            setCanCancel(true);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (file) uploadFile(file);
    }

    async function handleRemove() {
        if (!window.confirm('این ویدیو برای همیشه حذف شود؟')) return;
        setRemoving(true);
        try {
            await removeLessonVideo(lessonId);
            setVideo({ hasStored: false, hasExternal: false, name: null, size: null, duration: null });
            toast.success('ویدیو حذف شد');
            router.refresh();
        } catch {
            toast.error('حذف ویدیو با مشکل مواجه شد');
        } finally {
            setRemoving(false);
        }
    }

    const phaseLabel = {
        preparing: 'در حال آماده‌سازی...',
        uploading: `در حال آپلود... ${progress}٪`,
        finishing: 'در حال نهایی‌سازی...',
    }[phase];

    return (
        <div className="mt-6 rounded-md border bg-slate-100 p-4">
            <div className="flex items-center justify-between font-medium">
                <span className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    ویدیوی درس
                </span>

                {!isBusy && (
                    <div className="flex items-center gap-2">
                        {hasVideo && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                disabled={removing}
                                onClick={handleRemove}
                            >
                                {removing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="ml-1 h-4 w-4" />
                                )}
                                حذف
                            </Button>
                        )}
                        <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="ml-1.5 h-4 w-4" />
                            {hasVideo ? 'جایگزینی ویدیو' : 'آپلود ویدیو'}
                        </Button>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mkv"
                className="hidden"
                onChange={handleFileChange}
                disabled={isBusy}
            />

            {isBusy && (
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {phaseLabel}
                        </span>
                        {phase !== 'finishing' && canCancel && (
                            <Button type="button" size="sm" variant="ghost" onClick={cancelUpload}>
                                <X className="ml-1 h-4 w-4" />
                                لغو
                            </Button>
                        )}
                    </div>
                    <Progress value={progress} className="h-2 w-full bg-zinc-200" />
                    <p className="text-xs text-muted-foreground">
                        تا پایان آپلود این صفحه را نبندید. فایل مستقیم به فضای ذخیره‌سازی ارسال می‌شود.
                    </p>
                </div>
            )}

            {!isBusy && !hasVideo && (
                <p className="mt-3 text-sm italic text-slate-500">هنوز ویدیویی برای این درس آپلود نشده است.</p>
            )}

            {!isBusy && hasVideo && (
                <div className="mt-4 space-y-3">
                    <div className="rounded-md border bg-white p-3 text-sm">
                        {video.hasStored ? (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span className="truncate font-medium" dir="ltr">
                                    {video.name || 'video'}
                                </span>
                                {video.size ? <span className="text-muted-foreground">{formatBytes(video.size)}</span> : null}
                                {video.duration ? (
                                    <span className="text-muted-foreground" dir="ltr">
                                        {formatClock(video.duration)}
                                    </span>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                این درس هنوز به یک لینک خارجی (روش قدیمی) متصل است. با «جایگزینی ویدیو» می‌توانید فایل را روی
                                فضای ذخیره‌سازی آپلود کنید.
                            </p>
                        )}
                    </div>

                    <div className="aspect-video w-full overflow-hidden rounded-md bg-slate-950">
                        <SecureVideo key={previewKey} lessonId={lessonId} />
                    </div>
                </div>
            )}
        </div>
    );
};
