'use client';

import { useEffect, useState } from 'react';
import { Lock, PlayCircle, Download, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import SecureVideo from '@/components/secure-video';


const CourseLessonPreview = ({ courseId, moduleSlug, lesson, isEnrolled, autoOpen }) => {
    const [open, setOpen] = useState(false);

    const isFree = lesson?.access === 'public';
    const isPlayable = isFree || isEnrolled;
    const lessonId = lesson?.id || lesson?._id;

    useEffect(() => {
        if (autoOpen && isPlayable) {
            setOpen(true);
        }
        // Only meant to run once on mount when landing on a specific lesson.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The real video location is never present in the page. A fresh, short-lived
    // download link is requested (and re-checked on the server) on every click.
    async function handleVideoDownload() {
        try {
            const res = await fetch(`/api/video/${lessonId}?download=1`, { cache: 'no-store' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.url) {
                throw new Error(data?.error || 'دریافت لینک دانلود ممکن نشد.');
            }
            window.location.assign(data.url);
        } catch (error) {
            toast.error(error.message || 'دریافت لینک دانلود ممکن نشد.');
        }
    }

    if (!isPlayable) {
        return (
            <div
                className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground opacity-70',
                )}
            >
                <Lock size={16} className="flex-none text-muted-foreground" />
                <span className="truncate">{lesson?.title}</span>
            </div>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
            >
                <span className="flex items-center gap-2.5 truncate">
                    <PlayCircle size={16} className="flex-none text-primary" />
                    <span className="truncate">{lesson?.title}</span>
                </span>
                {isFree ? (
                    <Badge variant="outline" className="flex-none border-primary/30 text-[10px] text-primary">
                        پیش‌نمایش رایگان
                    </Badge>
                ) : (
                    <Badge variant="outline" className="flex-none border-primary/30 text-[10px] text-primary">
                        پرداخت شده
                    </Badge>
                )}
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-right">{lesson?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video w-full bg-slate-950">
                        {open && lesson?.hasVideo ? (
                            <SecureVideo lessonId={lessonId} autoPlay />
                        ) : (
                            open && (
                                <div className="flex h-full items-center justify-center text-sm text-white">
                                    ویدیویی برای این درس ثبت نشده است.
                                </div>
                            )
                        )}
                    </div>

                    {/* Downloads are only offered to students who've actually
                        purchased the course — free-preview viewers don't get these. */}
                    {isEnrolled && (lesson?.hasVideo || lesson?.attachmentUrl) && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
                            {lesson?.hasVideo && (
                                <Button type="button" size="sm" variant="outline" onClick={handleVideoDownload}>
                                    <Download className="h-4 w-4 ml-1.5" />
                                    دانلود ویدیو
                                </Button>
                            )}
                            {lesson?.attachmentUrl && (
                                <Button asChild size="sm" variant="outline">
                                    <a href={lesson.attachmentUrl} download target="_blank" rel="noreferrer">
                                        <Paperclip className="h-4 w-4 ml-1.5" />
                                        دانلود {lesson.attachmentName || 'فایل ضمیمه'}
                                    </a>
                                </Button>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CourseLessonPreview;
