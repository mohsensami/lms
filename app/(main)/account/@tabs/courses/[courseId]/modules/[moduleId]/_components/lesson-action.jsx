'use client';

import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { changeLessonPublishState, deleteLesson } from '@/app/actions/lesson';
import { toast } from 'sonner';

export const LessonActions = ({ lesson, moduleId, onDelete }) => {
    const [action, setAction] = useState(null);
    const [published, setPublished] = useState(lesson?.active);

    async function handleSubmit(event) {
        event.preventDefault();
        //console.log(action);
        try {
            switch (action) {
                case 'change-active': {
                    const activeState = await changeLessonPublishState(lesson.id);
                    setPublished(!activeState);
                    toast.success('درس به‌روزرسانی شد');
                    break;
                }

                case 'delete': {
                    if (published) {
                        toast.error('درس منتشرشده قابل حذف نیست. ابتدا آن را از حالت انتشار خارج کنید، سپس حذف کنید.');
                    } else {
                        await deleteLesson(lesson.id, moduleId);
                        onDelete();
                    }
                    break;
                }
                default:
                    throw new Error('عملیات نامعتبر است');
            }
        } catch (e) {
            toast.error(e.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-x-2">
                <Button variant="outline" size="sm" onClick={() => setAction('change-active')}>
                    {published ? 'منتشر نشده' : 'منتشر شده'}
                </Button>

                <Button size="sm" onClick={() => setAction('delete')}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
};
