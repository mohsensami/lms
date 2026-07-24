'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UploadButton } from '@/lib/uploadthing';
import { updatePost } from '@/app/actions/post';

export const PostThumbnailForm = ({ initialData, postId }) => {
    const router = useRouter();
    const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || null);
    const [isUploading, setIsUploading] = useState(false);

    return (
        <div className="mt-6 border bg-gray-50 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                تصویر شاخص پست
                <UploadButton
                    endpoint="postImageUploader"
                    onUploadBegin={() => setIsUploading(true)}
                    onClientUploadComplete={async (res) => {
                        const uploaded = res?.[0]?.ufsUrl ?? res?.[0]?.url;

                        if (!uploaded) {
                            setIsUploading(false);
                            toast.error('آپلود تصویر با مشکل مواجه شد');
                            return;
                        }

                        try {
                            await updatePost(postId, { thumbnail: uploaded });
                            setThumbnail(uploaded);
                            toast.success('تصویر پست به‌روزرسانی شد');
                            router.refresh();
                        } catch (error) {
                            toast.error('ذخیره‌سازی تصویر با مشکل مواجه شد');
                        } finally {
                            setIsUploading(false);
                        }
                    }}
                    onUploadError={(error) => {
                        setIsUploading(false);
                        toast.error(`خطا در آپلود تصویر: ${error.message}`);
                    }}
                    appearance={{
                        button: 'ut-uploading:cursor-not-allowed ut-uploading:opacity-70 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium after:hidden',
                        allowedContent: 'hidden',
                    }}
                    content={{
                        button: ({ isUploading: uploading }) => (uploading ? 'در حال آپلود...' : 'آپلود تصویر'),
                    }}
                />
            </div>

            <div className="relative mt-2 flex aspect-video items-center justify-center overflow-hidden rounded-md bg-slate-200">
                {thumbnail ? (
                    <Image alt="تصویر شاخص" fill className="object-cover" src={thumbnail} />
                ) : (
                    <ImageIcon className="h-10 w-10 text-slate-500" />
                )}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                )}
            </div>
        </div>
    );
};
