'use client';

import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changeQuizPublishState, deleteQuiz } from '@/app/actions/quiz';
import { toast } from 'sonner';

export const QuizSetAction = ({ quizSetId, quiz, quizId }) => {
    const [action, setAction] = useState(null);
    const [published, setPublished] = useState(quiz);
    const router = useRouter();

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            switch (action) {
                case 'change-active': {
                    const activeState = await changeQuizPublishState(quizSetId);
                    setPublished(!activeState);
                    toast.success('آزمون به‌روزرسانی شد');
                    router.refresh();
                    break;
                }
                case 'delete': {
                    if (published) {
                        toast.error('آزمون منتشرشده قابل حذف نیست. ابتدا آن را از حالت انتشار خارج کنید، سپس حذف کنید.');
                    } else {
                        await deleteQuiz(quizSetId, quizId);
                        toast.success('آزمون حذف شد');
                        router.push(`/account/quiz-sets`);
                    }
                    break;
                }
                default: {
                    throw new Error('عملیات نامعتبر است');
                }
            }
        } catch (e) {
            toast.error(`خطا: ${e.message}`);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-x-2">
                <Button variant="outline" size="sm" onClick={() => setAction('change-active')}>
                    {published ? 'عدم انتشار' : 'منتشر کردن'}
                </Button>

                <Button type="submit" name="action" value="delete" size="sm" onClick={() => setAction('delete')}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
};
