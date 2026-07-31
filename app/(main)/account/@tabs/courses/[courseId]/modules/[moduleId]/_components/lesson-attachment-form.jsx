'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Paperclip, Loader2, X } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import { updateLesson } from '@/app/actions/lesson';

export const LessonAttachmentForm = ({ initialData, lessonId }) => {
    const router = useRouter();
    const [attachment, setAttachment] = useState({
        url: initialData?.attachmentUrl || null,
        name: initialData?.attachmentName || null,
    });
    const [isUploading, setIsUploading] = useState(false);

    async function handleRemove() {
        try {
            await updateLesson(lessonId, { attachmentUrl: null, attachmentName: null });
            setAttachment({ url: null, name: null });
            toast.success('فایل ضمیمه حذف شد');
            router.refresh();
        } catch (error) {
            toast.error('مشکلی پیش آمد');
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                فایل ضمیمه (تمرین، جزوه و ...)
                <UploadButton
                    endpoint="lessonAttachmentUploader"
                    onUploadBegin={() => setIsUploading(true)}
                    onClientUploadComplete={async (res) => {
                        const uploaded = res?.[0];
                        const url = uploaded?.ufsUrl ?? uploaded?.url;
                        const name = uploaded?.name;

                        if (!url) {
                            setIsUploading(false);
                            toast.error('آپلود فایل با مشکل مواجه شد');
                            return;
                        }

                        try {
                            await updateLesson(lessonId, { attachmentUrl: url, attachmentName: name });
                            setAttachment({ url, name });
                            toast.success('فایل ضمیمه آپلود شد');
                            router.refresh();
                        } catch (error) {
                            toast.error('ذخیره‌سازی فایل با مشکل مواجه شد');
                        } finally {
                            setIsUploading(false);
                        }
                    }}
                    onUploadError={(error) => {
                        setIsUploading(false);
                        toast.error(`خطا در آپلود فایل: ${error.message}`);
                    }}
                    appearance={{
                        button: 'ut-uploading:cursor-not-allowed ut-uploading:opacity-70 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium after:hidden',
                        allowedContent: 'hidden',
                    }}
                    content={{
                        button: ({ isUploading: uploading }) =>
                            uploading ? 'در حال آپلود...' : attachment.url ? 'جایگزینی فایل' : 'آپلود فایل',
                    }}
                />
            </div>

            <div className="mt-3">
                {isUploading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        در حال آپلود...
                    </div>
                ) : attachment.url ? (
                    <div className="flex items-center justify-between rounded-md border bg-white p-3">
                        <a
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 truncate text-sm font-medium text-primary hover:underline"
                        >
                            <Paperclip className="h-4 w-4 shrink-0" />
                            <span className="truncate">{attachment.name || 'فایل ضمیمه'}</span>
                        </a>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleRemove}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <p className="text-sm italic text-slate-500">هنوز فایلی برای این درس آپلود نشده است.</p>
                )}
            </div>
        </div>
    );
};
