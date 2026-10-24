'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { updateProfilePicture } from '@/app/actions/account';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/user-avatar';

// A normal themed <Button> (follows the site's primary colour) that opens the
// file picker. The upload itself still goes through UploadThing's hook, so we
// no longer depend on UploadThing's own button styling.
const AvatarUploader = ({ initialImage, firstName }) => {
    const router = useRouter();
    const inputRef = useRef(null);
    const [image, setImage] = useState(initialImage);
    const [isUploading, setIsUploading] = useState(false);

    const { startUpload } = useUploadThing('avatarUploader', {
        onUploadError: (error) => {
            setIsUploading(false);
            toast.error(`خطا در آپلود عکس: ${error.message}`);
        },
    });

    async function handleFile(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('فقط فایل تصویری مجاز است');
            return;
        }

        setIsUploading(true);
        try {
            const res = await startUpload([file]);
            const uploaded = res?.[0]?.ufsUrl ?? res?.[0]?.url;

            if (!uploaded) {
                toast.error('آپلود عکس با مشکل مواجه شد');
                return;
            }

            // We update the DB directly from here (instead of relying on
            // UploadThing's server-side webhook) because that webhook is
            // called from UploadThing's own servers and can't reach
            // localhost during local development.
            await updateProfilePicture(uploaded);
            setImage(uploaded);
            toast.success('عکس پروفایل با موفقیت تغییر کرد');
            router.refresh();
        } catch {
            // onUploadError already reported upload failures.
            toast.error('ذخیره‌سازی عکس پروفایل با مشکل مواجه شد');
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="mx-auto flex flex-col items-center gap-3">
            <div className="relative size-28">
                <UserAvatar
                    src={image}
                    alt={firstName || 'کاربر'}
                    className="size-28 ring-4 ring-primary/10"
                    iconClassName="h-12 w-12"
                />

                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                        <Loader2 className="size-6 animate-spin text-white" />
                    </div>
                )}
            </div>

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            <Button type="button" size="sm" disabled={isUploading} onClick={() => inputRef.current?.click()}>
                {isUploading ? <Loader2 className="ml-1.5 h-4 w-4 animate-spin" /> : <Camera className="ml-1.5 h-4 w-4" />}
                {isUploading ? 'در حال آپلود...' : 'ویرایش عکس پروفایل'}
            </Button>
        </div>
    );
};

export default AvatarUploader;
