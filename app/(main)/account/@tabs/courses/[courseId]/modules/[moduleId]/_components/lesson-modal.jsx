import { IconBadge } from '@/components/icon-badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { LayoutDashboard } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Video } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LessonTitleForm } from './lesson-title-form';
import { LessonDescriptionForm } from './lesson-description-form';
import { LessonAccessForm } from './lesson-access-form';
import { VideoUrlForm } from './video-url-form';
import { LessonAttachmentForm } from './lesson-attachment-form';
import { CourseActions } from '../../../_components/course-action';
import { LessonActions } from './lesson-action';

export const LessonModal = ({ open, setOpen, courseId, lesson, moduleId }) => {
    function postDelete() {
        setOpen(false);
        onclose();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* <DialogTrigger>Open</DialogTrigger> */}
            <DialogContent
                className="sm:max-w-[1200px] w-[96%] overflow-y-auto max-h-[90vh]"
                onInteractOutside={(e) => {
                    e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>ویرایشگر درس</DialogTitle>
                    <DialogDescription>تنظیمات این درس را سفارشی و مدیریت کنید.</DialogDescription>
                </DialogHeader>
                <div>
                    <div className="flex items-center justify-between">
                        <div className="w-full">
                            <Link
                                href={`/account/courses/${courseId}`}
                                className="flex items-center text-sm hover:opacity-75 transition mb-6"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                بازگشت به تنظیمات دوره
                            </Link>
                            <div className="flex items-center justify-end">
                                <LessonActions lesson={lesson} moduleId={moduleId} onDelete={postDelete} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={LayoutDashboard} />
                                    <h2 className="text-xl">سفارشی سازی فصل</h2>
                                </div>
                                <LessonTitleForm
                                    initialData={{ title: lesson?.title }}
                                    courseId={courseId}
                                    lessonId={lesson?.id}
                                />
                                <LessonDescriptionForm
                                    initialData={{ description: lesson?.description }}
                                    courseId={courseId}
                                    lessonId={lesson?.id}
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={Eye} />
                                    <h2 className="text-xl">تنظیمات دسترسی</h2>
                                </div>
                                <LessonAccessForm
                                    initialData={{ isFree: lesson?.access !== 'private' }}
                                    courseId={courseId}
                                    lessonId={lesson?.id}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={Video} />
                                <h2 className="text-xl">افزودن ویدیو</h2>
                            </div>
                            <VideoUrlForm
                                initialData={{
                                    url: lesson?.video_url,
                                    duration: lesson?.duration,
                                }}
                                courseId={courseId}
                                lessonId={lesson?.id}
                            />
                            <LessonAttachmentForm
                                initialData={{
                                    attachmentUrl: lesson?.attachmentUrl,
                                    attachmentName: lesson?.attachmentName,
                                }}
                                lessonId={lesson?.id}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
