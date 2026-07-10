'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import { updateProfilePicture } from '@/app/actions/account';
import { cn } from '@/lib/utils';

const AvatarUploader = ({ initialImage, firstName }) => {
    const router = useRouter();
    const [image, setImage] = useState(initialImage);
    const [isUploading, setIsUploading] = useState(false);

    return (
        <div className="group relative mx-auto size-28">
            <Image
                src={image || 'https://i.pravatar.cc/300'}
                className="rounded-full object-cover ring-4 ring-primary/10"
                id="profile-banner"
                alt={firstName || 'کاربر'}
                width={112}
                height={112}
            />

            <div
                className={cn(
                    'pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity',
                    isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
            >
                {isUploading ? (
                    <Loader2 className="size-6 animate-spin text-white" />
                ) : (
                    <Camera className="size-6 text-white" />
                )}
            </div>

            <UploadButton
                endpoint="avatarUploader"
                onUploadBegin={() => setIsUploading(true)}
                onClientUploadComplete={async (res) => {
                    const uploaded = res?.[0]?.ufsUrl ?? res?.[0]?.url;

                    if (!uploaded) {
                        setIsUploading(false);
                        toast.error('آپلود عکس با مشکل مواجه شد');
                        return;
                    }

                    try {
                        // We update the DB directly from here (instead of relying on
                        // UploadThing's server-side webhook) because that webhook is
                        // called from UploadThing's own servers and can't reach
                        // localhost during local development.
                        await updateProfilePicture(uploaded);
                        setImage(uploaded);
                        toast.success('عکس پروفایل با موفقیت تغییر کرد');
                        router.refresh();
                    } catch (error) {
                        toast.error('ذخیره‌سازی عکس پروفایل با مشکل مواجه شد');
                    } finally {
                        setIsUploading(false);
                    }
                }}
                onUploadError={(error) => {
                    setIsUploading(false);
                    toast.error(`خطا در آپلود عکس: ${error.message}`);
                }}
                appearance={{
                    button: 'absolute inset-0 size-full cursor-pointer rounded-full opacity-0',
                    allowedContent: 'hidden',
                }}
                content={{
                    button: '',
                }}
            />
        </div>
    );
};

export default AvatarUploader;
