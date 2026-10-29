'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { UploadButton } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'post-image-provider';
const MAX_CLOUDINARY_MB = 10;

const PROVIDERS = [
    { value: 'uploadthing', label: 'UploadThing' },
    { value: 'cloudinary', label: 'Cloudinary' },
];

/** Uploads one image straight to Cloudinary with a server-signed request. */
async function uploadToCloudinary(file) {
    const sessionRes = await fetch('/api/admin/image-upload/cloudinary', { method: 'POST' });
    const session = await sessionRes.json().catch(() => null);
    if (!sessionRes.ok) throw new Error(session?.error || 'اتصال به Cloudinary ناموفق بود');

    const body = new FormData();
    Object.entries(session.fields).forEach(([key, value]) => body.append(key, value));
    body.append('file', file);

    const uploadRes = await fetch(session.uploadUrl, { method: 'POST', body });
    const data = await uploadRes.json().catch(() => null);
    if (!uploadRes.ok || !data?.secure_url) {
        throw new Error(data?.error?.message || 'آپلود در Cloudinary ناموفق بود');
    }
    return { url: data.secure_url, name: file.name };
}

/**
 * Image upload button with a choice of storage: UploadThing or Cloudinary.
 *
 *  - endpoint: UploadThing route ('postImageUploader' = cover, 'postContentImageUploader' = body images)
 *  - multiple: allow several files at once
 *  - onUploaded(files): called with [{ url, name }]
 *  - onUploadingChange(bool): optional, to show a spinner on a preview
 */
export function PostImageUploader({
    endpoint = 'postImageUploader',
    multiple = false,
    onUploaded,
    onUploadingChange,
    disabled,
    label = 'آپلود تصویر',
    variant = 'primary',
    className,
}) {
    const [provider, setProvider] = useState('uploadthing');
    const [busy, setBusy] = useState(false);
    const fileInput = useRef(null);

    // Remember the admin's last choice.
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved === 'uploadthing' || saved === 'cloudinary') setProvider(saved);
        } catch {
            /* storage unavailable — keep the default */
        }
    }, []);

    const choose = (value) => {
        setProvider(value);
        try {
            window.localStorage.setItem(STORAGE_KEY, value);
        } catch {
            /* ignore */
        }
    };

    const setUploading = (value) => {
        setBusy(value);
        onUploadingChange?.(value);
    };

    const onUploadThingDone = (res) => {
        setUploading(false);
        const files = (res || [])
            .map((file) => ({ url: file.ufsUrl ?? file.url, name: file.name }))
            .filter((file) => file.url);
        if (!files.length) {
            toast.error('آپلود تصویر با مشکل مواجه شد');
            return;
        }
        onUploaded?.(files);
    };

    const onCloudinaryFiles = async (event) => {
        const picked = Array.from(event.target.files || []);
        event.target.value = '';
        if (!picked.length) return;

        const files = multiple ? picked.slice(0, 5) : picked.slice(0, 1);
        const tooBig = files.find((f) => f.size > MAX_CLOUDINARY_MB * 1024 * 1024);
        if (tooBig) {
            toast.error(`حجم «${tooBig.name}» بیشتر از ${MAX_CLOUDINARY_MB} مگابایت است`);
            return;
        }
        if (files.some((f) => !f.type.startsWith('image/'))) {
            toast.error('فقط فایل تصویری مجاز است');
            return;
        }

        setUploading(true);
        try {
            const uploaded = [];
            for (const file of files) uploaded.push(await uploadToCloudinary(file));
            onUploaded?.(uploaded);
        } catch (error) {
            toast.error(error?.message || 'آپلود تصویر با مشکل مواجه شد');
        } finally {
            setUploading(false);
        }
    };

    const buttonClass =
        variant === 'secondary'
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-primary text-primary-foreground';

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            <div role="radiogroup" aria-label="محل ذخیره‌ی تصویر" className="inline-flex rounded-md border bg-background p-0.5">
                {PROVIDERS.map((p) => (
                    <Button
                        key={p.value}
                        type="button"
                        role="radio"
                        aria-checked={provider === p.value}
                        size="sm"
                        variant={provider === p.value ? 'secondary' : 'ghost'}
                        className="h-7 px-2.5 text-xs"
                        disabled={disabled || busy}
                        onClick={() => choose(p.value)}
                    >
                        {p.label}
                    </Button>
                ))}
            </div>

            {provider === 'uploadthing' ? (
                <UploadButton
                    endpoint={endpoint}
                    disabled={disabled}
                    onUploadBegin={() => setUploading(true)}
                    onClientUploadComplete={onUploadThingDone}
                    onUploadError={(error) => {
                        setUploading(false);
                        toast.error(`خطا در آپلود تصویر: ${error.message}`);
                    }}
                    appearance={{
                        container: 'items-start',
                        button: `ut-uploading:cursor-not-allowed ut-uploading:opacity-70 ${buttonClass} px-3 py-1.5 rounded-md text-sm font-medium h-9 w-auto after:hidden`,
                        allowedContent: 'hidden',
                    }}
                    content={{
                        button: ({ isUploading }) => (isUploading ? 'در حال آپلود...' : label),
                    }}
                />
            ) : (
                <>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        className="hidden"
                        onChange={onCloudinaryFiles}
                    />
                    <Button
                        type="button"
                        size="sm"
                        variant={variant === 'secondary' ? 'secondary' : 'default'}
                        className="h-9"
                        disabled={disabled || busy}
                        onClick={() => fileInput.current?.click()}
                    >
                        {busy ? (
                            <>
                                <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />
                                در حال آپلود...
                            </>
                        ) : (
                            label
                        )}
                    </Button>
                </>
            )}
        </div>
    );
}
