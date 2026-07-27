'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Lock, PlayCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// react-player uses browser APIs, so it must be loaded on the client only.
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const CourseLessonPreview = ({ courseId, moduleSlug, lesson, isEnrolled, autoOpen }) => {
    const [open, setOpen] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const router = useRouter();

    const isFree = lesson?.access === 'public';
    const isPlayable = isFree || isEnrolled;
    const isCompleted = lesson?.state === 'completed';

    useEffect(() => {
        if (autoOpen && isPlayable) {
            setOpen(true);
        }
        // Only meant to run once on mount when landing on a specific lesson.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function recordWatch(state, lastTime = 0) {
        if (!courseId || !moduleSlug) return; // free-preview lessons outside a real enrollment context
        try {
            await fetch('/api/lesson-watch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    lessonId: lesson.id || lesson._id,
                    moduleSlug,
                    state,
                    lastTime,
                }),
            });
        } catch (error) {
            // Silently ignore — this is just progress tracking, not critical path.
        }
    }

    function handleStart() {
        if (!hasStarted && isEnrolled) {
            setHasStarted(true);
            recordWatch('started');
        }
    }

    function handleEnded() {
        if (isEnrolled) {
            recordWatch('completed');
            router.refresh();
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
                className={cn(
                    'flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary',
                    isCompleted ? 'text-emerald-600' : 'text-foreground',
                )}
            >
                <span className="flex items-center gap-2.5 truncate">
                    {isCompleted ? (
                        <CheckCircle2 size={16} className="flex-none text-emerald-600" />
                    ) : (
                        <PlayCircle size={16} className="flex-none text-primary" />
                    )}
                    <span className="truncate">{lesson?.title}</span>
                </span>
                {isFree ? (
                    <Badge variant="outline" className="flex-none border-primary/30 text-[10px] text-primary">
                        پیش‌نمایش رایگان
                    </Badge>
                ) : (
                    !isCompleted && (
                        <Badge variant="outline" className="flex-none border-primary/30 text-[10px] text-primary">
                            پرداخت شده
                        </Badge>
                    )
                )}
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-right">{lesson?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video w-full bg-slate-950">
                        {open && (
                            <ReactPlayer
                                url={lesson?.video_url}
                                width="100%"
                                height="100%"
                                controls
                                playing
                                onStart={handleStart}
                                onEnded={handleEnded}
                                config={{
                                    file: {
                                        attributes: {
                                            controlsList: 'nodownload',
                                        },
                                    },
                                }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CourseLessonPreview;
