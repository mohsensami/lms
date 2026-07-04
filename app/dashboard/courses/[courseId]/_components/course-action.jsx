'use client';

import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { changeCoursePublishState, deleteCourse } from '@/app/actions/course';

export const CourseActions = ({ courseId, isActive }) => {
    const [action, setAction] = useState(null);
    const [published, setPublished] = useState(isActive);
    const router = useRouter();

    async function handleSubmit(event) {
        event.preventDefault();
        //console.log(action);
        try {
            switch (action) {
                case 'change-active': {
                    const activeState = await changeCoursePublishState(courseId);
                    setPublished(!activeState);
                    toast.success('دوره آموزشی به‌روزرسانی شد');
                    router.refresh();
                    break;
                }

                case 'delete': {
                    if (published) {
                        toast.error(
                            'یک دوره منتشر شده را نمی‌توان حذف کرد. ابتدا آن را از حالت انتشار خارج کنید، سپس حذف کنید.',
                        );
                    } else {
                        await deleteCourse(courseId);
                        toast.success('The Course has been deleted successfully');
                        router.push(`/dashboard/courses`);
                    }
                    break;
                }
                default:
                    throw new Error('Invalid Lesson Action');
            }
        } catch (e) {
            toast.error(e.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-x-2">
                <Button variant="outline" size="sm" onClick={() => setAction('change-active')}>
                    {published ? 'Unpublish' : 'Publish'}
                </Button>

                <Button size="sm" onClick={() => setAction('delete')}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
};
