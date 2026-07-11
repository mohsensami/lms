'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import { updateProfilePicture } from '@/app/actions/account';
import { buttonVariants } from '@/components/ui/button';
import UserAvatar from '@/components/user-avatar';
import { cn } from '@/lib/utils';

const AvatarUploader = ({ initialImage, firstName }) => {
    const router = useRouter();
    const [image, setImage] = useState(initialImage);
    const [isUploading, setIsUploading] = useState(false);

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

            {/* Explicit, always-visible button (not just a hover overlay) so
                it's obvious how to change the picture. */}
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
                    button: cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'cursor-pointer after:hidden ut-uploading:cursor-not-allowed ut-uploading:opacity-70 ',
                    ),
                    allowedContent: 'hidden',
                }}
                content={{
                    button: ({ isUploading: uploading }) => (uploading ? 'در حال آپلود...' : 'ویرایش عکس پروفایل'),
                }}
            />
        </div>
    );
};

export default AvatarUploader;
